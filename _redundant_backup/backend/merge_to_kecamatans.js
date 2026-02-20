const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Schema sementara untuk mengakses collection 'kecamatans'
// Kita asumsikan collection ini ada dan ingin kita update
const kecamatanSchema = new mongoose.Schema({
    nama: String,
    kabupaten: String,
    warga: Number
}, { timestamps: true, strict: false });

const KecamatanModel = mongoose.model('RealKecamatan', kecamatanSchema, 'kecamatans');

async function syncKecamatansCollection() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB');

        // Read JSON file
        const jsonPath = path.join(__dirname, '../db_Aceh/kecamatan/data_kecamatan.json');

        if (!fs.existsSync(jsonPath)) {
            console.error('File not found:', jsonPath);
            process.exit(1);
        }

        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const kecamatanData = JSON.parse(rawData);

        console.log(`Loaded ${kecamatanData.length} items from data_kecamatan.json`);

        let updatedCount = 0;
        let insertedCount = 0;

        for (const item of kecamatanData) {
            if (!item.nama) continue;

            // Upsert ke collection 'kecamatans'
            // Kita cari berdasarkan nama kecamatan. Kalau ada update, kalau tidak ada insert.
            // Bisa tambahkan filter kabupaten juga biar lebih unik
            const filter = { nama: item.nama };
            if (item.kabupaten) filter.kabupaten = item.kabupaten;

            const update = {
                $set: {
                    warga: item.warga || 0,
                    kabupaten: item.kabupaten,
                    // Tambahkan field lain jika ada di json
                    koordinat: item.koordinat
                }
            };

            const result = await KecamatanModel.updateOne(
                filter,
                update,
                { upsert: true }
            );

            if (result.upsertedCount > 0) insertedCount++;
            else if (result.modifiedCount > 0) updatedCount++;
        }

        console.log(`Sync Complete:`);
        console.log(` - Updated: ${updatedCount}`);
        console.log(` - Inserted: ${insertedCount}`);

        process.exit(0);

    } catch (err) {
        console.error('Sync failed:', err);
        process.exit(1);
    }
}

syncKecamatansCollection();
