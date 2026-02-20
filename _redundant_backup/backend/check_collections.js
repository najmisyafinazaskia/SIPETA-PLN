const mongoose = require('mongoose');
require('dotenv').config();

async function checkCollections() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Existing Collections:');
        collections.forEach(c => console.log(` - ${c.name}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCollections();
