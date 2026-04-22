const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const Post = require('../models/Post');
const CommunityMember = require('../models/CommunityMember');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/communities/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- COMMUTINIES ---

// Get all communities
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        let communities = await Community.find().sort({ membersCount: -1 });
        
        // Seed default communities if none exist
        if (communities.length === 0) {
            const defaults = [
                { name: "Software Engineering", subject: "Software Engineering", description: "Share Design, Development, and Innovations", color: "#6366f1" },
                { name: "Physics Lab", subject: "Physics", description: "Experiments, concepts & breakthroughs", color: "#f59e0b" },
                { name: "Web Development", subject: "Web Development", description: "HTML, CSS & JS", color: "#10b981" },
                { name: "Mobile Development", subject: "Mobile Development", description: "React Native and Flutter", color: "#3b82f6" },
                { name: "Computer Science Hub", subject: "CS", description: "Programming, algorithms & discussions", color: "#8b5cf6" }
            ];
            await Community.insertMany(defaults);
            communities = await Community.find().sort({ membersCount: -1 });
        }

        if (userId) {
            // Check which ones the user has joined
            const userMemberships = await CommunityMember.find({ userId });
            const joinedIds = userMemberships.map(m => m.communityId.toString());
            
            const results = communities.map(c => ({
                ...c.toObject(),
                id: c._id, // Format for frontend
                isJoined: joinedIds.includes(c._id.toString())
            }));
            return res.json(results);
        }
        
        res.json(communities);
    } catch (error) {
        console.error("Error fetching communities:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create a new community
router.post('/', async (req, res) => {
    try {
        const { name, subject, description, color, userId } = req.body;
        
        const community = new Community({
            name,
            subject,
            description,
            color,
            createdBy: userId
        });
        
        await community.save();
        
        // creator automatically becomes a member/founder
        const membership = new CommunityMember({
            userId,
            communityId: community._id,
            role: 'founder'
        });
        await membership.save();
        
        res.status(201).json({ ...community.toObject(), id: community._id, isJoined: true });
    } catch (error) {
        console.error("Error creating community:", error);
        res.status(500).json({ message: error.code === 11000 ? "Community name already exists" : "Server error" });
    }
});

// Join community
router.post('/:id/join', async (req, res) => {
    try {
        const { userId } = req.body;
        const communityId = req.params.id;
        
        const membership = new CommunityMember({ userId, communityId });
        await membership.save();
        
        // Increment member count
        await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: 1 } });
        
        res.json({ message: "Joined successfully" });
    } catch (error) {
        res.status(500).json({ message: "Member already exists or server error" });
    }
});

// Leave community
router.delete('/:id/leave', async (req, res) => {
    try {
        const { userId } = req.body;
        const communityId = req.params.id;
        
        await CommunityMember.findOneAndDelete({ userId, communityId });
        
        // Decrement member count
        await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: -1 } });
        
        res.json({ message: "Left successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// --- POSTS ---

// Get posts for a community
router.get('/:id/posts', async (req, res) => {
    try {
        const communityId = req.params.id;
        const posts = await Post.find({ communityId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts" });
    }
});

// Create a new post
router.post('/posts', async (req, res) => {
    try {
        const { communityId, author, content, type, images } = req.body;
        
        const post = new Post({
            communityId,
            author,
            content,
            type,
            images
        });
        
        await post.save();
        
        // Increment community post count
        await Community.findByIdAndUpdate(communityId, { $inc: { postsCount: 1 } });
        
        res.status(201).json(post);
    } catch (error) {
        console.error("Post creation error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Like/Unlike a post
router.post('/posts/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.findById(req.params.id);
        
        if (!post) return res.status(404).json({ message: "Post not found" });
        
        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex === -1) {
            post.likes.push(userId); // Like
        } else {
            post.likes.splice(likeIndex, 1); // Unlike
        }
        
        await post.save();
        res.json({ likes: post.likes.length, isLiked: post.likes.includes(userId) });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Add comment
router.post('/posts/:id/comment', async (req, res) => {
    try {
        const { author, text } = req.body;
        const post = await Post.findById(req.params.id);
        
        if (!post) return res.status(404).json({ message: "Post not found" });
        
        const newComment = { author, text, timestamp: new Date() };
        post.comments.push(newComment);
        
        await post.save();
        res.json(post.comments[post.comments.length - 1]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update Community
router.put('/:id', async (req, res) => {
    try {
        const { name, subject, description, color } = req.body;
        const updated = await Community.findByIdAndUpdate(
            req.params.id,
            { name, subject, description, color },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating community" });
    }
});

// Delete Community
router.delete('/:id', async (req, res) => {
    try {
        const communityId = req.params.id;
        await Community.findByIdAndDelete(communityId);
        await Post.deleteMany({ communityId });
        await CommunityMember.deleteMany({ communityId });
        res.json({ message: "Community and all related data deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting community" });
    }
});

// Delete Post
router.delete('/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const communityId = post.communityId;
        await Post.findByIdAndDelete(postId);
        
        // Decrement community post count
        await Community.findByIdAndUpdate(communityId, { $inc: { postsCount: -1 } });
        
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post" });
    }
});

// Image Upload Endpoint
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const imageUrl = `/uploads/communities/${req.file.filename}`;
        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ message: "Upload failed" });
    }
});

module.exports = router;
