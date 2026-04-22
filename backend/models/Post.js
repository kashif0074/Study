const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true
    },
    author: {
        id: {
            type: String, // uid or ObjectId
            required: true
        },
        name: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: ""
        }
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['note', 'question', 'challenge'],
        default: 'note'
    },
    likes: {
        type: [String], // Array of User IDs
        default: []
    },
    comments: [
        {
            id: { type: String, default: () => Date.now().toString() },
            author: String,
            text: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    images: [{
        type: String // URLs or base64
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);
