
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Ulp = require('./models/Ulp');

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');
        const ulps = await Ulp.find({}).limit(5).lean();
        console.log('ULP Data:', JSON.stringify(ulps, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

check();
