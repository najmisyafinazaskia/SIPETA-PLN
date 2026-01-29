const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Location = require('./models/Location');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const stats = await Location.aggregate([
            { $group: { _id: '$kabupatenKota', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        console.log('Total Kabupaten:', stats.length);
        console.log(JSON.stringify(stats, null, 2));
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}
check();
