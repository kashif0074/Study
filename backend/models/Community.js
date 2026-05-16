const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    color: {
        type: String,
        default: "#6366f1"
    },
    membersCount: {
        type: Number,
        default: 1
    },
    postsCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String, // Firebase uid or ObjectId
    },
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Community', communitySchema);
