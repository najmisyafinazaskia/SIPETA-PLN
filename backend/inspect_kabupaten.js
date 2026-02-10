const mongoose = require('mongoose');
require('dotenv').config();

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const doc = await mongoose.connection.db.collection('kabupaten_kotas').findOne({});
        console.log('Sample Document:', JSON.stringify(doc, null, 2));

        const count = await mongoose.connection.db.collection('kabupaten_kotas').countDocuments();
        console.log('Total Documents:', count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
