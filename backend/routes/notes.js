// backend/routes/notes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Note = require('../models/Note');

// Configure Multer for File Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==================== GET ALL NOTES OF A USER ====================
router.get('/', async (req, res) => {
    const logFile = path.join(__dirname, '../request_logs.txt');
    const fs = require('fs');
    try {
        const { userId } = req.query; 
        const logMsg = `[${new Date().toISOString()}] 📡 GET /notes?userId=${userId}\n`;
        fs.appendFileSync(logFile, logMsg);

        if (!userId) {
            fs.appendFileSync(logFile, `⚠️ Missing userId\n`);
            return res.status(400).json({ message: "userId is required" });
        }

        const start = Date.now();
        const notes = await Note.find({ userId })
            .sort({ createdAt: -1 });
        const duration = Date.now() - start;

        fs.appendFileSync(logFile, `✅ Found ${notes.length} notes in ${duration}ms\n`);
        res.status(200).json(notes);
    } catch (error) {
        fs.appendFileSync(logFile, `❌ Error: ${error.message}\n`);
        console.error("❌ Error fetching notes:", error);
        res.status(500).json({ message: "Server error while fetching notes" });
    }
});

// ==================== CREATE NEW NOTE (WITH FILE UPLOAD) ====================
router.post('/', upload.single('file'), async (req, res) => {
    try {
        // Data comes from req.body (for fields) and req.file (for binary)
        const { userId, title, content, type, subject } = req.body;
        
        console.log(`📩 Incoming POST request: Saving note "${title}" for user ${userId}`);

        if (!userId || !title || (!content && !req.file) || !type) {
            return res.status(400).json({ message: "userId, title, and type are required" });
        }

        // Generate full URL if a file was uploaded
        let fileUrl = null;
        if (req.file) {
            // Note: In production, use your actual domain. 
            // Here we use a relative path that the frontend will prepend with the server IP.
            fileUrl = `/uploads/${req.file.filename}`;
            console.log(`📎 File uploaded: ${fileUrl}`);
        }

        const newNote = new Note({
            userId,
            title: title.trim(),
            content: content || (req.file ? req.file.originalname : ""),
            type,
            fileUrl: fileUrl,
            subject: subject || "General"
        });

        const savedNote = await newNote.save();
        res.status(201).json({
            message: "Note created successfully",
            note: savedNote
        });
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Server error while creating note" });
    }
});

// ==================== DELETE NOTE ====================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedNote = await Note.findByIdAndDelete(id);
        
        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json({
            message: "Note deleted successfully",
            noteId: id
        });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ message: "Server error while deleting note" });
    }
});

module.exports = router;