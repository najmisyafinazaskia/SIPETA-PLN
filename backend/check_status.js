const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Location = require('./models/Location');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const stats = await Location.aggregate([
            { $group: { _id: '$kabupatenKota', allDusuns: { $push: '$dusuns' } } }
        ]);
        const result = stats.map(s => {
            const hasUnpowered = s.allDusuns.some(desadusuns =>
                (desadusuns || []).some(d => d.status.toLowerCase() === 'belum berlistrik')
            );
            return { name: s._id, hasUnpowered };
        });

        const stables = result.filter(r => !r.hasUnpowered);
        const warnings = result.filter(r => r.hasUnpowered);

        console.log('Stable Regions:', stables.length);
        console.log('Warning Regions:', warnings.length);
        console.log('\n--- Stable List ---');
        console.log(stables.map(r => r.name).sort().join(', '));
        console.log('\n--- Warning List ---');
        console.log(warnings.map(r => r.name).sort().join(', '));

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}
check();
