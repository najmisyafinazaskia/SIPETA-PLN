const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Location = require('./models/Location');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkXY() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const total = await Location.countDocuments();
        console.log(`Total Locations: ${total}`);

        // Cek X/Y upper
        const countX = await Location.countDocuments({ X: { $exists: true, $ne: null } });
        console.log(`Locations with X: ${countX}`);

        // Cek x/y lower
        const countxLower = await Location.countDocuments({ x: { $exists: true, $ne: null } });
        console.log(`Locations with x (lower): ${countxLower}`);

        // Sample
        const sample = await Location.findOne();
        if (sample) {
            console.log('Sample Data Key Objects:', Object.keys(sample.toObject()));
            console.log('Sample content:', sample.toObject());
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkXY();
