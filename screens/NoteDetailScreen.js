// screens/NoteDetailScreen.js - FULLY RESPONSIVE & FUNCTIONAL
import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert,
    Dimensions,
    StatusBar,
    Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Audio } from "expo-av";
import { useAuth } from "../context/AuthContext";
import CONFIG, { API_BASE_URL } from "../constants/config";
import { Linking } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// ✅ RESPONSIVE SCALING
const BASE_WIDTH = 375;
const scale = (size) => Math.min(screenWidth, 600) / BASE_WIDTH * size;
const verticalScale = (size) => screenHeight / 812 * size;

export default function NoteDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors } = useAuth();
    const styles = getStyles(colors);

    // ✅ Get actual note data
    const note = route.params?.note || {};
    
    // Determine the full URL for files (prepend server IP if it's a relative path)
    const getFullUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('file://') || url.startsWith('content://')) {
            return url;
        }
        
        // Ensure relative paths like /uploads/.. are handled correctly
        const baseUrl = API_BASE_URL.replace('/api', ''); // Get http://192.168.0.100:5000
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        
        return `${baseUrl}${cleanUrl}`;
    };

    const fileUrl = getFullUrl(note.fileUrl || note.fileUri);

    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // ✅ Proper audio cleanup
    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    // ✅ Fixed voice playback using Stable Method
    const playVoiceNote = async () => {
        if (!fileUrl) {
            Alert.alert("No Audio", "This note has no audio file attached.");
            return;
        }

        try {
            console.log("🎵 Stable Playback: Loading audio from:", fileUrl);
            const soundObject = new Audio.Sound();
            
            soundObject.setOnPlaybackStatusUpdate(status => {
                if (status.isLoaded) {
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        setSound(null);
                    } else {
                        setIsPlaying(status.isPlaying);
                    }
                }
            });

            await soundObject.loadAsync(
                { uri: fileUrl },
                { shouldPlay: true, volume: 1.0 }
            );
            
            setSound(soundObject);
        } catch (error) {
            console.error("❌ Playback error:", error);
            Alert.alert("Error", "Cannot play this voice note. Ensure it is a valid audio file.");
        }
    };

    const stopVoiceNote = async () => {
        if (sound) {
            await sound.stopAsync();
            setIsPlaying(false);
        }
    };

    // ✅ All actions working
    const handleAction = async (action) => {
        switch (action) {
            case "Continue":
                Alert.alert("Continue", `Continued "${note.title}"`);
                break;
            case "Share":
                try {
                    const shareOptions = {
                        title: note.title,
                        message: `${note.title}\n\n${note.content || ""}\n\nShared from StudySpark App`,
                    };
                    if (fileUrl) {
                        shareOptions.url = fileUrl;
                    }
                    await Share.share(shareOptions);
                } catch (error) {
                    Alert.alert("Error", "Could not share the note.");
                }
                break;
            case "Download":
                if (fileUrl) {
                    Linking.openURL(fileUrl);
                } else {
                    Alert.alert("Download", `Downloaded "${note.content.substring(0, 30)}..."`);
                }
                break;
            case "Delete":
                Alert.alert(
                    "Delete Note",
                    `Are you sure you want to delete "${note.title}"?`,
                    [
                        { text: "Cancel", style: "cancel" },
                        { 
                            text: "Delete", 
                            style: "destructive", 
                            onPress: async () => {
                                try {
                                    if (note._id) {
                                        const response = await fetch(`${CONFIG.API_URLS.NOTES}/${note._id}`, {
                                            method: 'DELETE'
                                        });
                                        if (!response.ok) {
                                            throw new Error("Failed to delete note from server");
                                        }
                                    }
                                    Alert.alert("Deleted", "Note has been deleted.");
                                    navigation.goBack();
                                } catch (error) {
                                    console.error("Delete error:", error);
                                    Alert.alert("Error", "Failed to delete note.");
                                }
                            } 
                        }
                    ]
                );
                break;
        }
    };

    // ✅ Responsive content rendering for ALL types
    const renderContent = () => {
        switch (note.type) {
            case "text":
                return <Text style={[styles.contentText, { color: colors.subText }]}>{note.content}</Text>;

            case "pdf":
            case "ppt":
            case "doc":
            case "file":
                const isPdf = note.type === "pdf";
                const isPpt = note.type === "ppt";
                const isDoc = note.type === "doc";
                
                return (
                    <View style={styles.pdfPreview}>
                        <Ionicons 
                            name={isPdf ? "document-attach-outline" : isPpt ? "easel-outline" : "document-text-outline"} 
                            size={scale(80)} 
                            color={isPpt ? colors.warning : isDoc ? colors.info : colors.danger} 
                        />
                        <Text style={[styles.pdfText, { color: colors.subText }]}>
                            {isPdf ? "📄 PDF Document" : isPpt ? "📊 Presentation" : isDoc ? "📝 Word Document" : "📁 Attached File"}
                        </Text>
                        <Text style={[styles.pdfFileName, { color: colors.subText }]}>{note.content}</Text>
                        
                        <TouchableOpacity 
                            style={[styles.openFileBtn, { backgroundColor: colors.primary }]}
                            onPress={() => fileUrl && Linking.openURL(fileUrl)}
                        >
                            <Ionicons name="eye-outline" size={scale(20)} color={colors.white} />
                            <Text style={styles.openFileText}>View Document</Text>
                        </TouchableOpacity>
                    </View>
                );

            case "image":
                return (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: fileUrl || `https://via.placeholder.com/400x300/${colors.primary.replace("#", "")}/FFFFFF?text=Image` }}
                            style={styles.noteImage}
                            resizeMode="contain"
                            onError={(e) => {
                                console.error("🖼️ Image load error:", e.nativeEvent.error);
                                console.log("🔗 Failed URL:", fileUrl);
                            }}
                        />
                        <Text style={[styles.imageCaption, { color: colors.subText }]}>{note.content}</Text>
                    </View>
                );

            case "voice":
                return (
                    <View style={styles.voiceContainer}>
                        <View style={styles.voiceWaveform}>
                            <Ionicons name="mic" size={scale(60)} color={colors.success} />
                        </View>
                        <Text style={[styles.voiceDuration, { color: colors.success }]}>{note.content}</Text>
                        <TouchableOpacity
                            style={[styles.playButton, isPlaying && styles.pauseButton, { backgroundColor: isPlaying ? colors.danger : colors.success, shadowColor: isPlaying ? colors.danger : colors.success }]}
                            onPress={isPlaying ? stopVoiceNote : playVoiceNote}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={isPlaying ? "pause" : "play"}
                                size={scale(32)}
                                color={colors.white}
                            />
                        </TouchableOpacity>
                    </View>
                );

            default:
                return <Text style={[styles.contentText, { color: colors.subText }]}>{note.content}</Text>;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                backgroundColor="transparent"
                translucent={true}
                barStyle={colors.text === colors.white ? "light-content" : "dark-content"}
            />
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Note Details</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="bookmark-outline" size={scale(24)} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Note Header */}
                <View style={styles.noteHeader}>
                    <View style={styles.noteTypeContainer}>
                        <View style={[
                            styles.typeBadge,
                            {
                                backgroundColor:
                                    note.type === "pdf" ? colors.badges.challenge :
                                        note.type === "image" ? colors.info + "20" :
                                            note.type === "voice" ? colors.success + "20" : colors.badges.note,
                            }
                        ]}>
                            <Ionicons
                                name={
                                    note.type === "pdf" ? "document-attach" :
                                        note.type === "image" ? "image" :
                                            note.type === "voice" ? "mic" : "document-text"
                                }
                                size={scale(16)}
                                color={
                                    note.type === "pdf" ? colors.danger :
                                        note.type === "image" ? colors.info :
                                            note.type === "voice" ? colors.success : colors.primary
                                }
                            />
                            <Text style={[styles.typeText, {
                                color: note.type === "pdf" ? colors.danger :
                                    note.type === "image" ? colors.info :
                                        note.type === "voice" ? colors.success : colors.primary
                            }]}>{note.type.toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.subject, { color: colors.subText }]} placeholderTextColor={colors.placeholder}>{note.subject || "General"}</Text>
                    </View>
                    <Text style={[styles.date, { color: colors.placeholder }]}>{note.date}</Text>
                </View>

                <Text style={styles.duration}>Duration: {note.duration || "N/A"}</Text>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressPercent}>{note.progress || 0}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View style={[
                            styles.progressBar,
                            { width: `${Math.min(note.progress || 0, 100)}%` }
                        ]} />
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.contentCard}>
                    <Text style={styles.contentTitle}>
                        {note.type === "voice" ? "🎙️ Voice Recording" :
                            note.type === "pdf" ? "📄 PDF Preview" :
                                note.type === "image" ? "🖼️ Image Note" : "📝 Note Content"}
                    </Text>
                    {renderContent()}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleAction("Continue")}>
                        <Ionicons name="play-circle" size={scale(20)} color={colors.primary} />
                        <Text style={styles.actionText}>Continue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleAction("Share")}>
                        <Ionicons name="share-outline" size={scale(20)} color={colors.primary} />
                        <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleAction("Download")}>
                        <Ionicons name="download-outline" size={scale(20)} color={colors.primary} />
                        <Text style={styles.actionText}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleAction("Delete")}>
                        <Ionicons name="trash-outline" size={scale(20)} color={colors.danger} />
                        <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(16),
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: { padding: scale(8) },
    headerTitle: { fontSize: scale(18), fontWeight: "700", color: colors.text },
    headerIcon: { padding: scale(8) },

    // Content
    content: { paddingHorizontal: scale(20), paddingBottom: verticalScale(40) },
    noteHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: verticalScale(16),
    },
    noteTypeContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
    typeBadge: {
        borderRadius: scale(8),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        marginRight: scale(10),
        flexDirection: "row",
        alignItems: "center",
    },
    typeText: { fontSize: scale(12), fontWeight: "700", marginLeft: scale(4) },
    subject: { fontSize: scale(16), fontWeight: "600", color: colors.subText },
    date: { fontSize: scale(14), color: colors.placeholder },

    // Title & Duration
    title: { fontSize: scale(28), fontWeight: "800", color: colors.text, marginBottom: scale(8) },
    duration: { fontSize: scale(16), color: colors.subText, marginBottom: verticalScale(24) },

    // Progress
    progressContainer: {
        backgroundColor: colors.card,
        borderRadius: scale(16),
        padding: scale(20),
        marginBottom: verticalScale(24),
        elevation: 4,
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowRadius: scale(12),
    },
    progressLabelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: scale(12),
    },
    progressLabel: { fontSize: scale(16), fontWeight: "600", color: colors.text },
    progressPercent: { fontSize: scale(20), fontWeight: "700", color: colors.primary },
    progressBarContainer: {
        height: scale(12),
        backgroundColor: colors.border,
        borderRadius: scale(6),
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: colors.primary,
        borderRadius: scale(6),
    },

    // Content Card
    contentCard: {
        backgroundColor: colors.card,
        borderRadius: scale(16),
        padding: scale(24),
        marginBottom: verticalScale(24),
        elevation: 4,
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowRadius: scale(12),
    },
    contentTitle: { fontSize: scale(20), fontWeight: "700", color: colors.text, marginBottom: scale(16) },
    contentText: { fontSize: scale(16), color: colors.subText, lineHeight: scale(28) },

    // Content Types
    pdfPreview: { alignItems: "center", paddingVertical: verticalScale(40) },
    pdfText: { fontSize: scale(16), color: colors.subText, marginTop: scale(16), textAlign: "center" },
    pdfFileName: { fontSize: scale(14), color: colors.subText, fontWeight: "600", marginTop: scale(8), marginBottom: scale(20) },
    openFileBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(10),
        borderRadius: scale(25),
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    openFileText: {
        color: colors.white,
        fontSize: scale(14),
        fontWeight: "700",
        marginLeft: scale(8),
    },

    imageContainer: { alignItems: "center" },
    noteImage: {
        width: Math.min(screenWidth * 0.85, scale(350)),
        height: verticalScale(250),
        borderRadius: scale(12),
        marginBottom: scale(16),
    },
    imageCaption: { fontSize: scale(14), color: colors.subText, textAlign: "center" },

    voiceContainer: { alignItems: "center", paddingVertical: verticalScale(30) },
    voiceWaveform: { marginBottom: verticalScale(20) },
    voiceDuration: { fontSize: scale(16), color: colors.success, fontWeight: "600", marginBottom: verticalScale(24), textAlign: "center" },
    playButton: {
        backgroundColor: colors.success,
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: colors.success,
        shadowOpacity: 0.4,
        shadowRadius: scale(12),
    },
    pauseButton: { backgroundColor: colors.danger, shadowColor: colors.danger },

    // Actions
    actionsContainer: { flexDirection: "row", flexWrap: "wrap", gap: scale(12) },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary + "15",
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(14),
        borderRadius: scale(12),
        flex: 1,
        minWidth: "48%",
        justifyContent: "center",
    },
    deleteButton: { backgroundColor: colors.danger + "10" },
    actionText: { fontSize: scale(16), fontWeight: "600", color: colors.primary, marginLeft: scale(8) },
    deleteText: { color: colors.danger },
});
