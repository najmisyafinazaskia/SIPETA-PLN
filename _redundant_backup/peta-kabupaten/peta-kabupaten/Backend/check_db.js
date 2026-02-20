const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'db_aceh';

(async () => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const count = await db.collection('kabupatens').countDocuments();
        console.log(`Count: ${count}`);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
})();
