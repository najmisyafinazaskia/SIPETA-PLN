const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const admin = client.db().admin();
        const dbs = await admin.listDatabases();
        console.log("Databases:");
        dbs.databases.forEach(db => console.log(` - ${db.name}`));

        // Check specific databases
        const dbNames = ['gis_pln_db', 'db_aceh'];
        for (const name of dbNames) {
            console.log(`\nChecking DB: ${name}`);
            const db = client.db(name);
            const collections = await db.listCollections().toArray();
            console.log(" Collections:");
            collections.forEach(c => console.log(`  - ${c.name}`));

            // Peek at 'batas_kabupaten' or similar if found
            const batas = collections.find(c => c.name.includes('batas') || c.name.includes('geometry'));
            if (batas) {
                console.log(`  > Found potential boundary collection: ${batas.name}`);
                const sample = await db.collection(batas.name).findOne({});
                console.log(`    Sample keys: ${Object.keys(sample)}`);
                if (sample.geometry || sample.type === 'Feature') {
                    console.log("    Likely GeoJSON data.");
                }
            }
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

main();
