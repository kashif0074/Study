// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'StudySpark' // Default database name
        });
        console.log("✅ MongoDB Connected Successfully to StudySpark");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed!");
        console.error("Error Message:", err.message);
        console.log("\n💡 Troubleshooting Tips:");
        console.log("1. Check if your MongoDB Atlas cluster is PAUSED.");
        console.log("2. Ensure your IP is whitelisted in Atlas Network Access.");
        console.log("3. Verify the MONGO_URI in your .env file.");
    }
};

connectDB();

// Test Route
app.get('/', (req, res) => {
    res.send('StudySpark Backend is Running... 🚀');
});

// Import Routes
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});