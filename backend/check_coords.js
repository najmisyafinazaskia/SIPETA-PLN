const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Location = require('./models/Location');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkCoordinates() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // Hitung total lokasi
        const total = await Location.countDocuments();
        console.log(`Total Locations: ${total}`);

        // Cek berapa yang punya koordinat valid
        const validCoords = await Location.countDocuments({
            latitude: { $exists: true, $ne: null },
            longitude: { $exists: true, $ne: null }
        });
        console.log(`Locations with coordinates: ${validCoords}`);

        // Sample data
        const sample = await Location.findOne({
            latitude: { $exists: true, $ne: null }
        });

        if (sample) {
            console.log('Sample Location with Coords:', {
                desa: sample.desa,
                lat: sample.latitude,
                lng: sample.longitude
            });
        } else {
            console.log('No locations with coordinates found!');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkCoordinates();
