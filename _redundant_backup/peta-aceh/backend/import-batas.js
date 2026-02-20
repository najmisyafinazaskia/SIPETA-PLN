const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function run() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('db_aceh');
        const collection = db.collection('kabupatens'); // Koleksi baru khusus perbatasan

        // Membaca file aceh_kabupaten.geojson yang ada di folder backend
        const filePath = path.join(__dirname, 'aceh_kabupaten.geojson');
        const geojsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        await collection.deleteMany({}); // Bersihkan data lama
        const result = await collection.insertMany(geojsonData.features);
        
        console.log(`✅ Berhasil! ${result.insertedCount} batas kabupaten masuk ke MongoDB.`);
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await client.close();
    }
}
run();