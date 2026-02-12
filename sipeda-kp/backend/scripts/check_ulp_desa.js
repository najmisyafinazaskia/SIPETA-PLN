
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const UlpDesa = require('./models/UlpDesa');

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');
        const docs = await UlpDesa.find({}).limit(5).lean();
        console.log('UlpDesa Data:', JSON.stringify(docs, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

check();
