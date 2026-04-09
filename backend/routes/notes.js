// backend/routes/notes.js
const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// ==================== GET ALL NOTES OF A USER ====================
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query; 
        console.log(`📡 Incoming GET request for userId: ${userId}`);

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const notes = await Note.find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: "Server error while fetching notes" });
    }
});

// ==================== CREATE NEW NOTE ====================
router.post('/', async (req, res) => {
    try {
        const { userId, title, content, type, fileUrl, subject } = req.body;
        console.log(`📩 Incoming POST request: Saving note "${title}" for user ${userId}`);

        if (!userId || !title || !content || !type) {
            return res.status(400).json({ message: "userId, title, content and type are required" });
        }

        const newNote = new Note({
            userId,
            title: title.trim(),
            content,
            type,
            fileUrl: fileUrl || null,
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