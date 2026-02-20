const mongoose = require('mongoose');
require('dotenv').config();
const Up3 = require('./models/Up3');
const Ulp = require('./models/Ulp');

const up3Data = [
    { name: "Banda Aceh", pelanggan: 317992 },
    { name: "Langsa", pelanggan: 254100 },
    { name: "Lhokseumawe", pelanggan: 492000 },
    { name: "Meulaboh", pelanggan: 236500 },
    { name: "Sigli", pelanggan: 273100 },
    { name: "Subulussalam", pelanggan: 195500 }
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    for (const item of up3Data) {
        const res = await Up3.updateOne(
            { nama_up3: new RegExp(`^${item.name}$`, 'i') },
            { $set: { pelanggan: item.pelanggan } }
        );
        console.log(`${item.name}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
    }

    // Seed ULPs with random data for demonstration
    const ulps = await Ulp.find({});
    for (const ulp of ulps) {
        const rand = Math.floor(Math.random() * 100000) + 10000;
        await Ulp.updateOne({ _id: ulp._id }, { $set: { pelanggan: rand } });
    }
    console.log(`Seed ${ulps.length} ULPs.`);
    await mongoose.connection.close();
}
seed();
