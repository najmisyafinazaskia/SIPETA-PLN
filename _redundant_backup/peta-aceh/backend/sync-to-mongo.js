const csv = require('csvtojson');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'db_aceh';
const client = new MongoClient(url);

async function startProcessing() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('desas');

        console.log("⏳ Membaca GeoJSON untuk mengambil koordinat terbaru...");
        const geojsonData = JSON.parse(fs.readFileSync('./desa-aceh-final-updated.geojson', 'utf8'));
        
        // Buat peta koordinat
        const geoMap = {};
        geojsonData.features.forEach(f => {
            const name = f.properties.name || "";
            const kec = f.properties.kecamatan || "";
            // Kunci unik: kecamatan_desa
            const key = `${kec}_${name}`.toLowerCase().replace(/\s/g, "");
            geoMap[key] = f.geometry.coordinates;
        });

        console.log("⏳ Membaca Data.csv untuk mengambil detail dusun...");
        // Berdasarkan gambar Anda, data dimulai dari baris 8 (skip 7 baris judul)
        const csvData = await csv({ noheader: true, delimiter: ';' }).fromFile('./Data.csv');
        const cleanCsv = csvData.slice(7); 

        const operations = [];

        for (let row of cleanCsv) {
            const kab = (row.field7 || "").trim();      // Kolom G
            const kec = (row.field8 || "").trim();      // Kolom H
            const desa = (row.field9 || "").trim();     // Kolom I
            
            if (!desa) continue;

            const key = `${kec}_${desa}`.toLowerCase().replace(/\s/g, "");

            // LOGIKA DUSUN (Nama field disesuaikan: Nama Dusun 1 di field13, Status di field14)
            const dusun_detail = [];
            if (row.field13) dusun_detail.push({ nama: row.field13, status: row.field14 });
            if (row.field15) dusun_detail.push({ nama: row.field15, status: row.field16 });
            if (row.field17) dusun_detail.push({ nama: row.field17, status: row.field18 });
            if (row.field19) dusun_detail.push({ nama: row.field19, status: row.field20 });

            // Tentukan Status Utama
            const allStatus = `${row.field14} ${row.field16} ${row.field18} ${row.field20}`;
            const statusGlobal = allStatus.includes("Berlistrik") ? "Berlistrik PLN" : "Belum Berlistrik";

            // Ambil koordinat dari GeoMap, jika tidak ada default ke [0,0]
            let coords = geoMap[key] || [0,0];

            operations.push({
                updateOne: {
                    filter: { name: desa, kecamatan: kec },
                    update: { 
                        $set: {
                            name: desa,
                            kecamatan: kec,
                            kabupaten: kab,
                            status: statusGlobal,
                            dusun_detail: dusun_detail, // <--- NAMA FIELD HARUS 'dusun_detail'
                            location: { type: "Point", coordinates: coords },
                            updatedAt: new Date()
                        }
                    },
                    upsert: true
                }
            });
        }

        console.log(`📤 Mengirim ${operations.length} data ke MongoDB...`);
        if (operations.length > 0) {
            await collection.bulkWrite(operations);
            console.log("✅ SELESAI! Dusun dan Koordinat sekarang sudah sinkron.");
        }

    } catch (err) {
        console.error("❌ Terjadi kesalahan:", err);
    } finally {
        await client.close();
    }
}

startProcessing();