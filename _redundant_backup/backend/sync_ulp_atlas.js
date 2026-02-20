const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Ulp = require('./models/Ulp');
const UlpDesa = require('./models/UlpDesa');

const ULP_LOKASI_PATH = path.join(__dirname, '../db_Aceh/ulp/ulp_lokasi.json');
const ULP_DESA_PATH = path.join(__dirname, '../db_Aceh/ulp/ulp_desa.json');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

const syncUlpLokasi = async () => {
    try {
        console.log('Reading ULP Lokasi JSON...');
        const data = JSON.parse(fs.readFileSync(ULP_LOKASI_PATH, 'utf8'));

        console.log(`Found ${data.length} ULP Office records.`);

        // Clear existing
        await Ulp.deleteMany({});
        console.log('Cleared existing ulp_db collection.');

        const docs = data.map(item => ({
            nama_ulp: item.ULP,
            longitude: item.x,
            latitude: item.y
        }));

        await Ulp.insertMany(docs);
        console.log('Imported ULP Lokasi to Atlas.');

    } catch (err) {
        console.error('Error syncing ULP Lokasi:', err);
    }
};

const syncUlpDesa = async () => {
    try {
        console.log('Reading ULP Desa JSON...');
        const rawData = fs.readFileSync(ULP_DESA_PATH, 'utf8');
        const data = JSON.parse(rawData);

        console.log(`Found ${data.length} ULP Desa records.`);

        // Clear existing
        await UlpDesa.deleteMany({});
        console.log('Cleared existing ulp_desa collection.');

        const docs = data.map(item => {
            // Normalize coordinates
            let lat = parseFloat(item.y_desa);
            let lng = parseFloat(item.x_desa);

            // Handle possible string formatting issues like "95978858" -> 95.978858 if needed
            // But let's assume if it is a huge integer, it needs division
            // Example from file: "x_desa": 95978858
            if (lng > 1000) {
                lng = lng / 1000000;
            }
            // Same for lat if needed
            if (lat > 1000) {
                lat = lat / 1000000;
            }

            return {
                UP3: item.UP3,
                "Kabupaten/Kota": item["Kabupaten/Kota"],
                KECAMATAN: item.KECAMATAN,
                "NAMA KELURAHAN/DESA": item["NAMA KELURAHAN/DESA"],
                Desa: item["NAMA KELURAHAN/DESA"], // Alias
                ULP: item.ULP || item.ulp || "Unknown", // Try to find ULP field
                latitude: lat,
                longitude: lng,
                Status_Listrik: "Berlistrik" // Default or extract if avail
            };
        });

        await UlpDesa.insertMany(docs);
        console.log('Imported ULP Desa to Atlas.');

    } catch (err) {
        console.error('Error syncing ULP Desa:', err);
    }
};

const run = async () => {
    await connectDB();
    await syncUlpLokasi();
    await syncUlpDesa();
    console.log('Sync Complete.');
    process.exit(0);
};

run();
