import React, { useMemo, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import CONFIG from "../constants/config";

export default function StudyPlanDetailScreen({ route, navigation }) {
  const { exam, sessions, allExams, allSessions } = route.params;
  const { user, updateUser, colors, recordActivity, addStudyTime } = useAuth();
  const { width, height } = useWindowDimensions();

  // ✅ Track Study Time
  useEffect(() => {
    // Only import useEffect if it's missing, but it's already in the file... wait, let's check imports.
    console.log("⏱️ Study Plan Detail Timer Started");
    const startTime = Date.now();
    recordActivity();

    return () => {
        const endTime = Date.now();
        const timeSpentMs = endTime - startTime;
        const minutes = timeSpentMs / (1000 * 60);
        
        if (minutes > 0.1) {
            console.log(`⏱️ Saving Plan Detail study time: ${minutes.toFixed(2)} mins`);
            addStudyTime(minutes);
        }
    };
  }, []);

  const isTablet = width >= 768;

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

  const toggleSessionComplete = (sessionId) => {
    let durationToAdd = 0;
    const updatedAllSessions = allSessions.map((s) => {
      if (s.id === sessionId) {
        durationToAdd = !s.completed ? (s.duration / 60) : -(s.duration / 60);
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    // Update locally and sync
    // Note: We need a way to update the parent state or re-fetch.
    // For now, we'll navigate back or use a callback if provided.
    // But better to just update the local display for immediate feedback.
    
    // We'll update the global user study time too
    if (durationToAdd > 0) {
      addStudyTime(durationToAdd * 60);
    }

    recordActivity();
    syncStudyPlan(allExams, updatedAllSessions);
    
    // Refresh local view
    navigation.setParams({
        sessions: sessions.map(s => s.id === sessionId ? { ...s, completed: !s.completed } : s),
        allSessions: updatedAllSessions
    });
  };

  const fontSize = {
    sm: moderateScale(12),
    base: moderateScale(14),
    lg: moderateScale(16),
    xl: moderateScale(18),
    '2xl': moderateScale(20),
    '3xl': moderateScale(24),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ maxWidth: responsiveWidth, alignSelf: 'center', width: '100%', flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { fontSize: fontSize['2xl'] }]}>{exam.subject}</Text>
            <Text style={[styles.headerSubtitle, { fontSize: fontSize.base }]}>
              {format(new Date(exam.date), "d MMMM yyyy")}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={[styles.scroll, { maxWidth: responsiveWidth, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { fontSize: fontSize.xl }]}>Study Timeline</Text>
          
          {sessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={moderateScale(64)} color={colors.placeholder} />
              <Text style={[styles.emptyText, { fontSize: fontSize.base }]}>No sessions planned for this exam.</Text>
            </View>
          ) : (
            sessions.map((session, index) => (
              <View 
                key={session.id} 
                style={[
                  styles.sessionCard,
                  session.completed && styles.sessionDone
                ]}
              >
                <View style={styles.sessionTimeContainer}>
                  <Text style={[styles.sessionDate, { fontSize: fontSize.sm }]}>
                    {format(new Date(session.date), "d MMM yyyy")}
                  </Text>
                  <Text style={[styles.sessionTime, { fontSize: fontSize.lg }]}>{session.time}</Text>
                </View>

                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionTopic, { fontSize: fontSize.lg }]}>{session.topic}</Text>
                  <View style={styles.sessionMeta}>
                    <Text style={[styles.metaText, { fontSize: fontSize.sm }]}>
                      <Ionicons name="hourglass-outline" size={moderateScale(12)} /> {session.duration} min
                    </Text>
                    <Text style={[styles.metaText, { fontSize: fontSize.sm }]}>
                      • {session.source}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.checkbox,
                    session.completed && styles.checkboxChecked
                  ]}
                  onPress={() => toggleSessionComplete(session.id)}
                >
                  {session.completed && <Ionicons name="checkmark" size={moderateScale(16)} color={colors.white} />}
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, scale, verticalScale, moderateScale, isTablet) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: scale(32),
    borderTopRightRadius: scale(32),
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: colors.white,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: verticalScale(2),
  },
  scroll: {
    paddingBottom: verticalScale(40),
  },
  content: {
    padding: scale(20),
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: verticalScale(20),
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sessionDone: {
    opacity: 0.6,
  },
  sessionTimeContainer: {
    alignItems: 'center',
    paddingRight: scale(16),
    borderRightWidth: 1,
    borderRightColor: colors.border,
    width: scale(80),
  },
  sessionDate: {
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sessionTime: {
    color: colors.text,
    fontWeight: '800',
    marginTop: verticalScale(2),
  },
  sessionInfo: {
    flex: 1,
    paddingLeft: scale(16),
  },
  sessionTopic: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: colors.subText,
    marginRight: scale(8),
  },
  checkbox: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(8),
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: verticalScale(60),
  },
  emptyText: {
    color: colors.placeholder,
    marginTop: verticalScale(16),
    textAlign: 'center',
  }
});
