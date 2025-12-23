// components/PostCard.js   (FULLY UPDATED)
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const PostCard = ({ post, onLike, onComment }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likes, setLikes] = useState(post.likes);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments || []); // <-- NEW

  const typeStyle = {
    note: { bg: "#E0E7FF", text: "#6366F1" },
    question: { bg: "#FEF3C7", text: "#D97706" },
    challenge: { bg: "#D1FAE5", text: "#059669" },
  }[post.type];

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes(newLiked ? likes + 1 : likes - 1);
    onLike?.(post.id, newLiked);
  };

  const submitComment = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      author: "You",
      text: comment.trim(),
      timestamp: "Just now",
    };

    setComments((prev) => [...prev, newComment]);
    setComment("");
    setShowCommentInput(false);
    Keyboard.dismiss();

    // Notify parent to update comment count
    onComment?.(post.id, newComment);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{post.author[0].toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Badges */}
      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: typeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: typeStyle.text }]}>
            {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
          </Text>
        </View>
        {post.subject && (
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectText}>{post.subject}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <View style={styles.imageGrid}>
          {post.images.map((img, i) => (
            <Image key={i} source={{ uri: img.uri }} style={styles.postImg} />
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={22}
            color={isLiked ? "#EF4444" : "#64748B"}
          />
          <Text style={styles.actionCount}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowCommentInput(true)}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#6B21A8" />
          <Text style={styles.actionCount}>{comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* === COMMENTS LIST === */}
      {comments.length > 0 && (
        <View style={styles.commentsList}>
          {comments.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <Text style={styles.commentAuthor}>{c.author}:</Text>
              <Text style={styles.commentText}>{c.text}</Text>
              <Text style={styles.commentTime}>{c.timestamp}</Text>
            </View>
          ))}
        </View>
      )}

      {/* === COMMENT INPUT === */}
      {showCommentInput && (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={comment}
            onChangeText={setComment}
            autoFocus
          />
          <TouchableOpacity
            onPress={submitComment}
            disabled={!comment.trim()}
          >
            <Ionicons
              name="send"
              size={22}
              color={comment.trim() ? "#6B21A8" : "#94A3B8"}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarLetter: { color: "#fff", fontWeight: "700", fontSize: 16 },
  headerInfo: { flex: 1 },
  author: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  timestamp: { fontSize: 12, color: "#94A3B8" },
  moreBtn: { padding: 4 },

  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  subjectBadge: {
    backgroundColor: "#E9D5FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectText: { fontSize: 12, color: "#9333EA", fontWeight: "600" },

  content: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
  },

  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  postImg: {
    width: 180,
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 24,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionCount: { fontSize: 13, color: "#64748B" },

  // === COMMENTS LIST ===
  commentsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  commentItem: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  commentAuthor: {
    fontWeight: "600",
    color: "#1E293B",
    marginRight: 6,
  },
  commentText: {
    flex: 1,
    color: "#475569",
    fontSize: 13,
  },
  commentTime: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 6,
  },

  // === COMMENT INPUT ===
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
});