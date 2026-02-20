const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const KecamatanStat = require('./models/KecamatanStat');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sipeta_db');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const migrateKecamatans = async () => {
    await connectDB();

    try {
        const jsonPath = path.join(__dirname, '../db_Aceh/kecamatan/data_kecamatan.json');
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(fileContent);

        console.log(`Found ${data.length} records to process.`);

        for (const item of data) {
            // Match by Kecamatan name (and optionally Kabkot to be safe)
            // Note: Data in json has 'Kabkot' and 'Kecamatan' with inconsistent casing potentially, 
            // but the file content showed proper casing (e.g. "Banda Aceh", "Baiturrahman").
            // We use case-insensitive regex for matching to be safe.

            const filter = {
                Kecamatan: { $regex: new RegExp(`^${item.Kecamatan}$`, 'i') },
                Kabkot: { $regex: new RegExp(`^${item.Kabkot}$`, 'i') }
            };

            const update = {
                Kabkot: item.Kabkot,
                Kecamatan: item.Kecamatan,
                Warga: item.Warga,
                Lembaga_Warga: item.Lembaga_Warga,
                tahun: item.tahun
            };

            await KecamatanStat.findOneAndUpdate(filter, update, { upsert: true, new: true });
        }

        console.log('Kecamatan data migration completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateKecamatans();
