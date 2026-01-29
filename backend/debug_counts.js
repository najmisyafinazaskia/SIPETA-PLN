const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Location = require('./models/Location');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Location.countDocuments();
        const totalDusuns = await Location.aggregate([
            { $project: { count: { $size: { $ifNull: ['$dusuns', []] } } } },
            { $group: { _id: null, total: { $sum: '$count' } } }
        ]);

        const kabStats = await Location.aggregate([
            {
                $group: {
                    _id: '$kabupatenKota',
                    desaCount: { $sum: 1 },
                    dusunCount: { $sum: { $size: { $ifNull: ['$dusuns', []] } } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log('--- SUMMARY ---');
        console.log('Total Desa:', count);
        console.log('Total Dusun:', totalDusuns[0]?.total);
        console.log('\n--- BY KABUPATEN ---');
        kabStats.forEach(k => {
            console.log(`${k._id.padEnd(25)} | Desa: ${String(k.desaCount).padStart(4)} | Dusun: ${String(k.dusunCount).padStart(5)}`);
        });

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}
check();
