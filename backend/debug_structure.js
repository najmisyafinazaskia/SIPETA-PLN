require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing connection to DB...');
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        console.log('✅ Connected!');
        try {
            const collection = mongoose.connection.collection('desas');
            const count = await collection.countDocuments();
            console.log(`Total documents: ${count}`);

            const doc = await collection.findOne({});
            if (doc) {
                console.log('First Document Keys:', Object.keys(doc));
                console.log('Sample Document:', JSON.stringify(doc, null, 2));
            } else {
                console.log('❌ Collection is empty!');
            }
            process.exit(0);
        } catch (err) {
            console.error('Query Error:', err);
            process.exit(1);
        }
    })
    .catch(e => {
        console.error('❌ Connection Failed:', e.message);
        process.exit(1);
    });
