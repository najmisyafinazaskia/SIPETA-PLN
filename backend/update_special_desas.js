require('dotenv').config();
const mongoose = require('mongoose');

const updateData = [
    { nama: "Dusun Tidak diketahui", status: "Belum Berlistrik" }
];

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const col = mongoose.connection.collection('desas');

        const targets = [
            /ujong\s*pacu/i,
            /ceding\s*ayu/i,
            /lipat\s*kajang/i,
            /(pulau|pulo)\s*balai/i
        ];

        for (const p of targets) {
            console.log(`Processing pattern: ${p}`);
            const result = await col.updateMany(
                { desa: { $regex: p } },
                { $set: { dusun_detail: updateData } }
            );
            console.log(`Updated ${result.modifiedCount} document(s).`);
        }

        await mongoose.disconnect();
    } catch (e) { console.error(e); }
}
run();
