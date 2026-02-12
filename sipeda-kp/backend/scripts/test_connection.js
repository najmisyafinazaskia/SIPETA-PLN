const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI;

console.log("-----------------------------------------");
console.log("🔍 TESTING MONGODB ATLAS CONNECTION");
console.log("-----------------------------------------");
console.log("URI:", uri ? uri.split('@')[1] : "NOT FOUND IN .ENV"); // Show only host for security

if (!uri) {
    console.error("❌ ERROR: MONGO_URI is missing in your .env file!");
    process.exit(1);
}

const options = {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
};

console.log("⏳ Connecting...");

mongoose.connect(uri, options)
    .then(async () => {
        console.log("✅ SUCCESS: Connected to MongoDB Atlas!");
        const cols = await mongoose.connection.db.listCollections().toArray();
        console.log("📦 Found Collections:", cols.map(c => c.name).join(', '));
        console.log("-----------------------------------------");
        console.log("Connection is Working perfectly!");
        process.exit(0);
    })
    .catch(err => {
        console.log("-----------------------------------------");
        console.error("❌ CONNECTION FAILED!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);

        if (err.message.includes('MongooseServerSelectionError')) {
            console.log("\n💡 TIPS:");
            console.log("1. Check your Internet connection.");
            console.log("2. Ensure YOUR IP is whitelisted in MongoDB Atlas (Network Access -> 0.0.0.0/0).");
            console.log("3. Check if your current network (Hotspot/Public WiFi) blocks database ports (27017).");
        }
        process.exit(1);
    });
