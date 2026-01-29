const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Agar frontend bisa mengakses API
app.use(express.json());

// Koneksi MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'db_aceh'; // Pastikan nama DB sama dengan di MongoDB Compass Anda
let db;

// Inisialisasi Koneksi ke MongoDB
MongoClient.connect(url)
    .then(client => {
        console.log('✅ Terhubung ke MongoDB');
        db = client.db(dbName);
    })
    .catch(error => console.error('❌ Gagal koneksi MongoDB:', error));

/**
 * Endpoint Utama untuk mengambil data peta
 * Mengubah data dari MongoDB menjadi format GeoJSON
 */
app.get('/api/peta', async (req, res) => {
    try {
        const collection = db.collection('desas');
        const desas = await collection.find({}).toArray();

        // Bungkus data ke dalam format GeoJSON
        const geojson = {
            type: "FeatureCollection",
            features: desas.map(d => ({
                type: "Feature",
                properties: {
                    name: d.name,
                    kecamatan: d.kecamatan,
                    kabupaten: d.kabupaten,
                    status: d.status,
                    dusun_detail: d.dusun_detail || [] // Menampilkan data dusun
                },
                geometry: d.location || { type: "Point", coordinates: [0, 0] }
            }))
        };

        res.json(geojson);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve file statis (jika file index.html ditaruh di folder public)
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📡 API GeoJSON siap di: http://localhost:${PORT}/api/peta`);
});