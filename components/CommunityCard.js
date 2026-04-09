// components/CommunityCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../context/AuthContext";

export const CommunityCard = ({ community, onPress, onJoin }) => {
  const { colors } = useAuth();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.banner, { backgroundColor: community.color || colors.primary }]}>
        <Ionicons name="people" size={32} color={colors.white} />
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
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.joinText}>Join</Text>
        </TouchableOpacity>
      )}
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
  name: { fontSize: 15, fontWeight: "600", color: colors.text },
  subject: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  subjectText: { fontSize: 11, color: colors.primary },
  desc: { fontSize: 13, color: colors.subText, marginBottom: 6 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { fontSize: 12, color: colors.placeholder },
  joinBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinText: { color: colors.white, fontWeight: "600", marginLeft: 4 },
});