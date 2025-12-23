// screens/AiTools.js - COMPLETE WITH NAVIGATION FIX
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isSmallDevice = screenHeight <= 667;

// ✅ Custom Textarea Component
const Textarea = ({ 
  placeholder, 
  value, 
  onChangeText, 
  rows = 4, 
  editable = true,
  style 
}) => {
  const height = rows * (isTablet ? 30 : 25);
  
  return (
    <TextInput
      style={[
        styles.textarea,
        { height: Math.max(height, 80) },
        style
      ]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={true}
      numberOfLines={rows}
      editable={editable}
      textAlignVertical="top"
      placeholderTextColor="#9CA3AF"
    />
  );
};

// ✅ RESPONSIVE SCALING
const scale = (size) => Math.min(screenWidth, 600) / 375 * size;
const verticalScale = (size) => screenHeight / 812 * size;

export default function AITools({ route, notes = [] }) {
  const [activeTab, setActiveTab] = useState("summarize");
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // ✅ Handle navigation from NotesScreen
  useEffect(() => {
    if (route?.params) {
      const { noteContent, noteTitle, autoGenerateSummary, autoGenerateQuiz, tab } = route.params;
      
      console.log("Navigation params received:", {
        noteContent: noteContent?.substring(0, 50) + "...",
        noteTitle,
        autoGenerateSummary,
        autoGenerateQuiz,
        tab
      });
      
      // Set the input text from note
      if (noteContent) {
        setInputText(noteContent);
      }
      
      // Set active tab if provided
      if (tab) {
        setActiveTab(tab);
      }
      
      // Auto-generate summary if param is set
      if (autoGenerateSummary) {
        setIsAutoGenerating(true);
        // Small delay to ensure content is set
        setTimeout(() => {
          console.log("Auto-generating summary...");
          handleSummarize();
          setIsAutoGenerating(false);
        }, 1000);
      }
      
      // Auto-generate quiz if param is set
      if (autoGenerateQuiz) {
        setIsAutoGenerating(true);
        setTimeout(() => {
          console.log("Auto-generating quiz...");
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

  // ✅ 1. PDF/DOC FIRST
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "text/plain"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        const mockText = `📄 Extracted from "${file.name}":\n\nAdvanced study techniques: active recall, spaced repetition, Feynman technique. Key principles: deliberate practice, consistent review, understanding > memorization.`;
        setInputText(mockText);
        showToast("✅ Document Loaded", `${file.name} ready for AI processing!`);
      }
    } catch (err) {
      console.error("Document error:", err);
      showToast("❌ Upload Failed", "Please try another document.");
    }
  };

  // ✅ 2. VOICE NOTE SECOND
  const startVoiceNote = async () => {
    showToast("🎙️ Recording", "Listening... (3s simulation)");
    setIsGenerating(true);
    
    setTimeout(() => {
      const voiceText = `🎙️ Voice transcribed: "Mastery requires active recall daily. Break complex topics into chunks. Use spaced repetition. Practice > Theory. Teach to learn."`;
      setInputText(voiceText);
      setIsGenerating(false);
      showToast("✅ Voice Ready", "Perfect transcription complete!");
    }, 3000);
  };

  // ✅ 3. IMAGE OCR THIRD
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
        showToast("🖼️ OCR Processing", "Extracting text from image...");
        setTimeout(() => {
          const ocrText = `🖼️ OCR extracted: "Handwritten notes: Mind maps → central idea + branches. Flashcards → Q&A format. Pomodoro → 25min focus. Active recall testing."`;
          setInputText(ocrText);
          showToast("✅ OCR Complete", "Text extracted successfully!");
        }, 2800);
      }
    } catch (err) {
      console.error("Image error:", err);
      showToast("❌ Image Failed", "Could not process the image.");
    }
  };

  // ✅ Text-to-Speech
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

  // ✅ AI Summary
  const handleSummarize = async () => {
    if (!inputText.trim()) {
      showToast("❌ No Content", "Upload or type content first");
      return;
    }

    setIsGenerating(true);
    setSummary("");
    
    setTimeout(() => {
      const source = inputText.includes("📄") ? "PDF" : 
                    inputText.includes("🎙️") ? "Voice" : 
                    inputText.includes("🖼️") ? "Image" : 
                    route?.params?.noteTitle ? "Note" : "Manual";
      
      const mockSummary = `🤖 AI Summary (${source})
        
**Key Insights:**
• Active recall > passive reading
• Spaced repetition builds retention
• Break complex topics into chunks  
• Deliberate practice daily
• Teach concepts to solidify learning

**Next Steps:**
1. Create 10 flashcards today
2. Schedule spaced reviews
3. Practice explaining simply

✨ +35 XP Earned!`;
      
      setSummary(mockSummary);
      setXpEarned(35);
      setIsGenerating(false);
      showToast("✅ Summary Ready!", "+35 XP earned!");
    }, 2200);
  };

  // ✅ Quiz Generator
  const handleGenerateQuiz = async () => {
    if (!inputText.trim()) {
      showToast("❌ No Content", "Add content first");
      return;
    }

    setIsGenerating(true);
    setQuiz([]);
    setShowResults(false);
    setQuizAnswers({});
    
    setTimeout(() => {
      const mockQuiz = [
        { id: 1, question: "Most effective study method?", options: ["Rereading", "Active recall", "Highlighting", "Summarizing"], correct: 1 },
        { id: 2, question: "Handle complex topics by?", options: ["Skipping", "Chunking", "Memorizing", "Googling"], correct: 1 },
        { id: 3, question: "Long-term retention uses?", options: ["Cramming", "Spaced repetition", "One-time review", "Group study"], correct: 1 },
        { id: 4, question: "True mastery confirmed by?", options: ["Notes volume", "Exam score", "Familiarity", "Teaching others"], correct: 3 }
      ];
      
      setQuiz(mockQuiz);
      setXpEarned(25);
      setIsGenerating(false);
      showToast("✅ Quiz Generated!", "4 questions ready! +25 XP");
    }, 2500);
  };

  // ✅ Check Quiz Answers
  const checkAnswers = () => {
    if (quiz.length === 0) return;
    
    const correctCount = quiz.filter((q) => quizAnswers[q.id] === q.options[q.correct]).length;
    const percentage = Math.round((correctCount / quiz.length) * 100);
    const earnedXP = correctCount * 20;
    
    setScore(percentage);
    setXpEarned((prev) => prev + earnedXP);
    setShowResults(true);

    const messages = [
      percentage === 100 && "🎉 PERFECT! Genius level! ✨",
      percentage >= 80 && "⭐ EXCELLENT! Crushing it! 🚀", 
      percentage >= 60 && "👍 GOOD JOB! Keep going! 📚",
      percentage >= 40 && "📈 NOT BAD! Review & retry! 💪",
      "🔥 GREAT EFFORT! Study more & ace it! 🎯"
    ];
    
    showToast("Results", `${percentage}% - +${earnedXP} XP`);
  };

  // Note selector component
  const NoteSelector = () => {
    if (!notes || notes.length === 0) return null;
    
    return (
      <View style={styles.noteSelector}>
        <Text style={styles.selectorLabel}>Or Select from Notes:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.notesScroll}
        >
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
                color={selectedNoteId === note.id ? "#fff" : getTypeColor(note.type)} 
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

  const getTypeColor = (type) => {
    const map = { 
      text: "#6B21A8", 
      pdf: "#DC2626", 
      image: "#2563EB", 
      voice: "#10B981" 
    };
    return map[type] || "#6B21A8";
  };

  const getTypeIcon = (type) => {
    const map = {
      text: "document-text",
      pdf: "document-attach",
      image: "image",
      voice: "mic"
    };
    return map[type] || "document-text";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ✅ HEADER */}
        <View style={styles.header}>
          <Ionicons name="sparkles" size={scale(40)} color="#fff" />
          <Text style={styles.headerTitle}>AI Study Tools</Text>
        </View>

        {/* Auto-generating indicator */}
        {isAutoGenerating && (
          <View style={styles.autoGenIndicator}>
            <ActivityIndicator size="small" color="#6B21A8" />
            <Text style={styles.autoGenText}>
              {activeTab === "summarize" ? "Generating Summary..." : "Generating Quiz..."}
            </Text>
          </View>
        )}

        {/* ✅ UPLOAD SECTION */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Add Study Material</Text>
          <View style={styles.uploadRow}>
            {/* 1️⃣ PDF FIRST */}
            <TouchableOpacity 
              style={[styles.uploadBtn, styles.pdfBtn]} 
              onPress={pickDocument} 
              disabled={isGenerating}
            >
              <View style={styles.uploadBtnIcon}>
                <Ionicons name="document-attach" size={scale(28)} color="#fff" />
              </View>
              <Text style={styles.uploadBtnText}>Files</Text>
              <Text style={styles.uploadBtnSub}>Upload & Extract</Text>
            </TouchableOpacity>

            {/* 2️⃣ VOICE SECOND */}
            <TouchableOpacity 
              style={[styles.uploadBtn, styles.voiceBtn]} 
              onPress={startVoiceNote} 
              disabled={isGenerating}
            >
              <View style={styles.uploadBtnIcon}>
                <Ionicons name="mic" size={scale(28)} color="#fff" />
              </View>
              <Text style={styles.uploadBtnText}>Voice Note</Text>
              <Text style={styles.uploadBtnSub}>Record & Transcribe</Text>
            </TouchableOpacity>

            {/* 3️⃣ IMAGE THIRD */}
            <TouchableOpacity 
              style={[styles.uploadBtn, styles.imageBtn]} 
              onPress={pickImage} 
              disabled={isGenerating}
            >
              <View style={styles.uploadBtnIcon}>
                <Ionicons name="camera" size={scale(28)} color="#fff" />
              </View>
              <Text style={styles.uploadBtnText}>Image OCR</Text>
              <Text style={styles.uploadBtnSub}>Scan & Extract</Text>
            </TouchableOpacity>
          </View>

          {/* Note Selector */}
          <NoteSelector />
        </View>

        {/* ✅ TAB BAR */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "summarize" && styles.tabActive]}
            onPress={() => setActiveTab("summarize")}
            disabled={isGenerating}
          >
            <Ionicons 
              name={activeTab === "summarize" ? "file-text" : "file-text-outline"} 
              size={scale(24)} 
              color={activeTab === "summarize" ? "#fff" : "#6B21A8"} 
            />
            <Text style={[
              styles.tabText,
              activeTab === "summarize" && styles.tabTextActive
            ]}>
              Summarize
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "quiz" && styles.tabActive]}
            onPress={() => setActiveTab("quiz")}
            disabled={isGenerating}
          >
            <Ionicons 
              name={activeTab === "quiz" ? "help-circle" : "help-circle-outline"} 
              size={scale(24)} 
              color={activeTab === "quiz" ? "#fff" : "#6B21A8"} 
            />
            <Text style={[
              styles.tabText,
              activeTab === "quiz" && styles.tabTextActive
            ]}>
              Quiz
            </Text>
          </TouchableOpacity>
        </View>

        {/* ✅ SUMMARIZE TAB */}
        {activeTab === "summarize" && (
          <View style={styles.contentSection}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🤖 AI Summarization</Text>
              
              {/* Show source note info if from navigation */}
              {route?.params?.noteTitle && (
                <View style={styles.sourceNote}>
                  <Ionicons name="document-text" size={scale(20)} color="#6B21A8" />
                  <Text style={styles.sourceNoteText}>From: {route.params.noteTitle}</Text>
                </View>
              )}
              
              <Textarea
                placeholder="Content appears here after upload..."
                value={inputText}
                onChangeText={setInputText}
                rows={isSmallDevice ? 4 : isTablet ? 8 : 6}
                editable={!isGenerating}
              />
              
              <TouchableOpacity 
                style={[
                  styles.actionBtn, 
                  (isGenerating || !inputText.trim()) && styles.actionBtnDisabled
                ]}
                onPress={handleSummarize}
                disabled={isGenerating || !inputText.trim()}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="sparkles" size={scale(20)} color="#fff" />
                )}
                <Text style={styles.actionBtnText}>
                  {isGenerating ? "Generating..." : " Generate Summary"}
                </Text>
              </TouchableOpacity>

              {summary ? (
                <View style={styles.resultBox}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>📝 AI Summary</Text>
                    <TouchableOpacity onPress={speakSummary} style={styles.speakBtn}>
                      <Ionicons 
                        name={isSpeaking ? "volume-high" : "volume-medium"} 
                        size={scale(24)} 
                        color="#6B21A8" 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.resultText}>{summary}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* ✅ QUIZ TAB */}
        {activeTab === "quiz" && (
          <View style={styles.contentSection}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🧠 AI Quiz Generator</Text>
              
              {/* Show source note info if from navigation */}
              {route?.params?.noteTitle && (
                <View style={styles.sourceNote}>
                  <Ionicons name="document-text" size={scale(20)} color="#6B21A8" />
                  <Text style={styles.sourceNoteText}>From: {route.params.noteTitle}</Text>
                </View>
              )}
              
              <Textarea
                placeholder="Upload content to generate quiz..."
                value={inputText}
                onChangeText={setInputText}
                rows={isSmallDevice ? 3 : isTablet ? 6 : 4}
                editable={!isGenerating}
              />
              
              <TouchableOpacity 
                style={[
                  styles.actionBtn, 
                  (isGenerating || !inputText.trim()) && styles.actionBtnDisabled
                ]}
                onPress={handleGenerateQuiz}
                disabled={isGenerating || !inputText.trim()}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="bulb" size={scale(20)} color="#fff" />
                )}
                <Text style={styles.actionBtnText}>
                  {isGenerating ? "Creating..." : "Generate Quiz"}
                </Text>
              </TouchableOpacity>

              {quiz.length > 0 && (
                <>
                  {showResults && (
                    <View style={styles.resultsCard}>
                      <Ionicons name="trophy" size={scale(48)} color="#FBBF24" />
                      <Text style={styles.scoreText}>{score}%</Text>
                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${score}%` }]} />
                      </View>
                      <Text style={styles.xpText}>+{xpEarned} XP Earned!</Text>
                    </View>
                  )}

                  {quiz.map((q, i) => {
                    const correct = showResults && quizAnswers[q.id] === q.options[q.correct];
                    const wrong = showResults && quizAnswers[q.id] && !correct;
                    return (
                      <View key={q.id} style={[
                        styles.qCard,
                        correct && styles.qCorrect,
                        wrong && styles.qWrong
                      ]}>
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
                              <View style={[
                                styles.radioCircle,
                                userSelected && styles.radioSelected,
                                isCorrectOption && showResults && styles.radioCorrect
                              ]} />
                              <Text style={[
                                styles.optionText,
                                isCorrectOption && showResults && styles.optionCorrectText,
                                userSelected && showResults && !isCorrectOption && styles.optionWrongText
                              ]}>
                                {option}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })}

                  {!showResults && quiz.length > 0 && (
                    <TouchableOpacity 
                      style={[
                        styles.submitBtn,
                        Object.keys(quizAnswers).length !== quiz.length && styles.submitBtnDisabled
                      ]}
                      onPress={checkAnswers}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                    >
                      <Text style={styles.submitBtnText}>✅ Submit & Check Answers</Text>
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

/* ✅ FULLY RESPONSIVE STYLES */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF5FF' },
  scroll: { paddingBottom: verticalScale(50) },
  
  // Header
  header: {
    backgroundColor: "#6B21A8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    paddingTop: verticalScale(40),
    borderBottomLeftRadius: scale(32),
    borderBottomRightRadius: scale(32),
    marginBottom: verticalScale(24),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerTitle: {
    fontSize: scale(28),
    fontWeight: "800",
    color: "#fff",
    marginLeft: scale(16),
    flex: 1,
  },

  // Auto-generating indicator
  autoGenIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9D5FF",
    padding: scale(12),
    marginHorizontal: scale(20),
    marginBottom: verticalScale(20),
    borderRadius: scale(12),
  },
  autoGenText: {
    fontSize: scale(14),
    color: "#6B21A8",
    fontWeight: "600",
    marginLeft: scale(10),
  },

  // Upload Section
  uploadSection: { 
    paddingHorizontal: scale(20), 
    marginBottom: verticalScale(24) 
  },
  sectionTitle: {
    fontSize: scale(22),
    fontWeight: "800",
    color: "#1E1B4B",
    marginBottom: verticalScale(20),
  },
  uploadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  uploadBtnIcon: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: "#6B21A8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(12),
  },
  uploadBtnText: {
    fontSize: scale(16),
    fontWeight: "700",
    color: "#1E1B4B",
    marginTop: scale(4),
    textAlign: 'center',
  },
  uploadBtnSub: {
    fontSize: scale(13),
    color: "#6B7280",
    marginTop: scale(4),
    textAlign: 'center',
  },
  
  // Different colors for each button
  pdfBtn: {
    borderTopWidth: scale(4),
    borderTopColor: "#DC2626",
  },
  voiceBtn: {
    borderTopWidth: scale(4),
    borderTopColor: "#10B981",
  },
  imageBtn: {
    borderTopWidth: scale(4),
    borderTopColor: "#2563EB",
  },

  // Note Selector
  noteSelector: {
    marginTop: verticalScale(20),
  },
  selectorLabel: {
    fontSize: scale(16),
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: scale(10),
  },
  notesScroll: {
    flexDirection: "row",
  },
  noteOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: scale(10),
    paddingHorizontal: scale(16),
    borderRadius: scale(12),
    marginRight: scale(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: scale(120),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  noteOptionActive: {
    backgroundColor: "#6B21A8",
    borderColor: "#6B21A8",
  },
  noteOptionText: {
    fontSize: scale(14),
    color: "#6B7280",
    marginLeft: scale(8),
    fontWeight: "500",
  },
  noteOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: scale(20),
    padding: scale(6),
    marginHorizontal: scale(20),
    marginBottom: verticalScale(24),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(14),
    borderRadius: scale(14),
    backgroundColor: "transparent",
  },
  tabActive: { 
    backgroundColor: "#6B21A8",
    ...Platform.select({
      ios: {
        shadowColor: "#6B21A8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tabText: {
    fontSize: scale(16),
    fontWeight: "600",
    color: "#6B21A8",
    marginLeft: scale(10),
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // Content
  contentSection: { paddingHorizontal: scale(20) },
  card: {
    backgroundColor: "#fff",
    borderRadius: scale(24),
    padding: scale(24),
    marginBottom: verticalScale(24),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardTitle: {
    fontSize: scale(24),
    fontWeight: "800",
    color: "#1E1B4B",
    marginBottom: verticalScale(16),
  },
  sourceNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    padding: scale(12),
    borderRadius: scale(12),
    marginBottom: verticalScale(16),
  },
  sourceNoteText: {
    fontSize: scale(14),
    color: "#6B21A8",
    fontWeight: "600",
    marginLeft: scale(10),
  },
  textarea: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: scale(16),
    padding: scale(16),
    fontSize: scale(15),
    color: "#1E1B4B",
    textAlignVertical: "top",
  },

  // Buttons
  actionBtn: {
    flexDirection: "row",
    backgroundColor: "#6B21A8",
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(20),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(16),
    ...Platform.select({
      ios: {
        shadowColor: "#6B21A8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionBtnDisabled: {
    backgroundColor: "#CBD5E1",
    opacity: 0.7,
  },
  actionBtnText: {
    fontSize: scale(16),
    fontWeight: "700",
    color: "#fff",
    marginLeft: scale(10),
  },

  // Results
  resultBox: {
    backgroundColor: "#ECFDF5",
    padding: scale(20),
    borderRadius: scale(20),
    borderLeftWidth: scale(6),
    borderLeftColor: "#10B981",
    marginTop: verticalScale(20),
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(12),
  },
  resultTitle: {
    fontSize: scale(18),
    fontWeight: "800",
    color: "#059669",
  },
  speakBtn: { padding: scale(8) },
  resultText: {
    fontSize: scale(15),
    color: "#1E293B",
    lineHeight: scale(24),
  },

  // Quiz
  qCard: {
    backgroundColor: "#fff",
    borderRadius: scale(20),
    padding: scale(20),
    marginTop: verticalScale(16),
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  qCorrect: { 
    borderColor: "#10B981", 
    backgroundColor: "#ECFDF5",
    borderWidth: 3,
  },
  qWrong: { 
    borderColor: "#EF4444", 
    backgroundColor: "#FEF2F2",
    borderWidth: 3,
  },
  qHeader: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    marginBottom: scale(16) 
  },
  qNum: { 
    fontSize: scale(20), 
    fontWeight: "800", 
    color: "#6B21A8", 
    marginRight: scale(12) 
  },
  qText: { 
    flex: 1, 
    fontSize: scale(17), 
    fontWeight: "600", 
    color: "#1E1B4B", 
    lineHeight: scale(24) 
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderRadius: scale(14),
    marginBottom: scale(8),
  },
  optionSelected: { 
    backgroundColor: "#F3E8FF",
    borderWidth: 2,
    borderColor: "#C4B5FD",
  },
  optionCorrect: { 
    backgroundColor: "#D1FAE5",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  optionWrong: { 
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  radioCircle: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: scale(14),
  },
  radioSelected: { 
    backgroundColor: "#6B21A8", 
    borderColor: "#6B21A8" 
  },
  radioCorrect: { 
    backgroundColor: "#10B981", 
    borderColor: "#10B981" 
  },
  optionText: { 
    fontSize: scale(15), 
    flex: 1, 
    color: "#374151" 
  },
  optionCorrectText: { 
    color: "#059669", 
    fontWeight: "700" 
  },
  optionWrongText: { 
    color: "#DC2626", 
    fontWeight: "600" 
  },

  // Results Card
  resultsCard: {
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: scale(28),
    borderRadius: scale(24),
    marginBottom: verticalScale(24),
    ...Platform.select({
      ios: {
        shadowColor: "#FBBF24",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  scoreText: {
    fontSize: scale(52),
    fontWeight: "900",
    color: "#B45309",
    marginTop: scale(12),
  },
  progressContainer: {
    width: "100%",
    height: scale(14),
    backgroundColor: "#F3F4F6",
    borderRadius: scale(7),
    overflow: "hidden",
    marginVertical: scale(16),
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FBBF24",
    borderRadius: scale(7),
  },
  xpText: {
    fontSize: scale(18),
    fontWeight: "800",
    color: "#B45309",
  },

  // Submit Button
  submitBtn: {
    backgroundColor: "#10B981",
    paddingVertical: verticalScale(18),
    borderRadius: scale(16),
    alignItems: "center",
    marginTop: verticalScale(20),
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitBtnDisabled: { 
    backgroundColor: "#6EE7B7",
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: scale(18),
    fontWeight: "800",
    color: "#fff",
  },
});