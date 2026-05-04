const https = require('https');

console.log("🔍 Fetching your public IP address...");

https.get('https://api.ipify.org?format=json', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const ip = JSON.parse(data).ip;
        console.log("\n✅ Your Public IP is:", ip);
        console.log("\n💡 IMPORTANT: Make sure this IP is added to your MongoDB Atlas Whitelist:");
        console.log("1. Go to https://cloud.mongodb.com/");
        console.log("2. Navigate to 'Network Access'");
        console.log("3. Click 'Add IP Address'");
        console.log(`4. Add '${ip}' or click 'Add Current IP Address'`);
    });
}).on('error', (err) => {
    console.error("❌ Failed to fetch public IP:", err.message);
});
