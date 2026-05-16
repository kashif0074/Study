// screens/AuthScreen.js (CORRECTED - Removed onAuthSuccess dependency)
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Modal,
    Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen({ visible, onClose, isGuestMode = false }) {
    const { login, signup, logout, resendVerification, colors } = useAuth();
    const styles = getStyles(colors);

    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [agree, setAgree] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isForgot, setIsForgot] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { resetPassword } = useAuth();

    // Load remembered email on mount
    React.useEffect(() => {
        const loadRememberedEmail = async () => {
            try {
                const savedEmail = await AsyncStorage.getItem('rememberedEmail');
                if (savedEmail) {
                    setEmail(savedEmail);
                    setRemember(true);
                }
            } catch (error) {
                console.error("Error loading remembered email:", error);
            }
        };
        loadRememberedEmail();
    }, []);

    const CheckBox = ({ checked, onPress }) => (
        <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked && <Ionicons name="checkmark" size={16} color={colors.white} />}
            </View>
        </TouchableOpacity>
    );

    const handleSubmit = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cleanEmail = email.trim();

        if (!emailRegex.test(cleanEmail)) {
            Alert.alert("Invalid Email", "Please enter a valid email address (e.g., user@example.com).");
            return;
        }

        if (isForgot) {
            try {
                await resetPassword(cleanEmail);
                Alert.alert("Success", "Password reset link sent to your email!");
                setIsForgot(false);
            } catch (error) {
                Alert.alert("Error", error.message || "Failed to send reset link.");
            }
            return;
        }

        try {
            if (isLogin) {
                // LOGIN
                await login(cleanEmail, password);
                
                // Handle Remember Me
                if (remember) {
                    await AsyncStorage.setItem('rememberedEmail', cleanEmail);
                } else {
                    await AsyncStorage.removeItem('rememberedEmail');
                }

                Alert.alert("Success", "Logged in successfully!");
                onClose?.(); // Close modal after successful login
            } else {
                // SIGNUP
                if (password !== confirm) {
                    Alert.alert("Error", "Passwords do not match!");
                    return;
                }

                // Password Policy Validation
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
                if (!passwordRegex.test(password)) {
                    Alert.alert(
                        "Weak Password",
                        "Password must be at least 8 characters long and include:\n• One uppercase letter\n• One lowercase letter\n• One numerical digit\n• One special character"
                    );
                    return;
                }

                if (!agree) {
                    Alert.alert("Error", "Please agree to the Terms and Privacy Policy");
                    return;
                }
                await signup(cleanEmail, password, name);
                Alert.alert(
                    "Verify Your Email", 
                    "Account created! We've sent a verification link to your email. Please verify it to access all features."
                );
                onClose?.(); // Close modal - user is already logged in by Firebase
                setIsLogin(true);
                setPassword("");
                setConfirm("");
            }
        } catch (error) {
            console.error("Auth Error:", error.code || "CUSTOM", error.message);

            let errorMessage = "Something went wrong. Please try again.";

            if (error.code === 'auth/email-not-verified' || error.message?.includes("verify your email")) {
                Alert.alert(
                    "Email Not Verified",
                    error.message,
                    [
                        { text: "Cancel", style: "cancel" },
                        { 
                            text: "Resend Link", 
                            onPress: async () => {
                                try {
                                    await resendVerification();
                                    Alert.alert("Link Sent", "A new verification link has been sent to your email.");
                                } catch (err) {
                                    Alert.alert("Error", "Failed to send link. Please try logging in again first.");
                                }
                            }
                        }
                    ]
                );
                return;
            }

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "This email is already registered.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Please enter a valid email address.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Password should be at least 6 characters long.";
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = "Invalid email or password.";
                    break;
                default:
                    errorMessage = error.message || errorMessage;
            }

            Alert.alert("Authentication Failed", errorMessage);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <View style={styles.modal}>
                    {/* Close Button - Hidden in Guest Mode */}
                    {!isGuestMode && (
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Ionicons name="close" size={28} color={colors.subText} />
                        </TouchableOpacity>
                    )}

                    <ScrollView 
                        contentContainerStyle={styles.container}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Ionicons name="bulb" size={40} color={colors.secondary || "#6B21A8"} />
                            </View>
                            <Text style={styles.brand}>StudySpark</Text>
                            <Text style={styles.subtitle}>
                                {isForgot
                                    ? "Enter your email to receive a password reset link"
                                    : isLogin
                                        ? "Welcome back! Sign in to continue"
                                        : "Join the learning revolution"}
                            </Text>
                        </View>

                        {isForgot ? (
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor={colors.placeholder}
                                color={colors.text}
                            />
                        ) : (
                            <>
                                {!isLogin && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        value={name}
                                        onChangeText={setName}
                                        placeholderTextColor={colors.placeholder}
                                        color={colors.text}
                                    />
                                )}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={colors.placeholder}
                                    color={colors.text}
                                />

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Password"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholderTextColor={colors.placeholder}
                                        color={colors.text}
                                    />
                                    <TouchableOpacity 
                                        style={styles.eyeIcon}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Ionicons 
                                            name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                            size={22} 
                                            color={colors.subText} 
                                        />
                                    </TouchableOpacity>
                                </View>

                                {!isLogin && (
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Confirm Password"
                                            secureTextEntry={!showConfirm}
                                            value={confirm}
                                            onChangeText={setConfirm}
                                            placeholderTextColor={colors.placeholder}
                                            color={colors.text}
                                        />
                                        <TouchableOpacity 
                                            style={styles.eyeIcon}
                                            onPress={() => setShowConfirm(!showConfirm)}
                                        >
                                            <Ionicons 
                                                name={showConfirm ? "eye-outline" : "eye-off-outline"} 
                                                size={22} 
                                                color={colors.subText} 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}

                        {!isForgot && (
                            <View style={styles.row}>
                                <CheckBox
                                    checked={isLogin ? remember : agree}
                                    onPress={() => (isLogin ? setRemember(!remember) : setAgree(!agree))}
                                />
                                <Text style={styles.checkboxText}>
                                    {isLogin ? "Remember me" : (
                                        <>I agree to the <Text style={styles.link}>Terms</Text> and <Text style={styles.link}>Privacy Policy</Text></>
                                    )}
                                </Text>

                                {isLogin && (
                                    <TouchableOpacity style={styles.forgotLink} onPress={() => setIsForgot(true)}>
                                        <Text style={styles.link}>Forgot password?</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>
                                {isForgot ? "Send Reset Link" : isLogin ? "Login" : "Create Account"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={isForgot 
                                ? () => setIsForgot(false) 
                                : () => setIsLogin(!isLogin)
                            }
                        >
                            <Text style={styles.toggleText}>
                                {isForgot 
                                    ? "Remember your password? " 
                                    : isLogin 
                                        ? "Don't have an account? " 
                                        : "Already have an account? "}
                                <Text style={styles.link}>
                                    {isForgot ? "Back to Login" : isLogin ? "Sign up" : "Login"}
                                </Text>
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.footerText}>
                            By continuing, you agree to our{" "}
                            <Text style={styles.link}>Terms of Service</Text> and{" "}
                            <Text style={styles.link}>Privacy Policy</Text>
                        </Text>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ==================== STYLES ====================
const getStyles = (colors) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: "92%",
        maxHeight: "90%",
        backgroundColor: colors.background || "#FFFFFF",
        borderRadius: 28,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 25,
    },
    closeBtn: {
        alignSelf: "flex-end",
        padding: 8,
        marginBottom: 10,
    },
    container: {
        paddingVertical: 10,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.white || "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
    },
    brand: {
        fontSize: 34,
        fontWeight: "800",
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        textAlign: "center",
        color: colors.subText,
        fontSize: 16,
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    input: {
        backgroundColor: colors.white || "#fff",
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        fontSize: 16,
        color: colors.text,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white || "#fff",
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 16,
        marginBottom: 14,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: colors.text,
    },
    eyeIcon: {
        padding: 16,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    checkboxContainer: { padding: 4 },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.placeholder,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxText: {
        color: colors.subText,
        marginLeft: 10,
        fontSize: 14,
        flex: 1,
    },
    forgotLink: { marginLeft: "auto" },
    link: { color: colors.primary, fontWeight: "700" },
    button: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 16,
        marginVertical: 10,
    },
    buttonText: {
        color: colors.white,
        textAlign: "center",
        fontWeight: "700",
        fontSize: 17,
    },
    toggleText: {
        textAlign: "center",
        color: colors.subText,
        fontSize: 15,
        marginVertical: 20,
    },
    footerText: {
        fontSize: 12,
        color: colors.placeholder,
        textAlign: "center",
        marginTop: 30,
        lineHeight: 18,
        paddingHorizontal: 20,
    },
});