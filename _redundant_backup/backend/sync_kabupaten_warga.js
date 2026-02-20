const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Kabupaten = require('./models/Kabupaten');

const populationData = [
    { name: "SIMEULUE", warga: 98630 },
    { name: "ACEH SINGKIL", warga: 135700 },
    { name: "ACEH SELATAN", warga: 242000 },
    { name: "ACEH TENGGARA", warga: 234400 },
    { name: "ACEH TIMUR", warga: 443640 },
    { name: "ACEH TENGAH", warga: 226700 },
    { name: "ACEH BARAT", warga: 206800 },
    { name: "ACEH BESAR", warga: 428250 },
    { name: "PIDIE", warga: 452550 },
    { name: "BIREUEN", warga: 459070 },
    { name: "ACEH UTARA", warga: 631980 },
    { name: "ACEH BARAT DAYA", warga: 159200 },
    { name: "GAYO LUES", warga: 104790 },
    { name: "ACEH TAMIANG", warga: 309000 },
    { name: "NAGAN RAYA", warga: 176400 },
    { name: "ACEH JAYA", warga: 99200 },
    { name: "BENER MERIAH", warga: 172000 },
    { name: "PIDIE JAYA", warga: 166500 },
    { name: "KOTA BANDA ACEH", warga: 265000 },
    { name: "KOTA SABANG", warga: 43470 },
    { name: "KOTA LANGSA", warga: 198000 },
    { name: "KOTA LHOKSEUMAWE", warga: 200400 },
    { name: "KOTA SUBULUSSALAM", warga: 99100 }
];

async function syncKabupatenPopulation() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        for (const data of populationData) {
            const result = await Kabupaten.findOneAndUpdate(
                { nama: new RegExp(`^${data.name}$`, 'i') },
                {
                    warga: data.warga,
                    lembaga_warga: "BPS",
                    tahun: 2024
                },
                { upsert: false } // We assume kabupaten already exists with coordinates
            );

            if (result) {
                console.log(`Updated population for ${data.name}`);
            } else {
                console.warn(`Kabupaten ${data.name} not found in database!`);
            }
        }

        console.log("Finished syncing kabupaten population.");
        process.exit(0);
    } catch (error) {
        console.error("Error syncing population:", error);
        process.exit(1);
    }
}

syncKabupatenPopulation();
