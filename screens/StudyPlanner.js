// screens/StudyPlanner.js (UPDATED FOR PDF/DOC/PPT FILES)
import React, { useState, useEffect, useMemo } from "react";
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
  useWindowDimensions,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { format, differenceInDays } from "date-fns";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from "../context/AuthContext";
import { askGemini } from "../constants/gemini";
import CONFIG from "../constants/config";

export default function StudyPlanner({ navigation }) {
  const { user, updateUser, colors, recordActivity } = useAuth();
  const { width, height } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;

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

  const responsiveWidth = useMemo(() => Math.min(width, 600), [width]);

  const styles = useMemo(() => getStyles(colors, scale, verticalScale, moderateScale, isTablet), [colors, scale, verticalScale, moderateScale, isTablet]);

  const [exams, setExams] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    subject: "",
    date: "",
    topics: "",
    files: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch plan on mount
  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        const userId = user?.uid || "guest_user";

        const response = await fetch(`${CONFIG.API_URLS.STUDY_PLANS}?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setExams(data.exams || []);
          setStudySessions(data.studySessions || []);
        }
      } catch (err) {
        console.error("Error fetching study plan:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudyPlan();
  }, [user?.uid]);

  // Sync plan to backend
  const syncStudyPlan = async (updatedExams, updatedSessions) => {
    try {
      const userId = user?.uid || "guest_user";

      await fetch(CONFIG.API_URLS.STUDY_PLANS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          exams: updatedExams,
          studySessions: updatedSessions
        })
      });
    } catch (err) {
      console.error("Error syncing study plan:", err);
    }
  };

  const showToast = (title, message) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  };

  // --- File Upload Functions ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
          "application/vnd.ms-powerpoint", // .ppt
          "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
          "text/plain",
          "application/rtf",
        ],
        copyToCacheDirectory: true,
        multiple: true, // Allow multiple file selection
      });

      if (!result.canceled && result.assets.length > 0) {
        const uploadedFiles = result.assets.map(file => {
          // Get file extension
          const fileName = file.name;
          const fileExt = fileName.split('.').pop().toLowerCase();

          // Determine file type based on extension/mime type
          let fileType = "document";
          let fileIcon = "document";

          if (fileExt === 'pdf' || file.mimeType === 'application/pdf') {
            fileType = "pdf";
            fileIcon = "document";
          } else if (fileExt === 'doc' || fileExt === 'docx' ||
            file.mimeType?.includes('word')) {
            fileType = "doc";
            fileIcon = "document-text";
          } else if (fileExt === 'ppt' || fileExt === 'pptx' ||
            file.mimeType?.includes('powerpoint')) {
            fileType = "ppt";
            fileIcon = "document-attach";
          } else if (fileExt === 'txt' || file.mimeType === 'text/plain') {
            fileType = "text";
            fileIcon = "document-text";
          }

          return {
            name: file.name,
            type: fileType,
            icon: fileIcon,
            size: file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown',
            uri: file.uri,
            mimeType: file.mimeType
          };
        });

        const updatedFiles = [...newExam.files, ...uploadedFiles];
        setNewExam({ ...newExam, files: updatedFiles });

        if (uploadedFiles.length === 1) {
          showToast("Uploaded", `${uploadedFiles[0].name} added`);
        } else {
          showToast("Uploaded", `${uploadedFiles.length} files added`);
        }
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
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uploadedImages = result.assets.map((image, index) => ({
          name: `Image ${newExam.files.length + index + 1}`,
          type: "image",
          icon: "image",
          size: 'Image',
          uri: image.uri,
          width: image.width,
          height: image.height
        }));

        const updatedFiles = [...newExam.files, ...uploadedImages];
        setNewExam({ ...newExam, files: updatedFiles });

        showToast("Uploaded", `${uploadedImages.length} image(s) added for OCR`);
      }
    } catch (err) {
      console.error("Image picker error:", err);
      showToast("Error", "Could not upload image");
    }
  };

  const scanImage = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showToast("Permission Denied", "Need camera access");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const scannedImage = {
          name: `Scan ${newExam.files.length + 1}`,
          type: "image",
          icon: "camera",
          size: 'Scan',
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height
        };

        const updatedFiles = [...newExam.files, scannedImage];
        setNewExam({ ...newExam, files: updatedFiles });

        showToast("Scanned", "Image added for OCR");
      }
    } catch (err) {
      console.error("Camera error:", err);
      showToast("Error", "Could not scan image");
    }
  };


  const removeFile = (index) => {
    const updated = newExam.files.filter((_, i) => i !== index);
    setNewExam({ ...newExam, files: updated });
  };

  // --- Get File Icon ---
  const getFileIcon = (file) => {
    // If file has custom icon property, use it
    if (file.icon) return file.icon;

    // Otherwise determine by type
    switch (file.type) {
      case "pdf": return "document";
      case "doc": return "document-text";
      case "ppt": return "document-attach";
      case "text": return "document-text";
      case "image": return "image";
      default: return "document";
    }
  };

  // --- Get File Type Display Text ---
  const getFileTypeText = (file) => {
    switch (file.type) {
      case "pdf": return "PDF";
      case "doc": return "DOC";
      case "ppt": return "PPT";
      case "text": return "TXT";
      case "image": return "Image";
      default: return "File";
    }
  };

  // --- Generate AI Study Plan ---
  const generateStudyPlan = async () => {
    if (!newExam.subject || !newExam.date) {
      showToast("Error", "Subject and date are required");
      return;
    }

    const topicsInput = newExam.topics
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    if (topicsInput.length === 0) {
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

    showToast("Designing Plan...", "AI is organizing your study schedule...");

    try {
      const prompt = `You are an expert academic planner. Create a strategic study schedule for a student.
      Subject: ${newExam.subject}
      Days until exam: ${daysUntilExam}
      Topics to cover: ${topicsInput.join(", ")}

      Return a valid JSON array of session objects. Each object MUST have:
      - "topic": The specific topic or sub-topic to focus on.
      - "date": Date in "YYYY-MM-DD" format. You must space these out starting from today, and filling up the days exactly up until the exam date (${format(examDate, 'yyyy-MM-dd')}). Do not stop early.
      - "time": Suggested start time in "HH:MM" (24h format).
      - "duration": Duration in minutes (e.g., 60, 90, 120).

      Rules:
      1. Distribute study tasks logically to avoid burnout.
      2. Prioritize harder topics or fundamental ones first.
      3. Use any provided file context to accurately weight the duration and focus of topics.
      4. Do not include any text or markdown outside of the JSON array.

      JSON Output:`;

      // Convert files
      const filesToSend = [];
      for (const file of newExam.files) {
        if (file.type === "doc" || file.type === "ppt") {
            showToast("⚠️ Note", `${file.name} is a format not supported directly by AI. Skipping it for AI context.`);
            continue;
        }
        try {
            const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' });
            filesToSend.push({
                mimeType: file.mimeType || 'application/pdf',
                base64: base64
            });
        } catch(e) {
            console.error("File read error in planner:", e);
        }
      }

      const aiSessions = await askGemini(prompt, filesToSend, true);

      if (!Array.isArray(aiSessions)) {
        throw new Error("Invalid schedule format from AI");
      }

      // Map AI sessions into our app's internal format
      let sessionId = Date.now();
      const formattedSessions = aiSessions.map((s, index) => {
        const fileForDay = newExam.files[index % newExam.files.length];
        return {
          id: sessionId++,
          subject: newExam.subject,
          topic: s.topic,
          date: s.date,
          time: s.time,
          duration: s.duration || 60,
          completed: false,
          source: fileForDay ? `${getFileTypeText(fileForDay)} Notes` : "AI Suggestion",
          fileType: fileForDay?.type
        };
      });

      const newExamEntry = {
        id: Date.now().toString(),
        subject: newExam.subject,
        date: newExam.date,
        topics: topicsInput,
        priority: daysUntilExam <= 5 ? "high" : daysUntilExam <= 10 ? "medium" : "low",
        files: newExam.files,
      };

      const updatedExams = [...exams, newExamEntry];
      const updatedSessions = [...studySessions, ...formattedSessions];
      setExams(updatedExams);
      setStudySessions(updatedSessions);
      syncStudyPlan(updatedExams, updatedSessions);
      setIsAddExamOpen(false);
      setNewExam({ subject: "", date: "", topics: "", files: [] });

      showToast(
        "AI Study Plan Ready!",
        `${formattedSessions.length} sessions strategically planned by AI`
      );
    } catch (error) {
      console.error("AI Planner Error:", error);
      showToast("AI Error", "Failed to design plan. Please try again.");
    }
  };

  const toggleSessionComplete = (id) => {
    let durationToAdd = 0;
    const updatedSessions = studySessions.map((s) => {
      if (s.id === id) {
        durationToAdd = !s.completed ? (s.duration / 60) : -(s.duration / 60);
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    setStudySessions(updatedSessions);
    syncStudyPlan(exams, updatedSessions);

    if (durationToAdd !== 0) {
      const currentHours = user?.studyTime ?? 0;
      updateUser({ studyTime: Math.max(0, Math.round((currentHours + durationToAdd) * 10) / 10) });
    }

    recordActivity();
    showToast("Great!", "Session marked complete!");
  };

  const getDaysUntil = (dateStr) => differenceInDays(new Date(dateStr), new Date());

  const todaysSessions = studySessions.filter((s) => s.date === format(new Date(), "yyyy-MM-dd"));
  const upcomingSessions = studySessions.filter((s) => s.date > format(new Date(), "yyyy-MM-dd"));

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
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scroll, { maxWidth: responsiveWidth, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerInner, { maxWidth: responsiveWidth, alignSelf: 'center', width: '100%' }]}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="calendar"
                size={isTablet ? moderateScale(32) : moderateScale(24)}
                color={colors.white}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { fontSize: fontSize['3xl'] }]}>
                AI Study Planner
              </Text>
              <Text style={[styles.headerSubtitle, { fontSize: fontSize.base }]}>
                Upload PDF/DOC/PPT → Get smart schedule
              </Text>
            </View>
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
              color={colors.white}
            />
            <Text style={[styles.addBtnText, { fontSize: fontSize.lg }]}>
              Study Schedule
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
                    <TouchableOpacity
                      key={exam.id}
                      style={[
                        styles.examCard,
                        isUrgent && styles.examUrgent,
                      ]}
                      onPress={() => {
                        const examSessions = studySessions.filter(s => s.subject === exam.subject);
                        navigation.navigate("StudyPlanDetail", { 
                          exam, 
                          sessions: examSessions,
                          allExams: exams,
                          allSessions: studySessions
                        });
                      }}
                    >
                      <View style={styles.examHeaderRow}>
                        <Text style={[styles.examSubject, { fontSize: fontSize.xl }]}>
                          {exam.subject}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={moderateScale(20)}
                          color={colors.subText}
                        />
                      </View>
                      <Text style={[styles.examDate, { fontSize: fontSize.base }]}>
                        {format(new Date(exam.date), "d MMMM yyyy")} • {daysLeft} days
                      </Text>
                      <View style={styles.fileTags}>
                        {exam.files.map((f, i) => (
                          <View key={i} style={styles.fileTag}>
                            <Ionicons
                              name={getFileIcon(f)}
                              size={isTablet ? moderateScale(16) : moderateScale(14)}
                              color={colors.primary}
                            />
                            <Text
                              style={[styles.fileTagText, { fontSize: fontSize.sm }]}
                              numberOfLines={1}
                            >
                              {getFileTypeText(f)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
          <SafeAreaView style={[styles.modalSafeArea, { maxWidth: responsiveWidth, alignSelf: 'center', width: '100%', overflow: 'hidden' }]}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontSize: fontSize['2xl'] }]}>
                  Plan Exam with AI
                </Text>
                <TouchableOpacity onPress={() => setIsAddExamOpen(false)}>
                  <Ionicons
                    name="close"
                    size={isTablet ? moderateScale(28) : moderateScale(24)}
                    color={colors.subText}
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
                    placeholderTextColor={colors.placeholder}
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
                    placeholderTextColor={colors.placeholder}
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
                    placeholderTextColor={colors.placeholder}
                  />
                </View>

                <View style={styles.uploadSection}>
                  <Text style={[styles.label, { fontSize: fontSize.base }]}>
                    Upload Study Materials
                  </Text>
                  <View style={styles.uploadBtns}>
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={pickDocument}
                    >
                      <Ionicons
                        name="document-attach"
                        size={isTablet ? moderateScale(24) : moderateScale(20)}
                        color={colors.primary}
                      />
                      <Text style={[styles.uploadBtnText, { fontSize: fontSize.sm }]}>
                        PDF/DOC/PPT
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={scanImage}
                    >
                      <Ionicons
                        name="camera"
                        size={isTablet ? moderateScale(24) : moderateScale(20)}
                        color={colors.primary}
                      />
                      <Text style={[styles.uploadBtnText, { fontSize: fontSize.sm }]}>
                        Scan
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={pickImage}
                    >
                      <Ionicons
                        name="image"
                        size={isTablet ? moderateScale(24) : moderateScale(20)}
                        color={colors.primary}
                      />
                      <Text style={[styles.uploadBtnText, { fontSize: fontSize.sm }]}>
                        Gallery
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {newExam.files.length > 0 && (
                    <View style={styles.filesList}>
                      <Text style={[styles.filesTitle, { fontSize: fontSize.base }]}>
                        Uploaded Files ({newExam.files.length})
                      </Text>
                      {newExam.files.map((file, i) => (
                        <View key={i} style={styles.fileItem}>
                          <Ionicons
                            name={getFileIcon(file)}
                            size={isTablet ? moderateScale(22) : moderateScale(18)}
                            color={colors.primary}
                          />
                          <View style={styles.fileInfo}>
                            <Text
                              style={[styles.fileName, { fontSize: fontSize.base }]}
                              numberOfLines={1}
                            >
                              {file.name}
                            </Text>
                            <Text style={[styles.fileDetails, { fontSize: fontSize.sm }]}>
                              {getFileTypeText(file)} • {file.size}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => removeFile(i)}
                          >
                            <Ionicons
                              name="close-circle"
                              size={isTablet ? moderateScale(24) : moderateScale(20)}
                              color={colors.danger}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.generateBtn} onPress={generateStudyPlan}>
                <Ionicons
                  name="sparkles"
                  size={isTablet ? moderateScale(24) : moderateScale(20)}
                  color={colors.white}
                />
                <Text style={[styles.generateText, { fontSize: fontSize.lg }]}>
                  Generate AI Study Plan
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView >
      </Modal >
    </SafeAreaView >
  );
}

// ✅ RESPONSIVE STYLESHEET
const getStyles = (colors, scale, verticalScale, moderateScale, isTablet) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    paddingBottom: verticalScale(30),
  },

  // Header
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
  },
  headerIcon: {
    width: scale(48),
    height: scale(48),
    backgroundColor: colors.overlay,
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
    color: colors.white,
    marginBottom: verticalScale(2),
  },
  headerSubtitle: {
    color: colors.white + "AA",
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
    backgroundColor: colors.primary,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    borderRadius: scale(20),
    marginBottom: verticalScale(20),
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
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
    color: colors.white,
    fontWeight: "700",
    marginLeft: scale(8),
  },

  // Section Titles
  sectionTitle: {
    fontWeight: "700",
    color: colors.text,
    marginBottom: verticalScale(12),
    marginTop: verticalScale(8),
  },

  // Exams
  examsList: {
    marginBottom: verticalScale(24),
    gap: verticalScale(12),
  },
  examCard: {
    backgroundColor: colors.card,
    borderRadius: scale(16),
    padding: scale(16),
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
  examUrgent: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + "10"
  },
  examHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  examSubject: {
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  examDate: {
    color: colors.subText,
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
    backgroundColor: colors.primary + "15",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    maxWidth: scale(120),
  },
  fileTagText: {
    color: colors.primary,
    fontWeight: "600",
    marginLeft: scale(4),
  },

  // Schedule
  scheduleCard: {
    backgroundColor: colors.card,
    borderRadius: scale(20),
    padding: scale(20),
    marginBottom: verticalScale(20),
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowOpacity: 0.05,
        shadowRadius: verticalScale(12),
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  cardTitle: {
    fontWeight: "700",
    color: colors.text,
  },
  cardSubtitle: {
    color: colors.subText,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: colors.placeholder,
    marginVertical: verticalScale(20),
    fontStyle: "italic",
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sessionDone: {
    opacity: 0.5,
  },
  sessionLeft: {
    flex: 1,
    marginRight: scale(12),
  },
  sessionTopic: {
    fontWeight: "600",
    color: colors.text,
    marginBottom: verticalScale(4),
  },
  sessionMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
  },
  meta: {
    color: colors.subText,
  },
  completeBtn: {
    backgroundColor: colors.background,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: colors.border,
  },
  completeBtnDone: {
    backgroundColor: colors.success + "20",
    borderColor: colors.success,
  },
  completeText: {
    fontWeight: "600",
    color: colors.primary,
  },

  // Upcoming
  upcomingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(12),
    backgroundColor: colors.card + "80", // slightly transparent or just card color
    borderRadius: scale(12),
    marginBottom: verticalScale(8),
  },
  upcomingDate: {
    fontWeight: "700",
    color: colors.primary,
    width: scale(60),
  },
  upcomingTopic: {
    flex: 1,
    color: colors.text,
    marginHorizontal: scale(8),
  },
  upcomingTime: {
    color: colors.subText,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  modalSafeArea: {
    backgroundColor: colors.card,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    height: isTablet ? "80%" : "90%",
    marginTop: isTablet ? "10%" : "0%",
  },
  modal: {
    flex: 1,
    backgroundColor: colors.card,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontWeight: "700",
    color: colors.text,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: scale(20),
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontWeight: "600",
    color: colors.text,
    marginBottom: verticalScale(8),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(12),
    padding: scale(12),
    backgroundColor: colors.inputBackground,
    color: colors.text,
  },
  uploadSection: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  uploadBtns: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: verticalScale(16),
  },
  uploadBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.inputBackground,
    paddingVertical: verticalScale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadBtnActive: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + "15",
  },
  uploadBtnText: {
    fontWeight: "600",
    color: colors.text,
    marginTop: verticalScale(4),
  },
  filesList: {
    marginTop: verticalScale(10),
  },
  filesTitle: {
    fontWeight: "600",
    color: colors.text,
    marginBottom: verticalScale(8),
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    padding: scale(12),
    borderRadius: scale(12),
    marginBottom: verticalScale(8),
    gap: scale(12),
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: colors.text,
    fontWeight: "500",
  },
  fileDetails: {
    color: colors.subText,
    marginTop: verticalScale(2),
  },
  removeBtn: {
    padding: scale(4),
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    margin: scale(20),
    paddingVertical: verticalScale(16),
    borderRadius: scale(16),
    gap: scale(8),
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  generateText: {
    fontWeight: "700",
    color: colors.white,
  },
});