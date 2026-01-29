require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const col = mongoose.connection.collection('desas');

        const patterns = [
            /ujong\s*pacu/i,
            /ceding\s*ayu/i,
            /lipat\s*kajang/i,
            /(pulau|pulo)\s*balai/i
        ];

        for (const p of patterns) {
            const matches = await col.find({ desa: { $regex: p } }).toArray();
            console.log(`Pattern ${p}: Found ${matches.length}`);
            matches.forEach(m => console.log(` - ${m.desa} (${m.kecamatan}, ${m.kabupaten})`));
        }

        await mongoose.disconnect();
    } catch (e) { console.error(e); }
}
check();
