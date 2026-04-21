// backend/routes/studyPlans.js
const express = require('express');
const router = express.Router();
const StudyPlan = require('../models/StudyPlan');

// GET user's study plan
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const plan = await StudyPlan.findOne({ userId });
        if (!plan) {
            return res.status(200).json({ exams: [], studySessions: [] });
        }

        res.status(200).json(plan);
    } catch (err) {
        console.error("Error fetching study plan:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST to update or create user's study plan
router.post('/', async (req, res) => {
    try {
        const { userId, exams, studySessions } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        // Upsert the study plan for this user
        const plan = await StudyPlan.findOneAndUpdate(
            { userId },
            { exams: exams || [], studySessions: studySessions || [] },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: "Study plan saved", plan });
    } catch (err) {
        console.error("Error saving study plan:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
