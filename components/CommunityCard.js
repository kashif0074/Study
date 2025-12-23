// components/CommunityCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const CommunityCard = ({ community, onPress, onJoin }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.banner, { backgroundColor: community.color }]}>
        <Ionicons name="people" size={32} color="#fff" />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{community.name}</Text>
          <View style={styles.subject}>
            <Text style={styles.subjectText}>{community.subject}</Text>
          </View>
        </View>
        <Text style={styles.desc} numberOfLines={2}>{community.description}</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>{community.members.toLocaleString()} members</Text>
          <Text style={styles.stat}>• {community.posts} posts</Text>
        </View>
      </View>
      {!community.isJoined && (
        <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.joinText}>Join</Text>
        </TouchableOpacity>
      )}
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
  },
  banner: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  name: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  subject: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  subjectText: { fontSize: 11, color: "#64748B" },
  desc: { fontSize: 13, color: "#64748B", marginBottom: 6 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { fontSize: 12, color: "#94A3B8" },
  joinBtn: {
    backgroundColor: "#6B21A8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinText: { color: "#fff", fontWeight: "600", marginLeft: 4 },
});