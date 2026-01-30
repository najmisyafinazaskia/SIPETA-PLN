const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- Username: ${u.username}`);
            console.log(`  Email: ${u.email}`);
            console.log(`  Name: ${u.name}`);
            console.log(`  isVerified: ${u.isVerified}`);
            console.log('---');
        });

        if (users.length === 0) {
            console.log("No users found! You might need to seed the database.");
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUsers();
