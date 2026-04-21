import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
    SafeAreaView,
    TextInput,
    Platform,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Speech from "expo-speech";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from "../context/AuthContext";
import { askGemini } from "../constants/gemini";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isSmallDevice = screenHeight <= 667;

// ✅ RESPONSIVE SCALING
const scale = (size) => Math.min(screenWidth, 600) / 375 * size;
const verticalScale = (size) => screenHeight / 812 * size;

// ✅ Custom Textarea Component
const Textarea = ({
    placeholder,
    value,
    onChangeText,
    rows = 4,
    editable = true,
    style,
    colors,
    styles,
    isTablet
}) => {
    const height = rows * (isTablet ? 30 : 25);

    return (
        <TextInput
            style={[
                styles.textarea,
                {
                    height: Math.max(height, 80),
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.inputBackground
                },
                style
            ]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            multiline={true}
            numberOfLines={rows}
            editable={editable}
            textAlignVertical="top"
            placeholderTextColor={colors.placeholder}
        />
    );
};

export default function AITools({ route, notes = [] }) {
    const { colors, updateUser, recordActivity } = useAuth();
    const styles = getStyles(colors);
    const [activeTab, setActiveTab] = useState("summarize");
    const [selectedNoteId, setSelectedNoteId] = useState("");
    const [inputText, setInputText] = useState("");
    const [summary, setSummary] = useState("");
    const [quiz, setQuiz] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [isAutoGenerating, setIsAutoGenerating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [numQuestions, setNumQuestions] = useState(5);

    // ✅ Handle navigation from NotesScreen
    useEffect(() => {
        if (route?.params) {
            const { noteContent, noteTitle, autoGenerateSummary, autoGenerateQuiz, tab } = route.params;

            if (noteContent) {
                setInputText(noteContent);
            }

            if (tab) {
                setActiveTab(tab);
            }

            if (autoGenerateSummary) {
                setIsAutoGenerating(true);
                setTimeout(() => {
                    handleSummarize();
                    setIsAutoGenerating(false);
                }, 1000);
            }

            if (autoGenerateQuiz) {
                setIsAutoGenerating(true);
                setTimeout(() => {
                    handleGenerateQuiz();
                    setIsAutoGenerating(false);
                }, 1000);
            }
        }
    }, [route?.params]);

    // ✅ Sync note content when note is selected from dropdown
    useEffect(() => {
        if (selectedNoteId) {
            const note = notes.find((n) => n.id === selectedNoteId);
            if (note) {
                setInputText(note.content || "");
                showToast("Note Loaded", `"${note.title}" loaded for AI processing`);
            }
        }
    }, [selectedNoteId, notes]);

    const showToast = (title, message) => {
        Alert.alert(title, message, [{ text: "OK" }]);
    };

    // ✅ PDF/DOC/PPT File Upload
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-powerpoint",
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    "text/plain",
                    "application/rtf",
                ],
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled && result.assets.length > 0) {
                const newFiles = result.assets.map(file => {
                    const fileName = file.name;
                    const fileExt = fileName.split('.').pop().toLowerCase();

                    let fileType = "document";
                    let fileIcon = "document";
                    let fileColor = colors.primary;

                    if (fileExt === 'pdf' || file.mimeType === 'application/pdf') {
                        fileType = "PDF";
                        fileIcon = "document";
                        fileColor = colors.danger;
                    } else if (fileExt === 'doc' || fileExt === 'docx' ||
                        file.mimeType?.includes('word')) {
                        fileType = "DOC";
                        fileIcon = "document-text";
                        fileColor = colors.info;
                    } else if (fileExt === 'ppt' || fileExt === 'pptx' ||
                        file.mimeType?.includes('powerpoint')) {
                        fileType = "PPT";
                        fileIcon = "document-attach";
                        fileColor = colors.success;
                    } else if (fileExt === 'txt' || file.mimeType === 'text/plain') {
                        fileType = "TXT";
                        fileIcon = "document-text";
                        fileColor = colors.subText;
                    }

                    return {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        type: fileType,
                        icon: fileIcon,
                        color: fileColor,
                        size: file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown',
                        uri: file.uri,
                        mimeType: file.mimeType
                    };
                });

                setUploadedFiles(prev => [...prev, ...newFiles]);

                if (newFiles.length === 1) {
                    showToast("✅ File Uploaded", `${newFiles[0].name} ready for AI processing!`);
                } else {
                    showToast("✅ Files Uploaded", `${newFiles.length} files ready for AI processing!`);
                }
            }
        } catch (err) {
            console.error("Document picker error:", err);
            showToast("❌ Upload Failed", "Could not upload document. Please try again.");
        }
    };

    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        showToast("🗑️ File Removed", "File removed from list");
    };

    const startVoiceNoteOption = () => {
        Alert.alert(
            "Voice Option",
            "Choose an option",
            [
                { text: "Record Voice", onPress: startVoiceNote },
                { text: "Upload Voice File", onPress: pickVoiceFile },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const startVoiceNote = async () => {
        showToast("🎙️ Speech-to-Text Not Native", "App currently only supports uploading voice files for Gemini.");
    };

    const pickVoiceFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "audio/*",
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const newFile = {
                    id: Date.now(),
                    name: file.name,
                    type: "AUDIO",
                    icon: "mic",
                    color: colors.success,
                    size: file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown',
                    uri: file.uri,
                    mimeType: file.mimeType || "audio/mpeg"
                };
                setUploadedFiles(prev => [...prev, newFile]);
                showToast("✅ Audio Uploaded", `${file.name} ready for analysis`);
            }
        } catch (err) {
            console.error("Audio picker error:", err);
            showToast("❌ Upload Failed", "Could not upload audio file.");
        }
    };

    const pickImageOption = () => {
        Alert.alert(
            "Image Option",
            "Choose an option",
            [
                { text: "Take Photo", onPress: takePhoto },
                { text: "Choose from Gallery", onPress: pickImage },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                showToast("❌ Permission", "Camera access needed for OCR.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.9,
            });

            if (!result.canceled && result.assets?.[0]) {
                processImage(result.assets[0]);
            }
        } catch (err) {
            console.error("Camera error:", err);
            showToast("❌ Camera Failed", "Could not capture image.");
        }
    };

    const pickImage = async () => {
        try {
            const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!granted) {
                showToast("❌ Permission", "Gallery access needed for OCR.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.9,
            });

            if (!result.canceled && result.assets?.[0]) {
                processImage(result.assets[0]);
            }
        } catch (err) {
            console.error("Image error:", err);
            showToast("❌ Image Failed", "Could not process the image.");
        }
    };

    const processImage = (asset) => {
        showToast("🖼️ Image Added", "Image ready for Gemini OCR processing.");
        
        const newFile = {
            id: Date.now(),
            name: asset.fileName || "Scanned Image",
            type: "IMAGE",
            icon: "image",
            color: colors.primary,
            size: asset.fileSize ? `${Math.round(asset.fileSize / 1024)} KB` : 'Unknown',
            uri: asset.uri,
            mimeType: asset.mimeType || "image/jpeg"
        };
        setUploadedFiles(prev => [...prev, newFile]);
    };

    const speakSummary = async () => {
        if (!summary) return;

        try {
            if (isSpeaking) {
                await Speech.stop();
                setIsSpeaking(false);
            } else {
                await Speech.speak(summary.replace(/##.*\n/g, ''), {
                    language: 'en',
                    pitch: 1.0,
                    rate: 0.9,
                });
                setIsSpeaking(true);
            }
        } catch (err) {
            showToast("❌ Speech Error", "Could not read summary aloud.");
        }
    };

    const handleSummarize = async () => {
        if (!inputText.trim() && uploadedFiles.length === 0) {
            showToast("❌ No Content", "Upload files or type content first");
            return;
        }

        setIsGenerating(true);
        setSummary("");

        try {
            // Convert files to base64 inlineData format
            const filesToSend = [];
            for (const file of uploadedFiles) {
                // Ignore unsupported files
                if (file.type === "DOC" || file.type === "PPT") {
                    showToast("⚠️ Note", `${file.name} is a format not supported directly by this AI model yet. Skipping it.`);
                    continue;
                }

                try {
                    const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' });
                    filesToSend.push({
                        mimeType: file.mimeType || 'application/pdf',
                        base64: base64
                    });
                } catch(e) {
                    console.error("Failed to read file", file.name, e);
                }
            }

            const prompt = `You are an expert academic tutor. Provide a precise, well-structured summary. 
            Highlight the key concepts, main take-away points, and any important definitions using bullet points. 
            Format the output beautifully for a mobile app screen using markdown.

            Content to summarize:
            ${inputText}`;

            const responseText = await askGemini(prompt, filesToSend);
            setSummary(responseText);
            showToast("✅ Summary Ready!", "AI has analyzed your content.");
        } catch (error) {
            console.error("AI Summarize Error:", error);
            showToast("❌ AI Error", "Failed to generate summary. Please check your connection.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!inputText.trim() && uploadedFiles.length === 0) {
            showToast("❌ No Content", "Upload files or add text first");
            return;
        }

        setIsGenerating(true);
        setQuiz([]);
        setShowResults(false);
        setQuizAnswers({});

        try {
            // Convert files
            const filesToSend = [];
            for (const file of uploadedFiles) {
                if (file.type === "DOC" || file.type === "PPT") continue;
                try {
                    const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' });
                    filesToSend.push({
                        mimeType: file.mimeType || 'application/pdf',
                        base64: base64
                    });
                } catch(e) {}
            }

            const prompt = `Generate a ${numQuestions}-question multiple-choice quiz based on the provided material or content. 
            You must return a valid JSON array of objects. Each object must have:
            - "id": a unique number
            - "question": the question string
            - "options": an array of exactly 4 strings
            - "correct": a number (0-3) representing the index of the correct option in the "options" array.

            Ensure the questions are challenging and cover the most important parts of the text.
            Do not include any text, markdown formatting, or explanations outside of the JSON array.

            Content:
            ${inputText}`;

            const questions = await askGemini(prompt, filesToSend, true);
            
            if (Array.isArray(questions)) {
                setQuiz(questions);
                showToast("✅ Quiz Generated!", `${questions.length} questions ready for you!`);
            } else {
                throw new Error("Invalid response format from AI");
            }
        } catch (error) {
            console.error("AI Quiz Error:", error);
            showToast("❌ AI Error", "Failed to generate quiz. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const checkAnswers = () => {
        if (quiz.length === 0) return;

        const correctCount = quiz.filter((q) => quizAnswers[q.id] === q.options[q.correct]).length;
        const percentage = Math.round((correctCount / quiz.length) * 100);

        setScore(percentage);
        setShowResults(true);

        // Update global user state with the quiz score and record activity for streak
        updateUser({ quizScore: `${percentage}%` });
        recordActivity();

        showToast("Results", `You scored ${percentage}%`);
    };

    const NoteSelector = () => {
        if (!notes || notes.length === 0) return null;

        return (
            <View style={styles.noteSelector}>
                <Text style={styles.selectorLabel}>Or Select from Notes:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.notesScroll} >
                    {notes.map((note) => (
                        <TouchableOpacity
                            key={note.id}
                            style={[
                                styles.noteOption,
                                selectedNoteId === note.id && styles.noteOptionActive
                            ]}
                            onPress={() => setSelectedNoteId(note.id)}
                            disabled={isGenerating}
                        >
                            <Ionicons
                                name={getTypeIcon(note.type)}
                                size={scale(18)}
                                color={selectedNoteId === note.id ? colors.white : getTypeColor(note.type)}
                            />
                            <Text
                                style={[
                                    styles.noteOptionText,
                                    selectedNoteId === note.id && styles.noteOptionTextActive
                                ]}
                                numberOfLines={1}
                            >
                                {note.title || `Note ${note.id.slice(0, 4)}`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const UploadedFilesList = () => {
        if (uploadedFiles.length === 0) return null;

        return (
            <View style={styles.uploadedFilesSection}>
                <Text style={styles.uploadedFilesTitle}>📁 Uploaded Files ({uploadedFiles.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filesScroll}>
                    {uploadedFiles.map((file) => (
                        <View key={file.id} style={styles.fileCard}>
                            <View style={[styles.fileIconContainer, { backgroundColor: file.color + '20' }]}>
                                <Ionicons name={file.icon} size={scale(24)} color={file.color} />
                            </View>
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                <View style={styles.fileMeta}>
                                    <Text style={[styles.fileType, { color: file.color }]}>{file.type}</Text>
                                    <Text style={styles.fileSize}> • {file.size}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.removeFileBtn} onPress={() => removeFile(file.id)} disabled={isGenerating}>
                                <Ionicons name="close-circle" size={scale(20)} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const getTypeColor = (type) => {
        const map = { text: colors.primary, pdf: colors.danger, image: colors.primary, voice: colors.success };
        return map[type] || colors.primary;
    };

    const getTypeIcon = (type) => {
        const map = { text: "document-text", pdf: "document-attach", image: "image", voice: "mic" };
        return map[type] || "document-text";
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                backgroundColor="transparent"
                translucent={true}
                barStyle="light-content"
            />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Ionicons name="sparkles" size={scale(40)} color={colors.white} />
                    <Text style={styles.headerTitle}>AI Study Tools</Text>
                </View>

                {isAutoGenerating && (
                    <View style={styles.autoGenIndicator}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.autoGenText}>
                            {activeTab === "summarize" ? "Generating Summary..." : "Generating Quiz..."}
                        </Text>
                    </View>
                )}

                <View style={styles.uploadSection}>
                    <Text style={styles.sectionTitle}>Add Study Material</Text>
                    <View style={styles.uploadRow}>
                        <TouchableOpacity style={[styles.uploadBtn, styles.filesBtn]} onPress={pickDocument} disabled={isGenerating}>
                            <View style={[styles.uploadBtnIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="folder" size={scale(28)} color={colors.white} />
                            </View>
                            <Text style={styles.uploadBtnText}>Files</Text>
                            <Text style={styles.uploadBtnSub}>PDF/DOC/PPT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.uploadBtn, styles.voiceBtn]} onPress={startVoiceNoteOption} disabled={isGenerating}>
                            <View style={[styles.uploadBtnIcon, { backgroundColor: colors.success }]}>
                                <Ionicons name="mic" size={scale(28)} color={colors.white} />
                            </View>
                            <Text style={styles.uploadBtnText}>Voice Note</Text>
                            <Text style={styles.uploadBtnSub}>Record / Upload</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.uploadBtn, styles.imageBtn]} onPress={pickImageOption} disabled={isGenerating}>
                            <View style={[styles.uploadBtnIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="camera" size={scale(28)} color={colors.white} />
                            </View>
                            <Text style={styles.uploadBtnText}>Scan Notes</Text>
                            <Text style={styles.uploadBtnSub}>Camera / Gallery</Text>
                        </TouchableOpacity>
                    </View>
                    <UploadedFilesList />
                    <NoteSelector />
                </View>

                <View style={styles.tabBar}>
                    <TouchableOpacity style={[styles.tab, activeTab === "summarize" && styles.tabActive]} onPress={() => setActiveTab("summarize")} disabled={isGenerating}>
                        <Text style={[styles.tabText, activeTab === "summarize" && styles.tabTextActive]}>Summarize</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === "quiz" && styles.tabActive]} onPress={() => setActiveTab("quiz")} disabled={isGenerating}>
                        <Text style={[styles.tabText, activeTab === "quiz" && styles.tabTextActive]}>Quiz</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === "summarize" && (
                    <View style={styles.contentSection}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>AI Summarization</Text>
                            {route?.params?.noteTitle && (
                                <View style={styles.sourceNote}>
                                    <Ionicons name="document-text" size={scale(20)} color={colors.primary} />
                                    <Text style={styles.sourceNoteText}>From: {route.params.noteTitle}</Text>
                                </View>
                            )}
                            <Textarea
                                placeholder="Content appears here after upload..."
                                value={inputText}
                                onChangeText={setInputText}
                                rows={isSmallDevice ? 4 : isTablet ? 8 : 6}
                                editable={!isGenerating}
                                colors={colors}
                                styles={styles}
                                isTablet={isTablet}
                            />
                            <TouchableOpacity 
                                style={[styles.actionBtn, (isGenerating || (!inputText.trim() && uploadedFiles.length === 0)) && styles.actionBtnDisabled]} 
                                onPress={handleSummarize} 
                                disabled={isGenerating || (!inputText.trim() && uploadedFiles.length === 0)}
                            >
                                {isGenerating ? <ActivityIndicator size="small" color={colors.white} /> : <Ionicons name="sparkles" size={scale(20)} color={colors.white} />}
                                <Text style={styles.actionBtnText}>{isGenerating ? "Generating..." : " Generate Summary"}</Text>
                            </TouchableOpacity>
                            {summary ? (
                                <View style={styles.resultBox}>
                                    <View style={styles.resultHeader}>
                                        <Text style={styles.resultTitle}>AI Summary</Text>
                                        <TouchableOpacity onPress={speakSummary} style={styles.speakBtn}>
                                            <Ionicons name={isSpeaking ? "volume-high" : "volume-medium"} size={scale(24)} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.resultText}>{summary}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                )}

                {activeTab === "quiz" && (
                    <View style={styles.contentSection}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>AI Quiz Generator</Text>
                            {route?.params?.noteTitle && (
                                <View style={styles.sourceNote}>
                                    <Ionicons name="document-text" size={scale(20)} color={colors.primary} />
                                    <Text style={styles.sourceNoteText}>From: {route.params.noteTitle}</Text>
                                </View>
                            )}
                            <Textarea
                                placeholder="Upload content to generate quiz..."
                                value={inputText}
                                onChangeText={setInputText}
                                rows={isSmallDevice ? 3 : isTablet ? 6 : 4}
                                editable={!isGenerating}
                                colors={colors}
                                styles={styles}
                                isTablet={isTablet}
                            />
                            <TouchableOpacity 
                                style={[styles.actionBtn, (isGenerating || (!inputText.trim() && uploadedFiles.length === 0)) && styles.actionBtnDisabled]} 
                                onPress={handleGenerateQuiz} 
                                disabled={isGenerating || (!inputText.trim() && uploadedFiles.length === 0)}
                            >
                                {isGenerating ? <ActivityIndicator size="small" color={colors.white} /> : <Ionicons name="bulb" size={scale(20)} color={colors.white} />}
                                <Text style={styles.actionBtnText}>{isGenerating ? "Creating..." : "Generate Quiz"}</Text>
                            </TouchableOpacity>

                            {!isGenerating && quiz.length === 0 && (inputText.trim() || uploadedFiles.length > 0) && (
                                <View style={styles.numSelector}>
                                    <Text style={styles.selectorLabel}>Questions:</Text>
                                    {[5, 10, 15].map(num => (
                                        <TouchableOpacity
                                            key={num}
                                            style={[styles.numBtn, numQuestions === num && styles.numBtnActive]}
                                            onPress={() => setNumQuestions(num)}
                                        >
                                            <Text style={[styles.numText, numQuestions === num && styles.numTextActive]}>{num}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {quiz.length > 0 && (
                                <>
                                    {showResults && (
                                        <View style={styles.resultsCard}>
                                            <Ionicons name="trophy" size={scale(48)} color={colors.warning} />
                                            <Text style={styles.scoreText}>{score}%</Text>
                                            <View style={styles.progressContainer}>
                                                <View style={[styles.progressBar, { width: `${score}%` }]} />
                                            </View>
                                            <Text style={styles.scoreResultText}>Review your answers below!</Text>
                                        </View>
                                    )}

                                    {quiz.map((q, i) => {
                                        const correct = showResults && quizAnswers[q.id] === q.options[q.correct];
                                        const wrong = showResults && quizAnswers[q.id] && !correct;
                                        return (
                                            <View key={q.id} style={[styles.qCard, correct && styles.qCorrect, wrong && styles.qWrong]}>
                                                <View style={styles.qHeader}>
                                                    <Text style={styles.qNum}>{i + 1}.</Text>
                                                    <Text style={styles.qText}>{q.question}</Text>
                                                </View>
                                                {q.options.map((option, idx) => {
                                                    const isCorrectOption = showResults && option === q.options[q.correct];
                                                    const userSelected = quizAnswers[q.id] === option;
                                                    return (
                                                        <TouchableOpacity
                                                            key={idx}
                                                            style={[
                                                                styles.optionRow,
                                                                userSelected && styles.optionSelected,
                                                                showResults && isCorrectOption && styles.optionCorrect,
                                                                showResults && userSelected && !isCorrectOption && styles.optionWrong
                                                            ]}
                                                            onPress={() => !showResults && setQuizAnswers({ ...quizAnswers, [q.id]: option })}
                                                            disabled={showResults || isGenerating}
                                                        >
                                                            <View style={[styles.radioCircle, userSelected && styles.radioSelected, isCorrectOption && showResults && styles.radioCorrect]} />
                                                            <Text style={[styles.optionText, isCorrectOption && showResults && styles.optionCorrectText, userSelected && showResults && !isCorrectOption && styles.optionWrongText]}>{option}</Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        );
                                    })}

                                    {!showResults && quiz.length > 0 && (
                                        <TouchableOpacity style={[styles.submitBtn, Object.keys(quizAnswers).length !== quiz.length && styles.submitBtnDisabled]} onPress={checkAnswers} disabled={Object.keys(quizAnswers).length !== quiz.length}>
                                            <Text style={styles.submitBtnText}> Submit & Check Answers</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingBottom: verticalScale(50) },
    header: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(24),
        paddingTop: verticalScale(40),
        borderBottomLeftRadius: scale(32),
        borderBottomRightRadius: scale(32),
        marginBottom: verticalScale(24),
        ...Platform.select({
            ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
            android: { elevation: 8 },
        }),
    },
    headerTitle: { fontSize: scale(28), fontWeight: "800", color: colors.white, marginLeft: scale(16), flex: 1 },
    autoGenIndicator: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.accent + "40", padding: scale(12), marginHorizontal: scale(20), marginBottom: verticalScale(20), borderRadius: scale(12) },
    autoGenText: { fontSize: scale(14), color: colors.primary, fontWeight: "600", marginLeft: scale(10) },
    uploadSection: { paddingHorizontal: scale(20), marginBottom: verticalScale(24) },
    sectionTitle: { fontSize: scale(22), fontWeight: "800", color: colors.text, marginBottom: verticalScale(20) },
    uploadRow: { flexDirection: "row", justifyContent: "space-between", gap: scale(12) },
    uploadBtn: { flex: 1, backgroundColor: colors.card, paddingVertical: verticalScale(10), paddingHorizontal: scale(12), borderRadius: scale(16), alignItems: "center", ...Platform.select({ ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }, android: { elevation: 6 } }) },
    uploadBtnIcon: { width: scale(40), height: scale(40), borderRadius: scale(20), alignItems: "center", justifyContent: "center", marginBottom: scale(6) },
    uploadBtnText: { fontSize: scale(14), fontWeight: "700", color: colors.text, marginTop: scale(2), textAlign: 'center' },
    uploadBtnSub: { fontSize: scale(11), color: colors.subText, marginTop: scale(2), textAlign: 'center' },
    filesBtn: { borderTopWidth: scale(1), borderTopColor: colors.primary },
    voiceBtn: { borderTopWidth: scale(1), borderTopColor: colors.success },
    imageBtn: { borderTopWidth: scale(1), borderTopColor: colors.primary },
    uploadedFilesSection: { marginTop: verticalScale(24) },
    uploadedFilesTitle: { fontSize: scale(18), fontWeight: "700", color: colors.text, marginBottom: scale(12) },
    filesScroll: { flexDirection: "row" },
    fileCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, padding: scale(12), borderRadius: scale(16), marginRight: scale(12), minWidth: scale(200), borderWidth: 1, borderColor: colors.border, ...Platform.select({ ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 } }) },
    fileIconContainer: { width: scale(44), height: scale(44), borderRadius: scale(12), alignItems: "center", justifyContent: "center", marginRight: scale(12) },
    fileInfo: { flex: 1 },
    fileName: { fontSize: scale(14), fontWeight: "600", color: colors.text, marginBottom: scale(4) },
    fileMeta: { flexDirection: "row", alignItems: "center" },
    fileType: { fontSize: scale(12), fontWeight: "700", marginRight: scale(6) },
    fileSize: { fontSize: scale(12), color: colors.subText },
    removeFileBtn: { padding: scale(6), marginLeft: scale(8) },
    noteSelector: { marginTop: verticalScale(24) },
    selectorLabel: { fontSize: scale(16), fontWeight: "600", color: colors.text, marginBottom: scale(10) },
    notesScroll: { flexDirection: "row" },
    noteOption: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, paddingVertical: scale(10), paddingHorizontal: scale(16), borderRadius: scale(12), marginRight: scale(8), borderWidth: 1, borderColor: colors.border, minWidth: scale(120), ...Platform.select({ ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 } }) },
    noteOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    noteOptionText: { fontSize: scale(14), color: colors.subText, marginLeft: scale(8), fontWeight: "500" },
    noteOptionTextActive: { color: colors.white, fontWeight: "600" },
    tabBar: { flexDirection: "row", backgroundColor: colors.card, borderRadius: scale(20), padding: scale(6), marginHorizontal: scale(20), marginBottom: verticalScale(24), ...Platform.select({ ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }, android: { elevation: 4 } }) },
    tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(14), borderRadius: scale(14), backgroundColor: colors.white },
    tabActive: { backgroundColor: colors.primary, ...Platform.select({ ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 }, android: { elevation: 6 } }) },
    tabText: { fontSize: scale(16), fontWeight: "600", color: colors.primary, marginLeft: scale(10) },
    tabTextActive: { color: colors.white, fontWeight: "700" },
    contentSection: { paddingHorizontal: scale(20) },
    card: { backgroundColor: colors.card, borderRadius: scale(24), padding: scale(24), marginBottom: verticalScale(24), ...Platform.select({ ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 }, android: { elevation: 6 } }) },
    cardTitle: { fontSize: scale(24), fontWeight: "800", color: colors.text, marginBottom: verticalScale(16) },
    sourceNote: { flexDirection: "row", alignItems: "center", backgroundColor: colors.accent + "40", padding: scale(12), borderRadius: scale(12), marginBottom: verticalScale(16) },
    sourceNoteText: { fontSize: scale(14), color: colors.primary, fontWeight: "600", marginLeft: scale(10) },
    textarea: { backgroundColor: colors.inputBackground, borderWidth: 2, borderColor: colors.border, borderRadius: scale(16), padding: scale(16), fontSize: scale(15), color: colors.text, textAlignVertical: "top" },
    actionBtn: { flexDirection: "row", backgroundColor: colors.primary, paddingVertical: verticalScale(16), paddingHorizontal: scale(20), borderRadius: scale(16), alignItems: "center", justifyContent: "center", marginTop: verticalScale(16), ...Platform.select({ ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 4 } }) },
    actionBtnDisabled: { backgroundColor: colors.placeholder, opacity: 0.7 },
    actionBtnText: { fontSize: scale(16), fontWeight: "700", color: colors.white, marginLeft: scale(10) },
    resultBox: { backgroundColor: colors.success + "10", padding: scale(20), borderRadius: scale(20), borderLeftWidth: scale(6), borderLeftColor: colors.success, marginTop: verticalScale(20) },
    resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: scale(12) },
    resultTitle: { fontSize: scale(18), fontWeight: "800", color: colors.success },
    speakBtn: { padding: scale(8) },
    resultText: { fontSize: scale(15), color: colors.text, lineHeight: scale(24) },
    qCard: { backgroundColor: colors.card, borderRadius: scale(20), padding: scale(20), marginTop: verticalScale(16), borderWidth: 2, borderColor: colors.border },
    qCorrect: { borderColor: colors.success, backgroundColor: colors.success + "10", borderWidth: 3 },
    qWrong: { borderColor: colors.danger, backgroundColor: colors.danger + "10", borderWidth: 3 },
    qHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: scale(16) },
    qNum: { fontSize: scale(20), fontWeight: "800", color: colors.primary, marginRight: scale(12) },
    qText: { flex: 1, fontSize: scale(17), fontWeight: "600", color: colors.text, lineHeight: scale(24) },
    optionRow: { flexDirection: "row", alignItems: "center", paddingVertical: verticalScale(14), paddingHorizontal: scale(16), borderRadius: scale(14), marginBottom: scale(8) },
    optionSelected: { backgroundColor: colors.accent + "40", borderWidth: 2, borderColor: colors.primary + "80" },
    optionCorrect: { backgroundColor: colors.success + "20", borderWidth: 2, borderColor: colors.success },
    optionWrong: { backgroundColor: colors.danger + "20", borderWidth: 2, borderColor: colors.danger },
    radioCircle: { width: scale(22), height: scale(22), borderRadius: scale(11), borderWidth: 2, borderColor: colors.border, marginRight: scale(14) },
    radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    radioCorrect: { backgroundColor: colors.success, borderColor: colors.success },
    optionText: { fontSize: scale(15), flex: 1, color: colors.text },
    optionCorrectText: { color: colors.success, fontWeight: "700" },
    optionWrongText: { color: colors.danger, fontWeight: "600" },
    resultsCard: { alignItems: "center", backgroundColor: colors.warning + "30", padding: scale(28), borderRadius: scale(24), marginBottom: verticalScale(24), ...Platform.select({ ios: { shadowColor: colors.warning, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 }, android: { elevation: 6 } }) },
    scoreText: { fontSize: scale(52), fontWeight: "900", color: colors.warning, marginTop: scale(12) },
    progressContainer: { width: "100%", height: scale(14), backgroundColor: colors.background, borderRadius: scale(7), overflow: "hidden", marginVertical: scale(16) },
    progressBar: { height: "100%", backgroundColor: colors.warning, borderRadius: scale(7) },
    scoreResultText: { fontSize: scale(18), fontWeight: "800", color: colors.warning },
    submitBtn: { backgroundColor: colors.success, paddingVertical: verticalScale(18), borderRadius: scale(16), alignItems: "center", marginTop: verticalScale(20), ...Platform.select({ ios: { shadowColor: colors.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 4 } }) },
    submitBtnDisabled: { backgroundColor: colors.success + "80", opacity: 0.7 },
    submitBtnText: { fontSize: scale(18), fontWeight: "800", color: colors.white },
    numSelector: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: verticalScale(16), gap: scale(10) },
    numBtn: { paddingHorizontal: scale(16), paddingVertical: scale(8), borderRadius: scale(12), backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
    numBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    numText: { fontSize: scale(14), fontWeight: "700", color: colors.primary },
    numTextActive: { color: colors.white },
});