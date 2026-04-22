const express = require('express');
const router = express.Router();
const AiHistory = require('../models/AiHistory');

// Save a new AI History record
router.post('/', async (req, res) => {
    try {
        const { userId, type, content, sourceMaterial, title } = req.body;

        if (!userId || !type || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newRecord = new AiHistory({
            userId,
            type,
            content,
            sourceMaterial: sourceMaterial || "",
            title: title || "Generated Content"
        });

        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) {
        console.error("Save AI History Error:", err);
        res.status(500).json({ error: 'Failed to save AI history' });
    }
});

// Get AI History for a user
router.get('/', async (req, res) => {
    try {
        const { userId, type } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const query = { userId };
        if (type) {
            query.type = type;
        }

        const history = await AiHistory.find(query).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (err) {
        console.error("Get AI History Error:", err);
        res.status(500).json({ error: 'Failed to fetch AI history' });
    }
});

// Delete a history record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await AiHistory.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.status(200).json({ message: 'Record deleted successfully' });
    } catch (err) {
        console.error("Delete AI History Error:", err);
        res.status(500).json({ error: 'Failed to delete AI history' });
    }
});

module.exports = router;
