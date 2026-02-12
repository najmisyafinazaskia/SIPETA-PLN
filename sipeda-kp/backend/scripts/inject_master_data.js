const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Schema Sederhana untuk Data Master
const KabupatenSchema = new mongoose.Schema({
    nama: { type: String, required: true, unique: true }
}, { strict: false });

const KecamatanSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    kabupaten: { type: String, required: true }
}, { strict: false });
// Compound Index agar kombinasi nama kec + kab unik
KecamatanSchema.index({ nama: 1, kabupaten: 1 }, { unique: true });

const Kabupaten = mongoose.model('KabupatenKota', KabupatenSchema, 'kabupaten_kotas');
const Kecamatan = mongoose.model('Kecamatan', KecamatanSchema, 'kecamatans');

async function injectMasterData() {
    try {
        console.log('🔄 Menghubungkan ke MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Terhubung.');

        const dbAcehDir = path.resolve(__dirname, '..', 'db_Aceh');

        // 1. INJEKSI KABUPATEN
        const kabFile = path.join(dbAcehDir, 'kabupaten_kota', 'data_kabupaten_kota.json');
        if (fs.existsSync(kabFile)) {
            console.log('\n📦 Menginjeksi Data Kabupaten...');
            const kabData = JSON.parse(fs.readFileSync(kabFile, 'utf8'));

            // Hapus data lama agar bersih (opsional, tapi bagus untuk re-seed)
            await Kabupaten.deleteMany({});
            console.log('   🗑️  Data lama dihapus.');

            const result = await Kabupaten.insertMany(kabData);
            console.log(`   ✅ Berhasil memasukkan ${result.length} Kabupaten.`);
        } else {
            console.warn('⚠️ File data kabupaten tidak ditemukan.');
        }

        // 2. INJEKSI KECAMATAN
        const kecFile = path.join(dbAcehDir, 'kecamatan', 'data_kecamatan.json');
        if (fs.existsSync(kecFile)) {
            console.log('\n📦 Menginjeksi Data Kecamatan...');
            const kecData = JSON.parse(fs.readFileSync(kecFile, 'utf8'));

            await Kecamatan.deleteMany({});
            console.log('   🗑️  Data lama dihapus.');

            const result = await Kecamatan.insertMany(kecData);
            console.log(`   ✅ Berhasil memasukkan ${result.length} Kecamatan.`);
        } else {
            console.warn('⚠️ File data kecamatan tidak ditemukan.');
        }

        console.log('\n🎉 Injeksi Master Data Selesai!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

injectMasterData();
