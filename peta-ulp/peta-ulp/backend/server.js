// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const path = require('path');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Konfigurasi MongoDB
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'gis_pln_db';

async function main() {
    try {
        await client.connect();
        console.log("Berhasil koneksi ke MongoDB");
        const db = client.db(dbName);

        // API 1: Data Kantor ULP
        app.get('/api/ulp', async (req, res) => {
            const collection = db.collection('kantor_ulp');
            const data = await collection.find({}).project({ _id: 0 }).toArray();
            res.json(data);
        });

        // API 2: Data Desa Dikelompokkan Per ULP
        app.get('/api/desa_by_ulp', async (req, res) => {
            const collection = db.collection('sebaran_desa');
            const semuaDesa = await collection.find({}).project({ _id: 0 }).toArray();

            // Pengelompokan (Grouping) secara manual di server
            const grouped = semuaDesa.reduce((acc, desa) => {
                // Trim whitespace untuk hindari duplikat "Idi " vs "Idi"
                let namaULP = desa.ULP ? desa.ULP.trim() : 'Lainnya';

                if (!acc[namaULP]) acc[namaULP] = [];
                acc[namaULP].push(desa);
                return acc;
            }, {});

            res.json(grouped);
        });

        // API 3: Batas Kabupaten (Updated to match UP3 logic)
        app.get('/api/batas-kabupaten', async (req, res) => {
            try {
                // Gunakan database 'db_aceh' untuk batas administratif
                const dbAceh = client.db('db_aceh');
                const collection = dbAceh.collection('kabupatens');

                // Ambil semua data GeoJSON
                const data = await collection.find({}).project({ _id: 0 }).toArray();

                // Filter: Hanya ambil yang punya nama Kabupaten (menghindari artifact kotak/bounding box di backend)
                const filtered = data.filter(f =>
                    f.properties && (f.properties.Kab_Kota || f.properties.name)
                );

                res.json(filtered);
            } catch (error) {
                console.error("Gagal mengambil data batas kabupaten:", error);
                res.status(500).json({ error: "Terjadi kesalahan server" });
            }
        });

        // Serve Index.html for root
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });

        app.listen(port, () => {
            console.log(`Server ULP berjalan di http://localhost:${port}`);
        });

    } catch (e) {
        console.error("Gagal koneksi database:", e);
    }
}

main();