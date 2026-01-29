require('dotenv').config();
const mongoose = require('mongoose');

// Data from user
const newDusuns = [
    { nama: "PERPOLIN", status: "Belum Berlistrik PLN" },
    { nama: "I", status: "Berlistrik PLN" },
    { nama: "DURIAN", status: "Berlistrik PLN" },
    { nama: "Penguhapan", status: "Berlistrik PLN" }
];

async function updateDesa() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('desas');

        // Target: Desa Guhang (Aceh Barat Daya) - matches "DURIAN"
        // Also check if there is a "Guha" exactly? User said "Desa Guha".
        // Let's search using flexible regex for name

        const target = await collection.findOne({
            desa: { $regex: /guhang/i },
            kabupaten: { $regex: /aceh barat daya/i }
        });

        if (!target) {
            console.log('❌ Could not find Desa "Guhang" in ACEH BARAT DAYA.');
            // Try searching just "Guha" in any location?
            const altTarget = await collection.findOne({ desa: { $regex: /^Guha$/i } });
            if (altTarget) {
                console.log(`⚠️ Found match for exact "Guha": ${altTarget.desa}, ${altTarget.kabupaten}`);
                // Update this one instead?
                // But Guhang had DURIAN.
                // I will stick to Guhang if found.
            } else {
                console.log('❌ No "Guha" or "Guhang" found locally that fits perfectly.');
                process.exit(1);
            }
        } else {
            console.log(`✅ Found Target: ${target.desa} (${target.kecamatan}, ${target.kabupaten})`);
        }

        const idToUpdate = target ? target._id : null;
        if (!idToUpdate) return;

        console.log('📝 Updating Dusun List...');
        const result = await collection.updateOne(
            { _id: idToUpdate },
            { $set: { dusun_detail: newDusuns } }
        );

        console.log(`✅ Update Result: ${result.modifiedCount} document(s) updated.`);

        // Use View to confirm
        const updated = await collection.findOne({ _id: idToUpdate });
        console.log('New Data:', JSON.stringify(updated.dusun_detail, null, 2));

        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

updateDesa();
