const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer Storage Configuration for Avatars
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only images (jpeg, jpg, png) are allowed"));
    }
});

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        user = new User({ email, password, name });
        await user.save();

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { id: user._id, email, name }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

// Get User Profile from MongoDB
router.get('/profile/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }
        res.json(user);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Server error during profile fetch" });
    }
});

// Update User Stats/Profile
router.put('/update-profile', async (req, res) => {
    try {
        const { email, name, quizScore, studyStreak, studyTime, avatar, bio, institution, major, year } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required to update profile" });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (quizScore !== undefined) updates.quizScore = quizScore;
        if (studyStreak !== undefined) updates.studyStreak = studyStreak;
        if (studyTime !== undefined) updates.studyTime = studyTime;
        if (avatar !== undefined) updates.avatar = avatar;
        if (bio !== undefined) updates.bio = bio;
        if (institution !== undefined) updates.institution = institution;
        if (major !== undefined) updates.major = major;
        if (year !== undefined) updates.year = year;

        const setOnInsert = {
            password: "firebase_user_social_or_external"
        };
        if (updates.name === undefined) {
            setOnInsert.name = name || String(email).split('@')[0] || 'User';
        }

        const user = await User.findOneAndUpdate(
            { email: String(email).toLowerCase() },
            { 
                $set: updates,
                $setOnInsert: setOnInsert
            },
            { new: true, upsert: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found and could not be created" });
        }

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("❌ Profile update error:", error);
        res.status(500).json({ message: "Server error during profile update", error: error.message });
    }
});

// Avatar Upload Endpoint
router.post('/upload-avatar', upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        res.json({ avatarUrl });
    } catch (error) {
        console.error("Avatar upload error:", error);
        res.status(500).json({ message: "Upload failed" });
    }
});

module.exports = router;