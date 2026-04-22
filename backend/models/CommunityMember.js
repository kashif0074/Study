const mongoose = require('mongoose');

const communityMemberSchema = new mongoose.Schema({
    userId: {
        type: String, // Firebase uid or ObjectId
        required: true,
        index: true
    },
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true
    },
    role: {
        type: String,
        enum: ['founder', 'moderator', 'member'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user can only be in a community once
communityMemberSchema.index({ userId: 1, communityId: 1 }, { unique: true });

module.exports = mongoose.model('CommunityMember', communityMemberSchema);
