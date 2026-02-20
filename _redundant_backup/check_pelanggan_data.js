const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Location = require('./backend/models/Location');
const Up3 = require('./backend/models/Up3');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const locWithPelanggan = await Location.countDocuments({ pelanggan: { $gt: 0 } });
        const totalLocs = await Location.countDocuments({});
        console.log(`Locations with pelanggan > 0: ${locWithPelanggan} / ${totalLocs}`);

        const up3WithPelanggan = await Up3.find({ pelanggan: { $exists: true } }).lean();
        console.log(`UP3s with meta pelanggan data: ${up3WithPelanggan.length}`);
        console.log(JSON.stringify(up3WithPelanggan, null, 2));

        // Sample of locations with pelanggan
        if (locWithPelanggan > 0) {
            const samples = await Location.find({ pelanggan: { $gt: 0 } }).limit(5).lean();
            console.log("Sample locations with pelanggan:");
            console.log(JSON.stringify(samples.map(s => ({ desa: s.desa, pelanggan: s.pelanggan })), null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

checkData();
