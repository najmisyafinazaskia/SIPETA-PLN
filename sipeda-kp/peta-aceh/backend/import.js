const { MongoClient } = require('mongodb');
const csv = require('csvtojson');
const path = require('path');

const url = 'mongodb://localhost:27017';
const dbName = 'db_aceh';
const collectionName = 'desas';

async function importData() {
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log("✅ Terhubung ke MongoDB");
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const csvFilePath = path.join(__dirname, 'peta koordinat.csv');
        
        // Membaca CSV tanpa header agar bisa menentukan kolom berdasarkan index (field1, field2, dst)
        const jsonArray = await csv({ noheader: true }).fromFile(csvFilePath);

        console.log("🗑️  Membersihkan data lama...");
        await collection.deleteMany({});

        // Lewati 2 baris header pertama di CSV kamu
        const dataRows = jsonArray.slice(2);

        const documents = dataRows.map((row) => {
            // Mapping Dusun 1 sampai Dusun 6
            const dusun_list = [];
            const dusunIndices = [
                { n: 'field9', s: 'field10' }, { n: 'field11', s: 'field12' },
                { n: 'field13', s: 'field14' }, { n: 'field15', s: 'field16' },
                { n: 'field17', s: 'field18' }, { n: 'field19', s: 'field20' }
            ];

            dusunIndices.forEach(idx => {
                let namaDusun = row[idx.n];
                let statusDusun = row[idx.s];
                if (namaDusun && namaDusun !== "0" && namaDusun !== "") {
                    dusun_list.push({
                        nama: String(namaDusun),
                        status: String(statusDusun || "0")
                    });
                }
            });

            // Struktur Dokumen MongoDB (Ini yang akan jadi "kolom" di database)
            return {
                provinsi: row['field1'],    // Kolom Provinsi
                kabupaten: row['field2'],   // Kolom Kabupaten
                kecamatan: row['field3'],   // Kolom Kecamatan
                desa: row['field4'],        // Kolom Desa
                dusun_detail: dusun_list,   // Kolom Dusun (Daftar Dusun)
                location: {                 // Kolom Koordinat (Standar GeoJSON)
                    type: "Point",
                    coordinates: [
                        parseFloat(row['field5']), // Longitude (x)
                        parseFloat(row['field6'])  // Latitude (y)
                    ]
                }
            };
        }).filter(item => !isNaN(item.location.coordinates[0]));

        if (documents.length > 0) {
            await collection.insertMany(documents);
            console.log(`✅ BERHASIL! ${documents.length} desa masuk ke MongoDB dengan kolom yang rapi.`);
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await client.close();
    }
}

importData();