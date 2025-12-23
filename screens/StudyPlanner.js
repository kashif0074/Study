// screens/StudyPlanner.js (FIXED & RESPONSIVE)
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ CORRECT IMPORT
import { Ionicons } from "@expo/vector-icons";
import { format, differenceInDays } from "date-fns";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get('window');

// 📏 Responsive scaling functions
const scale = (size) => {
  const baseWidth = 375; // iPhone 6/7/8 base
  const scaleFactor = Math.min(width, 600) / baseWidth;
  return size * scaleFactor;
};

const verticalScale = (size) => {
  const baseHeight = 667; // iPhone 6/7/8 base
  const scaleFactor = Math.min(height, 800) / baseHeight;
  return size * scaleFactor;
};

const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// 📱 Device breakpoints
const isSmallDevice = width < 375;
const isTablet = width >= 768;
const isLargeTablet = width >= 1024;

export default function StudyPlanner() {
  const [exams, setExams] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    subject: "",
    date: "",
    topics: "",
    files: [],
  });
  const [isRecording, setIsRecording] = useState(false);

  const showToast = (title, message) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  };

  // --- File Upload ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "text/plain",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const updatedFiles = [...newExam.files, { 
          name: file.name, 
          type: "document",
          size: file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown'
        }];
        setNewExam({ ...newExam, files: updatedFiles });
        showToast("Uploaded", `${file.name} added`);
      }
    } catch (err) {
      console.error("Document picker error:", err);
      showToast("Error", "Could not upload document");
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast("Permission Denied", "Need gallery access");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const updatedFiles = [...newExam.files, { 
          name: `Image ${newExam.files.length + 1}`, 
          type: "image",
          size: 'Image'
        }];
        setNewExam({ ...newExam, files: updatedFiles });
        showToast("Uploaded", "Image added for OCR");
      }
    } catch (err) {
      console.error("Image picker error:", err);
      showToast("Error", "Could not upload image");
    }
  };

  // --- Voice Recording (Simulated) ---
  const pickVoice = async () => {
    try {
      showToast("Recording", "Starting voice recording...");
      setIsRecording(true);
      
      // Simulate recording
      setTimeout(() => {
        const voiceNote = `Voice Note ${newExam.files.length + 1}`;
        const updatedFiles = [...newExam.files, { 
          name: voiceNote, 
          type: "voice",
          size: 'Audio'
        }];
        setNewExam({ ...newExam, files: updatedFiles });
        setIsRecording(false);
        showToast("Voice Note Added", "Recording saved!");
      }, 3000);
    } catch (err) {
      console.error("Voice recording error:", err);
      setIsRecording(false);
      showToast("Error", "Could not record voice note");
    }
  };

  const removeFile = (index) => {
    const updated = newExam.files.filter((_, i) => i !== index);
    setNewExam({ ...newExam, files: updated });
  };

  // --- Generate AI Study Plan ---
  const generateStudyPlan = () => {
    if (!newExam.subject || !newExam.date) {
      showToast("Error", "Subject and date are required");
      return;
    }

    const topics = newExam.topics
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    if (topics.length === 0) {
      showToast("Error", "Add at least one topic");
      return;
    }

    const examDate = new Date(newExam.date);
    const today = new Date();
    const daysUntilExam = differenceInDays(examDate, today);

    if (daysUntilExam < 1) {
      showToast("Error", "Exam date must be in the future");
      return;
    }

    // AI Study Plan Generation
    const sessions = [];
    const totalStudyDays = Math.min(daysUntilExam, 14);
    const sessionsPerDay = Math.ceil(topics.length / totalStudyDays);

    let sessionId = 1;
    let xpTotal = 0;

    for (let i = 0; i < totalStudyDays; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i + 1);
      const dateStr = format(currentDate, "yyyy-MM-dd");

      const dayTopics = topics.slice(i * sessionsPerDay, (i + 1) * sessionsPerDay);
      const fileForDay = newExam.files[i % newExam.files.length];

      dayTopics.forEach((topic, idx) => {
        const duration = 60 + (idx * 15);
        let xp = 20;
        
        if (fileForDay) {
          if (fileForDay.type === "document") xp += 10;
          else if (fileForDay.type === "image") xp += 10;
          else if (fileForDay.type === "voice") xp += 15;
        }
        
        xpTotal += xp;

        sessions.push({
          id: sessionId++,
          subject: newExam.subject,
          topic: topic,
          date: dateStr,
          time: idx === 0 ? "09:00" : idx === 1 ? "14:00" : "18:00",
          duration,
          completed: false,
          source: fileForDay ? 
            (fileForDay.type === "document" ? "PDF/Doc" : 
             fileForDay.type === "image" ? "Image OCR" : "Voice Note") 
            : "Manual",
        });
      });
    }

    // Add final review
    sessions.push({
      id: sessionId++,
      subject: newExam.subject,
      topic: "Full Revision + Mock Test",
      date: format(examDate, "yyyy-MM-dd"),
      time: "10:00",
      duration: 120,
      completed: false,
      source: "AI Summary",
    });

    const newExamEntry = {
      id: Date.now().toString(),
      subject: newExam.subject,
      date: newExam.date,
      topics,
      priority: daysUntilExam <= 5 ? "high" : daysUntilExam <= 10 ? "medium" : "low",
      files: newExam.files,
    };

    setExams([...exams, newExamEntry]);
    setStudySessions([...studySessions, ...sessions]);
    setIsAddExamOpen(false);
    setNewExam({ subject: "", date: "", topics: "", files: [] });

    showToast(
      "AI Plan Ready!",
      `${sessions.length} study sessions created\n+${xpTotal} XP total`
    );
  };

  const toggleSessionComplete = (id) => {
    setStudySessions(
      studySessions.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      )
    );
    showToast("Great!", "Session marked complete!");
  };

  const getDaysUntil = (dateStr) => differenceInDays(new Date(dateStr), new Date());

  const todaysSessions = studySessions.filter((s) => s.date === format(new Date(), "yyyy-MM-dd"));
  const upcomingSessions = studySessions.filter((s) => s.date > format(new Date(), "yyyy-MM-dd"));

  // Get appropriate icon for file type
  const getFileIcon = (type) => {
    switch(type) {
      case "document": return "document";
      case "image": return "image";
      case "voice": return "mic";
      default: return "document";
    }
  };

  // Responsive font sizes
  const fontSize = {
    xs: moderateScale(10),
    sm: moderateScale(12),
    base: moderateScale(14),
    lg: moderateScale(16),
    xl: moderateScale(18),
    '2xl': moderateScale(20),
    '3xl': moderateScale(24),
    '4xl': moderateScale(28),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons 
              name="calendar" 
              size={isTablet ? moderateScale(32) : moderateScale(24)} 
              color="#fff" 
            />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { fontSize: fontSize['3xl'] }]}>
              AI Study Planner
            </Text>
            <Text style={[styles.headerSubtitle, { fontSize: fontSize.base }]}>
              Upload notes → Get smart schedule
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Add Exam Button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsAddExamOpen(true)}
          >
            <Ionicons 
              name="add" 
              size={isTablet ? moderateScale(24) : moderateScale(20)} 
              color="#fff" 
            />
            <Text style={[styles.addBtnText, { fontSize: fontSize.lg }]}>
              Plan New Exam
            </Text>
          </TouchableOpacity>

          {/* Active Exams */}
          {exams.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { fontSize: fontSize['2xl'] }]}>
                Active Exams
              </Text>
              <View style={styles.examsList}>
                {exams.map((exam) => {
                  const daysLeft = getDaysUntil(exam.date);
                  const isUrgent = daysLeft <= 3;

                  return (
                    <View
                      key={exam.id}
                      style={[
                        styles.examCard,
                        isUrgent && styles.examUrgent,
                      ]}
                    >
                      <View style={styles.examHeaderRow}>
                        <Text style={[styles.examSubject, { fontSize: fontSize.xl }]}>
                          {exam.subject}
                        </Text>
                        {isUrgent && (
                          <Ionicons 
                            name="flame" 
                            size={isTablet ? moderateScale(24) : moderateScale(20)} 
                            color="#EF4444" 
                          />
                        )}
                      </View>
                      <Text style={[styles.examDate, { fontSize: fontSize.base }]}>
                        {format(new Date(exam.date), "EEE, MMM d")} • {daysLeft} days
                      </Text>
                      <View style={styles.fileTags}>
                        {exam.files.map((f, i) => (
                          <View key={i} style={styles.fileTag}>
                            <Ionicons
                              name={getFileIcon(f.type)}
                              size={isTablet ? moderateScale(16) : moderateScale(14)}
                              color="#6B21A8"
                            />
                            <Text 
                              style={[styles.fileTagText, { fontSize: fontSize.sm }]} 
                              numberOfLines={1}
                            >
                              {f.name.length > 15 ? f.name.substring(0, 12) + '...' : f.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Today's Plan */}
          <View style={styles.scheduleCard}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { fontSize: fontSize['2xl'] }]}>
                Today's Study Plan
              </Text>
              <Text style={[styles.cardSubtitle, { fontSize: fontSize.base }]}>
                {todaysSessions.filter((s) => !s.completed).length} left
              </Text>
            </View>
            {todaysSessions.length === 0 ? (
              <Text style={[styles.empty, { fontSize: fontSize.base }]}>
                No study sessions today
              </Text>
            ) : (
              todaysSessions.map((session) => (
                <View
                  key={session.id}
                  style={[
                    styles.sessionItem,
                    session.completed && styles.sessionDone,
                  ]}
                >
                  <View style={styles.sessionLeft}>
                    <Text style={[styles.sessionTopic, { fontSize: fontSize.lg }]}>
                      {session.topic}
                    </Text>
                    <View style={styles.sessionMeta}>
                      <Text style={[styles.meta, { fontSize: fontSize.sm }]}>
                        <Ionicons 
                          name="time-outline" 
                          size={isTablet ? moderateScale(16) : moderateScale(14)} 
                        /> {session.time}
                      </Text>
                      <Text style={[styles.meta, { fontSize: fontSize.sm }]}>
                        • {session.duration} min
                      </Text>
                      <Text style={[styles.meta, { fontSize: fontSize.sm }]}>
                        • {session.source}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.completeBtn,
                      session.completed && styles.completeBtnDone,
                    ]}
                    onPress={() => toggleSessionComplete(session.id)}
                  >
                    <Text style={[styles.completeText, { fontSize: fontSize.base }]}>
                      {session.completed ? "Done" : "Start"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { fontSize: fontSize['2xl'] }]}>
                Upcoming
              </Text>
              {upcomingSessions.slice(0, isTablet ? 5 : 3).map((s) => (
                <View key={s.id} style={styles.upcomingItem}>
                  <Text style={[styles.upcomingDate, { fontSize: fontSize.base }]}>
                    {format(new Date(s.date), "MMM d")}
                  </Text>
                  <Text 
                    style={[styles.upcomingTopic, { fontSize: fontSize.base }]} 
                    numberOfLines={1}
                  >
                    {s.topic}
                  </Text>
                  <Text style={[styles.upcomingTime, { fontSize: fontSize.sm }]}>
                    {s.time}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Exam Modal */}
      <Modal 
        visible={isAddExamOpen} 
        transparent 
        animationType="slide"
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontSize: fontSize['2xl'] }]}>
                  Plan Exam with AI
                </Text>
                <TouchableOpacity onPress={() => setIsAddExamOpen(false)}>
                  <Ionicons 
                    name="close" 
                    size={isTablet ? moderateScale(28) : moderateScale(24)} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalBodyContent}
              >
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { fontSize: fontSize.base }]}>
                    Exam Name *
                  </Text>
                  <TextInput
                    style={[styles.input, { fontSize: fontSize.base }]}
                    placeholder="e.g., Physics Final"
                    value={newExam.subject}
                    onChangeText={(t) => setNewExam({ ...newExam, subject: t })}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { fontSize: fontSize.base }]}>
                    Exam Date *
                  </Text>
                  <TextInput
                    style={[styles.input, { fontSize: fontSize.base }]}
                    placeholder="YYYY-MM-DD"
                    value={newExam.date}
                    onChangeText={(t) => setNewExam({ ...newExam, date: t })}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { fontSize: fontSize.base }]}>
                    Topics (comma-separated) *
                  </Text>
                  <TextInput
                    style={[styles.input, { fontSize: fontSize.base }]}
                    placeholder="Mechanics, Waves, Thermodynamics"
                    value={newExam.topics}
                    onChangeText={(t) => setNewExam({ ...newExam, topics: t })}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.uploadSection}>
                  <Text style={[styles.label, { fontSize: fontSize.base }]}>
                    Upload Notes, Docs, Images
                  </Text>
                  <View style={styles.uploadBtns}>
                    <TouchableOpacity 
                      style={styles.uploadBtn} 
                      onPress={pickDocument}
                      disabled={isRecording}
                    >
                      <Ionicons 
                        name="document-attach" 
                        size={isTablet ? moderateScale(24) : moderateScale(20)} 
                        color="#6B21A8" 
                      />
                      <Text style={[styles.uploadBtnText, { fontSize: fontSize.sm }]}>
                        PDF/Doc
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.uploadBtn} 
                      onPress={pickImage}
                      disabled={isRecording}
                    >
                      <Ionicons 
                        name="image" 
                        size={isTablet ? moderateScale(24) : moderateScale(20)} 
                        color="#6B21A8" 
                      />
                      <Text style={[styles.uploadBtnText, { fontSize: fontSize.sm }]}>
                        Image
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.uploadBtn, isRecording && styles.uploadBtnActive]}
                      onPress={pickVoice}
                      disabled={isRecording}
                    >
                      <Ionicons 
                        name={isRecording ? "mic-circle" : "mic"} 
                        size={isTablet ? moderateScale(24) : moderateScale(20)} 
                        color={isRecording ? "#EF4444" : "#6B21A8"} 
                      />
                      <Text style={[styles.uploadBtnText, { fontSize: fontSize.sm }]}>
                        {isRecording ? "Recording..." : "Voice"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {newExam.files.map((file, i) => (
                    <View key={i} style={styles.fileItem}>
                      <Ionicons
                        name={getFileIcon(file.type)}
                        size={isTablet ? moderateScale(22) : moderateScale(18)}
                        color="#6B21A8"
                      />
                      <Text 
                        style={[styles.fileName, { fontSize: fontSize.base }]} 
                        numberOfLines={1}
                      >
                        {file.name}
                      </Text>
                      <Text style={[styles.fileSize, { fontSize: fontSize.sm }]}>
                        {file.size}
                      </Text>
                      <TouchableOpacity onPress={() => removeFile(i)}>
                        <Ionicons 
                          name="close-circle" 
                          size={isTablet ? moderateScale(24) : moderateScale(20)} 
                          color="#EF4444" 
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.generateBtn} onPress={generateStudyPlan}>
                <Ionicons 
                  name="sparkles" 
                  size={isTablet ? moderateScale(24) : moderateScale(20)} 
                  color="#fff" 
                />
                <Text style={[styles.generateText, { fontSize: fontSize.lg }]}>
                  Generate AI Study Plan
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ✅ RESPONSIVE STYLESHEET
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6B21A8',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: { 
    flex: 1, 
    backgroundColor: "#FAF5FF" 
  },
  scroll: { 
    paddingBottom: verticalScale(30),
  },

  // Header
  header: {
    backgroundColor: "#6B21A8",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(isTablet ? 40 : 50),
    paddingBottom: verticalScale(isTablet ? 30 : 24),
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: scale(32),
    borderBottomRightRadius: scale(32),
    ...Platform.select({
      ios: {
        shadowColor: "#6B21A8",
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowOpacity: 0.3,
        shadowRadius: verticalScale(12),
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerIcon: {
    width: scale(48),
    height: scale(48),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  headerText: {
    flex: 1,
  },
  headerTitle: { 
    fontWeight: "800", 
    color: "#fff",
    marginBottom: verticalScale(2),
  },
  headerSubtitle: { 
    color: "#E9D5FF", 
    marginTop: verticalScale(4) 
  },

  content: { 
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
  },

  // Add Button
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B21A8",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    borderRadius: scale(20),
    marginBottom: verticalScale(20),
    ...Platform.select({
      ios: {
        shadowColor: "#6B21A8",
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.2,
        shadowRadius: verticalScale(8),
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addBtnText: { 
    color: "#fff", 
    fontWeight: "700",
    marginLeft: scale(8),
  },

  // Section Titles
  sectionTitle: { 
    fontWeight: "700", 
    color: "#1F2937", 
    marginBottom: verticalScale(12),
    marginTop: verticalScale(8),
  },

  // Exams
  examsList: { 
    marginBottom: verticalScale(24),
    gap: verticalScale(12),
  },
  examCard: {
    backgroundColor: "#fff",
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.05,
        shadowRadius: verticalScale(8),
      },
      android: {
        elevation: 3,
      },
    }),
  },
  examUrgent: { 
    borderColor: "#FECACA", 
    backgroundColor: "#FEF2F2" 
  },
  examHeaderRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  examSubject: { 
    fontWeight: "700", 
    color: "#1F2937",
    flex: 1,
  },
  examDate: { 
    color: "#6B7280", 
    marginVertical: verticalScale(6) 
  },
  fileTags: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: scale(6), 
    marginTop: verticalScale(8) 
  },
  fileTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    maxWidth: scale(120),
  },
  fileTagText: { 
    color: "#6B21A8", 
    marginLeft: scale(4),
    flexShrink: 1,
  },

  // Schedule Card
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: scale(20),
    padding: scale(16),
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.05,
        shadowRadius: verticalScale(8),
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: { 
    marginBottom: verticalScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { 
    fontWeight: "700", 
    color: "#1F2937" 
  },
  cardSubtitle: { 
    color: "#6B7280" 
  },
  empty: { 
    textAlign: "center", 
    color: "#9CA3AF", 
    padding: verticalScale(20),
  },

  // Session Items
  sessionItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: scale(16),
    padding: scale(14),
    marginBottom: verticalScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sessionDone: { 
    backgroundColor: "#F0FDF4", 
    borderColor: "#BBF7D0" 
  },
  sessionLeft: { 
    flex: 1,
    marginRight: scale(12),
  },
  sessionTopic: { 
    fontWeight: "600", 
    color: "#1F2937",
    marginBottom: verticalScale(2),
  },
  sessionMeta: { 
    flexDirection: "row", 
    gap: scale(10), 
    flexWrap: 'wrap',
  },
  meta: { 
    color: "#6B7280",
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeBtn: {
    backgroundColor: "#6B21A8",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(12),
    minWidth: scale(70),
  },
  completeBtnDone: { 
    backgroundColor: "#10B981" 
  },
  completeText: { 
    color: "#fff", 
    fontWeight: "600",
    textAlign: 'center',
  },

  // Upcoming Items
  upcomingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: scale(12),
    borderRadius: scale(12),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  upcomingDate: { 
    fontWeight: "600", 
    color: "#6B21A8",
    minWidth: scale(60),
  },
  upcomingTopic: { 
    color: "#1F2937", 
    flex: 1, 
    marginHorizontal: scale(10),
  },
  upcomingTime: { 
    color: "#6B7280",
    minWidth: scale(50),
    textAlign: 'right',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? verticalScale(30) : verticalScale(20),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(20),
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalTitle: { 
    fontWeight: "700", 
    color: "#1F2937" 
  },
  modalBody: {
    paddingHorizontal: scale(20),
    maxHeight: Dimensions.get('window').height * 0.55,
  },
  modalBodyContent: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
  },

  // Inputs
  inputGroup: { 
    marginBottom: verticalScale(16) 
  },
  label: { 
    fontWeight: "600", 
    color: "#374151", 
    marginBottom: verticalScale(8) 
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scale(16),
    padding: scale(14),
    backgroundColor: "#F9FAFB",
  },

  // Upload Section
  uploadSection: { 
    marginTop: verticalScale(10) 
  },
  uploadBtns: { 
    flexDirection: "row", 
    gap: scale(8), 
    marginBottom: verticalScale(12),
    flexWrap: 'wrap',
  },
  uploadBtn: {
    flex: 1,
    minWidth: scale(85),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E8FF",
    padding: scale(12),
    borderRadius: scale(16),
    marginBottom: verticalScale(4),
  },
  uploadBtnActive: {
    backgroundColor: "#FEE2E2",
  },
  uploadBtnText: { 
    marginLeft: scale(6), 
    color: "#6B21A8", 
    fontWeight: "600",
    textAlign: 'center',
  },

  // File Items
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: scale(10),
    borderRadius: scale(12),
    marginBottom: verticalScale(8),
  },
  fileName: { 
    flex: 1, 
    marginLeft: scale(8), 
    color: "#1F2937",
    marginRight: scale(8),
  },
  fileSize: {
    color: "#6B7280",
    marginRight: scale(8),
  },

  // Generate Button
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B21A8",
    marginHorizontal: scale(20),
    padding: scale(16),
    borderRadius: scale(20),
    marginTop: scale(8),
    marginBottom: scale(10),
  },
  generateText: { 
    color: "#fff", 
    fontWeight: "700", 
    marginLeft: scale(8) 
  },
});