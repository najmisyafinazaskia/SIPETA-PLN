const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const stats = await mongoose.connection.db.collection('kecamatans').findOne({});
        console.log(`Kabkot: "${stats.Kabkot}"`);
        console.log(`Kecamatan: "${stats.Kecamatan}"`);
        console.log(`Warga: ${stats.Warga}`);
        process.exit(0);
    } catch (err) { console.error(err); process.exit(1); }
}
check();
