const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkCollections() {
    try {
        await mongoose.connect(MONGO_URI, { dbName: 'StudySpark' });
        console.log("✅ Connected to StudySpark DB");

        const collections = ['User', 'Note', 'Community', 'Post', 'StudyPlan'];
        const results = {};

        for (const modelName of collections) {
            const Model = mongoose.model(modelName, new mongoose.Schema({}, { strict: false }), modelName.toLowerCase() + 's');
            const count = await Model.countDocuments();
            results[modelName] = count;
        }

        console.log("\n📊 Database Statistics:");
        console.table(results);

        await mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error checking collections:", err.message);
    }
}

checkCollections();
