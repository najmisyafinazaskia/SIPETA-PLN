const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/db_aceh';

console.log('Connecting to:', MONGO_URI);

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected!');
        try {
            const collection = mongoose.connection.collection('desas');
            const count = await collection.countDocuments();
            console.log('Total documents in "desas":', count);

            const sample = await collection.findOne();
            console.log('Sample document:', JSON.stringify(sample, null, 2));

            process.exit(0);
        } catch (err) {
            console.error('Error querying:', err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
