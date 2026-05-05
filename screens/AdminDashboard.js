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
    Modal,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import CONFIG from "../constants/config";
import Communities from "./Communities";

// Edit Community Modal for Admin
function EditCommunityModal({ community, onClose, onUpdate, onDelete }) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { colors: themeColors } = useAuth();
    
    // Admin Dashboard styles are slightly different, we'll use local inline styles or adapted ones
    const [form, setForm] = useState({
        id: community?.id || community?._id,
        name: community?.name || "",
        subject: community?.subject || "",
        description: community?.description || "",
        color: community?.color || themeColors.primary,
    });

    const colors = [themeColors.primary, themeColors.secondary, themeColors.catChem, themeColors.catBio, themeColors.catCS, themeColors.danger, themeColors.catPhysics];

    const handleUpdate = () => {
        if (!form.name.trim()) {
            Alert.alert("Missing Name", "Please enter a community name");
            return;
        }
        if (!form.subject.trim()) {
            Alert.alert("Missing Subject", "Please enter a subject");
            return;
        }
        if (!form.description.trim()) {
            Alert.alert("Missing Description", "Please enter a description");
            return;
        }

        onUpdate(form);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: themeColors.border,
                    backgroundColor: themeColors.card
                }}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color={themeColors.subText} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: themeColors.text }}>Edit Community</Text>
                    <TouchableOpacity onPress={handleUpdate}>
                        <Text style={{ fontSize: 16, fontWeight: "bold", color: themeColors.primary }}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ padding: 20 }}>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: themeColors.subText, marginBottom: 8 }}>Community Name *</Text>
                        <TextInput
                            style={{
                                backgroundColor: themeColors.inputBackground || themeColors.card,
                                borderRadius: 12,
                                padding: 15,
                                fontSize: 16,
                                color: themeColors.text,
                                borderWidth: 1,
                                borderColor: themeColors.border
                            }}
                            placeholder="Community Name"
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            placeholderTextColor={themeColors.placeholder}
                        />
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: themeColors.subText, marginBottom: 8 }}>Subject *</Text>
                        <TextInput
                            style={{
                                backgroundColor: themeColors.inputBackground || themeColors.card,
                                borderRadius: 12,
                                padding: 15,
                                fontSize: 16,
                                color: themeColors.text,
                                borderWidth: 1,
                                borderColor: themeColors.border
                            }}
                            placeholder="Subject"
                            value={form.subject}
                            onChangeText={(text) => setForm({ ...form, subject: text })}
                            placeholderTextColor={themeColors.placeholder}
                        />
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: themeColors.subText, marginBottom: 8 }}>Description *</Text>
                        <TextInput
                            style={{
                                backgroundColor: themeColors.inputBackground || themeColors.card,
                                borderRadius: 12,
                                padding: 15,
                                fontSize: 16,
                                color: themeColors.text,
                                borderWidth: 1,
                                borderColor: themeColors.border,
                                height: 100,
                                textAlignVertical: "top"
                            }}
                            placeholder="Description"
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                            multiline
                            placeholderTextColor={themeColors.placeholder}
                        />
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: themeColors.subText, marginBottom: 8 }}>Choose Color Theme</Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                            {colors.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: color,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderWidth: form.color === color ? 3 : 0,
                                        borderColor: themeColors.text
                                    }}
                                    onPress={() => setForm({ ...form, color })}
                                >
                                    {form.color === color && (
                                        <Ionicons name="checkmark" size={20} color={themeColors.white} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 15,
                            borderRadius: 12,
                            backgroundColor: themeColors.danger + "10",
                            borderWidth: 1,
                            borderColor: themeColors.danger,
                            marginTop: 20,
                            marginBottom: 40,
                            gap: 10
                        }}
                        onPress={() => onDelete(form.id, form.name)}
                    >
                        <Ionicons name="trash-outline" size={20} color={themeColors.danger} />
                        <Text style={{ fontSize: 16, fontWeight: "bold", color: themeColors.danger }}>Delete Community</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default function AdminDashboard({ onBack }) {
    const { colors, user, isAdmin, logout } = useAuth();
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

    const [activeSection, setActiveSection] = useState("menu"); // "menu", "communities", "users"
    const [communities, setCommunities] = useState([]);
    const [loadingCommunities, setLoadingCommunities] = useState(false);
    const [editingCommunity, setEditingCommunity] = useState(null);
    const [statsData, setStatsData] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalCommunities: 0
    });

    const fetchStats = async () => {
        try {
            const resp = await fetch(`${CONFIG.API_URLS.ADMIN}/stats`);
            const data = await resp.json();
            if (data.success && data.stats) {
                setStatsData(data.stats);
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        }
    };

    React.useEffect(() => {
        fetchStats();
        fetchCommunities();
    }, []);

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userTab, setUserTab] = useState("users"); // "users", "content", "stats"
    const [reports, setReports] = useState([
        { id: 101, type: "Post", reason: "Inappropriate language", reportedBy: "Sara Malik", status: "Pending" },
        { id: 102, type: "Note", reason: "Spam content", reportedBy: "Ahmed Khan", status: "Reviewed" },
    ]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const resp = await fetch(`${CONFIG.API_URLS.ADMIN}/users`);
            const data = await resp.json();
            if (data.success && data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleBanUser = async (id, currentStatus) => {
        try {
            const resp = await fetch(`${CONFIG.API_URLS.ADMIN}/users/${id}/toggle-ban`, {
                method: 'POST'
            });
            const data = await resp.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned: data.isBanned } : u));
                Alert.alert("Success", `User has been ${data.isBanned ? "banned" : "unbanned"}.`);
                fetchStats(); // Update stats if needed
            }
        } catch (error) {
            console.error("Error toggling ban:", error);
            Alert.alert("Error", "Failed to update user status");
        }
    };

    const fetchCommunities = async () => {
        setLoadingCommunities(true);
        try {
            const resp = await fetch(CONFIG.API_URLS.COMMUNITIES);
            const data = await resp.json();
            if (Array.isArray(data)) {
                setCommunities(data);
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
        } finally {
            setLoadingCommunities(false);
        }
    };

    const handleUpdateCommunity = async (updatedCommunity) => {
        try {
            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/${updatedCommunity.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCommunity)
            });
            if (resp.ok) {
                setCommunities(prev => prev.map(c => c._id === updatedCommunity.id ? { ...c, ...updatedCommunity } : c));
                setEditingCommunity(null);
                Alert.alert("Success", "Community updated successfully");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update community");
        }
    };

    const deleteCommunity = (id, name) => {
        Alert.alert(
            "Delete Community",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/${id}`, {
                                method: 'DELETE'
                            });
                            if (resp.ok) {
                                setCommunities(prev => prev.filter(c => c._id !== id));
                                setEditingCommunity(null);
                                Alert.alert("Success", "Community deleted");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete community");
                        }
                    }
                }
            ]
        );
    };

    const stats = [
        { label: "Total Users", value: statsData.totalUsers.toString(), icon: "people" },
        { label: "Total Posts", value: statsData.totalPosts.toString(), icon: "chatbubbles" },
        { label: "Communities", value: statsData.totalCommunities.toString(), icon: "layers" },
    ];



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

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={[styles.headerInner, { maxWidth: responsiveWidth, alignSelf: 'center', width: '100%' }]}>
                {activeSection !== "menu" && (
                    <TouchableOpacity onPress={() => setActiveSection("menu")} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color={colors.white} />
                    </TouchableOpacity>
                )}
                <Text style={[styles.headerTitle, { fontSize: fontSize['3xl'] }]}>
                    {activeSection === "menu" ? "Admin Dashboard" : "Admin Dashboard"}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="transparent" translucent={true} barStyle="light-content" />

            {activeSection === "menu" && renderHeader()}

            {activeSection === "menu" ? (
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={[styles.scroll, { maxWidth: responsiveWidth, alignSelf: 'center', width: '100%' }]}
                    showsVerticalScrollIndicator={false}
                >
                    <>
                        <View style={styles.statsGrid}>
                            {stats.map((stat, i) => (
                                <View key={i} style={styles.statCard}>
                                    <Ionicons name={stat.icon} size={moderateScale(24)} color={colors.primary} />
                                    <Text style={[styles.statValue, { fontSize: fontSize.xl }]}>{stat.value}</Text>
                                    <Text style={[styles.statLabel, { fontSize: fontSize.xs }]}>{stat.label}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { fontSize: fontSize.xl, marginTop: 10 }]}>Select Management Area</Text>
                        
                        <TouchableOpacity 
                            style={styles.menuCard} 
                            onPress={() => setActiveSection("communities")}
                        >
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + "15" }]}>
                                <Ionicons name="layers" size={32} color={colors.primary} />
                            </View>
                            <View style={styles.menuInfo}>
                                <Text style={[styles.menuTitle, { fontSize: fontSize.xl }]}>Admin Communities Manage</Text>
                                <Text style={[styles.menuDesc, { fontSize: fontSize.sm }]}>Manage, edit, or delete student communities</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={colors.subText} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.menuCard} 
                            onPress={() => {
                                setActiveSection("users");
                                fetchUsers();
                            }}
                        >
                            <View style={[styles.iconBox, { backgroundColor: colors.success + "15" }]}>
                                <Ionicons name="people" size={32} color={colors.success} />
                            </View>
                            <View style={styles.menuInfo}>
                                <Text style={[styles.menuTitle, { fontSize: fontSize.xl }]}>Admin Manage Users</Text>
                                <Text style={[styles.menuDesc, { fontSize: fontSize.sm }]}>View and manage all registered students</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={colors.subText} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bottomLogoutBtn} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={moderateScale(22)} color={colors.danger} />
                            <Text style={[styles.bottomLogoutText, { fontSize: fontSize.lg }]}>Logout from Admin</Text>
                        </TouchableOpacity>
                    </>
                </ScrollView>
            ) : activeSection === "communities" ? (
                <Communities onBack={() => setActiveSection("menu")} />
            ) : activeSection === "users" ? (
                <View style={{ flex: 1 }}>
                    {renderHeader()}
                    
                    <ScrollView 
                        style={styles.container}
                        contentContainerStyle={[styles.scroll, { maxWidth: responsiveWidth, alignSelf: 'center', width: '100%' }]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Stat Cards at top */}
                        <View style={styles.statsGrid}>
                            <View style={styles.statCardFixed}>
                                <Ionicons name="people" size={moderateScale(24)} color={colors.primary} />
                                <Text style={[styles.statValueLarge, { fontSize: fontSize.xl }]}>{statsData.totalUsers.toLocaleString()}</Text>
                                <Text style={[styles.statLabelSmall, { fontSize: fontSize.xs }]}>Total Users</Text>
                            </View>
                            <View style={styles.statCardFixed}>
                                <Ionicons name="chatbubbles" size={moderateScale(24)} color={colors.primary} />
                                <Text style={[styles.statValueLarge, { fontSize: fontSize.xl }]}>{statsData.totalPosts.toLocaleString()}</Text>
                                <Text style={[styles.statLabelSmall, { fontSize: fontSize.xs }]}>Total Posts</Text>
                            </View>
                            <View style={styles.statCardFixed}>
                                <Ionicons name="layers" size={moderateScale(24)} color={colors.primary} />
                                <Text style={[styles.statValueLarge, { fontSize: fontSize.xl }]}>{statsData.totalCommunities.toLocaleString()}</Text>
                                <Text style={[styles.statLabelSmall, { fontSize: fontSize.xs }]}>Communities</Text>
                            </View>
                        </View>

                        {/* User Management Section */}
                        <Text style={[styles.sectionTitle, { fontSize: fontSize.xl, marginTop: 10 }]}>User Management</Text>
                        {loadingUsers ? (
                            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                        ) : (
                            <View style={styles.section}>
                                {users.map(user => (
                                    <View key={user._id} style={styles.userCardWhite}>
                                        <View style={styles.userInfo}>
                                            <Text style={[styles.userName, { fontSize: fontSize.lg }]}>{user.name}</Text>
                                            <Text style={[styles.userEmail, { fontSize: fontSize.sm }]}>{user.email}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[
                                                styles.banActionBtn,
                                                user.isBanned && styles.unbanActionBtn
                                            ]}
                                            onPress={() => toggleBanUser(user._id, user.isBanned)}
                                        >
                                            <Text style={[
                                                styles.banActionBtnText, 
                                                { fontSize: fontSize.sm, color: user.isBanned ? "#166534" : "#991B1B" }
                                            ]}>
                                                {user.isBanned ? "Unban" : "Ban"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {users.length === 0 && (
                                    <Text style={styles.userEmail}>No users found.</Text>
                                )}
                            </View>
                        )}

                        {/* Content Quality Alerts Section */}
                        <Text style={[styles.sectionTitle, { fontSize: fontSize.xl }]}>Content Quality Alerts</Text>
                        <View style={styles.alertCardYellow}>
                            <View style={styles.alertCardContent}>
                                <Ionicons name="warning" size={moderateScale(22)} color="#D97706" />
                                <Text style={[styles.alertCardText, { fontSize: fontSize.base }]}>3 posts reported for spam</Text>
                            </View>
                            <TouchableOpacity onPress={() => Alert.alert("Review", "Reviewing reported content...")}>
                                <Text style={[styles.reviewLinkText, { fontSize: fontSize.base }]}>Review</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            ) : null}

            {editingCommunity && (
                <Modal visible={!!editingCommunity} animationType="slide">
                    <EditCommunityModal 
                        community={editingCommunity} 
                        onClose={() => setEditingCommunity(null)}
                        onUpdate={handleUpdateCommunity}
                        onDelete={deleteCommunity}
                    />
                </Modal>
            )}
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
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: verticalScale(15),
    },
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
    adminActionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(10),
    },
    smallActionBtn: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        justifyContent: "center",
        alignItems: "center",
    },
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
    userRole: { color: colors.subText, marginTop: verticalScale(2) },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: colors.card,
        padding: scale(8),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginHorizontal: scale(-20), // Compensate for scroll padding
        marginBottom: verticalScale(15),
    },
    tab: {
        flex: 1,
        padding: scale(12),
        alignItems: "center",
        borderRadius: scale(12),
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: { fontWeight: "600", color: colors.text },
    activeTabText: { color: colors.white },
    actionBtn: {
        backgroundColor: colors.danger,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        borderRadius: scale(8),
    },
    blockedBtn: { backgroundColor: colors.success },
    actionBtnText: { color: colors.white, fontWeight: "600" },
    reportCard: {
        backgroundColor: colors.card,
        padding: scale(16),
        borderRadius: scale(16),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: colors.danger + "20",
    },
    reportHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: verticalScale(8) },
    reportType: { fontWeight: "700", color: colors.danger },
    reportStatus: { color: colors.warning, fontWeight: "600" },
    reportReason: { fontSize: 15, marginBottom: verticalScale(8), color: colors.text },
    reportedBy: { color: colors.subText, fontSize: 14 },
    reportActions: { flexDirection: "row", gap: scale(12), marginTop: verticalScale(12) },
    reviewBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(10),
        borderRadius: scale(8),
        flex: 1,
    },
    deleteBtn: {
        backgroundColor: colors.danger,
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(10),
        borderRadius: scale(8),
        flex: 1,
    },
    reviewBtnText: { color: colors.white, textAlign: "center", fontWeight: "600" },
    deleteBtnText: { color: colors.white, textAlign: "center", fontWeight: "600" },
    statBox: {
        backgroundColor: colors.card,
        padding: scale(20),
        borderRadius: scale(16),
        width: "48%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.primary + "20",
    },
    statNumber: { fontWeight: "bold", color: colors.primary },
    statCardFixed: {
        backgroundColor: colors.card,
        width: "31%",
        padding: scale(15),
        borderRadius: scale(16),
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: verticalScale(2) },
                shadowOpacity: 0.1,
                shadowRadius: verticalScale(8),
            },
            android: {
                elevation: 4,
            },
        }),
    },
    statValueLarge: { fontWeight: "800", color: colors.text, marginTop: verticalScale(8) },
    statLabelSmall: { color: colors.subText, marginTop: verticalScale(2), textAlign: 'center' },
    userCardWhite: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.card,
        padding: scale(20),
        borderRadius: scale(16),
        marginBottom: verticalScale(12),
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: verticalScale(2) },
                shadowOpacity: 0.05,
                shadowRadius: verticalScale(6),
            },
            android: {
                elevation: 2,
            },
        }),
    },
    banActionBtn: {
        backgroundColor: "#FEF2F2", // Light red
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(10),
        borderRadius: scale(10),
        borderWidth: 1,
        borderColor: "#FCA5A5",
    },
    unbanActionBtn: {
        backgroundColor: "#F0FDF4", // Light green
        borderColor: "#86EFAC",
    },
    banActionBtnText: { color: "#991B1B", fontWeight: "700" },
    alertCardYellow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFBEB",
        padding: scale(16),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: "#FDE68A",
        marginTop: verticalScale(10),
    },
    alertCardContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
    },
    alertCardText: { color: "#92400E", fontWeight: "600" },
    reviewLinkText: { color: "#6B21A8", fontWeight: "700" },
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
    menuCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        padding: scale(20),
        borderRadius: scale(16),
        marginBottom: verticalScale(15),
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: verticalScale(2) },
                shadowOpacity: 0.1,
                shadowRadius: verticalScale(4),
            },
            android: {
                elevation: 4,
            },
        }),
    },
    iconBox: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(12),
        justifyContent: "center",
        alignItems: "center",
        marginRight: scale(15),
    },
    menuInfo: { flex: 1 },
    menuTitle: { fontWeight: "800", color: colors.text, marginBottom: verticalScale(4) },
    menuDesc: { color: colors.subText, lineHeight: verticalScale(18) },
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