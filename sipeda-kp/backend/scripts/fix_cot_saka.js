const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Location = require('./models/Location');

async function fixCotSaka() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Update Cot Saka in Desa Lhok Sandeng
        const lhokSandengDesa = await Location.findOne({ desa: 'Lhok Sandeng' });
        if (lhokSandengDesa) {
            let updated = false;
            lhokSandengDesa.dusun_detail.forEach(d => {
                if (d.nama.toUpperCase() === 'COT SAKA') {
                    d.status = 'Berlistrik PLN';
                    updated = true;
                    console.log(`Updated Dusun ${d.nama} to Berlistrik PLN`);
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

fixCotSaka();
