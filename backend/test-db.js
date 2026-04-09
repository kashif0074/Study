const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log("Connecting to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { dbName: 'StudySpark' })
    .then(() => {
        console.log("✅ MongoDB Connected Successfully to StudySpark");
        process.exit(0);
    })
    .catch((err) => {
        require('fs').writeFileSync('test_error.txt', err.message);
        console.error("❌ MongoDB Connection Failed!");
        console.error("Reason:", err.message);
        process.exit(1);
    });
