const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5001; // Ubah port agar tidak bentrok dengan backend utama (5000)

app.use(cors());
app.use(express.json());

const url = 'mongodb://localhost:27017';
const dbName = 'db_aceh';
let db;

MongoClient.connect(url)
    .then(client => {
        db = client.db(dbName);
        console.log('✅ PT ACEH Backend: Berhubung ke MongoDB');
    })
    .catch(err => console.error('❌ PT ACEH Backend: Gagal koneksi:', err));

// Endpoint Titik Desa
app.get('/api/peta', async (req, res) => {
    try {
        console.log("📥 Request masuk ke /api/peta");
        const desas = await db.collection('desas').find({}).toArray();
        console.log(`📊 Ditemukan ${desas.length} data desa.`);

        const geojson = {
            type: "FeatureCollection",
            features: desas.map(d => {
                let statusUtama = "Tidak Berlistrik";
                if (d.dusun_detail && d.dusun_detail.length > 0) {
                    const adaPLN = d.dusun_detail.some(dsn =>
                        dsn.status && dsn.status.toUpperCase().includes("PLN")
                    );
                    statusUtama = adaPLN ? "Berlistrik PLN" : "Belum Listrik PLN";
                }

                // Gunakan X dan Y jika ada, jika tidak gunakan d.location
                let geometry = null;
                if (d.X && d.Y) {
                    const lat = parseFloat(d.Y);
                    const lng = parseFloat(d.X);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        geometry = {
                            type: "Point",
                            coordinates: [lng, lat] // [Longitude, Latitude]
                        };
                    }
                } else if (d.location) {
                    geometry = d.location;
                }

                if (!geometry) {
                    // console.warn(`⚠️ Warning: Data desa ${d.desa} tidak memiliki koordinat (X,Y) maupun location.`);
                }

                return {
                    type: "Feature",
                    properties: {
                        kabupaten: d.kabupaten,
                        kecamatan: d.kecamatan,
                        name: d.desa,
                        status: statusUtama,
                        dusun_detail: d.dusun_detail
                    },
                    geometry: geometry
                };
            }).filter(f => f.geometry !== null) // Hapus yang tidak punya geometry
        };
        console.log(`📤 Mengirim ${geojson.features.length} fitur valid ke client.`);
        res.json(geojson);
    } catch (err) {
        console.error("❌ Error di /api/peta:", err);
        res.status(500).json({ message: "Gagal ambil data desa" });
    }
});

// Endpoint Batas Kabupaten (Vektor dari aceh_kabupaten.geojson)
app.get('/api/batas-kabupaten', async (req, res) => {
    try {
        console.log("📥 Request masuk ke /api/batas-kabupaten");
        const kabupatens = await db.collection('kabupatens').find({}).toArray();
        res.json({ type: "FeatureCollection", features: kabupatens });
    } catch (err) {
        console.error("❌ Error di /api/batas-kabupaten:", err);
        res.status(500).json({ message: "Gagal ambil batas kabupaten" });
    }
});

app.use(express.static(path.join(__dirname, '../frontend/public')));
app.listen(PORT, () => console.log(`🚀 Server PETA ACEH running on http://localhost:${PORT}`));