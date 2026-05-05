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
    useWindowDimensions,
    SafeAreaView,
    KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import CONFIG from "../constants/config";
import { useEffect } from "react";

// Global constants removed to support dynamic resizing


// Simple PostCard Component
const PostCard = ({ post, onLike, onComment, isAdmin, onAdminAction }) => {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { colors } = useAuth();
    const styles = getStyles(colors, isTablet);
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

    const confirmDeletePost = () => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => onAdminAction(post.id, "delete") }
            ]
        );
    };

    const formattedTime = new Date(post.createdAt).toLocaleDateString() + ' ' + new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const baseUrl = CONFIG.API_URLS.AUTH.split('/api')[0]; // Extract base domain

    return (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={styles.authorAvatar}>
                    <Text style={styles.avatarText}>{(post.author?.name || "U")[0]}</Text>
                </View>
                <View style={styles.postMeta}>
                    <Text style={styles.authorName}>{post.author?.name || "Unknown User"}</Text>
                    <Text style={styles.timestamp}>{formattedTime}</Text>
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
                    {post.images.map((imgUrl, i) => (
                        <Image
                            key={i}
                            source={{ uri: imgUrl.startsWith('http') ? imgUrl : `${baseUrl}${imgUrl}` }}
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
                        color={post.isLiked ? colors.danger : colors.subText}
                    />
                    <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
                        {post.likes?.length || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => setShowCommentInput(!showCommentInput)}
                >
                    <Ionicons
                        name="chatbubble-outline"
                        size={isTablet ? 26 : 22}
                        color={colors.subText}
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
                        placeholderTextColor={colors.placeholder}
                        multiline
                    />
                    <TouchableOpacity onPress={handleAddComment}>
                        <Ionicons name="send" size={isTablet ? 26 : 22} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Admin Delete Action */}
            {isAdmin && (
                <TouchableOpacity
                    style={styles.adminPostAction}
                    onPress={confirmDeletePost}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    <Text style={styles.adminActionText}>DELETE POST</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default function Communities({ onBack }) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { colors, isAdmin, user } = useAuth();
    const styles = getStyles(colors, isTablet);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateCommunity, setShowCreateCommunity] = useState(false);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [editingCommunity, setEditingCommunity] = useState(null);
    const [showAllMyCommunities, setShowAllMyCommunities] = useState(false);
    const [loading, setLoading] = useState(true);

    const getCommunityColor = (subject) => {
        if (subject === 'Software Engineering') return colors.catMath;
        if (subject === 'Physics') return colors.catPhysics;
        if (subject === 'Web Development') return colors.catChem;
        if (subject === 'Mobile Development') return colors.catBio;
        if (subject === 'CS') return colors.catCS;
        return colors.primary; // Default color
    };

    const [communities, setCommunities] = useState([]);
    const [posts, setPosts] = useState([]);

    // Fetch Communities on mount
    useEffect(() => {
        fetchCommunities();
    }, [user?.uid]);

    // Fetch Posts when a community is opened
    useEffect(() => {
        if (selectedCommunity) {
            fetchPosts(selectedCommunity._id);
        }
    }, [selectedCommunity]);

    const fetchCommunities = async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}?userId=${user.uid}&email=${user.email}`);
            const data = await resp.json();
            if (Array.isArray(data)) {
                const formatted = data.map(c => ({ ...c, id: c._id }));
                setCommunities(formatted);
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async (communityId) => {
        try {
            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/${communityId}/posts`);
            const data = await resp.json();
            if (Array.isArray(data)) {
                // Map _id to id and check liked status
                const formattedPosts = data.map(p => ({
                    ...p,
                    id: p._id,
                    isLiked: p.likes.includes(user.uid)
                }));
                setPosts(formattedPosts);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const toggleJoin = async (communityId) => {
        try {
            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/${communityId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid })
            });
            if (resp.ok) {
                fetchCommunities();
                Alert.alert("Success", "Joined community!");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to join");
        }
    };

    const leaveCommunity = async (communityId) => {
        try {
            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/${communityId}/leave`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid })
            });
            if (resp.ok) {
                fetchCommunities();
                Alert.alert("Success", "Left community");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to leave");
        }
    };

    const handleLike = async (postId, newLiked) => {
        try {
            // Optimistic update
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    const newLikes = p.isLiked 
                        ? p.likes.filter(id => id !== user.uid) 
                        : [...p.likes, user.uid];
                    return { ...p, likes: newLikes, isLiked: !p.isLiked };
                }
                return p;
            }));

            await fetch(`${CONFIG.API_URLS.COMMUNITIES}/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid })
            });
            // We don't bother re-fetching here as the optimistic update handles it
        } catch (error) {
            console.error("Like error:", error);
            // Revert on error if needed, but keeping it simple for now
        }
    };

    const handleComment = async (postId, newComment) => {
        try {
            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: user.name || user.email.split('@')[0],
                    text: newComment.text
                })
            });
            if (resp.ok) {
                fetchPosts(selectedCommunity._id);
            }
        } catch (error) {
            console.error("Comment error:", error);
        }
    };

    const addNewPost = async (postData) => {
        try {
            setLoading(true);
            const uploadedImageUrls = [];

            // Upload images first
            for (const img of postData.images) {
                const formData = new FormData();
                const filename = img.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('image', {
                    uri: img.uri,
                    name: filename,
                    type: type
                });

                const uploadResp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/upload`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (uploadResp.ok) {
                    const uploadData = await uploadResp.json();
                    uploadedImageUrls.push(uploadData.imageUrl);
                }
            }

            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    communityId: selectedCommunity._id,
                    author: {
                        id: user.uid,
                        name: user.displayName || user.name || user.email.split('@')[0],
                        avatar: user.avatar || ""
                    },
                    content: postData.content,
                    type: postData.type,
                    images: uploadedImageUrls
                })
            });

            if (resp.ok) {
                setShowCreatePost(false);
                fetchPosts(selectedCommunity._id);
                fetchCommunities(); // Update post count
                Alert.alert("Posted!", "Your post is live!");
            }
        } catch (error) {
            console.error("Post creation error:", error);
            Alert.alert("Error", "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    const addNewCommunity = async (newCommunity) => {
        try {
            const resp = await fetch(CONFIG.API_URLS.COMMUNITIES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCommunity,
                    userId: user.uid
                })
            });

            if (resp.ok) {
                fetchCommunities();
                setShowCreateCommunity(false);
                Alert.alert("Success!", `${newCommunity.name} community created!`);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to create community");
        }
    };

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCommunity = (community) => setSelectedCommunity(community);
    const closeCommunity = () => setSelectedCommunity(null);

    const handlePostAction = async (postId, action) => {
        if (action === "delete") {
            Alert.alert(
                "Delete Post",
                "Are you sure you want to delete this post?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/posts/${postId}`, {
                                    method: 'DELETE'
                                });
                                if (resp.ok) {
                                    setPosts(prev => prev.filter(p => p.id !== postId));
                                    Alert.alert("Success", "Post deleted!");
                                    // Also update community info for postsCount
                                    fetchCommunities();
                                }
                            } catch (error) {
                                Alert.alert("Error", "Failed to delete post");
                            }
                        }
                    }
                ]
            );
        }
    };

    const handleUpdateCommunity = async (updatedCommunity) => {
        try {
            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/${updatedCommunity.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCommunity)
            });
            if (resp.ok) {
                fetchCommunities();
                setEditingCommunity(null);
                Alert.alert("Success", "Community updated successfully");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update community");
        }
    };

    const handleDeleteCommunity = async (id, name) => {
        Alert.alert(
            "Delete Community",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const resp = await fetch(`${CONFIG.API_URLS.COMMUNITIES}/${id}`, {
                                method: 'DELETE'
                            });
                            if (resp.ok) {
                                fetchCommunities();
                                Alert.alert("Success", "Community deleted");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete community");
                        }
                    }
                }
            ]
        );
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
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={{ marginRight: 15 }}>
                            <Ionicons name="arrow-back" size={isTablet ? 36 : 28} color={colors.white} />
                        </TouchableOpacity>
                    )}
                    <Ionicons name="people" size={isTablet ? 44 : 36} color={colors.white} />
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Communities</Text>
                        <Text style={styles.headerSubtitle}>Connect & learn together</Text>
                    </View>
                </View>

                {user?.isBanned ? (
                    <View style={[styles.content, { alignItems: 'center', justifyContent: 'center', marginTop: 100 }]}>
                        <Ionicons name="lock-closed" size={80} color={colors.danger} />
                        <Text style={[styles.sectionTitle, { marginTop: 20, textAlign: 'center' }]}>Access Restricted</Text>
                        <Text style={[styles.discoverDesc, { textAlign: 'center', marginTop: 10 }]}>
                            Your account has been restricted by the administrator. You are no longer able to view or participate in communities.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.content}>
                    {/* Search */}
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={isTablet ? 24 : 20} color={colors.placeholder} />
                        <TextInput
                            placeholder="Search communities..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                            placeholderTextColor={colors.placeholder}
                        />
                    </View>

                    {/* Create Community Button */}
                    <TouchableOpacity
                        style={styles.createCommunityBtn}
                        onPress={() => setShowCreateCommunity(true)}
                    >
                        <Ionicons name="add-circle" size={isTablet ? 28 : 22} color={colors.white} />
                        <Text style={styles.createCommunityText}>Create Community</Text>
                    </TouchableOpacity>

                    {/* My Communities */}
                    {(isAdmin ? communities.length > 0 : communities.filter(c => c.isJoined).length > 0) && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    {showAllMyCommunities ? "All My Communities" : "My Communities"}
                                </Text>
                                <TouchableOpacity onPress={() => setShowAllMyCommunities(!showAllMyCommunities)}>
                                    <Text style={styles.seeAllText}>
                                        {showAllMyCommunities ? "Show Less" : "See All"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showAllMyCommunities ? (
                                <View style={{ marginBottom: isTablet ? 32 : 24 }}>
                                    {communities.filter(c => isAdmin || c.isJoined).map(community => (
                                        <TouchableOpacity
                                            key={community._id || community.id}
                                            style={[styles.discoverCard, { marginBottom: 12 }]}
                                            onPress={() => openCommunity(community)}
                                        >
                                            <View style={[styles.discoverColor, { backgroundColor: community.color }]}>
                                                <Ionicons name="people" size={isTablet ? 28 : 24} color={colors.white} />
                                            </View>
                                            <View style={styles.discoverInfo}>
                                                <View style={styles.discoverHeader}>
                                                    <Text style={styles.discoverName}>{community.name}</Text>
                                                    <Text style={styles.discoverSubject}>{community.subject}</Text>
                                                </View>
                                                <Text style={styles.discoverDesc} numberOfLines={1}>{community.description}</Text>
                                            </View>
                                            {isAdmin && (
                                                <TouchableOpacity
                                                    style={styles.adminEditBtn}
                                                    onPress={() => setEditingCommunity(community)}
                                                >
                                                    <Ionicons name="settings" size={20} color={colors.primary} />
                                                </TouchableOpacity>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.myCommunitiesScroll}
                                >
                                    {communities.filter(c => isAdmin || c.isJoined).map(community => (
                                        <TouchableOpacity
                                            key={community._id || community.id}
                                            style={styles.myCommunityCard}
                                            onPress={() => openCommunity(community)}
                                        >
                                            <View style={[styles.communityColor, { backgroundColor: community.color }]}>
                                                <Ionicons name="people" size={isTablet ? 36 : 28} color={colors.white} />
                                                {community.createdBy === user?.uid && (
                                                    <View style={styles.userCreatedBadge}>
                                                        <Ionicons name="star" size={isTablet ? 16 : 12} color={colors.warning} />
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.myCommunityName} numberOfLines={1}>
                                                {community.name}
                                            </Text>
                                            <Text style={styles.myCommunityMembers}>
                                                {(community.membersCount || community.members || 0).toLocaleString()} members
                                            </Text>

                                            {isAdmin && (
                                                <TouchableOpacity
                                                    style={styles.adminEditBtn}
                                                    onPress={() => setEditingCommunity(community)}
                                                >
                                                    <Ionicons name="settings" size={16} color={colors.primary} />
                                                    <Text style={styles.adminEditText}>Manage</Text>
                                                </TouchableOpacity>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </>
                    )}

                    {!showAllMyCommunities && (
                        <>
                            {/* Discover */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Discover More</Text>
                                <Text style={styles.sectionCount}>
                                    {isAdmin ? 0 : filteredCommunities.filter(c => !c.isJoined).length} available
                                </Text>
                            </View>

                            {(isAdmin ? [] : filteredCommunities.filter(c => !c.isJoined)).length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="search" size={isTablet ? 64 : 48} color={colors.border} />
                                    <Text style={styles.emptyStateText}>No communities found</Text>
                                    <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
                                </View>
                            ) : (
                                filteredCommunities.filter(c => !c.isJoined).map(community => (
                                    <View key={community._id || community.id} style={styles.discoverCard}>
                                        <View style={[styles.discoverColor, { backgroundColor: community.color }]}>
                                            <Ionicons name="people" size={isTablet ? 28 : 24} color={colors.white} />
                                            {community.createdBy === user?.uid && (
                                                <View style={styles.userCreatedSmallBadge}>
                                                    <Ionicons name="star" size={isTablet ? 14 : 10} color={colors.warning} />
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
                                                    <Ionicons name="people" size={isTablet ? 16 : 14} /> {(community.membersCount || community.members || 0).toLocaleString()}
                                                </Text>
                                                <Text style={styles.stat}>
                                                    • <Ionicons name="document-text" size={isTablet ? 16 : 14} /> {(community.postsCount || community.posts || 0).toLocaleString()} posts
                                                </Text>
                                            </View>
                                        </View>
                                        {!isAdmin && (
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
                                        )}

                                        {isAdmin && (
                                            <TouchableOpacity
                                                style={styles.adminDeleteBtn}
                                                onPress={() => handleDeleteCommunity(community.id, community.name)}
                                            >
                                                <Ionicons name="trash" size={20} color={colors.danger} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))
                            )}
                        </>
                    )}
                </View>
            )}
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
                    isAdmin={isAdmin}
                    onAdminAction={handlePostAction}
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

            {/* Edit Community Modal */}
            <Modal
                visible={!!editingCommunity}
                animationType="slide"
                statusBarTranslucent
            >
                <EditCommunityModal
                    community={editingCommunity}
                    onClose={() => setEditingCommunity(null)}
                    onUpdate={handleUpdateCommunity}
                    onDelete={(id, name) => {
                        handleDeleteCommunity(id, name);
                        setEditingCommunity(null);
                    }}
                />
            </Modal>
        </SafeAreaView>
    );
}

// Community Detail
function CommunityDetail({ community, posts, onBack, onCreatePost, onLike, onComment, isAdmin, onAdminAction }) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { colors } = useAuth();
    const styles = getStyles(colors, isTablet);
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.detailContainer}>
                <View style={[styles.detailHeader, { backgroundColor: community?.color || colors.primary }]}>
                    <View style={styles.detailHeaderTop}>
                        <TouchableOpacity style={styles.backButton} onPress={onBack}>
                            <Ionicons name="arrow-back" size={isTablet ? 32 : 28} color={colors.white} />
                        </TouchableOpacity>
                        {community?.createdBy === "user" && (
                            <View style={styles.userCreatedLabel}>
                                <Ionicons name="star" size={isTablet ? 18 : 14} color={colors.warning} />
                                <Text style={styles.userCreatedLabelText}>Your Community</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.detailCommunityName}>{community?.name}</Text>
                    <Text style={styles.detailCommunityDesc}>{community?.description}</Text>

                    <View style={styles.detailCommunityStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="people" size={isTablet ? 22 : 16} color={colors.white} />
                            <Text style={styles.detailStat}>{(community?.membersCount || community?.members || 0).toLocaleString()} Members</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="document-text" size={isTablet ? 22 : 16} color={colors.white} />
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
                        <Ionicons name="create-outline" size={isTablet ? 28 : 24} color={colors.primary} />
                        <Text style={styles.createPostButtonText}>Create New Post</Text>
                    </TouchableOpacity>

                    {posts.length === 0 ? (
                        <View style={styles.noPostsContainer}>
                            <Ionicons name="chatbubble" size={isTablet ? 64 : 48} color={colors.border} />
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
                                isAdmin={isAdmin}
                                onAdminAction={onAdminAction}
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
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { colors } = useAuth();
    const styles = getStyles(colors, isTablet);
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
                        <Ionicons name="close" size={isTablet ? 32 : 28} color={colors.subText} />
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
                                    color={type === t ? colors.white : colors.subText}
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
                        placeholderTextColor={colors.placeholder}
                    />

                    {/* Image Picker */}
                    <TouchableOpacity
                        style={styles.addImageBtn}
                        onPress={pickImage}
                    >
                        <Ionicons name="image-outline" size={isTablet ? 28 : 24} color={colors.primary} />
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
                                        <Ionicons name="close-circle" size={isTablet ? 28 : 24} color={colors.danger} />
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
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { colors: themeColors } = useAuth();
    const styles = getStyles(themeColors, isTablet);
    const [form, setForm] = useState({
        name: "",
        subject: "",
        description: "",
        color: themeColors.primary,
    });

    const colors = [themeColors.primary, themeColors.secondary, themeColors.catChem, themeColors.catBio, themeColors.catCS, themeColors.danger, themeColors.catPhysics];

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
        setForm({ name: "", subject: "", description: "", color: themeColors.primary });
    };

    return (
        <SafeAreaView style={styles.createCommunityModalContainer}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.createCommunityModalInner}
            >
                <View style={styles.createCommunityModalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={isTablet ? 32 : 28} color={themeColors.subText} />
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
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            placeholderTextColor={themeColors.placeholder}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Subject *</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder="e.g., Mathematics, Physics, CS"
                            value={form.subject}
                            onChangeText={(text) => setForm({ ...form, subject: text })}
                            placeholderTextColor={themeColors.placeholder}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Description *</Text>
                        <TextInput
                            style={[styles.formInput, styles.descriptionInput]}
                            placeholder="Describe your community..."
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor={themeColors.placeholder}
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
                                    onPress={() => setForm({ ...form, color })}
                                >
                                    {form.color === color && (
                                        <Ionicons name="checkmark" size={isTablet ? 24 : 20} color={themeColors.white} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.communityPreview}>
                        <Text style={styles.previewTitle}>Preview</Text>
                        <View style={[styles.previewCard, { backgroundColor: form.color }]}>
                            <Ionicons name="people" size={isTablet ? 36 : 28} color={themeColors.white} />
                            <Text style={styles.previewName}>{form.name || "Community Name"}</Text>
                            <Text style={styles.previewDesc}>{form.description || "Community description"}</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


// Edit Community Modal
function EditCommunityModal({ community, onClose, onUpdate, onDelete }) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { colors: themeColors } = useAuth();
    const styles = getStyles(themeColors, isTablet);
    const [form, setForm] = useState({
        id: community?.id,
        name: community?.name || "",
        subject: community?.subject || "",
        description: community?.description || "",
        color: community?.color || themeColors.primary,
    });

    const colors = [themeColors.primary, themeColors.secondary, themeColors.catChem, themeColors.catBio, themeColors.catCS, themeColors.danger, themeColors.catPhysics];

    const handleUpdate = () => {
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

        onUpdate(form);
    };

    return (
        <SafeAreaView style={styles.createCommunityModalContainer}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.createCommunityModalInner}
            >
                <View style={styles.createCommunityModalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={isTablet ? 32 : 28} color={themeColors.subText} />
                    </TouchableOpacity>
                    <Text style={styles.createCommunityModalTitle}>Edit Community</Text>
                    <TouchableOpacity onPress={handleUpdate}>
                        <Text style={styles.createSubmitText}>Save</Text>
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
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            placeholderTextColor={themeColors.placeholder}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Subject *</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder="e.g., Mathematics, Physics, CS"
                            value={form.subject}
                            onChangeText={(text) => setForm({ ...form, subject: text })}
                            placeholderTextColor={themeColors.placeholder}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Description *</Text>
                        <TextInput
                            style={[styles.formInput, styles.descriptionInput]}
                            placeholder="Describe your community..."
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor={themeColors.placeholder}
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
                                    onPress={() => setForm({ ...form, color })}
                                >
                                    {form.color === color && (
                                        <Ionicons name="checkmark" size={isTablet ? 24 : 20} color={themeColors.white} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.communityPreview}>
                        <Text style={styles.previewTitle}>Preview</Text>
                        <View style={[styles.previewCard, { backgroundColor: form.color }]}>
                            <Ionicons name="people" size={isTablet ? 36 : 28} color={themeColors.white} />
                            <Text style={styles.previewName}>{form.name || "Community Name"}</Text>
                            <Text style={styles.previewDesc}>{form.description || "Community description"}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.modalDeleteBtn}
                        onPress={() => onDelete(form.id, form.name)}
                    >
                        <Ionicons name="trash-outline" size={20} color={themeColors.danger} />
                        <Text style={styles.modalDeleteText}>Delete Community</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Styles
const getStyles = (colors, isTablet) => StyleSheet.create({
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
        paddingBottom: isTablet ? 60 : 30,
    },
    header: {
        backgroundColor: colors.primary,
        padding: isTablet ? 32 : 20,
        paddingTop: isTablet ? 40 : 60,
        paddingBottom: isTablet ? 36 : 30,
        flexDirection: "row",
        alignItems: "center",
        borderBottomLeftRadius: isTablet ? 40 : 32,
        borderBottomRightRadius: isTablet ? 40 : 32,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
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
        color: colors.white,
        marginBottom: isTablet ? 4 : 0,
    },
    headerSubtitle: {
        fontSize: isTablet ? 18 : 15,
        color: colors.accent,
        marginTop: 4
    },
    content: {
        padding: isTablet ? 32 : 20,
        paddingBottom: isTablet ? 40 : 20,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        borderRadius: isTablet ? 24 : 20,
        paddingHorizontal: isTablet ? 20 : 16,
        marginBottom: isTablet ? 28 : 24,
        height: isTablet ? 60 : 50,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
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
        color: colors.text,
    },
    createCommunityBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
        padding: isTablet ? 18 : 14,
        borderRadius: isTablet ? 24 : 20,
        marginBottom: isTablet ? 32 : 28,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
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
        color: colors.white,
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
        color: colors.text
    },
    seeAllText: {
        fontSize: isTablet ? 16 : 14,
        color: colors.primary,
        fontWeight: "600",
    },
    sectionCount: {
        fontSize: isTablet ? 16 : 14,
        color: colors.subText,
    },
    myCommunitiesScroll: {
        marginBottom: isTablet ? 32 : 24,
        paddingVertical: isTablet ? 4 : 2,
    },
    myCommunityCard: {
        width: isTablet ? 180 : 140,
        backgroundColor: colors.card,
        borderRadius: isTablet ? 24 : 20,
        padding: isTablet ? 20 : 16,
        marginRight: isTablet ? 16 : 12,
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
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
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: isTablet ? 4 : 3,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
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
        color: colors.text,
        textAlign: "center",
        marginBottom: isTablet ? 8 : 4,
    },
    myCommunityMembers: {
        fontSize: isTablet ? 14 : 13,
        color: colors.subText
    },
    discoverCard: {
        backgroundColor: colors.card,
        borderRadius: isTablet ? 24 : 20,
        padding: isTablet ? 20 : 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: isTablet ? 20 : 16,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
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
        backgroundColor: colors.card,
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
        color: colors.text,
        flex: 1,
        marginRight: isTablet ? 12 : 8,
    },
    discoverSubject: {
        fontSize: isTablet ? 14 : 12,
        fontWeight: "600",
        color: colors.primary,
        backgroundColor: colors.accent,
        paddingHorizontal: isTablet ? 10 : 8,
        paddingVertical: isTablet ? 4 : 3,
        borderRadius: isTablet ? 12 : 8,
    },
    discoverDesc: {
        fontSize: isTablet ? 16 : 14,
        color: colors.subText,
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
        color: colors.subText,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    joinBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: isTablet ? 24 : 20,
        paddingVertical: isTablet ? 12 : 10,
        borderRadius: isTablet ? 20 : 16,
        minWidth: isTablet ? 90 : 70,
    },
    leaveBtn: {
        backgroundColor: colors.danger,
    },
    joinText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: isTablet ? 16 : 14,
        textAlign: 'center',
    },
    emptyState: {
        alignItems: "center",
        padding: isTablet ? 40 : 30,
        backgroundColor: colors.card,
        borderRadius: isTablet ? 24 : 20,
        marginTop: isTablet ? 20 : 10,
    },
    emptyStateText: {
        fontSize: isTablet ? 20 : 16,
        fontWeight: "600",
        color: colors.text,
        marginTop: isTablet ? 20 : 16,
    },
    emptyStateSubtext: {
        fontSize: isTablet ? 16 : 14,
        color: colors.subText,
        marginTop: isTablet ? 8 : 6,
    },

    // Post Card Styles
    postCard: {
        backgroundColor: colors.card,
        borderRadius: isTablet ? 24 : 20,
        padding: isTablet ? 24 : 16,
        marginBottom: isTablet ? 20 : 16,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
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
        backgroundColor: colors.secondary,
        justifyContent: "center",
        alignItems: "center"
    },
    avatarText: {
        color: colors.white,
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
        color: colors.text
    },
    timestamp: {
        fontSize: isTablet ? 15 : 13,
        color: colors.subText,
        marginTop: isTablet ? 2 : 1,
    },
    postTypeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: isTablet ? 12 : 8,
        paddingVertical: isTablet ? 4 : 3,
        borderRadius: isTablet ? 12 : 8,
        marginTop: isTablet ? 6 : 4,
    },
    noteBadge: { backgroundColor: colors.badges.note },
    questionBadge: { backgroundColor: colors.badges.question },
    challengeBadge: { backgroundColor: colors.badges.challenge },
    postTypeText: {
        fontSize: isTablet ? 13 : 11,
        fontWeight: "600",
        color: colors.text,
    },
    postContent: {
        fontSize: isTablet ? 18 : 15,
        color: colors.text,
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
        color: colors.subText
    },
    likedText: {
        color: colors.danger,
        fontWeight: "600"
    },
    commentsSection: {
        marginTop: isTablet ? 20 : 16,
        paddingTop: isTablet ? 16 : 12,
        borderTopWidth: 1,
        borderColor: colors.divider
    },
    comment: {
        marginBottom: isTablet ? 16 : 12
    },
    commentAuthor: {
        fontSize: isTablet ? 16 : 14,
        fontWeight: "600",
        color: colors.text
    },
    commentText: {
        fontSize: isTablet ? 16 : 14,
        color: colors.text,
        marginVertical: isTablet ? 6 : 4
    },
    commentTime: {
        fontSize: isTablet ? 14 : 12,
        color: colors.subText
    },
    commentInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: isTablet ? 16 : 12
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.inputBackground,
        borderRadius: isTablet ? 24 : 20,
        padding: isTablet ? 16 : 12,
        marginRight: isTablet ? 12 : 8,
        fontSize: isTablet ? 16 : 14,
        minHeight: isTablet ? 50 : 40,
        color: colors.text,
    },

    // Community Detail Styles
    detailContainer: {
        flex: 1,
        backgroundColor: colors.background
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
        backgroundColor: colors.warningLight,
        paddingHorizontal: isTablet ? 12 : 8,
        paddingVertical: isTablet ? 6 : 4,
        borderRadius: isTablet ? 20 : 16,
        gap: isTablet ? 6 : 4,
    },
    userCreatedLabelText: {
        color: colors.white,
        fontSize: isTablet ? 14 : 12,
        fontWeight: "600",
    },
    detailCommunityName: {
        fontSize: isTablet ? 32 : 26,
        fontWeight: "800",
        color: colors.white,
        marginBottom: isTablet ? 12 : 8
    },
    detailCommunityDesc: {
        fontSize: isTablet ? 18 : 15,
        color: colors.accent,
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
        color: colors.white,
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
        backgroundColor: colors.accent,
        padding: isTablet ? 20 : 16,
        borderRadius: isTablet ? 24 : 20,
        justifyContent: "center",
        marginBottom: isTablet ? 24 : 20,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
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
        color: colors.primary,
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
        color: colors.subText,
        fontSize: isTablet ? 20 : 16,
        marginTop: isTablet ? 20 : 16
    },
    createFirstPostBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: isTablet ? 24 : 20,
        paddingVertical: isTablet ? 14 : 12,
        borderRadius: isTablet ? 20 : 16,
        marginTop: isTablet ? 20 : 16,
    },
    createFirstPostText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: isTablet ? 18 : 16,
    },

    // Create Post Modal Styles
    createModalContainer: {
        flex: 1,
        backgroundColor: colors.background
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
        borderColor: colors.divider,
    },
    createModalTitle: {
        fontSize: isTablet ? 24 : 18,
        fontWeight: "700",
        color: colors.text,
    },
    postSubmitText: {
        color: colors.primary,
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
        backgroundColor: colors.inputBackground,
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
        backgroundColor: colors.primary
    },
    typeText: {
        fontSize: isTablet ? 16 : 14,
        color: colors.subText,
        fontWeight: '600',
    },
    typeTextActive: {
        color: colors.white
    },
    createPostInput: {
        backgroundColor: colors.card,
        borderRadius: isTablet ? 20 : 16,
        padding: isTablet ? 20 : 16,
        height: isTablet ? 200 : 160,
        textAlignVertical: "top",
        marginBottom: isTablet ? 24 : 20,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: isTablet ? 18 : 16,
        color: colors.text,
    },
    addImageBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.accent,
        padding: isTablet ? 20 : 16,
        borderRadius: isTablet ? 20 : 16,
        justifyContent: "center",
        marginBottom: isTablet ? 24 : 20,
    },
    addImageText: {
        color: colors.primary,
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
        backgroundColor: colors.background
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
        borderColor: colors.divider,
    },
    createCommunityModalTitle: {
        fontSize: isTablet ? 24 : 18,
        fontWeight: "700",
        color: colors.text,
    },
    createSubmitText: {
        color: colors.primary,
        fontWeight: "700",
        fontSize: isTablet ? 20 : 16
    },
    adminPostAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: 12,
        paddingTop: 12,
    },
    adminActionText: {
        color: colors.danger,
        fontWeight: '800',
        fontSize: 12,
        marginLeft: 6,
        letterSpacing: 1,
    },
    adminEditBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: colors.primary + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    adminEditText: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 4,
    },
    adminDeleteBtn: {
        padding: 8,
        marginLeft: 8,
        backgroundColor: colors.danger + '10',
        borderRadius: 10,
    },
    modalDeleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 20,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.danger + '10',
        borderWidth: 1,
        borderColor: colors.danger,
    },
    modalDeleteText: {
        color: colors.danger,
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 10,
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
        color: colors.text,
        marginBottom: isTablet ? 12 : 8
    },
    formInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: isTablet ? 20 : 16,
        padding: isTablet ? 18 : 14,
        fontSize: isTablet ? 18 : 16,
        backgroundColor: colors.card,
        color: colors.text,
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
        borderColor: colors.white,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
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
        color: colors.text,
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
        color: colors.white,
        marginTop: isTablet ? 16 : 12,
        marginBottom: isTablet ? 8 : 6,
        textAlign: 'center',
    },
    previewDesc: {
        fontSize: isTablet ? 16 : 14,
        color: colors.accent,
        textAlign: 'center',
        lineHeight: isTablet ? 22 : 20,
    },
});
