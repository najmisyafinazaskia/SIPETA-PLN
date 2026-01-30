const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
// Melayani file statis dari folder Frontend
app.use(express.static(path.join(__dirname, '../Frontend')));

const url = 'mongodb://localhost:27017';
const dbName = 'db_aceh';
let db;

MongoClient.connect(url)
    .then(client => {
        db = client.db(dbName);
        console.log('✅ Terhubung ke MongoDB');
    })
    .catch(err => console.error('❌ Gagal koneksi:', err));

// Helper untuk hitung titik tengah (Centroid sederhana dari Bounding Box)
function getCenter(geometry) {
    if (!geometry || !geometry.coordinates) return [4.6, 96.5]; // Default

    let coords = [];
    // Ratakan array koordinat sedalam apapun (MultiPolygon/Polygon)
    const flatCoords = (arr) => {
        if (typeof arr[0] === 'number') coords.push(arr);
        else arr.forEach(flatCoords);
    };
    flatCoords(geometry.coordinates);

    if (coords.length === 0) return [4.6, 96.5];

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    coords.forEach(c => {
        let lng = c[0];
        let lat = c[1];
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    });

    return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
}

// Endpoint untuk mengambil 23 titik kabupaten saja
app.get('/api/titik-kabupaten', async (req, res) => {
    try {
        const kabupatens = await db.collection('kabupatens').find({}).toArray();
        const dataTitik = kabupatens.map(k => ({
            nama: k.properties.Kab_Kota || k.properties.name,
            // Hitung koordinat dari geometry jika center_point tidak ada
            koordinat: k.properties.center_point || getCenter(k.geometry),
            status: "Berlistrik PLN"
        }));
        res.json(dataTitik);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal ambil data kabupaten" });
    }
});

// Endpoint untuk poligon wilayah Aceh (Warna-warni)
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

app.listen(PORT, () => console.log(`🚀 Server jalan di http://localhost:5000`));