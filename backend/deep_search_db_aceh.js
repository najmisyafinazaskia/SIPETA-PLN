const mongoose = require('mongoose');
const baseUri = "mongodb+srv://pln-sipeta:punyaUP2KPLN@cluster0.nhwvtny.mongodb.net/";
const options = "?appName=Cluster0";

async function deepSearch() {
    console.log("=== DEEP SEARCH IN db_aceh ===");

    try {
        const conn = await mongoose.createConnection(baseUri + 'db_aceh' + options).asPromise();
        const db = conn.db;
        const cols = await db.listCollections().toArray();
        console.log("Collections:", cols.map(c => c.name).join(", "));

        for (const c of cols) {
            const col = db.collection(c.name);
            // Search for "Keujrun" in any string field
            // Note: Efficient way is to just grep specific fields if known, but generic search is harder.
            // We'll search typical name fields.

            const queries = [
                { desa: { $regex: /keujrun/i } },
                { name: { $regex: /keujrun/i } },
                { nama: { $regex: /keujrun/i } }
            ];

            for (const q of queries) {
                try {
                    const res = await col.find(q).toArray();
                    if (res.length > 0) {
                        console.log(`\nFound ${res.length} matches in '${c.name}' with query ${JSON.stringify(q)}:`);
                        res.forEach(item => {
                            console.log(`- ${item.desa || item.name || item.nama} (ID: ${item._id})`);
                        });
                    }
                } catch (err) {
                    // Ignore errors if field doesn't exist
                }
            }
        }

        await conn.close();

    } catch (e) {
        console.error("Error:", e);
    }
}

deepSearch();
