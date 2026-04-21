// backend/models/StudyPlan.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: String,
    type: String,
    icon: String,
    size: String,
    uri: String,
    mimeType: String,
    width: Number,
    height: Number
});

const examSchema = new mongoose.Schema({
    id: String,
    subject: String,
    date: String,
    topics: [String],
    priority: String,
    files: [fileSchema]
});

const studySessionSchema = new mongoose.Schema({
    id: Number,
    subject: String,
    topic: String,
    date: String,
    time: String,
    duration: Number,
    completed: Boolean,
    source: String,
    fileType: String
});

const studyPlanSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    exams: [examSchema],
    studySessions: [studySessionSchema]
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
