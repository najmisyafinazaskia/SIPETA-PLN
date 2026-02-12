const { MongoClient } = require('mongodb');
const fs = require('fs');

const url = 'mongodb://localhost:27017';
const dbName = 'peta_aceh_db';
const client = new MongoClient(url);

async function upload() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('desas');
        const geojsonData = JSON.parse(fs.readFileSync('desa-aceh-final.geojson', 'utf8'));

        const operations = geojsonData.features.map(f => ({
            updateOne: {
                filter: { name: f.properties.name, kecamatan: f.properties.kecamatan },
                update: { $set: { ...f.properties, location: f.geometry, updatedAt: new Date() } },
                upsert: true
            }
        }));

        const result = await collection.bulkWrite(operations);
        console.log(`✨ MongoDB Update Selesai! Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
    } catch (err) { console.error(err); } finally { await client.close(); }
}
upload();