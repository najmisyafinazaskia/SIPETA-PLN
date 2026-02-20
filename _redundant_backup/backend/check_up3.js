
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Up3 = require('./models/Up3');

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');
        const up3s = await Up3.find({}).lean();
        console.log('UP3 Data:', JSON.stringify(up3s, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

check();
