const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Community = require('../models/Community');
const Post = require('../models/Post');

// Define admin email (should match AuthContext ADMIN_EMAIL)
const ADMIN_EMAIL = 'admin@studyspark.com';

// Get global stats for Admin Dashboard
router.get('/stats', async (req, res) => {
    try {
        // Exclude admin from user count
        const totalUsers = await User.countDocuments({ email: { $ne: ADMIN_EMAIL } });
        const totalCommunities = await Community.countDocuments();
        const totalPosts = await Post.countDocuments();

        // You can add more stats here, like active users in last 24h, etc.
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalCommunities,
                totalPosts
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Get all users for Admin (excluding admin)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ email: { $ne: ADMIN_EMAIL } }, 'name email isBanned').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Toggle Ban Status
router.post('/users/:id/toggle-ban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({ success: true, isBanned: user.isBanned });
    } catch (error) {
        console.error("Error toggling ban status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
