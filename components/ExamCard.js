// components/ExamCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

export const ExamCard = ({ exam, onPress }) => {
  const daysLeft = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.icon}>
        <Ionicons name="document-text" size={24} color="#6B21A8" />
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    elevation: 2,
  },
  icon: {
    width: 48,
    height: 48,
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  subject: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  date: { fontSize: 13, color: "#6B21A8", marginVertical: 2 },
  topics: { fontSize: 13, color: "#64748B" },
  days: { alignItems: "center" },
  daysText: { fontSize: 18, fontWeight: "800", color: "#DC2626" },
  daysLabel: { fontSize: 11, color: "#94A3B8" },
});