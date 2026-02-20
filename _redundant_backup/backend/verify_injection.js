const mongoose = require('mongoose');
require('dotenv').config();

async function verifyInjection() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB:', mongoose.connection.name);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in DB:', collections.map(c => c.name));

        const kabCount = await mongoose.connection.db.collection('kabupaten_kotas').countDocuments();
        const kecCount = await mongoose.connection.db.collection('kecamatans').countDocuments();

        console.log(`\nVerifikasi Data:`);
        console.log(`- kabupaten_kotas: ${kabCount} dokumen`);
        console.log(`- kecamatans: ${kecCount} dokumen`);

        if (kabCount > 0 && kecCount > 0) {
            console.log('\n✅ Data SUDAH ADA di database. Silakan REFRESH MongoDB Compass Anda.');
        } else {
            console.log('\n❌ Data KOSONG. Ada masalah saat injeksi.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verifyInjection();
