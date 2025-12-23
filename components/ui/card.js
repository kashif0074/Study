// components/ui/card.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function CardHeader({ children }) {
  return <View style={styles.header}>{children}</View>;
}
export function CardTitle({ children }) {
  return <Text style={styles.title}>{children}</Text>;
}
export function CardContent({ children }) {
  return <View style={styles.content}>{children}</View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, marginVertical: 8, elevation: 2, shadowColor: "#A78BFA", shadowOpacity: 0.06, shadowRadius: 6 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  title: { fontSize: 18, fontWeight: "700", color: "#1E1B4B" },
  content: { padding: 16 },
});