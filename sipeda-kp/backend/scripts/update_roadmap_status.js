const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Location = require('./models/Location');

async function updateRoadmap() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Update Perabis and Perpolin in Desa Guha, Simpang Kanan
        const guha = await Location.findOne({ desa: 'Guha', kecamatan: 'Simpang Kanan' });
        if (guha) {
            let updated = false;
            guha.dusun_detail.forEach(d => {
                if (d.nama.toUpperCase() === 'PERABIS' || d.nama.toUpperCase() === 'PERPOLIN') {
                    d.status = 'sudah dikerjakan di roadmap 2025';
                    updated = true;
                    console.log(`Updated Dusun ${d.nama} in Desa Guha`);
                }
            });
            if (updated) {
                await Location.updateOne({ _id: guha._id }, { $set: { dusun_detail: guha.dusun_detail } });
            }
        }

        // 2. Update Lhok Pineung in Desa Lhok Sandeng
        const lhokSandengDesa = await Location.findOne({ desa: 'Lhok Sandeng' });
        if (lhokSandengDesa) {
            let updated = false;
            lhokSandengDesa.dusun_detail.forEach(d => {
                // If it's the one in the screenshot or matches the request intent
                if (d.nama.toUpperCase() === 'LHOK PINEUNG' || d.nama.toUpperCase() === 'LHOK SANDENG' || d.nama.toUpperCase() === 'COT SAKA') {
                    d.status = 'sudah masuk di roadmap 2026';
                    updated = true;
                    console.log(`Updated Dusun ${d.nama} in Desa Lhok Sandeng`);
                }
            });

            if (updated) {
                await Location.updateOne({ _id: lhokSandengDesa._id }, { $set: { dusun_detail: lhokSandengDesa.dusun_detail } });
            }
        }

        console.log('Updates completed');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateRoadmap();
