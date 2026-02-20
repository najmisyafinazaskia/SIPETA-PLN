const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const UlpDesa = require('./models/UlpDesa');

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected.');

        const filePath = path.join(__dirname, '../db_Aceh/ulp/ulp_desa.json');
        console.log(`Reading file: ${filePath}`);

        let rawData = fs.readFileSync(filePath, 'utf8').trim();

        // Fix potential JSON trailing comma or missing bracket
        if (rawData.endsWith('}')) {
            rawData += ']';
        } else if (rawData.endsWith('},')) {
            // Remove trailing comma and add bracket
            rawData = rawData.slice(0, -1) + ']';
        }

        let jsonData = [];
        try {
            jsonData = JSON.parse(rawData);
        } catch (e) {
            console.error("Standard JSON parse failed. Attempting robust line-by-line recovery...");

            // Regex to match individual JSON objects in the array
            // Assuming objects start with { and end with }
            // We'll iterate through the string to find balanced brackets

            const objects = [];
            let braceCount = 0;
            let startIndex = -1;

            for (let i = 0; i < rawData.length; i++) {
                const char = rawData[i];

                if (char === '{') {
                    if (braceCount === 0) startIndex = i;
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0 && startIndex !== -1) {
                        const objStr = rawData.substring(startIndex, i + 1);
                        try {
                            const obj = JSON.parse(objStr);
                            objects.push(obj);
                        } catch (parseErr) {
                            // Ignore malformed objects
                        }
                        startIndex = -1;
                    }
                }
            }

            if (objects.length > 0) {
                console.log(`Recovered ${objects.length} valid objects from corrupted file.`);
                jsonData = objects;
            } else {
                throw new Error("Failed to recover any data.");
            }
        }

        console.log(`Found ${jsonData.length} entries.`);

        // Clear existing collection
        console.log('Clearing existing collection...');
        await UlpDesa.deleteMany({});

        console.log('Inserting data...');
        const fixCoord = (val) => {
            if (!val) return 0;
            let num = parseFloat(val);
            if (isNaN(num)) return 0;
            // Heuristic for Aceh coordinates: Longitude ~95-98, Latitude ~2-6
            // If num is huge (e.g. > 1000), divide until it fits range or makes sense
            // Typically just formatting issue like missing dot

            // Check Longitude candidates
            if (num > 90000000) num /= 1000000;
            if (num > 900000) num /= 10000;
            if (num > 180) return num / 1000000; // generic fallback

            return num;
        };

        const bulkOps = jsonData.map(item => {
            // Normalize data
            return {
                updateOne: {
                    filter: {
                        "Kabupaten/Kota": item["Kabupaten/Kota"],
                        "KECAMATAN": item["KECAMATAN"],
                        "NAMA KELURAHAN/DESA": item["NAMA KELURAHAN/DESA"]
                    },
                    update: {
                        $set: {
                            UP3: item.UP3,
                            "Kabupaten/Kota": item["Kabupaten/Kota"],
                            KECAMATAN: item["KECAMATAN"],
                            "NAMA KELURAHAN/DESA": item["NAMA KELURAHAN/DESA"],
                            Desa: item["NAMA KELURAHAN/DESA"], // Normalize
                            ULP: item.ULP, // Field now verified to exist

                            latitude: fixCoord(item.y_desa),
                            longitude: fixCoord(item.x_desa),
                        }
                    },
                    upsert: true
                }
            };
        });

        if (bulkOps.length > 0) {
            await UlpDesa.bulkWrite(bulkOps);
            console.log(`Successfully synced ${jsonData.length} documents.`);
        } else {
            console.log("No data to sync.");
        }

        console.log("Done.");
        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

run();
