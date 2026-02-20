const mongoose = require('mongoose');
require('dotenv').config();
const Location = require('../models/Location');

async function checkGeo() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const count = await Location.countDocuments();
        console.log(`Total Locations: ${count}`);

        const sample = await Location.findOne({ x: { $exists: true, $ne: "0" } });
        if (sample) {
            console.log("Sample with Coordinates:");
            console.log(`Name: ${sample.desa}`);
            console.log(`X: ${sample.x}, Y: ${sample.y}`);
            console.log(`Dusuns: ${sample.dusuns ? sample.dusuns.length : 0}`);
        } else {
            console.log("No locations with valid X/Y found!");
        }

        // Check "REFF!" filtering validity
        const reffCount = await Location.countDocuments({ "dusuns.status": "REFF!" });
        console.log(`Locations with REFF! dusuns: ${reffCount}`);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkGeo();
