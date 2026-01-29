const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/db_aceh';
// Mengambil URI Atlas dari process.env atau hardcoded sementara utk memastikan jalan
const CLOUD_URI = 'mongodb+srv://pln-sipeta:punyaUP2KPLN@cluster0.nhwvtny.mongodb.net/db_aceh?appName=Cluster0';

async function migrate() {
    console.log('🚀 Starting Migration: Local -> Cloud');

    try {
        // 1. Fetch from Local
        console.log('🔌 Connecting to LOCAL Database...');
        const localConn = await mongoose.createConnection(LOCAL_URI, { serverSelectionTimeoutMS: 5000 }).asPromise();
        console.log('✅ Connected to Local.');

        const localColl = localConn.collection('desas');
        const data = await localColl.find({}).toArray();
        console.log(`📦 Found ${data.length} documents in Local DB.`);

        if (data.length === 0) {
            console.log('⚠️ No data found in Local DB to migrate.');
            await localConn.close();
            process.exit(0);
        }

        // 2. Push to Cloud
        console.log('🔌 Connecting to CLOUD Database (Atlas)...');
        const cloudConn = await mongoose.createConnection(CLOUD_URI, { serverSelectionTimeoutMS: 10000 }).asPromise();
        console.log('✅ Connected to Cloud.');

        const cloudColl = cloudConn.collection('desas');

        const cloudCount = await cloudColl.countDocuments();
        if (cloudCount > 0) {
            console.log(`⚠️ Cloud DB already has ${cloudCount} documents. Clearing them to ensure fresh copy...`);
            await cloudColl.deleteMany({});
            console.log('🗑️ Cloud collection cleared.');
        }

        console.log(`📤 Uploading ${data.length} documents to Cloud...`);
        // Batch insert in case of large data
        const result = await cloudColl.insertMany(data);
        console.log(`✅ Successfully migrated ${result.insertedCount} documents!`);

        await localConn.close();
        await cloudConn.close();
        console.log('🎉 Migration FINISHED Successfully!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Migration Error:', err);
        process.exit(1);
    }
}

migrate();
