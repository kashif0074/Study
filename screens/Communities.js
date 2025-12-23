// screens/Communities.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  Platform,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallDevice = height <= 667;

// Simple PostCard Component
const PostCard = ({ post, onLike, onComment }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleAddComment = () => {
    if (!commentText.trim()) {
      Alert.alert("Empty Comment", "Please write something");
      return;
    }
    onComment(post.id, {
      id: Date.now().toString(),
      author: "You",
      text: commentText,
      timestamp: "Just now",
    });
    setCommentText("");
    setShowCommentInput(false);
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorAvatar}>
          <Text style={styles.avatarText}>{post.author[0]}</Text>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.authorName}>{post.author}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
          {post.type && (
            <View style={[styles.postTypeBadge, 
              post.type === 'question' ? styles.questionBadge : 
              post.type === 'challenge' ? styles.challengeBadge : 
              styles.noteBadge
            ]}>
              <Text style={styles.postTypeText}>
                {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.images?.length > 0 && (
        <View style={styles.imageGrid}>
          {post.images.map((img, i) => (
            <Image 
              key={i} 
              source={{ uri: img.uri }} 
              style={styles.postImage} 
              resizeMode="cover" 
            />
          ))}
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => onLike(post.id, !post.isLiked)}
        >
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={isTablet ? 28 : 24}
            color={post.isLiked ? "#EF4444" : "#64748B"}
          />
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => setShowCommentInput(!showCommentInput)}
        >
          <Ionicons 
            name="chatbubble-outline" 
            size={isTablet ? 26 : 22} 
            color="#64748B" 
          />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Comments */}
      {post.comments.length > 0 && (
        <View style={styles.commentsSection}>
          {post.comments.map((c) => (
            <View key={c.id} style={styles.comment}>
              <Text style={styles.commentAuthor}>{c.author}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
              <Text style={styles.commentTime}>{c.timestamp}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Add Comment */}
      {showCommentInput && (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={commentText}
            onChangeText={setCommentText}
            placeholderTextColor="#9CA3AF"
            multiline
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Ionicons name="send" size={isTablet ? 26 : 22} color="#6B21A8" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const [communities, setCommunities] = useState([
    {
      id: "1",
      name: "Mathematics Enthusiasts",
      subject: "Math",
      members: 2453,
      posts: 1234,
      description: "Share problems, solutions & math insights",
      color: "#3B82F6",
      isJoined: true,
      createdBy: "system",
    },
    {
      id: "2",
      name: "Physics Lab",
      subject: "Physics",
      members: 1876,
      posts: 892,
      description: "Experiments, concepts & breakthroughs",
      color: "#8B5CF6",
      isJoined: true,
      createdBy: "system",
    },
    {
      id: "3",
      name: "Chemistry Club",
      subject: "Chemistry",
      members: 1532,
      posts: 734,
      description: "Molecules, reactions & compounds",
      color: "#10B981",
      isJoined: false,
      createdBy: "system",
    },
    {
      id: "4",
      name: "Biology Study Group",
      subject: "Biology",
      members: 2105,
      posts: 1456,
      description: "From cells to ecosystems",
      color: "#F97316",
      isJoined: false,
      createdBy: "system",
    },
    {
      id: "5",
      name: "Computer Science Hub",
      subject: "CS",
      members: 3421,
      posts: 2134,
      description: "Programming, algorithms & discussions",
      color: "#6366F1",
      isJoined: false,
      createdBy: "system",
    },
  ]);

  const [posts, setPosts] = useState([
    {
      id: "1",
      author: "Sarah Johnson",
      content: "Just learned completing the square! Here's my step-by-step method.",
      type: "note",
      likes: 24,
      comments: [
        { id: "c1", author: "Alex", text: "Super clear! Thanks", timestamp: "1h ago" },
        { id: "c2", author: "Emma", text: "Can you share the PDF?", timestamp: "30m ago" },
      ],
      timestamp: "2h ago",
      isLiked: false,
      images: [],
    },
    {
      id: "2",
      author: "Mike Chen",
      content: "Permutations vs Combinations — can someone explain the difference?",
      type: "question",
      likes: 15,
      comments: [
        { id: "c3", author: "John", text: "Order matters in permutations", timestamp: "4h ago" },
        { id: "c4", author: "Lisa", text: "Combinations don't care about order", timestamp: "3h ago" },
      ],
      timestamp: "5h ago",
      isLiked: true,
      images: [],
    },
  ]);

  const toggleJoin = (id) => {
    setCommunities(prev =>
      prev.map(c => (c.id === id ? { ...c, isJoined: !c.isJoined } : c))
    );
    Alert.alert("Success", "Community updated!");
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCommunity = (community) => setSelectedCommunity(community);
  const closeCommunity = () => setSelectedCommunity(null);

  const handleLike = (postId, newLiked) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: newLiked, likes: newLiked ? p.likes + 1 : p.likes - 1 }
          : p
      )
    );
  };

  const handleComment = (postId, newComment) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
  };

  const addNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
    Alert.alert("Posted!", "Your post is live!");
  };

  const addNewCommunity = (newCommunity) => {
    const community = {
      ...newCommunity,
      id: Date.now().toString(),
      members: 1,
      posts: 0,
      isJoined: true,
      createdBy: "user",
    };
    setCommunities(prev => [community, ...prev]);
    setShowCreateCommunity(false);
    Alert.alert("Success!", `${newCommunity.name} community created!`);
  };

  const leaveCommunity = (id) => {
    setCommunities(prev =>
      prev.map(c => (c.id === id ? { ...c, isJoined: false } : c))
    );
    Alert.alert("Left Community", "You have left the community");
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
          <Ionicons name="people" size={isTablet ? 44 : 36} color="#fff" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Communities</Text>
            <Text style={styles.headerSubtitle}>Connect & learn together</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Search */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={isTablet ? 24 : 20} color="#94A3B8" />
            <TextInput
              placeholder="Search communities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Create Community Button */}
          <TouchableOpacity 
            style={styles.createCommunityBtn}
            onPress={() => setShowCreateCommunity(true)}
          >
            <Ionicons name="add-circle" size={isTablet ? 28 : 22} color="#fff" />
            <Text style={styles.createCommunityText}>Create Community</Text>
          </TouchableOpacity>

          {/* My Communities */}
          {communities.filter(c => c.isJoined).length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Communities</Text>
                <TouchableOpacity onPress={() => {
                  // Filter to show only joined communities
                  setSearchQuery("");
                }}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.myCommunitiesScroll}
              >
                {communities.filter(c => c.isJoined).map(community => (
                  <TouchableOpacity
                    key={community.id}
                    style={styles.myCommunityCard}
                    onPress={() => openCommunity(community)}
                  >
                    <View style={[styles.communityColor, { backgroundColor: community.color }]}>
                      <Ionicons name="people" size={isTablet ? 36 : 28} color="#fff" />
                      {community.createdBy === "user" && (
                        <View style={styles.userCreatedBadge}>
                          <Ionicons name="star" size={isTablet ? 16 : 12} color="#FBBF24" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.myCommunityName} numberOfLines={1}>
                      {community.name}
                    </Text>
                    <Text style={styles.myCommunityMembers}>
                      {community.members.toLocaleString()} members
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Discover */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover More</Text>
            <Text style={styles.sectionCount}>
              {filteredCommunities.filter(c => !c.isJoined).length} available
            </Text>
          </View>
          
          {filteredCommunities.filter(c => !c.isJoined).length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={isTablet ? 64 : 48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No communities found</Text>
              <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
            </View>
          ) : (
            filteredCommunities.filter(c => !c.isJoined).map(community => (
              <View key={community.id} style={styles.discoverCard}>
                <View style={[styles.discoverColor, { backgroundColor: community.color }]}>
                  <Ionicons name="people" size={isTablet ? 28 : 24} color="#fff" />
                  {community.createdBy === "user" && (
                    <View style={styles.userCreatedSmallBadge}>
                      <Ionicons name="star" size={isTablet ? 14 : 10} color="#FBBF24" />
                    </View>
                  )}
                </View>
                <View style={styles.discoverInfo}>
                  <View style={styles.discoverHeader}>
                    <Text style={styles.discoverName} numberOfLines={1}>
                      {community.name}
                    </Text>
                    <Text style={styles.discoverSubject}>{community.subject}</Text>
                  </View>
                  <Text style={styles.discoverDesc} numberOfLines={2}>
                    {community.description}
                  </Text>
                  <View style={styles.discoverStats}>
                    <Text style={styles.stat}>
                      <Ionicons name="people" size={isTablet ? 16 : 14} /> {community.members.toLocaleString()}
                    </Text>
                    <Text style={styles.stat}>
                      • <Ionicons name="document-text" size={isTablet ? 16 : 14} /> {community.posts} posts
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.joinBtn,
                    community.isJoined && styles.leaveBtn
                  ]}
                  onPress={() => community.isJoined ? leaveCommunity(community.id) : toggleJoin(community.id)}
                >
                  <Text style={styles.joinText}>
                    {community.isJoined ? 'Leave' : 'Join'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Community Detail Modal */}
      <Modal 
        visible={!!selectedCommunity} 
        animationType="slide"
        statusBarTranslucent
      >
        <CommunityDetail
          community={selectedCommunity}
          posts={posts}
          onBack={closeCommunity}
          onCreatePost={() => setShowCreatePost(true)}
          onLike={handleLike}
          onComment={handleComment}
        />
      </Modal>

      {/* Create Post Modal */}
      <Modal 
        visible={showCreatePost} 
        animationType="slide"
        statusBarTranslucent
      >
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPost={addNewPost}
        />
      </Modal>

      {/* Create Community Modal */}
      <Modal 
        visible={showCreateCommunity} 
        animationType="slide"
        statusBarTranslucent
      >
        <CreateCommunityModal
          onClose={() => setShowCreateCommunity(false)}
          onCreate={addNewCommunity}
        />
      </Modal>
    </SafeAreaView>
  );
}

// Community Detail
function CommunityDetail({ community, posts, onBack, onCreatePost, onLike, onComment }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.detailContainer}>
        <View style={[styles.detailHeader, { backgroundColor: community?.color || "#6B21A8" }]}>
          <View style={styles.detailHeaderTop}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={isTablet ? 32 : 28} color="#fff" />
            </TouchableOpacity>
            {community?.createdBy === "user" && (
              <View style={styles.userCreatedLabel}>
                <Ionicons name="star" size={isTablet ? 18 : 14} color="#FBBF24" />
                <Text style={styles.userCreatedLabelText}>Your Community</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.detailCommunityName}>{community?.name}</Text>
          <Text style={styles.detailCommunityDesc}>{community?.description}</Text>
          
          <View style={styles.detailCommunityStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={isTablet ? 22 : 16} color="#fff" />
              <Text style={styles.detailStat}>{community?.members.toLocaleString()} Members</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="document-text" size={isTablet ? 22 : 16} color="#fff" />
              <Text style={styles.detailStat}>{posts.length} Posts</Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.createPostButton} 
            onPress={onCreatePost}
          >
            <Ionicons name="create-outline" size={isTablet ? 28 : 24} color="#6B21A8" />
            <Text style={styles.createPostButtonText}>Create New Post</Text>
          </TouchableOpacity>

          {posts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Ionicons name="chatbubble" size={isTablet ? 64 : 48} color="#CBD5E1" />
              <Text style={styles.noPosts}>No posts yet. Be the first!</Text>
              <TouchableOpacity 
                style={styles.createFirstPostBtn}
                onPress={onCreatePost}
              >
                <Text style={styles.createFirstPostText}>Create First Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={onLike}
                onComment={onComment}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Create Post Modal
function CreatePostModal({ onClose, onPost }) {
  const [content, setContent] = useState("");
  const [type, setType] = useState("note");
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Allow gallery access to add images");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 4,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        }));
        setImages(prev => [...prev, ...newImages].slice(0, 4));
      }
    } catch (err) {
      console.error("Image picker error:", err);
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert("Empty Post", "Add some text or images");
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      author: "You",
      content,
      type,
      likes: 0,
      comments: [],
      timestamp: "Just now",
      isLiked: false,
      images,
    };

    onPost(newPost);
  };

  return (
    <SafeAreaView style={styles.createModalContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.createModalInner}
      >
        <View style={styles.createModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={isTablet ? 32 : 28} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.createModalTitle}>Create Post</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.postSubmitText}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.createModalBody}
          showsVerticalScrollIndicator={false}
        >
          {/* Type Selector */}
          <View style={styles.typeSelector}>
            {["note", "question", "challenge"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                onPress={() => setType(t)}
              >
                <Ionicons 
                  name={
                    t === "note" ? "document-text" : 
                    t === "question" ? "help-circle" : "trophy"
                  }
                  size={isTablet ? 24 : 20}
                  color={type === t ? "#fff" : "#64748B"}
                />
                <Text
                  style={[styles.typeText, type === t && styles.typeTextActive]}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Input */}
          <TextInput
            style={styles.createPostInput}
            placeholder="Share your knowledge, ask a question, or post a challenge..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />

          {/* Image Picker */}
          <TouchableOpacity 
            style={styles.addImageBtn} 
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={isTablet ? 28 : 24} color="#6B21A8" />
            <Text style={styles.addImageText}>
              Add Images {images.length > 0 && `(${images.length}/4)`}
            </Text>
          </TouchableOpacity>

          {/* Image Preview */}
          {images.length > 0 && (
            <View style={styles.createImageGrid}>
              {images.map((img, i) => (
                <View key={i} style={styles.createImageWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.createPreviewImage} resizeMode="cover" />
                  <TouchableOpacity 
                    style={styles.removeImageBtn} 
                    onPress={() => removeImage(i)}
                  >
                    <Ionicons name="close-circle" size={isTablet ? 28 : 24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Create Community Modal
function CreateCommunityModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    subject: "",
    description: "",
    color: "#6B21A8",
  });

  const colors = ["#6B21A8", "#3B82F6", "#10B981", "#F97316", "#6366F1", "#EF4444", "#8B5CF6"];

  const handleCreate = () => {
    if (!form.name.trim()) {
      Alert.alert("Missing Name", "Please enter a community name");
      return;
    }
    if (!form.subject.trim()) {
      Alert.alert("Missing Subject", "Please enter a subject");
      return;
    }
    if (!form.description.trim()) {
      Alert.alert("Missing Description", "Please enter a description");
      return;
    }

    onCreate(form);
    setForm({ name: "", subject: "", description: "", color: "#6B21A8" });
  };

  return (
    <SafeAreaView style={styles.createCommunityModalContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.createCommunityModalInner}
      >
        <View style={styles.createCommunityModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={isTablet ? 32 : 28} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.createCommunityModalTitle}>Create Community</Text>
          <TouchableOpacity onPress={handleCreate}>
            <Text style={styles.createSubmitText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.createCommunityModalBody}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Community Name *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Advanced Calculus Group"
              value={form.name}
              onChangeText={(text) => setForm({...form, name: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Subject *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Mathematics, Physics, CS"
              value={form.subject}
              onChangeText={(text) => setForm({...form, subject: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description *</Text>
            <TextInput
              style={[styles.formInput, styles.descriptionInput]}
              placeholder="Describe your community..."
              value={form.description}
              onChangeText={(text) => setForm({...form, description: text})}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Choose Color Theme</Text>
            <View style={styles.colorPicker}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    form.color === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setForm({...form, color})}
                >
                  {form.color === color && (
                    <Ionicons name="checkmark" size={isTablet ? 24 : 20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.communityPreview}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={[styles.previewCard, { backgroundColor: form.color }]}>
              <Ionicons name="people" size={isTablet ? 36 : 28} color="#fff" />
              <Text style={styles.previewName}>{form.name || "Community Name"}</Text>
              <Text style={styles.previewDesc}>{form.description || "Community description"}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles
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
    paddingBottom: isTablet ? 60 : 30,
  },
  header: {
    backgroundColor: "#6B21A8",
    padding: isTablet ? 32 : 20,
    paddingTop: isTablet ? 40 : 60,
    paddingBottom: isTablet ? 36 : 30,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: isTablet ? 40 : 32,
    borderBottomRightRadius: isTablet ? 40 : 32,
    ...Platform.select({
      ios: {
        shadowColor: "#6B21A8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerText: { 
    marginLeft: isTablet ? 20 : 16,
    flex: 1,
  },
  headerTitle: { 
    fontSize: isTablet ? 34 : 26, 
    fontWeight: "800", 
    color: "#fff",
    marginBottom: isTablet ? 4 : 0,
  },
  headerSubtitle: { 
    fontSize: isTablet ? 18 : 15, 
    color: "#E9D5FF", 
    marginTop: 4 
  },
  content: { 
    padding: isTablet ? 32 : 20,
    paddingBottom: isTablet ? 40 : 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: isTablet ? 24 : 20,
    paddingHorizontal: isTablet ? 20 : 16,
    marginBottom: isTablet ? 28 : 24,
    height: isTablet ? 60 : 50,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchInput: { 
    flex: 1, 
    marginLeft: isTablet ? 14 : 10, 
    fontSize: isTablet ? 18 : 16,
    color: '#1E1B4B',
  },
  createCommunityBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B21A8",
    padding: isTablet ? 18 : 14,
    borderRadius: isTablet ? 24 : 20,
    marginBottom: isTablet ? 32 : 28,
    ...Platform.select({
      ios: {
        shadowColor: "#6B21A8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createCommunityText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: isTablet ? 18 : 16,
    marginLeft: isTablet ? 12 : 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: isTablet ? 20 : 16,
    marginTop: isTablet ? 8 : 0,
  },
  sectionTitle: { 
    fontSize: isTablet ? 24 : 20, 
    fontWeight: "700", 
    color: "#1E1B4B" 
  },
  seeAllText: {
    fontSize: isTablet ? 16 : 14,
    color: "#6B21A8",
    fontWeight: "600",
  },
  sectionCount: {
    fontSize: isTablet ? 16 : 14,
    color: "#64748B",
  },
  myCommunitiesScroll: {
    marginBottom: isTablet ? 32 : 24,
    paddingVertical: isTablet ? 4 : 2,
  },
  myCommunityCard: {
    width: isTablet ? 180 : 140,
    backgroundColor: "#fff",
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 20 : 16,
    marginRight: isTablet ? 16 : 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  communityColor: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: isTablet ? 40 : 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: isTablet ? 16 : 12,
    position: 'relative',
  },
  userCreatedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: isTablet ? 4 : 3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  myCommunityName: { 
    fontSize: isTablet ? 18 : 15, 
    fontWeight: "600", 
    color: "#1E1B4B", 
    textAlign: "center",
    marginBottom: isTablet ? 8 : 4,
  },
  myCommunityMembers: { 
    fontSize: isTablet ? 14 : 13, 
    color: "#64748B" 
  },
  discoverCard: {
    backgroundColor: "#fff",
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 20 : 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: isTablet ? 20 : 16,
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
  discoverColor: {
    width: isTablet ? 70 : 56,
    height: isTablet ? 70 : 56,
    borderRadius: isTablet ? 20 : 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: isTablet ? 20 : 16,
    position: 'relative',
  },
  userCreatedSmallBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: isTablet ? 3 : 2,
  },
  discoverInfo: { 
    flex: 1,
    marginRight: isTablet ? 16 : 12,
  },
  discoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 8 : 6,
  },
  discoverName: { 
    fontSize: isTablet ? 20 : 16, 
    fontWeight: "700", 
    color: "#1E1B4B",
    flex: 1,
    marginRight: isTablet ? 12 : 8,
  },
  discoverSubject: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: "600",
    color: "#6B21A8",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: isTablet ? 10 : 8,
    paddingVertical: isTablet ? 4 : 3,
    borderRadius: isTablet ? 12 : 8,
  },
  discoverDesc: { 
    fontSize: isTablet ? 16 : 14, 
    color: "#64748B", 
    marginVertical: isTablet ? 8 : 6,
    lineHeight: isTablet ? 22 : 20,
  },
  discoverStats: { 
    flexDirection: "row", 
    gap: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  stat: { 
    fontSize: isTablet ? 15 : 13, 
    color: "#64748B",
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinBtn: { 
    backgroundColor: "#6B21A8", 
    paddingHorizontal: isTablet ? 24 : 20, 
    paddingVertical: isTablet ? 12 : 10, 
    borderRadius: isTablet ? 20 : 16,
    minWidth: isTablet ? 90 : 70,
  },
  leaveBtn: {
    backgroundColor: "#EF4444",
  },
  joinText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: "center",
    padding: isTablet ? 40 : 30,
    backgroundColor: "#fff",
    borderRadius: isTablet ? 24 : 20,
    marginTop: isTablet ? 20 : 10,
  },
  emptyStateText: { 
    fontSize: isTablet ? 20 : 16, 
    fontWeight: "600", 
    color: "#1E1B4B",
    marginTop: isTablet ? 20 : 16,
  },
  emptyStateSubtext: { 
    fontSize: isTablet ? 16 : 14, 
    color: "#64748B", 
    marginTop: isTablet ? 8 : 6,
  },

  // Post Card Styles
  postCard: {
    backgroundColor: "#fff",
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 24 : 16,
    marginBottom: isTablet ? 20 : 16,
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
  postHeader: { 
    flexDirection: "row", 
    marginBottom: isTablet ? 16 : 12 
  },
  authorAvatar: { 
    width: isTablet ? 56 : 40, 
    height: isTablet ? 56 : 40, 
    borderRadius: isTablet ? 28 : 20, 
    backgroundColor: "#A78BFA", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  avatarText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: isTablet ? 20 : 16 
  },
  postMeta: { 
    marginLeft: isTablet ? 16 : 12, 
    justifyContent: "center",
    flex: 1,
  },
  authorName: { 
    fontSize: isTablet ? 18 : 15, 
    fontWeight: "600", 
    color: "#1E1B4B" 
  },
  timestamp: { 
    fontSize: isTablet ? 15 : 13, 
    color: "#9CA3AF",
    marginTop: isTablet ? 2 : 1,
  },
  postTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 4 : 3,
    borderRadius: isTablet ? 12 : 8,
    marginTop: isTablet ? 6 : 4,
  },
  noteBadge: { backgroundColor: '#DBEAFE' },
  questionBadge: { backgroundColor: '#FEF3C7' },
  challengeBadge: { backgroundColor: '#FCE7F3' },
  postTypeText: {
    fontSize: isTablet ? 13 : 11,
    fontWeight: "600",
    color: "#1E1B4B",
  },
  postContent: { 
    fontSize: isTablet ? 18 : 15, 
    color: "#374151", 
    lineHeight: isTablet ? 26 : 22, 
    marginBottom: isTablet ? 16 : 12 
  },
  imageGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: isTablet ? 12 : 8, 
    marginVertical: isTablet ? 16 : 12 
  },
  postImage: { 
    width: isTablet ? 160 : 100, 
    height: isTablet ? 160 : 100, 
    borderRadius: isTablet ? 16 : 12 
  },
  postActions: { 
    flexDirection: "row", 
    gap: isTablet ? 24 : 20, 
    marginTop: isTablet ? 12 : 8 
  },
  actionBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: isTablet ? 8 : 6 
  },
  actionText: { 
    fontSize: isTablet ? 16 : 14, 
    color: "#64748B" 
  },
  likedText: { 
    color: "#EF4444", 
    fontWeight: "600" 
  },
  commentsSection: { 
    marginTop: isTablet ? 20 : 16, 
    paddingTop: isTablet ? 16 : 12, 
    borderTopWidth: 1, 
    borderColor: "#E5E7EB" 
  },
  comment: { 
    marginBottom: isTablet ? 16 : 12 
  },
  commentAuthor: { 
    fontSize: isTablet ? 16 : 14, 
    fontWeight: "600", 
    color: "#1E1B4B" 
  },
  commentText: { 
    fontSize: isTablet ? 16 : 14, 
    color: "#374151", 
    marginVertical: isTablet ? 6 : 4 
  },
  commentTime: { 
    fontSize: isTablet ? 14 : 12, 
    color: "#9CA3AF" 
  },
  commentInputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: isTablet ? 16 : 12 
  },
  commentInput: { 
    flex: 1, 
    backgroundColor: "#F1F5F9", 
    borderRadius: isTablet ? 24 : 20, 
    padding: isTablet ? 16 : 12, 
    marginRight: isTablet ? 12 : 8,
    fontSize: isTablet ? 16 : 14,
    minHeight: isTablet ? 50 : 40,
  },

  // Community Detail Styles
  detailContainer: { 
    flex: 1, 
    backgroundColor: "#FAF5FF" 
  },
  detailHeader: { 
    paddingTop: isTablet ? 40 : 60, 
    paddingBottom: isTablet ? 36 : 30, 
    paddingHorizontal: isTablet ? 32 : 20,
  },
  detailHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
  },
  backButton: { 
    marginBottom: 0,
  },
  userCreatedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 6 : 4,
    borderRadius: isTablet ? 20 : 16,
    gap: isTablet ? 6 : 4,
  },
  userCreatedLabelText: {
    color: "#fff",
    fontSize: isTablet ? 14 : 12,
    fontWeight: "600",
  },
  detailCommunityName: { 
    fontSize: isTablet ? 32 : 26, 
    fontWeight: "800", 
    color: "#fff", 
    marginBottom: isTablet ? 12 : 8 
  },
  detailCommunityDesc: { 
    fontSize: isTablet ? 18 : 15, 
    color: "#E9D5FF", 
    marginBottom: isTablet ? 20 : 16,
    lineHeight: isTablet ? 24 : 22,
  },
  detailCommunityStats: { 
    flexDirection: "row", 
    gap: isTablet ? 24 : 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 8 : 6,
  },
  detailStat: { 
    color: "#fff", 
    fontSize: isTablet ? 18 : 15,
    fontWeight: '600',
  },
  detailContent: { 
    flex: 1, 
    padding: isTablet ? 32 : 20 
  },
  createPostButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F3E8FF", 
    padding: isTablet ? 20 : 16, 
    borderRadius: isTablet ? 24 : 20, 
    justifyContent: "center", 
    marginBottom: isTablet ? 24 : 20,
    ...Platform.select({
      ios: {
        shadowColor: "#6B21A8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  createPostButtonText: { 
    color: "#6B21A8", 
    fontWeight: "700", 
    fontSize: isTablet ? 20 : 16, 
    marginLeft: isTablet ? 12 : 10 
  },
  noPostsContainer: {
    alignItems: "center",
    padding: isTablet ? 40 : 30,
  },
  noPosts: { 
    textAlign: "center", 
    color: "#9CA3AF", 
    fontSize: isTablet ? 20 : 16, 
    marginTop: isTablet ? 20 : 16 
  },
  createFirstPostBtn: {
    backgroundColor: "#6B21A8",
    paddingHorizontal: isTablet ? 24 : 20,
    paddingVertical: isTablet ? 14 : 12,
    borderRadius: isTablet ? 20 : 16,
    marginTop: isTablet ? 20 : 16,
  },
  createFirstPostText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: isTablet ? 18 : 16,
  },

  // Create Post Modal Styles
  createModalContainer: { 
    flex: 1, 
    backgroundColor: "#FAF5FF" 
  },
  createModalInner: {
    flex: 1,
  },
  createModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isTablet ? 24 : 20,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  createModalTitle: { 
    fontSize: isTablet ? 24 : 18, 
    fontWeight: "700",
    color: '#1E1B4B',
  },
  postSubmitText: { 
    color: "#6B21A8", 
    fontWeight: "700", 
    fontSize: isTablet ? 20 : 16 
  },
  createModalBody: { 
    flex: 1, 
    padding: isTablet ? 32 : 20 
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: isTablet ? 24 : 20,
    backgroundColor: "#F1F5F9",
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 8 : 4,
  },
  typeBtn: { 
    flex: 1, 
    padding: isTablet ? 16 : 12, 
    borderRadius: isTablet ? 12 : 10, 
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
    gap: isTablet ? 8 : 6,
  },
  typeBtnActive: { 
    backgroundColor: "#6B21A8" 
  },
  typeText: { 
    fontSize: isTablet ? 16 : 14, 
    color: "#64748B",
    fontWeight: '600',
  },
  typeTextActive: { 
    color: "#fff" 
  },
  createPostInput: { 
    backgroundColor: "#F8FAFC", 
    borderRadius: isTablet ? 20 : 16, 
    padding: isTablet ? 20 : 16, 
    height: isTablet ? 200 : 160, 
    textAlignVertical: "top", 
    marginBottom: isTablet ? 24 : 20, 
    borderWidth: 1, 
    borderColor: "#E5E7EB",
    fontSize: isTablet ? 18 : 16,
  },
  addImageBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F3E8FF", 
    padding: isTablet ? 20 : 16, 
    borderRadius: isTablet ? 20 : 16, 
    justifyContent: "center", 
    marginBottom: isTablet ? 24 : 20,
  },
  addImageText: { 
    color: "#6B21A8", 
    fontWeight: "600", 
    fontSize: isTablet ? 18 : 16, 
    marginLeft: isTablet ? 12 : 10 
  },
  createImageGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: isTablet ? 16 : 12 
  },
  createImageWrapper: { 
    position: "relative" 
  },
  createPreviewImage: { 
    width: isTablet ? 120 : 100, 
    height: isTablet ? 120 : 100, 
    borderRadius: isTablet ? 16 : 12 
  },
  removeImageBtn: { 
    position: "absolute", 
    top: -8, 
    right: -8 
  },

  // Create Community Modal Styles
  createCommunityModalContainer: { 
    flex: 1, 
    backgroundColor: "#FAF5FF" 
  },
  createCommunityModalInner: {
    flex: 1,
  },
  createCommunityModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isTablet ? 24 : 20,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  createCommunityModalTitle: { 
    fontSize: isTablet ? 24 : 18, 
    fontWeight: "700",
    color: '#1E1B4B',
  },
  createSubmitText: { 
    color: "#6B21A8", 
    fontWeight: "700", 
    fontSize: isTablet ? 20 : 16 
  },
  createCommunityModalBody: { 
    flex: 1, 
    padding: isTablet ? 32 : 20 
  },
  formGroup: { 
    marginBottom: isTablet ? 24 : 20 
  },
  formLabel: { 
    fontSize: isTablet ? 18 : 14, 
    fontWeight: "600", 
    color: "#374151", 
    marginBottom: isTablet ? 12 : 8 
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: isTablet ? 20 : 16,
    padding: isTablet ? 18 : 14,
    fontSize: isTablet ? 18 : 16,
    backgroundColor: "#F9FAFB",
    color: '#1E1B4B',
  },
  descriptionInput: {
    height: isTablet ? 120 : 100,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: isTablet ? 16 : 12,
    marginTop: isTablet ? 12 : 8,
  },
  colorOption: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 60 : 50,
    borderRadius: isTablet ? 30 : 25,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  communityPreview: {
    marginTop: isTablet ? 32 : 24,
  },
  previewTitle: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: "600",
    color: "#1E1B4B",
    marginBottom: isTablet ? 16 : 12,
  },
  previewCard: {
    padding: isTablet ? 24 : 20,
    borderRadius: isTablet ? 24 : 20,
    alignItems: "center",
  },
  previewName: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: "700",
    color: "#fff",
    marginTop: isTablet ? 16 : 12,
    marginBottom: isTablet ? 8 : 6,
    textAlign: 'center',
  },
  previewDesc: {
    fontSize: isTablet ? 16 : 14,
    color: "#E9D5FF",
    textAlign: 'center',
    lineHeight: isTablet ? 22 : 20,
  },
});