const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log("Connecting to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { 
    dbName: 'StudySpark',
    serverSelectionTimeoutMS: 5000,
    family: 4
})
    .then(() => {
        console.log("✅ MongoDB Connected Successfully to StudySpark");
        process.exit(0);
    })
    .catch((err) => {
        require('fs').writeFileSync('test_error.txt', err.message);
        console.error("❌ MongoDB Connection Failed!");
        console.error("Reason:", err.message);
        console.log("\n💡 TIP: Try running 'node check-ip.js' to verify your whitelisted IP.");
        process.exit(1);
    });
