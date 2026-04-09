// components/PostCard.js
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
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../context/AuthContext";

export const PostCard = ({ post, onLike, onComment }) => {
  const { colors } = useAuth();
  const styles = getStyles(colors);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likes, setLikes] = useState(post.likes);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const typeStyle = {
    note: { bg: colors.badges?.note || colors.accent, text: colors.primary },
    question: { bg: colors.badges?.question || colors.warning + "20", text: colors.warning },
    challenge: { bg: colors.badges?.challenge || colors.danger + "20", text: colors.secondary },
  }[post.type] || { bg: colors.accent, text: colors.primary };

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
          <Ionicons name="ellipsis-vertical" size={20} color={colors.subText} />
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
            color={isLiked ? colors.danger : colors.subText}
          />
          <Text style={styles.actionCount}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowCommentInput(true)}
        >
          <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
          <Text style={styles.actionCount}>{comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={22} color={colors.subText} />
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
            placeholderTextColor={colors.placeholder}
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
              color={comment.trim() ? colors.primary : colors.placeholder}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
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
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarLetter: { color: colors.white, fontWeight: "700", fontSize: 16 },
  headerInfo: { flex: 1 },
  author: { fontSize: 15, fontWeight: "600", color: colors.text },
  timestamp: { fontSize: 12, color: colors.placeholder },
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
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectText: { fontSize: 12, color: colors.primary, fontWeight: "600" },

  content: {
    fontSize: 14,
    color: colors.text,
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
    borderColor: colors.border,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 24,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionCount: { fontSize: 13, color: colors.subText },

  commentsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentItem: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  commentAuthor: {
    fontWeight: "600",
    color: colors.text,
    marginRight: 6,
  },
  commentText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  commentTime: {
    fontSize: 11,
    color: colors.placeholder,
    marginLeft: 6,
  },

  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
});