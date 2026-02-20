const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Ulp = require('./backend/models/Ulp');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const ulps = await Ulp.find({ pelanggan: { $exists: true, $gt: 0 } }).lean();
        console.log(`Found ${ulps.length} ULPs with pelanggan count.`);
        console.log(JSON.stringify(ulps.slice(0, 3), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

check();
