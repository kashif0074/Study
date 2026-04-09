// screens/AdminDashboard.js (WITH LOGOUT BUTTON)
import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar,
    useWindowDimensions,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard({ onBack }) {
    const { colors, isAdmin, logout } = useAuth();
    const { width, height } = useWindowDimensions();

    const isTablet = width >= 768;
    const responsiveWidth = useMemo(() => Math.min(width, 600), [width]);

    const { scale, verticalScale, moderateScale } = useMemo(() => {
        const baseWidth = 375;
        const baseHeight = 667;
        const scaleFactor = Math.min(width, 600) / baseWidth;
        const vScaleFactor = Math.min(height, 800) / baseHeight;

        const s = (size) => size * scaleFactor;
        const vs = (size) => size * vScaleFactor;
        const ms = (size, factor = 0.5) => size + (s(size) - size) * factor;

        return { scale: s, verticalScale: vs, moderateScale: ms };
    }, [width, height]);

    const styles = useMemo(() => getStyles(colors, scale, verticalScale, moderateScale, isTablet), [colors, scale, verticalScale, moderateScale, isTablet]);

    const [users, setUsers] = useState([
        { id: "1", name: "Kashif shahzad", email: "kashif@edu.com", status: "active" },
        { id: "2", name: "Sarim Mohsin", email: "sarim@edu.com", status: "active" },
        { id: "3", name: "Daniyal Desmond", email: "Daniyal@actor.com", status: "active" },
    ]);

    const stats = [
        { label: "Total Users", value: "1,234", icon: "people" },
        { label: "Total Posts", value: "8,921", icon: "chatbubbles" },
        { label: "Communities", value: "42", icon: "layers" },
    ];

    const toggleBanUser = (id) => {
        setUsers(users.map(u => {
            if (u.id === id) {
                const newStatus = u.status === "active" ? "banned" : "active";
                Alert.alert("Success", `User ${u.name} has been ${newStatus}.`);
                return { ...u, status: newStatus };
            }
            return u;
        }));
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout from Admin Panel?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Logout", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                            // After logout, onBack will be called to go to auth screen
                            onBack?.();
                        } catch (error) {
                            Alert.alert("Error", "Failed to logout. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    if (!isAdmin) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Access Denied</Text>
            </View>
        );
    }

    const fontSize = {
        xs: moderateScale(10),
        sm: moderateScale(12),
        base: moderateScale(14),
        lg: moderateScale(16),
        xl: moderateScale(18),
        '2xl': moderateScale(22),
        '3xl': moderateScale(26),
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                backgroundColor="transparent"
                translucent={true}
                barStyle="light-content"
            />

            <View style={styles.header}>
                <View style={[styles.headerInner, { maxWidth: responsiveWidth, alignSelf: 'center', width: '100%' }]}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontSize: fontSize['3xl'] }]}>Admin Dashboard</Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={moderateScale(24)} color={colors.white} />
                        <Text style={[styles.logoutBtnText, { fontSize: fontSize.sm }]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.scroll, { maxWidth: responsiveWidth, alignSelf: 'center', width: '100%' }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, i) => (
                        <View key={i} style={styles.statCard}>
                            <Ionicons name={stat.icon} size={moderateScale(24)} color={colors.primary} />
                            <Text style={[styles.statValue, { fontSize: fontSize.xl }]}>{stat.value}</Text>
                            <Text style={[styles.statLabel, { fontSize: fontSize.xs }]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* User Management Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontSize: fontSize.xl }]}>User Management</Text>
                    {users.map(user => (
                        <View key={user.id} style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { fontSize: fontSize.lg }]}>{user.name}</Text>
                                <Text style={[styles.userEmail, { fontSize: fontSize.sm }]}>{user.email}</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.banBtn,
                                    user.status === "banned" && styles.unbanBtn
                                ]}
                                onPress={() => toggleBanUser(user.id)}
                            >
                                <Text style={[styles.banBtnText, { fontSize: fontSize.sm }]}>
                                    {user.status === "active" ? "Ban" : "Unban"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Content Quality Alerts (Mock) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontSize: fontSize.xl }]}>Content Quality Alerts</Text>
                    <View style={styles.alertCard}>
                        <Ionicons name="warning" size={moderateScale(20)} color={colors.warning} />
                        <Text style={[styles.alertText, { fontSize: fontSize.base }]}>3 posts reported for spam</Text>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { fontSize: fontSize.base }]}>Review</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button at Bottom */}
                <TouchableOpacity style={styles.bottomLogoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={moderateScale(22)} color={colors.danger} />
                    <Text style={[styles.bottomLogoutText, { fontSize: fontSize.lg }]}>Logout from Admin</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (colors, scale, verticalScale, moderateScale, isTablet) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorText: { color: colors.danger, fontSize: moderateScale(18), fontWeight: "bold" },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(isTablet ? 40 : 50),
        paddingBottom: verticalScale(isTablet ? 30 : 24),
        borderBottomLeftRadius: scale(32),
        borderBottomRightRadius: scale(32),
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: verticalScale(4) },
                shadowOpacity: 0.3,
                shadowRadius: verticalScale(12),
            },
            android: {
                elevation: 8,
            },
        }),
    },
    headerInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backBtn: { padding: scale(8) },
    headerTitle: { color: colors.white, fontWeight: "800", flex: 1, textAlign: "center" },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white + "20",
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(20),
        gap: scale(5),
    },
    logoutBtnText: { color: colors.white, fontWeight: "600" },
    container: { flex: 1 },
    scroll: { padding: scale(20), paddingBottom: verticalScale(40) },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: verticalScale(25),
    },
    statCard: {
        backgroundColor: colors.card,
        width: "31%",
        padding: scale(15),
        borderRadius: scale(16),
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: verticalScale(2) },
                shadowOpacity: 0.05,
                shadowRadius: verticalScale(8),
            },
            android: {
                elevation: 3,
            },
        }),
    },
    statValue: { fontWeight: "800", color: colors.text, marginTop: verticalScale(8) },
    statLabel: { color: colors.subText, marginTop: verticalScale(2), textAlign: 'center' },
    section: { marginBottom: verticalScale(30) },
    sectionTitle: { fontWeight: "700", color: colors.text, marginBottom: verticalScale(15) },
    userCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.card,
        padding: scale(15),
        borderRadius: scale(12),
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: colors.border,
    },
    userInfo: { flex: 1 },
    userName: { fontWeight: "600", color: colors.text },
    userEmail: { color: colors.subText, marginTop: verticalScale(2) },
    banBtn: {
        backgroundColor: colors.danger + "15",
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(8),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.danger,
    },
    unbanBtn: {
        backgroundColor: colors.success + "15",
        borderColor: colors.success,
    },
    banBtnText: { color: colors.text, fontWeight: "600" },
    alertCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.warning + "10",
        padding: scale(15),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: colors.warning,
    },
    alertText: { flex: 1, marginLeft: scale(10), color: colors.text },
    linkText: { color: colors.primary, fontWeight: "700" },
    bottomLogoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.card,
        padding: scale(16),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: colors.danger,
        marginTop: verticalScale(20),
        marginBottom: verticalScale(30),
        gap: scale(10),
    },
    bottomLogoutText: { color: colors.danger, fontWeight: "600" },
});