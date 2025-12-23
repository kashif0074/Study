// screens/AuthScreen.js
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen({ visible, onClose, onAuthSuccess }) {
  // Use 'login' from context (Note: If using persistence, this should be 'login')
  const { login } = useAuth(); 
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [remember, setRemember] = useState(false);

  const CheckBox = ({ checked, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
    </TouchableOpacity>
  );

  const handleSubmit = () => {
    // --- STEP 1: Implement basic front-end validation here (omitted for brevity) ---
    // Example: if (!email || !password) { showToast("Please fill all fields"); return; }
    
    // --- STEP 2: Call the mock login/signup process ---
    
    // Create the mock user data
    const userData = {
        name: isLogin ? (name || "Guest") : name,
        email: email,
        // In a real app, the backend handles the password validation/hashing
    };

    // Call the context function
    login(userData); 
    
    // Call the success callback passed from App.js
    // The optional chaining (?.) prevents errors if the prop is undefined
    onAuthSuccess?.();
    
    // Close the modal
    onClose?.();
  };


  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modal}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#6B7280" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.container}>
            
            {/* Logo and Subtitle */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="bulb" size={40} color="#C4B5FD" />
              </View>
              <Text style={styles.brand}>StudySpark</Text>
              <Text style={styles.subtitle}>
                {isLogin ? "Welcome back! Sign in to continue" : "Join the learning revolution"}
              </Text>
            </View>

            {/* Form Inputs */}
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#A78BFA"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#A78BFA"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#A78BFA"
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
                placeholderTextColor="#A78BFA"
              />
            )}

            {/* Checkbox and Links */}
            <View style={styles.row}>
              {/* Checkbox */}
              <CheckBox
                checked={isLogin ? remember : agree}
                onPress={() => (isLogin ? setRemember(!remember) : setAgree(!agree))}
              />
              
              {/* Text */}
              <Text style={styles.checkboxText}>
                {isLogin ? (
                  "Remember me"
                ) : (
                  <>
                    I agree to the{" "}
                    <Text style={styles.link}>Terms of Service</Text> and{" "}
                    <Text style={styles.link}>Privacy Policy</Text>
                  </>
                )}
              </Text>
              
              {/* Forgot Password Link */}
              {isLogin && (
                <TouchableOpacity style={styles.forgotLink}>
                  <Text style={styles.link}>Forgot password?</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>
                {isLogin ? "Login" : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Toggle Login/Signup */}
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.link}>
                  {isLogin ? "Sign up" : "Login"}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <View style={styles.line} />
            </View>


            {/* Footer */}
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "92%",
    maxHeight: "92%",
    backgroundColor: "#F8F5FF",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
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
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#6B21A8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  brand: {
    fontSize: 34,
    fontWeight: "800",
    color: "#6B21A8",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    fontSize: 16,
    color: "#1E1B4B",
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
    borderColor: "#A78BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#6B21A8",
    borderColor: "#6B21A8",
  },
  checkboxText: {
    color: "#6B7280",
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  forgotLink: { marginLeft: "auto" },
  link: { color: "#6B21A8", fontWeight: "700" },
  button: {
    backgroundColor: "#6B21A8",
    padding: 18,
    borderRadius: 16,
    marginVertical: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 17,
  },
  toggleText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 15,
    marginVertical: 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  orText: { marginHorizontal: 16, color: "#9CA3AF", fontSize: 14 },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  socialButton: {
    flex: 0.48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    padding: 16,
    borderRadius: 16,
  },
  socialText: {
    marginLeft: 10,
    color: "#1E1B4B",
    fontWeight: "600",
    fontSize: 15,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 30,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});