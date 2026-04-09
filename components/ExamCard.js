// components/ExamCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

export const ExamCard = ({ exam, onPress }) => {
  const { colors } = useAuth();
  const styles = getStyles(colors);
  const daysLeft = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.icon}>
        <Ionicons name="document-text" size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.subject}>{exam.subject}</Text>
        <Text style={styles.date}>{format(new Date(exam.date), "MMM dd, yyyy")}</Text>
        <Text style={styles.topics}>{exam.topics}</Text>
      </View>
      <View style={styles.days}>
        <Text style={styles.daysText}>{daysLeft}</Text>
        <Text style={styles.daysLabel}>days left</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    elevation: 2,
  },
  icon: {
    width: 48,
    height: 48,
    backgroundColor: colors.accent,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  subject: { fontSize: 16, fontWeight: "700", color: colors.text },
  date: { fontSize: 13, color: colors.primary, marginVertical: 2 },
  topics: { fontSize: 13, color: colors.subText },
  days: { alignItems: "center" },
  daysText: { fontSize: 18, fontWeight: "800", color: colors.danger },
  daysLabel: { fontSize: 11, color: colors.placeholder },
});