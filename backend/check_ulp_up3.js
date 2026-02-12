const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkUlpDesa() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const col = db.collection('ulp_desa');

        const hasUP3 = await col.findOne({ UP3: { $exists: true } });
        console.log('Record with UP3:', hasUP3 ? 'Found' : 'Not Found');
        if (hasUP3) {
            console.log('UP3 value:', hasUP3.UP3);
            console.log('ULP value:', hasUP3.ULP);
        }

        const sample = await col.findOne({});
        console.log('Sample record keys:', Object.keys(sample));
        console.log('Sample content:', JSON.stringify(sample, null, 2));

        const up3s = await col.distinct('UP3');
        console.log('Unique UP3s:', up3s);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkUlpDesa();
