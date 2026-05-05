const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Note = require('./models/Note');

dotenv.config();

async function testQuery() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { 
            dbName: 'StudySpark',
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log("✅ MongoDB Connected");

        console.log("🔍 Querying notes for 'guest_user'...");
        console.time("QueryDuration");
        const notes = await Note.find({ userId: 'guest_user' }).limit(10);
        console.timeEnd("QueryDuration");
        
        console.log(`✅ Found ${notes.length} notes.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error during query:", err.message);
        process.exit(1);
    }
}

testQuery();
