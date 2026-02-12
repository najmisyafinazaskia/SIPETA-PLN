const mongoose = require('mongoose');
require('dotenv').config();
const Up3 = require('./models/Up3');
async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const names = await Up3.find({}, { nama_up3: 1 }).lean();
    console.log(JSON.stringify(names, null, 2));
    await mongoose.connection.close();
}
check();
