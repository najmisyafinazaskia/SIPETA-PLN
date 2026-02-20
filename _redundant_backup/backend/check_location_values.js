const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Location = require('./models/Location');
async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const loc = await Location.findOne({ kabupaten: /Banda Aceh/i }).lean();
        console.log(`kabupaten: "${loc.kabupaten}"`);
        console.log(`kecamatan: "${loc.kecamatan}"`);
        process.exit(0);
    } catch (err) { console.error(err); process.exit(1); }
}
check();
