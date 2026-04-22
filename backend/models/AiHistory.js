const mongoose = require('mongoose');

const AiHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['summary', 'quiz'],
        required: true,
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // Can be String (for summary) or Array (for quiz)
        required: true,
    },
    sourceMaterial: {
        type: String, // Truncated or full text context
        default: "",
    },
    title: {
        type: String, // e.g. snippet of text or "Note Title"
        default: "Generated Content",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('AiHistory', AiHistorySchema);
