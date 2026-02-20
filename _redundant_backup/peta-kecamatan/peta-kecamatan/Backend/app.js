const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

const url = 'mongodb://localhost:27017';
const dbName = 'db_aceh';
let db;

const client = new MongoClient(url);

client.connect()
    .then(() => {
        db = client.db(dbName);
        console.log('✅ Terhubung ke MongoDB');
    })
    .catch(err => console.error('❌ Gagal koneksi:', err));

// Endpoint: Mengambil 1 titik per kecamatan agar peta tidak berat
app.get('/api/peta-kecamatan', async (req, res) => {
    try {
        const dataKec = await db.collection('desas').aggregate([
            {
                $group: {
                    _id: "$kecamatan",
                    kabupaten: { $first: "$kabupaten" },
                    nama_kecamatan: { $first: "$kecamatan" },
                    koordinat: { $first: "$location" }
                }
            },
            { $sort: { nama_kecamatan: 1 } }
        ]).toArray();
        res.json(dataKec);
    } catch (err) {
        res.status(500).json({ message: "Gagal ambil data kecamatan" });
    }
});

// Endpoint: Batas Wilayah Aceh
app.get('/api/batas-kabupaten', async (req, res) => {
    try {
        const kabupatens = await db.collection('kabupatens').find({}).toArray();
        res.json({ type: "FeatureCollection", features: kabupatens });
    } catch (err) {
        res.status(500).json({ message: "Gagal ambil batas wilayah" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server Kecamatan jalan di http://localhost:5000`));