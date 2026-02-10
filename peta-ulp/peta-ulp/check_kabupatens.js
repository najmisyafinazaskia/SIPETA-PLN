const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function main() {
    try {
        await client.connect();
        const db = client.db('db_aceh');
        const collection = db.collection('kabupatens');

        const sample = await collection.findOne({});
        if (sample) {
            console.log("Sample ID:", sample._id);
            console.log("Keys:", Object.keys(sample));
            if (sample.geometry) {
                console.log("Has geometry field. Type:", sample.geometry.type);
            }
            if (sample.properties) {
                console.log("Properties:", sample.properties);
            }
        } else {
            console.log("Collection is empty.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

main();
