const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Location = require('./models/Location');
const KecamatanStat = require('./models/KecamatanStat');

async function testMapping() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const stats = await KecamatanStat.find({}).limit(5).lean();
        console.log('STATS_SAMPLES:');
        stats.forEach(s => console.log(JSON.stringify(s)));

        const locs = await Location.find({}).limit(5).lean();
        console.log('LOC_SAMPLES:');
        locs.forEach(l => console.log(JSON.stringify({ kab: l.kabupaten, kec: l.kecamatan })));

        process.exit(0);
    } catch (err) { console.error(err); process.exit(1); }
}
testMapping();
