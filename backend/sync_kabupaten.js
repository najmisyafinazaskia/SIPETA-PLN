const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function syncKabupaten() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Read JSON file
        const jsonPath = path.join(__dirname, '../db_Aceh/kabupaten_kota/data_kabupaten_kota.json');
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const kabupatenData = JSON.parse(rawData);

        console.log(`Loaded ${kabupatenData.length} items from JSON`);

        const collection = mongoose.connection.db.collection('kabupaten_kotas');

        for (const item of kabupatenData) {
            if (!item.nama) continue;

            // Upsert: Update if exists, Insert if not
            const result = await collection.updateOne(
                { nama: item.nama },
                { $set: { koordinat: item.koordinat, warga: item.warga } },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                console.log(`Inserted: ${item.nama}`);
            } else if (result.modifiedCount > 0) {
                console.log(`Updated: ${item.nama}`);
            } else {
                console.log(`No change: ${item.nama}`);
            }
        }

        console.log('Sync complete');
        process.exit(0);

    } catch (err) {
        console.error('Sync failed:', err);
        process.exit(1);
    }
}

syncKabupaten();
