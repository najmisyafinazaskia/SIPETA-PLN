
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Location = require('./models/Location');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const kabList = ["KOTA BANDA ACEH", "ACEH BESAR", "KOTA SABANG"];
        const docs = await Location.find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean();
        const total = docs.reduce((sum, d) => sum + (d.pelanggan || 0), 0);
        console.log('Total Pelanggan from Locations:', total);
        console.log('Sample Doc:', docs[0]?.pelanggan);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

check();
