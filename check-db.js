const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

console.log("Connecting to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    dbName: 'StudySpark',
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    process.exit(0);
})
.catch(err => {
    console.error("❌ MongoDB Connection Failed!");
    console.error("Error:", err.message);
    process.exit(1);
});
