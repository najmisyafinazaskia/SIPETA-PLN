const { MongoClient } = require('mongodb');
const fs = require('fs');

async function upload() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('db_aceh'); // Sesuaikan nama DB di Compass kamu
        const collection = db.collection('desas');

        // Baca file GeoJSON hasil merge terakhir
        const data = JSON.parse(fs.readFileSync('./desa-aceh-final.geojson', 'utf8'));

        console.log("⏳ Menghapus data lama dan mengunggah data baru...");
        await collection.deleteMany({}); // Bersihkan agar tidak double

        const docs = data.features.map(f => ({
            name: f.properties.name,
            kecamatan: f.properties.kecamatan,
            kabupaten: f.properties.kabupaten,
            status: f.properties.status,
            dusun: f.properties.dusun, // Data dusun yang kita buat tadi
            location: f.geometry
        }));

        await collection.insertMany(docs);
        console.log("✅ Berhasil! Silakan cek MongoDB Compass sekarang.");
    } catch (e) { console.error(e); }
    finally { client.close(); }
}
upload();