// backend/routes/ai.js
const express = require('express');
const router = express.Router();
const summarizationService = require('../services/summarizationService');

/**
 * @route   POST /api/ai/summarize
 * @desc    Summarize a text block using the custom-trained T5 model
 * @access  Public
 */
router.post('/summarize', async (req, res) => {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'No text provided for summarization.' });
    }

    try {
        console.log(`🧠 [API] Received summarization request (Text Length: ${text.length} chars)`);
        
        if (!summarizationService.isReady) {
            return res.status(503).json({ 
                error: 'Summarization model is still loading in the background. Please try again in a few seconds.' 
            });
        }

        const summary = await summarizationService.summarize(text);
        
        console.log(`✅ [API] Summarization complete!`);
        res.json({ summary });
        
    } catch (error) {
        console.error('❌ [API] Summarization Route Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate summary.', 
            details: error.message 
        });
    }
});

/**
 * @route   GET /api/ai/status
 * @desc    Check the loading status of the trained T5 model
 * @access  Public
 */
router.get('/status', (req, res) => {
    res.json({ ready: summarizationService.isReady });
});

module.exports = router;
