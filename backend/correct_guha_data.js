require('dotenv').config();
const mongoose = require('mongoose');

const userDusuns = [
    { nama: "PERPOLIN", status: "Belum Berlistrik PLN" },
    { nama: "I", status: "Berlistrik PLN" },
    { nama: "DURIAN", status: "Berlistrik PLN" },
    { nama: "Penguhapan", status: "Berlistrik PLN" }
];

const originalGuhangDusuns = [
    { nama: "DURIAN", status: "Berlistrik PLN" },
    { nama: "KANDIS", status: "Berlistrik PLN" },
    { nama: "MANGGIS", status: "Berlistrik PLN" }
];

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const col = mongoose.connection.collection('desas');

        // 1. Revert Guhang (Aceh Barat Daya)
        const guhang = await col.findOne({ desa: 'Guhang', kabupaten: 'ACEH BARAT DAYA' });
        if (guhang) {
            console.log('Restoring Guhang (Aceh Barat Daya) to original state...');
            await col.updateOne(
                { _id: guhang._id },
                { $set: { dusun_detail: originalGuhangDusuns } }
            );
            console.log('✅ Guhang Restored.');
        }

        // 2. Update Guha (Aceh Singkil)
        // Note: Using regex to be safe with casing
        const guha = await col.findOne({
            desa: { $regex: /^Guha$/i },
            kabupaten: { $regex: /singkil/i }
        });

        if (guha) {
            console.log(`Found Guha in ${guha.kabupaten}, ${guha.kecamatan}. Updating...`);
            await col.updateOne(
                { _id: guha._id },
                { $set: { dusun_detail: userDusuns } }
            );
            console.log('✅ Guha (Aceh Singkil) Updated with user data.');
        } else {
            console.log('❌ Guha (Aceh Singkil) NOT FOUND. Creating new entry?');
            // If not found, maybe I should insert it?
            // The user implied it should be there ("apakah sudah sesuai? pada db nya").
            // If it's not there, I'll insert it.
            // But I need X, Y coordinates?
            // I'll skip insertion unless user confirms, or just log error.
            // Actually, if it's missing, it's a bug in seed data.
        }

        await mongoose.disconnect();
    } catch (e) { console.error(e); }
}

run();
