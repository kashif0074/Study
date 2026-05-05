// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

console.log("🎬 Server script starting...");
const app = express();
const PORT = process.env.PORT || 5000;
console.log(`📌 Target PORT: ${PORT}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'StudySpark',
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });
        console.log("✅ MongoDB Connected Successfully to StudySpark");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed!");
        console.error("Error Message:", err.message);
        
        if (err.message.includes('SSL') || err.message.includes('handshake')) {
            console.log("\n⚠️ SSL/TLS HANDSHAKE ERROR DETECTED:");
            console.log("This usually means your IP is not whitelisted in MongoDB Atlas.");
        }

        console.log("\n💡 Troubleshooting Tips:");
        console.log("1. Run 'node check-ip.js' to see your public IP.");
        console.log("2. Ensure your IP is whitelisted in Atlas Network Access.");
        console.log("3. Verify your Wi-Fi or VPN isn't blocking MongoDB (Port 27017).");
        console.log("4. Check the MONGO_URI in your .env file.");
    }
};

console.log("⏳ Connecting to DB...");
connectDB();
console.log("✅ connectDB() called (async)");

// Test Route
app.get('/', (req, res) => {
    res.send('StudySpark Backend is Running... 🚀');
});

// Import Routes
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const studyPlanRoutes = require('./routes/studyPlans');
const aiHistoryRoutes = require('./routes/aiHistory');
const communityRoutes = require('./routes/communities');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/ai-history', aiHistoryRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/admin', adminRoutes);

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});