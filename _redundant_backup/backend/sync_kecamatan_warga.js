const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const KecamatanStat = require('./models/KecamatanStat');

async function syncKecamatanWarga() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Read JSON file
        const jsonPath = path.join(__dirname, '../db_Aceh/kecamatan/data_kecamatan.json');

        if (!fs.existsSync(jsonPath)) {
            console.error('File not found:', jsonPath);
            process.exit(1);
        }

        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const kecamatanData = JSON.parse(rawData);

        console.log(`Loaded ${kecamatanData.length} items from JSON`);

        let updatedCount = 0;
        for (const item of kecamatanData) {
            if (!item.nama) continue;

            // Upsert: Update if exists, Insert if not
            await KecamatanStat.updateOne(
                { nama: item.nama },
                { $set: { warga: item.warga || 0, kabupaten: item.kabupaten } },
                { upsert: true }
            );
            updatedCount++;
        }

        console.log(`Synced ${updatedCount} items to MongoDB`);
        process.exit(0);

    } catch (err) {
        console.error('Sync failed:', err);
        process.exit(1);
    }
}

syncKecamatanWarga();
