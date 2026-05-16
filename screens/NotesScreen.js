// screens/NotesScreen.js (COMPLETE & RESPONSIVE WITH AI FUNCTIONALITY)
import React, { useState, useEffect, useRef, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Dimensions,
    Animated,
    Easing,
    Alert,
    Modal,
    Share,
    useWindowDimensions,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import { Audio } from "expo-av";
import { useAuth } from "../context/AuthContext";
import CONFIG from "../constants/config";

export default function NotesScreen({ navigation }) {
    const { user, updateUser, colors } = useAuth();
    const styles = getStyles(colors);
    const { width, height } = useWindowDimensions();

    // Responsive calculations
    const isSmallScreen = width < 375;
    const isTablet = width >= 768;
    const responsiveWidth = Math.min(width, 500);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [notes, setNotes] = useState([
        {
            id: "1",
            title: "React Hooks",
            content: "useState, useEffect, custom hooks...",
            type: "text",
            date: "Today",
            subject: "Programming",
            duration: "1h 30m",
            progress: 85
        },
        {
            id: "2",
            title: "Mobile App Development",
            content: "A mobile app developer is someone who designs and builds applications that run on smartphones and tablets.",
            type: "Files",
            date: "Yesterday",
            subject: "Mobile App Development",
            duration: "2h 15m",
            progress: 92
        },
        {
            id: "3",
            title: "Calculus Handwritten",
            content: "Integration techniques including substitution, integration by parts, and partial fractions.",
            type: "image",
            date: "2 days ago",
            subject: "Mathematics",
            duration: "3h 00m",
            progress: 78
        },
        {
            id: "4",
            title: "Data Science",
            content: "Data science is the field that uses data, statistics, and algorithms to find patterns and make informed decisions..",
            type: "voice",
            date: "3 days ago",
            subject: "Data Science",
            duration: "45m",
            progress: 65
        },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [newNoteType, setNewNoteType] = useState("text");
    const [newNoteContent, setNewNoteContent] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const fabScale = useRef(new Animated.Value(1)).current;

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
        useCallback(() => {
            fetchNotes();
        }, [user?.uid])
    );

    const fetchNotes = async () => {
        const userId = user?.uid || "guest_user";
        try {
            const response = await fetch(`${CONFIG.API_URLS.NOTES}?userId=${userId}`);
            const data = await response.json();
            if (response.ok) {
                setNotes(data);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
    };

    // Timer for recording duration
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleFabPress = () => {
        Animated.sequence([
            Animated.spring(fabScale, { toValue: 0.92, friction: 4, useNativeDriver: true }),
            Animated.spring(fabScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();

        setModalVisible(true);
        setSelectedFile(null);
        setNewNoteTitle("");
        setNewNoteContent("");
        setIsRecording(false);
        setRecordingDuration(0);

        // Set newNoteType based on filterType
        setNewNoteType(filterType === "all" ? "text" : filterType);
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-powerpoint",
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                ]
            });
            if (result.canceled) return;
            setSelectedFile(result.assets[0]);
            Alert.alert("Success", "Document selected successfully!");
        } catch (err) {
            Alert.alert("Error", "Failed to pick document");
        }
    };

    const pickImage = async () => {
        try {
            const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!granted) {
                Alert.alert("Permission Required", "Please allow photo access to select images");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                aspect: [4, 3],
            });
            if (!result.canceled) {
                setSelectedFile(result.assets[0]);
                Alert.alert("Success", "Image selected successfully!");
            }
        } catch (err) {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const scanImage = async () => {
        try {
            const { granted } = await ImagePicker.requestCameraPermissionsAsync();
            if (!granted) {
                Alert.alert("Permission Required", "Please allow camera access to scan images");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                aspect: [4, 3],
            });
            if (!result.canceled) {
                setSelectedFile(result.assets[0]);
                Alert.alert("Success", "Image scanned successfully!");
            }
        } catch (err) {
            Alert.alert("Error", "Failed to scan image");
        }
    };

    // Function to upload existing voice files
    const pickVoiceFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/x-m4a", "audio/*"],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const file = result.assets[0];

            // Try to get duration if it's an audio file
            let duration = "N/A";
            try {
                const soundObject = new Audio.Sound();
                await soundObject.loadAsync({ uri: file.uri });
                const status = await soundObject.getStatusAsync();
                if (status.isLoaded) {
                    const totalSeconds = Math.floor(status.durationMillis / 1000);
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
                await soundObject.unloadAsync();
            } catch (audioErr) {
                console.log("Could not get audio duration:", audioErr);
            }

            setSelectedFile({
                ...file,
                type: 'uploaded',
                duration: duration
            });

            Alert.alert("Success", "Voice file uploaded successfully!");
        } catch (err) {
            console.error("Voice upload error:", err);
            Alert.alert("Error", "Failed to upload voice file. Please try again.");
        }
    };

    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                Alert.alert("Permission Required", "Please allow microphone access to record audio");
                return;
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
            });
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            Alert.alert("Recording", "Recording started. Tap stop when finished.");
        } catch (err) {
            console.error("Recording error:", err);
            Alert.alert("Error", "Failed to start recording. Please try again.");
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);
            if (!recording) return;
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            });
            const uri = recording.getURI();
            const duration = Math.floor(recordingDuration);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;

            setSelectedFile({
                uri,
                name: `Voice Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.m4a`,
                duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
                type: 'recorded'
            });
            setRecording(null);
            Alert.alert("Recording Saved", `Voice note recorded (${minutes}:${seconds.toString().padStart(2, '0')})`);
        } catch (err) {
            Alert.alert("Error", "Failed to save recording");
        }
    };

    const handleAddNote = () => {
        if (!newNoteTitle.trim()) {
            Alert.alert("Error", "Title is required");
            return;
        }

        const fileName = selectedFile?.name || selectedFile?.fileName || "New Note";
        const content = selectedFile ? fileName : newNoteContent;
        const duration = selectedFile?.duration || "Not specified";

        // Intelligent Type Detection
        let detectedType = newNoteType;
        if (selectedFile) {
            const ext = fileName.split('.').pop().toLowerCase();
            if (['pdf'].includes(ext)) detectedType = 'pdf';
            else if (['ppt', 'pptx'].includes(ext)) detectedType = 'ppt';
            else if (['doc', 'docx'].includes(ext)) detectedType = 'doc';
            else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) detectedType = 'image';
            else if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) detectedType = 'voice';
            else detectedType = 'file';
        }

        const newNote = {
            userId: user?.uid || "guest_user",
            title: newNoteTitle,
            content: content,
            type: detectedType,
            fileUrl: selectedFile?.uri || null, 
            subject: detectedType === "text" ? "General" :
                    ["pdf", "doc", "ppt", "file", "files", "files"].includes(detectedType) ? "Document" :
                    detectedType === "image" ? "Image" : "Voice"
        };

        // Send to backend (Use FormData for files, JSON for text-only)
        console.log("📤 Sending note to backend:", newNote);

        let body;
        let headers = {};

        if (selectedFile) {
            // Use FormData for file uploads
            body = new FormData();
            body.append('userId', newNote.userId);
            body.append('title', newNote.title);
            body.append('content', newNote.content);
            body.append('type', newNote.type);
            body.append('subject', newNote.subject);

            // Append the actual file binary
            body.append('file', {
                uri: selectedFile.uri,
                name: selectedFile.name || (newNote.type === 'voice' ? "recording.m4a" : "upload.file"),
                type: selectedFile.mimeType || 
                      (newNote.type === 'image' ? 'image/jpeg' : 
                       newNote.type === 'voice' ? 'audio/m4a' : 'application/octet-stream')
            });
            // Headers are handled automatically by FormData
        } else {
            // Use JSON for text-only notes
            body = JSON.stringify(newNote);
            headers['Content-Type'] = 'application/json';
        }

        fetch(CONFIG.API_URLS.NOTES, {
            method: 'POST',
            headers: headers,
            body: body
        })
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to save note");
            }
            return data;
        })
        .then(data => {
            if (data.note) {
                console.log("✅ Note saved successfully:", data.note);
                setNotes(prevNotes => [data.note, ...prevNotes]);
                updateUser({ notesCreated: (user?.notesCreated ?? 0) + 1 });
                Alert.alert("Success", "Note and file uploaded to MongoDB!");
            }
        })
        .catch(error => {
            console.error("❌ Error saving note:", error);
            Alert.alert("Error", `Could not save note: ${error.message}`);
        });
        
        setModalVisible(false);
        setNewNoteTitle("");
        setNewNoteContent("");
        setSelectedFile(null);
        setNewNoteType("text");
        setIsRecording(false);
        setRecordingDuration(0);
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (filterType === "all") return matchesSearch;
        
        const noteType = note.type?.toLowerCase() || "";
        if (filterType === "files") {
            return matchesSearch && ["pdf", "doc", "ppt", "file", "files"].includes(noteType);
        }
        
        return matchesSearch && noteType === filterType.toLowerCase();
    });

    const filters = [
        { value: "all", label: "All", icon: "apps-outline" },
        { value: "text", label: "Text", icon: "document-text-outline" },
        { value: "files", label: "Files", icon: "document-attach-outline" },
        { value: "image", label: "Image", icon: "image-outline" },
        { value: "voice", label: "Voice", icon: "mic-outline" },
    ];

    const getTypeColor = (type) => {
        const t = (type || "").toLowerCase();
        const map = {
            text: colors.primary,
            pdf: colors.danger,
            doc: colors.info,
            ppt: colors.warning,
            file: colors.danger,
            files: colors.danger,
            image: colors.secondary,
            voice: colors.success
        };
        return map[t] || colors.primary;
    };

    const getTypeIcon = (type) => {
        const t = (type || "").toLowerCase();
        const map = {
            text: "document-text",
            pdf: "document",
            doc: "document-text",
            ppt: "document-attach",
            file: "document-attach",
            files: "document-attach",
            image: "image",
            voice: "mic"
        };
        return map[t] || "document-text";
    };

    const handleEllipsisPress = (note) => {
        setSelectedNote(note);
        setMenuVisible(true);
    };

    const handleMenuAction = (action) => {
        if (!selectedNote) return;

        switch (action) {
            case "Summary":
                // Navigate to AI Tools with note content for summarization
                navigation.navigate("AiTools", {
                    noteContent: selectedNote.content,
                    noteTitle: selectedNote.title,
                    noteType: selectedNote.type,
                    fileUrl: selectedNote.fileUrl || selectedNote.fileUri,
                    autoGenerateSummary: true,
                    tab: "summarize"
                });
                setMenuVisible(false);
                break;

            case "Quiz":
                // Navigate to AI Tools with note content for quiz generation
                navigation.navigate("AiTools", {
                    noteContent: selectedNote.content,
                    noteTitle: selectedNote.title,
                    noteType: selectedNote.type,
                    fileUrl: selectedNote.fileUrl || selectedNote.fileUri,
                    autoGenerateQuiz: true,
                    tab: "quiz"
                });
                setMenuVisible(false);
                break;

            case "Share":
                Share.share({
                    title: selectedNote.title,
                    message: `${selectedNote.title}\n\n${selectedNote.content}\n\nShared from StudySpark App`,
                    url: selectedNote.fileUri || undefined,
                }).catch(() => Alert.alert("Error", "Failed to share"));
                setMenuVisible(false);
                break;

            case "Delete":
                Alert.alert(
                    "Delete Note",
                    `Are you sure you want to delete "${selectedNote.title}"?`,
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                                try {
                                    const response = await fetch(`${CONFIG.API_URLS.NOTES}/${selectedNote._id}`, {
                                        method: 'DELETE'
                                    });
                                    if (response.ok) {
                                        setNotes(notes.filter(n => n._id !== selectedNote._id));
                                        Alert.alert("Deleted", "Note has been deleted.");
                                    }
                                } catch (error) {
                                    console.error("Delete error:", error);
                                    Alert.alert("Error", "Failed to delete note.");
                                }
                                setMenuVisible(false);
                            }
                        },
                    ]
                );
                break;
        }
    };

    const handleNotePress = (note) => {
        navigation.navigate("NoteDetail", { note });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const renderNote = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleNotePress(item)}
            style={[
                styles.noteCard,
                styles.cardShadow,
                {
                    marginHorizontal: isTablet ? 20 : 0,
                    maxWidth: isTablet ? responsiveWidth - 40 : '100%'
                }
            ]}
        >
            <View style={styles.noteHeader}>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + "20" }]}>
                    <Ionicons
                        name={getTypeIcon(item.type)}
                        size={isSmallScreen ? 14 : isTablet ? 18 : 16}
                        color={getTypeColor(item.type)}
                    />
                    <Text style={[styles.typeText, {
                        color: getTypeColor(item.type),
                        fontSize: isSmallScreen ? 10 : isTablet ? 13 : 11
                    }]}>
                        {item.type.toUpperCase()}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        handleEllipsisPress(item);
                    }}
                    style={styles.ellipsisButton}
                >
                    <Ionicons name="ellipsis-vertical" size={isSmallScreen ? 18 : isTablet ? 24 : 22} color={colors.subText} />
                </TouchableOpacity>
            </View>

            <Text style={[
                styles.noteTitle,
                { fontSize: isSmallScreen ? 16 : isTablet ? 22 : 18 }
            ]}>{item.title}</Text>
            <Text style={[
                styles.notePreview,
                { fontSize: isSmallScreen ? 13.5 : isTablet ? 16 : 14.5 }
            ]} numberOfLines={2}>{item.content}</Text>

            <View style={styles.noteFooter}>
                <Text style={[
                    styles.dateTextSmall,
                    { fontSize: isSmallScreen ? 11 : isTablet ? 14 : 12 }
                ]}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.date}</Text>
                {item.duration && (
                    <Text style={[
                        styles.durationTextSmall,
                        { fontSize: isSmallScreen ? 11 : isTablet ? 14 : 12 }
                    ]}>• {item.duration}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <LinearGradient colors={[colors.primary, colors.primary, colors.primary + "E6"]} style={styles.header}>
                <Text style={[
                    styles.headerTitle,
                    { fontSize: isSmallScreen ? 26 : isTablet ? 38 : 34 }
                ]}>My Notes</Text>

                <View style={[
                    styles.searchBox,
                    {
                        paddingHorizontal: isSmallScreen ? 12 : isTablet ? 20 : 16,
                        height: isSmallScreen ? 48 : isTablet ? 60 : 52
                    }
                ]}>
                    <Ionicons name="search" size={isSmallScreen ? 18 : isTablet ? 24 : 22} color={colors.accent} />
                    <TextInput
                        style={[
                            styles.searchInput,
                            {
                                fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
                                marginLeft: isSmallScreen ? 8 : isTablet ? 16 : 12
                            }
                        ]}
                        placeholder="Search notes..."
                        placeholderTextColor={colors.placeholder + "AA"}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {filters.map(f => (
                        <TouchableOpacity
                            key={f.value}
                            style={[
                                styles.filterBtn,
                                filterType === f.value && styles.filterActive,
                                {
                                    paddingHorizontal: isSmallScreen ? 12 : isTablet ? 18 : 14,
                                    paddingVertical: isSmallScreen ? 6 : isTablet ? 10 : 8
                                }
                            ]}
                            onPress={() => setFilterType(f.value)}
                        >
                            <Ionicons
                                name={f.icon}
                                size={isSmallScreen ? 14 : isTablet ? 20 : 18}
                                color={filterType === f.value ? colors.primary : colors.white}
                            />
                            <Text style={[
                                styles.filterLabel,
                                filterType === f.value && styles.filterLabelActive,
                                {
                                    fontSize: isSmallScreen ? 12 : isTablet ? 16 : 14,
                                    marginLeft: isSmallScreen ? 4 : isTablet ? 8 : 6
                                }
                            ]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </LinearGradient>

            <FlatList
                data={filteredNotes}
                keyExtractor={item => item._id || item.id}
                renderItem={renderNote}
                contentContainerStyle={[
                    styles.list,
                    {
                        maxWidth: responsiveWidth,
                        alignSelf: 'center',
                        width: '100%',
                        padding: isSmallScreen ? 16 : isTablet ? 32 : 20,
                        paddingBottom: isSmallScreen ? 100 : isTablet ? 120 : 100
                    }
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-outline" size={isSmallScreen ? 48 : isTablet ? 72 : 64} color={colors.accent} />
                        <Text style={[
                            styles.emptyText,
                            { fontSize: isSmallScreen ? 18 : isTablet ? 24 : 20 }
                        ]}>No notes found</Text>
                        <Text style={[
                            styles.emptySubtext,
                            { fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16 }
                        ]}>
                            {searchQuery ? "Try a different search" : "Create your first note!"}
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        right: isTablet ? 40 : isSmallScreen ? 16 : 24,
                        bottom: isTablet ? 40 : isSmallScreen ? 16 : 34,
                        width: isSmallScreen ? 56 : isTablet ? 80 : 68,
                        height: isSmallScreen ? 56 : isTablet ? 80 : 68,
                        borderRadius: isSmallScreen ? 28 : isTablet ? 40 : 34
                    }
                ]}
                onPress={handleFabPress}
            >
                <Animated.View style={[styles.shimmer, {
                    opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
                    transform: [{ translateX: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 100] }) }]
                }]} />
                <Animated.View style={{ transform: [{ scale: fabScale }] }}>
                    <Ionicons
                        name="add"
                        size={isSmallScreen ? 24 : isTablet ? 36 : 32}
                        color={colors.white}
                    />
                </Animated.View>
            </TouchableOpacity>

            {/* Add Note Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        style={[
                            styles.modal,
                            {
                                width: isSmallScreen ? width * 0.95 : isTablet ? width * 0.7 : width * 0.92,
                                maxWidth: 500,
                                padding: isSmallScreen ? 20 : isTablet ? 32 : 24
                            }
                        ]}
                    >
                        <Text style={[
                            styles.modalTitle,
                            { fontSize: isSmallScreen ? 20 : isTablet ? 26 : 22 }
                        ]}>Add New Note</Text>

                        <TextInput
                            style={[
                                styles.input,
                                {
                                    height: isSmallScreen ? 50 : isTablet ? 60 : 56,
                                    fontSize: isSmallScreen ? 15 : isTablet ? 18 : 16
                                }
                            ]}
                            placeholder="Note Title"
                            placeholderTextColor={colors.placeholder}
                            value={newNoteTitle}
                            onChangeText={setNewNoteTitle}
                            maxLength={100}
                        />

                        {/* Type picker - shows only relevant options based on filter */}
                        {filterType === "all" ? (
                            <View style={styles.typePicker}>
                                {["text", "files", "image", "voice"].map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[
                                            styles.typeBtn,
                                            newNoteType === t && styles.typeActive,
                                            {
                                                padding: isSmallScreen ? 10 : isTablet ? 16 : 12,
                                                marginBottom: isSmallScreen ? 4 : 8
                                            }
                                        ]}
                                        onPress={() => setNewNoteType(t)}
                                    >
                                        <Ionicons
                                            name={getTypeIcon(t)}
                                            size={isSmallScreen ? 18 : isTablet ? 24 : 22}
                                            color={newNoteType === t ? colors.white : getTypeColor(t)}
                                        />
                                        <Text style={[
                                            styles.typeLabel,
                                            newNoteType === t && { color: colors.white },
                                            {
                                                fontSize: isSmallScreen ? 12 : isTablet ? 16 : 14,
                                                marginLeft: isSmallScreen ? 6 : isTablet ? 10 : 8
                                            }
                                        ]}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            // When a specific filter is selected, show only that type (fixed)
                            <View style={[styles.fixedTypeContainer, {
                                backgroundColor: getTypeColor(filterType) + "20",
                                borderColor: getTypeColor(filterType) + "40"
                            }]}>
                                <Ionicons
                                    name={getTypeIcon(filterType)}
                                    size={isSmallScreen ? 28 : isTablet ? 36 : 32}
                                    color={getTypeColor(filterType)}
                                />
                                <Text style={[
                                    styles.fixedTypeText,
                                    {
                                        fontSize: isSmallScreen ? 16 : isTablet ? 20 : 18,
                                        color: getTypeColor(filterType)
                                    }
                                ]}>
                                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)} Note
                                </Text>
                                <Text style={[
                                    styles.fixedTypeSubtext,
                                    { fontSize: isSmallScreen ? 13 : isTablet ? 16 : 14 }
                                ]}>
                                    {filterType === "text" ? "Type your text below" :
                                        filterType === "files" ? "Upload a PDF/DOC/PPT file" :
                                            filterType === "image" ? "Upload an image" :
                                                "Record or upload voice note"}
                                </Text>
                            </View>
                        )}

                        {newNoteType === "text" ? (
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        height: isSmallScreen ? 100 : isTablet ? 140 : 120,
                                        fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16
                                    }
                                ]}
                                placeholder="Start typing your note here..."
                                placeholderTextColor={colors.placeholder}
                                multiline
                                textAlignVertical="top"
                                value={newNoteContent}
                                onChangeText={setNewNoteContent}
                                maxLength={2000}
                            />
                        ) : newNoteType === "files" ? (
                            <TouchableOpacity
                                style={[
                                    styles.uploadBtn,
                                    { padding: isSmallScreen ? 14 : isTablet ? 20 : 16 }
                                ]}
                                onPress={pickDocument}
                            >
                                <Ionicons name="document-attach" size={isSmallScreen ? 22 : isTablet ? 28 : 26} color={colors.primary} />
                                <View style={{ flex: 1, marginLeft: isSmallScreen ? 10 : isTablet ? 16 : 12 }}>
                                    <Text style={[
                                        styles.uploadText,
                                        { fontSize: isSmallScreen ? 14 : isTablet ? 17 : 16 }
                                    ]}>
                                        {selectedFile ? selectedFile.name : "Pick PDF/DOC/PPT File"}
                                    </Text>
                                    {selectedFile && (
                                        <Text style={[
                                            styles.fileSizeText,
                                            { fontSize: isSmallScreen ? 12 : isTablet ? 14 : 14 }
                                        ]}>
                                            {selectedFile.size ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "File selected"}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ) : newNoteType === "image" ? (
                            <View style={styles.voiceOptionsRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.recordButton,
                                        {
                                            padding: isSmallScreen ? 14 : isTablet ? 20 : 18,
                                            marginRight: isSmallScreen ? 6 : isTablet ? 12 : 8
                                        }
                                    ]}
                                    onPress={scanImage}
                                >
                                    <Ionicons name="camera" size={isSmallScreen ? 24 : isTablet ? 32 : 30} color={colors.primary} />
                                    <Text style={[
                                        styles.recordButtonText,
                                        { fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16 }
                                    ]}>
                                        Scan Image
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.uploadVoiceButton,
                                        {
                                            padding: isSmallScreen ? 14 : isTablet ? 20 : 18,
                                            marginLeft: isSmallScreen ? 6 : isTablet ? 12 : 8
                                        }
                                    ]}
                                    onPress={pickImage}
                                >
                                    <Ionicons name="image" size={isSmallScreen ? 24 : isTablet ? 32 : 30} color={colors.primary} />
                                    <Text style={[
                                        styles.uploadVoiceButtonText,
                                        { fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16 }
                                    ]}>
                                        {selectedFile ? "Change Image" : "Gallery"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.voiceRecordingContainer}>
                                <View style={styles.voiceOptionsRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.recordButton,
                                            isRecording && styles.recordingButton,
                                            {
                                                padding: isSmallScreen ? 14 : isTablet ? 20 : 18,
                                                marginRight: isSmallScreen ? 6 : isTablet ? 12 : 8
                                            }
                                        ]}
                                        onPress={isRecording ? stopRecording : startRecording}
                                    >
                                        <Ionicons
                                            name={isRecording ? "stop-circle" : "mic"}
                                            size={isSmallScreen ? 24 : isTablet ? 32 : 30}
                                            color={isRecording ? colors.danger : colors.primary}
                                        />
                                        <Text style={[
                                            styles.recordButtonText,
                                            { fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16 }
                                        ]}>
                                            {isRecording ? "Stop Recording" : selectedFile ? "Re-record" : "Record Voice"}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.uploadVoiceButton,
                                            {
                                                padding: isSmallScreen ? 14 : isTablet ? 20 : 18,
                                                marginLeft: isSmallScreen ? 6 : isTablet ? 12 : 8
                                            }
                                        ]}
                                        onPress={pickVoiceFile}
                                    >
                                        <Ionicons
                                            name="cloud-upload"
                                            size={isSmallScreen ? 24 : isTablet ? 32 : 30}
                                            color={colors.primary}
                                        />
                                        <Text style={[
                                            styles.uploadVoiceButtonText,
                                            { fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16 }
                                        ]}>
                                            Upload Voice
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {isRecording && (
                                    <View style={styles.recordingTimer}>
                                        <Ionicons name="radio-button-on" size={isSmallScreen ? 16 : isTablet ? 20 : 18} color={colors.danger} />
                                        <Text style={[
                                            styles.recordingTimerText,
                                            { fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16 }
                                        ]}>
                                            Recording: {formatTime(recordingDuration)}
                                        </Text>
                                    </View>
                                )}

                                {selectedFile && !isRecording && (
                                    <View style={styles.recordingPreview}>
                                        <Ionicons
                                            name={selectedFile.type === 'uploaded' ? "cloud-done" : "play-circle"}
                                            size={isSmallScreen ? 20 : isTablet ? 24 : 22}
                                            color={colors.success}
                                        />
                                        <View style={[
                                            styles.recordingInfo,
                                            { marginLeft: isSmallScreen ? 10 : isTablet ? 16 : 12 }
                                        ]}>
                                            <Text style={[
                                                styles.recordingPreviewText,
                                                { fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16 }
                                            ]}>
                                                {selectedFile.type === 'uploaded' ? "Voice file uploaded" : "Voice note recorded"}
                                            </Text>
                                            <Text style={[
                                                styles.recordingDetailsText,
                                                { fontSize: isSmallScreen ? 12 : isTablet ? 14 : 14 }
                                            ]}>
                                                {selectedFile.name} • {selectedFile.duration || "Duration: N/A"}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setSelectedFile(null)}
                                            style={styles.removeButton}
                                        >
                                            <Ionicons name="close-circle" size={isSmallScreen ? 20 : isTablet ? 24 : 22} color={colors.subText} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={[
                            styles.modalActions,
                            { marginTop: isSmallScreen ? 16 : isTablet ? 24 : 20 }
                        ]}>
                            <TouchableOpacity
                                style={[
                                    styles.cancelBtn,
                                    { padding: isSmallScreen ? 14 : isTablet ? 20 : 16 }
                                ]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[
                                    styles.cancelText,
                                    { fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16 }
                                ]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.addBtn,
                                    { padding: isSmallScreen ? 14 : isTablet ? 20 : 16 }
                                ]}
                                onPress={handleAddNote}
                                disabled={!newNoteTitle.trim()}
                            >
                                <Text style={[
                                    styles.addText,
                                    { fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16 }
                                ]}>Add Note</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Ellipsis Menu Modal */}
            <Modal
                visible={menuVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        style={[
                            styles.menu,
                            {
                                width: isSmallScreen ? width * 0.85 : isTablet ? width * 0.5 : width * 0.8,
                                maxWidth: 400,
                                padding: isSmallScreen ? 16 : isTablet ? 24 : 20
                            }
                        ]}
                    >
                        <Text style={[
                            styles.menuTitle,
                            { fontSize: isSmallScreen ? 16 : isTablet ? 22 : 18 }
                        ]}>{selectedNote?.title || "Note Options"}</Text>

                        <TouchableOpacity
                            style={[
                                styles.menuItem,
                                { paddingVertical: isSmallScreen ? 12 : isTablet ? 16 : 14 }
                            ]}
                            onPress={() => handleMenuAction("Summary")}
                        >
                            <Ionicons name="bulb-outline" size={isSmallScreen ? 20 : isTablet ? 24 : 22} color={colors.primary} />
                            <Text style={[
                                styles.menuText,
                                {
                                    fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
                                    marginLeft: isSmallScreen ? 12 : isTablet ? 16 : 14
                                }
                            ]}>Generate Summary</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.menuItem,
                                { paddingVertical: isSmallScreen ? 12 : isTablet ? 16 : 14 }
                            ]}
                            onPress={() => handleMenuAction("Quiz")}
                        >
                            <Ionicons name="school-outline" size={isSmallScreen ? 20 : isTablet ? 24 : 22} color={colors.primary} />
                            <Text style={[
                                styles.menuText,
                                {
                                    fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
                                    marginLeft: isSmallScreen ? 12 : isTablet ? 16 : 14
                                }
                            ]}>Generate Quiz</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.menuItem,
                                { paddingVertical: isSmallScreen ? 12 : isTablet ? 16 : 14 }
                            ]}
                            onPress={() => handleMenuAction("Share")}
                        >
                            <Ionicons name="share-outline" size={isSmallScreen ? 20 : isTablet ? 24 : 22} color={colors.primary} />
                            <Text style={[
                                styles.menuText,
                                {
                                    fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
                                    marginLeft: isSmallScreen ? 12 : isTablet ? 16 : 14
                                }
                            ]}>Share Note</Text>
                        </TouchableOpacity>

                        <View style={[
                            styles.menuDivider,
                            { marginVertical: isSmallScreen ? 8 : isTablet ? 12 : 8 }
                        ]} />

                        <TouchableOpacity
                            style={[
                                styles.menuItem,
                                { paddingVertical: isSmallScreen ? 12 : isTablet ? 16 : 14 }
                            ]}
                            onPress={() => handleMenuAction("Delete")}
                        >
                            <Ionicons name="trash-outline" size={isSmallScreen ? 20 : isTablet ? 24 : 22} color={colors.danger} />
                            <Text style={[
                                styles.menuText,
                                {
                                    fontSize: isSmallScreen ? 14 : isTablet ? 18 : 16,
                                    marginLeft: isSmallScreen ? 12 : isTablet ? 16 : 14,
                                    color: colors.danger
                                }
                            ]}>
                                Delete Note
                            </Text>
                        </TouchableOpacity>

                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTitle: {
        fontWeight: "800",
        color: colors.white,
        marginBottom: 16,
        textAlign: "center",
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.inputBackground + "30", // Transparent look for header
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border + "40",
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        color: colors.white,
    },
    filterRow: {
        flexDirection: "row",
        paddingBottom: 4,
    },
    filterBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.15)", // Premium glass look
        marginRight: 8,
    },
    filterActive: {
        backgroundColor: colors.white
    },
    filterLabel: {
        color: colors.white,
        fontWeight: "500",
        opacity: 0.9,
    },
    filterLabelActive: {
        color: colors.primary,
        fontWeight: "700"
    },
    list: {
        paddingBottom: 100,
    },
    noteCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    cardShadow: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    noteHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
    },
    typeBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12
    },
    typeText: {
        marginLeft: 6,
        fontWeight: "700"
    },
    ellipsisButton: {
        padding: 4,
    },
    noteTitle: {
        fontWeight: "700",
        color: colors.text,
        marginBottom: 6
    },
    notePreview: {
        color: colors.subText,
        lineHeight: 22,
        marginBottom: 8,
    },
    noteFooter: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateTextSmall: {
        color: colors.subText
    },
    durationTextSmall: {
        color: colors.subText,
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontWeight: "600",
        color: colors.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        color: colors.subText,
        textAlign: "center",
    },
    fab: {
        position: "absolute",
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 25,
        elevation: 20,
        overflow: "hidden",
    },
    shimmer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay, // Use themed overlay
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    modal: {
        backgroundColor: colors.card,
        borderRadius: 24,
        width: "100%",
    },
    modalTitle: {
        fontWeight: "700",
        color: colors.primary,
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
        color: colors.text,
        backgroundColor: colors.card,
    },
    typePicker: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        flexWrap: "wrap",
    },
    typeBtn: {
        flex: 1,
        minWidth: "23%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        backgroundColor: colors.inputBackground,
    },
    typeActive: {
        backgroundColor: colors.primary
    },
    typeLabel: {
        fontWeight: "600",
        color: colors.primary,
    },
    fixedTypeContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 20,
    },
    fixedTypeText: {
        fontWeight: "700",
        marginTop: 8,
        marginBottom: 4,
    },
    fixedTypeSubtext: {
        color: colors.subText,
        textAlign: "center",
    },
    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: "dashed",
        marginBottom: 20,
    },
    uploadText: {
        fontWeight: "600",
        color: colors.primary,
    },
    fileSizeText: {
        color: colors.subText,
        marginTop: 2,
    },
    voiceRecordingContainer: {
        marginBottom: 3,
    },
    voiceOptionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    uploadVoiceButton: {
        width: "48%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: "dashed",
        backgroundColor: colors.accent,
    },
    uploadVoiceButtonText: {
        marginLeft: 8,
        fontWeight: "600",
        color: colors.primary,
    },
    recordButton: {
        width: "48%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: colors.primary + "15",
    },
    recordingButton: {
        borderColor: colors.danger,
        backgroundColor: colors.danger + "15",
    },
    recordButtonText: {
        marginLeft: 12,
        fontWeight: "600",
        color: colors.primary,
    },
    recordingTimer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
    },
    recordingTimerText: {
        marginLeft: 8,
        color: colors.danger,
        fontWeight: "600",
    },
    recordingPreview: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.success + "20",
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
    },
    recordingInfo: {
        flex: 1,
    },
    recordingPreviewText: {
        color: colors.success, // or a darker variant if available, but success color works
        fontWeight: "500",
    },
    recordingDetailsText: {
        color: colors.subText,
        marginTop: 2,
    },
    removeButton: {
        padding: 4,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: colors.disabled,
        borderRadius: 16,
    },
    cancelText: {
        color: colors.white,
        textAlign: "center",
        fontWeight: "600",
    },
    addBtn: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: 16,
    },
    addText: {
        color: colors.white,
        textAlign: "center",
        fontWeight: "700",
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    menu: {
        backgroundColor: colors.card,
        borderRadius: 20,
        width: "100%",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    },
    menuTitle: {
        fontWeight: "700",
        color: colors.primary,
        textAlign: "center",
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuText: {
        color: colors.text,
        fontWeight: "600",
    },
    menuDivider: {
        height: 1,
        backgroundColor: colors.divider,
    },
});
