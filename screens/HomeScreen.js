// screens/HomeScreen.js (Responsive Version with Theme)
import React, { memo, useRef, useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Animated,
    Easing,
    Alert,
    useWindowDimensions,
    Image,
    StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import CONFIG from "../constants/config";
import { Share as RNShare } from "react-native";

// ----- Main Screen -----
export default function HomeScreen() {
    const navigation = useNavigation();
    const { user, setShowAuth, colors, recordActivity } = useAuth();
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const fabScale = useRef(new Animated.Value(1)).current;
    const [activeTab, setActiveTab] = useState("Recent");
    const [recentNotes, setRecentNotes] = useState([]);
    const [totalNotesCount, setTotalNotesCount] = useState(0);
    const { width, height } = useWindowDimensions();

    // Responsive calculations
    const isSmallScreen = width < 375;
    const isTablet = width >= 768;
    const responsiveWidth = Math.min(width, 500);

    const styles = getStyles(colors);

    // Theme object for legacy components if needed (though we're moving to direct colors)
    const theme = {
        bg: colors.background,
        text: colors.text,
        card: colors.card,
        border: colors.border,
        subText: colors.subText,
        primary: colors.primary,
    };
    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (user && user.uid) {
                recordActivity(); // ✅ Record daily activity for streak
                fetch(`${CONFIG.API_URLS.NOTES}?userId=${user.uid}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (Array.isArray(data)) {
                            setRecentNotes(data.slice(0, 3));
                            setTotalNotesCount(data.length);
                        }
                    })
                    .catch((err) => console.error("Error fetching notes in home:", err));
            } else {
                setTotalNotesCount(0);
                setRecentNotes([]);
            }
        }, [user])
    );

    // Guest Mode: Trigger Auth Modal
    const requireLogin = (actionName = "this feature") => {
        if (!user) {
            Alert.alert(
                "Sign In Required",
                `To use ${actionName}, please sign in or create an account.`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Sign In", onPress: () => setShowAuth(true) },
                ]
            );
            return false;
        }
        return true;
    };

    const handleFabPress = () => {
        if (!requireLogin("create notes")) return;

        Animated.sequence([
            Animated.spring(fabScale, { toValue: 0.92, friction: 6, useNativeDriver: true }),
            Animated.spring(fabScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]).start();

        navigation.navigate("Notes");
    };

    const handleQuickAction = (type) => {
        if (!requireLogin(`create ${type} note`)) return;
        navigation.navigate("Notes");
    };

    const handleContinue = () => {
        if (!requireLogin("view note details")) return;
        navigation.navigate("NoteDetail");
    };

    const handleViewAll = () => {
        if (!requireLogin("view all notes")) return;
        navigation.navigate("Notes");
    };

    const handleShareNote = async (note) => {
        if (!requireLogin("share note")) return;
        try {
            const shareOptions = {
                title: note.title,
                message: `${note.title}\n\n${note.content || ""}\n\nShared from StudySpark App`,
            };
            if (note.fileUrl || note.fileUri) {
                shareOptions.url = note.fileUrl || note.fileUri;
            }
            await RNShare.share(shareOptions);
        } catch (error) {
            console.error("Share error:", error);
        }
    };

    // Responsive Subcomponents
    const StatCard = memo(({ label, value, color }) => {
        const { width } = useWindowDimensions();
        const isTablet = width >= 768;
        const responsiveWidth = Math.min(width, 500);
        const isSmallScreen = width < 375;
        const cardWidth = isTablet ? (responsiveWidth - 80) / 4 : (responsiveWidth - 60) / 2;

        return (
            <View style={[styles.statCard, {
                width: cardWidth,
                backgroundColor: colors.card,
                borderColor: colors.border,
            }]}>
                <Text style={[styles.statValue(isSmallScreen, isTablet), { color }]}>{value}</Text>
                <Text style={[styles.statLabel(isSmallScreen, isTablet), { color: colors.subText }]}>{label}</Text>
            </View>
        );
    });

    const QuickActionButton = memo(({ icon, title, subtitle, color, onPress }) => {
        const { width } = useWindowDimensions();
        const isTablet = width >= 768;
        const responsiveWidth = Math.min(width, 500);
        const isSmallScreen = width < 375;
        const buttonWidth = isTablet ? (responsiveWidth - 100) / 4 : (responsiveWidth - 80) / 4;
        const iconSize = isSmallScreen ? 50 : isTablet ? 70 : 60;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.quickActionBtn, { width: buttonWidth }]}
                onPress={onPress}
            >
                <LinearGradient
                    colors={[color, `${color}E6`]}
                    style={[styles.quickActionIconContainer, { width: iconSize, height: iconSize }]}
                >
                    <Ionicons name={icon} size={isSmallScreen ? 18 : isTablet ? 26 : 22} color={colors.white} />
                </LinearGradient>
                <Text style={[styles.quickActionTitle(isSmallScreen, isTablet), { color: colors.text }]}>{title}</Text>
                <Text style={[styles.quickActionSubtitle(isSmallScreen, isTablet), { color: colors.subText }]}>{subtitle}</Text>
            </TouchableOpacity>
        );
    });

    const RecentActivityCard = memo(
        ({ type, subject, duration, title, summary, progress, date, onContinue, onShare }) => {
            const { width } = useWindowDimensions();
            const isTablet = width >= 768;
            const isSmallScreen = width < 375;
            const typeColors = {
                PDF: colors.danger,
                Text: colors.primary,
                Voice: colors.primary,
                Image: colors.secondary
            };
            const typeBg = {
                PDF: colors.badges.challenge,
                Text: colors.badges.note,
                Voice: colors.badges.note,
                Image: colors.background
            };
            const color = typeColors[type] || colors.primary;
            const backgroundColor = typeBg[type] || colors.primary + "15";

            return (
                <View style={[styles.activityCard, {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                }]}>
                    <View style={styles.activityHeader}>
                        <View style={[styles.activityTypeTag, { backgroundColor }]}>
                            <Text style={[styles.activityTypeText(isSmallScreen), { color }]}>
                                {type.toUpperCase()}
                            </Text>
                        </View>
                        <Text style={[styles.activitySubject(isSmallScreen, isTablet), { color: colors.subText }]}>{subject}</Text>
                        <Text style={[styles.activityDuration(isSmallScreen), { color: colors.subText }]}>• {duration}</Text>

                    </View>
                    <Text style={[styles.activityTitle(isSmallScreen, isTablet), { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.activitySummary(isSmallScreen, isTablet), { color: colors.subText }]} numberOfLines={2}>
                        {summary}
                    </Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
                    </View>
                    <View style={styles.activityFooter}>
                        <Text style={[styles.activityDate(isSmallScreen), { color: colors.subText }]}>{date}</Text>
                        <View style={styles.activityActions}>
                            <TouchableOpacity onPress={onContinue}>
                                <Text style={[styles.activityActionText(isSmallScreen), { color: colors.primary }]}>Continue</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onShare} style={{ marginLeft: 16 }}>
                                <Text style={[styles.activityActionText(isSmallScreen), { color: colors.primary }]}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={[styles.scroll, {
                    maxWidth: Math.min(width, 500),
                    alignSelf: 'center',
                    width: '100%'
                }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Gradient Header */}
                <LinearGradient colors={[colors.primary, colors.primary, colors.primary + "CC"]} style={styles.header}>
                    <View style={styles.greetingHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.logo(isSmallScreen, isTablet)}>StudySpark</Text>
                            <Text style={styles.greeting(isSmallScreen, isTablet)}>
                                Good morning, {user?.name || "Guest"}
                            </Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.headerIcon}>
                                <Ionicons name="notifications-outline" size={isSmallScreen ? 20 : isTablet ? 28 : 24} color={colors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.profileBadge, {
                                    backgroundColor: user?.avatar ? 'transparent' : colors.secondary,
                                    width: isSmallScreen ? 36 : isTablet ? 52 : 44,
                                    height: isSmallScreen ? 36 : isTablet ? 52 : 44,
                                    borderRadius: isSmallScreen ? 18 : isTablet ? 26 : 22,
                                    overflow: 'hidden'
                                }]}
                                onPress={() => {
                                    if (!requireLogin("access profile")) return;
                                    navigation.navigate("Profile");
                                }}
                            >
                                {user?.avatar ? (
                                    <Image
                                        source={{ 
                                            uri: user.avatar.startsWith('http') 
                                                ? user.avatar 
                                                : `${CONFIG.API_URLS.AUTH.replace('/api/auth', '')}${user.avatar}`
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <Text style={styles.profileText(isSmallScreen, isTablet)}>
                                        {user?.name?.[0]?.toUpperCase() || "G"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <StatCard label="Study Streak" value={`${user?.studyStreak ?? 0} days`} color={colors.secondary} />
                        <StatCard label="Notes Created" value={`${user ? totalNotesCount : 0}`} color={colors.primary} />
                        <StatCard label="Quiz Score" value={user?.quizScore ?? "0%"} color={colors.secondary} />
                        <StatCard label="Study Time" value={`${user?.studyTime ? parseFloat(user.studyTime).toFixed(1) : 0} hrs`} color={colors.accent} />
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle(isSmallScreen, isTablet), { color: theme.text }]}>Quick Actions</Text>
                    <View style={styles.quickActionsRow}>
                        <QuickActionButton
                            icon="create-outline"
                            title="Organize Notes"
                            subtitle="Text & Docs"
                            color={colors.primary}
                            onPress={() => handleQuickAction("text")}
                        />
                        <QuickActionButton
                            icon="document-attach-outline"
                            title="Upload Files"
                            subtitle="Extract & Analyze"
                            color={colors.secondary}
                            onPress={() => handleQuickAction("PDF")}
                        />
                        <QuickActionButton
                            icon="camera-outline"
                            title="Image upload"
                            subtitle="OCR Tool"
                            color={colors.secondary}
                            onPress={() => handleQuickAction("image")}
                        />
                        <QuickActionButton
                            icon="mic-outline"
                            title="Voice Record"
                            subtitle="Audio to Text"
                            color={colors.accent}
                            onPress={() => handleQuickAction("voice")}
                        />
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.recentActivityHeader}>
                        <Text style={[styles.sectionTitle(isSmallScreen, isTablet), { color: theme.text }]}>Recent Activity</Text>
                        <View style={[styles.recentActivityTabs, { backgroundColor: theme.card }]}>
                            <TouchableOpacity
                                style={[styles.activityTab, activeTab === "Recent" && styles.activityTabActive]}
                                onPress={() => setActiveTab("Recent")}
                            >
                                <Text
                                    style={[
                                        styles.activityTabText(isSmallScreen),
                                        activeTab === "Recent" && styles.activityTabActiveText,
                                    ]}
                                >
                                    Recent
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                    {activeTab === "Recent" && (
                        <>
                            {(user && user.uid && recentNotes.length > 0) ? (
                                recentNotes.map((note, index) => (
                                    <RecentActivityCard
                                        key={note._id || index}
                                        type={note.type === "pdf" ? "PDF" : note.type === "image" ? "Image" : note.type === "voice" ? "Voice" : "Text"}
                                        subject={note.subject || "General"}
                                        duration={note.duration || "N/A"}
                                        title={note.title}
                                        summary={note.content}
                                        progress={note.progress || Math.floor(Math.random() * 40 + 60)}
                                        date={note.createdAt ? new Date(note.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                                        onContinue={() => navigation.navigate("NoteDetail", { note })}
                                        onShare={() => handleShareNote(note)}
                                    />
                                ))
                            ) : (user && user.uid) ? (
                                <View style={{ padding: 40, alignItems: "center" }}>
                                    <Text style={{ fontSize: 16, color: theme.subText }}>No recent notes yet.</Text>
                                    <Text style={{ fontSize: 14, color: theme.subText, marginTop: 8 }}>Create your first note to see it here!</Text>
                                </View>
                            ) : (
                                <>
                                    <RecentActivityCard
                                        type="PDF"
                                        subject="software Engineering"
                                        duration="2h 30m"
                                        title="Software Engineering"
                                        summary="Overview of Software Engineering, Use Case Diagram, and Class Diagram."
                                        progress={85}
                                        date="Dec 13, 2025"
                                        onContinue={handleContinue}
                                        onShare={() => requireLogin("share note") || console.log("Share")}
                                    />
                                    <RecentActivityCard
                                        type="Text"
                                        subject="Mathematics"
                                        duration="1h 45m"
                                        title="Advanced Calculus Integration"
                                        summary="Detailed analysis of integration techniques, substitution methods, and applications."
                                        progress={92}
                                        date="Dec 12, 2025"
                                        onContinue={handleContinue}
                                        onShare={() => requireLogin("share note") || console.log("Share")}
                                    />
                                    <RecentActivityCard
                                        type="Voice"
                                        subject="Auotomata"
                                        duration="3h 15m"
                                        title="Theory of Auotomata"
                                        summary="Lecture on Dfa and Nfa, finite Automata,pushdown Automat and Turning Automata."
                                        progress={67}
                                        date="Dec 11, 2025"
                                        onContinue={handleContinue}
                                        onShare={() => requireLogin("share note") || console.log("Share")}
                                    />
                                </>
                            )}
                        </>
                    )}

                    {activeTab === "Favorites" && (
                        <View style={{ padding: 60, alignItems: "center" }}>
                            <Text style={{ fontSize: 16, color: theme.subText }}>No favorites yet!</Text>
                        </View>
                    )}

                    <TouchableOpacity style={[styles.viewAllBtn, {
                        backgroundColor: theme.card,
                        borderColor: colors.primary
                    }]} onPress={handleViewAll}>
                        <Text style={[styles.viewAllText(isSmallScreen, isTablet), { color: colors.primary }]}>View All Notes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Shimmer FAB - Responsive positioning */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        right: isTablet ? 40 : 24,
                        bottom: isTablet ? 40 : 34,
                        width: isSmallScreen ? 56 : isTablet ? 80 : 68,
                        height: isSmallScreen ? 56 : isTablet ? 80 : 68,
                        borderRadius: isSmallScreen ? 28 : isTablet ? 40 : 34,
                        backgroundColor: colors.primary, // ✅ Use theme primary
                    }
                ]}
                onPress={handleFabPress}
            >
                <Animated.View
                    style={[
                        styles.fabShimmer,
                        {
                            opacity: shimmerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.5],
                            }),
                            transform: [
                                {
                                    translateX: shimmerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-100, 100],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
                <Animated.View style={{ transform: [{ scale: fabScale }] }}>
                    <Ionicons name="add" size={isSmallScreen ? 24 : isTablet ? 36 : 32} color={colors.white} />
                </Animated.View>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// ----- Responsive Styles -----
const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        paddingBottom: 100,
        width: '100%',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    greetingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    logo: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 22 : isTablet ? 34 : 28,
        fontWeight: "800",
        color: colors.white,
    }),
    greeting: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
        color: colors.accent,
        marginTop: 4,
    }),
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
    },
    headerIcon: {
        marginHorizontal: 8,
        padding: 8
    },
    profileBadge: {
        backgroundColor: colors.accent,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    profileText: (isSmallScreen, isTablet) => ({
        color: colors.white,
        fontSize: isSmallScreen ? 14 : isTablet ? 20 : 16,
        fontWeight: "bold",
    }),
    statsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
    },
    statCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    statValue: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 20 : isTablet ? 28 : 24,
        fontWeight: "bold",
        color: colors.white,
    }),
    statLabel: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 11 : isTablet ? 15 : 13,
        marginTop: 6,
    }),
    section: {
        paddingHorizontal: 20,
        marginTop: 28,
        width: '100%',
    },
    sectionTitle: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 18 : isTablet ? 24 : 20,
        fontWeight: "700",
        marginBottom: 16,
    }),
    quickActionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: 'wrap',
        gap: 8,
    },
    quickActionBtn: {
        alignItems: "center",
        marginBottom: 8,
    },
    quickActionIconContainer: {
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        shadowColor: colors.black,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    quickActionTitle: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 11 : isTablet ? 15 : 13,
        fontWeight: "600",
        textAlign: "center",
    }),
    quickActionSubtitle: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 9 : isTablet ? 13 : 11,
        textAlign: "center",
        marginTop: 2,
    }),
    recentActivityHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: 'wrap',
        gap: 10,
    },
    recentActivityTabs: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 4
    },
    activityTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10
    },
    activityTabText: (isSmallScreen) => ({
        fontSize: isSmallScreen ? 12 : 14,
        color: colors.subText,
    }),
    activityTabActive: {
        backgroundColor: colors.card
    },
    activityTabActiveText: {
        color: colors.primary,
        fontWeight: "600"
    },
    activityCard: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        elevation: 4,
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        width: '100%',
        borderWidth: 1,
    },
    activityHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    activityTypeTag: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 10
    },
    activityTypeText: (isSmallScreen) => ({
        fontSize: isSmallScreen ? 9 : 11,
        fontWeight: "700",
    }),
    activitySubject: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 12 : isTablet ? 16 : 14,
        fontWeight: "600",
    }),
    activityDuration: (isSmallScreen) => ({
        fontSize: isSmallScreen ? 11 : 13,
        marginLeft: 6,
    }),
    ellipsis: {
        position: "absolute",
        right: 0,
        top: 0
    },
    activityTitle: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 15 : isTablet ? 19 : 17,
        fontWeight: "700",
        marginBottom: 6,
    }),
    activitySummary: (isSmallScreen, isTablet) => ({
        fontSize: isSmallScreen ? 12 : isTablet ? 16 : 14,
        lineHeight: 20,
        marginBottom: 12,
    }),
    progressBarContainer: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 12
    },
    progressBar: {
        height: "100%",
        borderRadius: 4
    },
    activityFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: 'wrap',
    },
    activityDate: (isSmallScreen) => ({
        fontSize: isSmallScreen ? 11 : 13,
    }),
    activityActions: {
        flexDirection: "row"
    },
    activityActionText: (isSmallScreen) => ({
        fontSize: isSmallScreen ? 12 : 14,
        fontWeight: "600",
    }),
    viewAllBtn: {
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: "center",
        borderWidth: 2,
        marginTop: 16,
        width: '100%',
    },
    viewAllText: (isSmallScreen, isTablet) => ({
        fontWeight: "700",
        fontSize: isSmallScreen ? 14 : isTablet ? 20 : 16,
    }),
    fab: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
        overflow: "hidden",
    },
    fabShimmer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
    },
});
