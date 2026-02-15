const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing connection to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Success! Connected to MongoDB Atlas.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Failed! Connection error:', err.message);
        process.exit(1);
    });
