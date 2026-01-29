const mongoose = require('mongoose');
const Location = require('./models/Location');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importFromJSON() {
    try {
        console.log('🔄 Menghubungkan ke MongoDB...');
        console.log('URI:', process.env.MONGO_URI ? 'Ditemukan' : 'TIDAK DITEMUKAN');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Terhubung ke MongoDB');

        const jsonPath = path.join(__dirname, 'data', 'locationData.json');
        console.log('📂 Mencari file di:', jsonPath);

        if (!fs.existsSync(jsonPath)) {
            console.error(`❌ File tidak ditemukan: ${jsonPath}`);
            return;
        }

        console.log('📖 Membaca file JSON...');
        let fileContent = fs.readFileSync(jsonPath, 'utf-8').trim();

        // Bersihkan koma terakhir atau spasi aneh di akhir array jika ada
        fileContent = fileContent.replace(/,\s*\]$/, ']');

        const rawData = JSON.parse(fileContent);
        console.log(`📊 Ditemukan ${rawData.length} entri data.`);

        // Mapping data langsung dari format JSON ke Model Mongoose
        const mappedData = rawData.map((item) => {
            const dusuns = [];

            // Loop Dusun A sampai F
            ['A', 'B', 'C', 'D', 'E', 'F'].forEach(suffix => {
                const namaDusun = item[`Nama Dusun ${suffix}`];
                const statusDusun = item[`Status Dusun ${suffix}`];

                if (namaDusun && namaDusun !== "0" && namaDusun !== 0) {
                    dusuns.push({
                        nama: String(namaDusun).trim(),
                        status: String(statusDusun || "Belum Berlistrik").trim()
                    });
                }
            });

            return {
                kabupaten: String(item['Kabupaten/Kota']).trim(),
                kecamatan: String(item['KECAMATAN']).trim(),
                desa: String(item['NAMA KELURAHAN/DESA']).trim(),
                X: String(item['x']).trim(),
                Y: String(item['y']).trim(),
                x: String(item['x']).trim(),
                y: String(item['y']).trim(),
                dusun_detail: dusuns
            };
        });

        console.log(`🧹 Memproses ${mappedData.length} entri data ke database.`);

        // Hapus data lama
        console.log('🗑️ Menghapus data lokasi lama...');
        await Location.deleteMany({});

        // Import dalam batch
        const batchSize = 500;
        for (let i = 0; i < mappedData.length; i += batchSize) {
            const batch = mappedData.slice(i, i + batchSize);
            await Location.insertMany(batch, { lean: true });
            console.log(`   ✓ Kemajuan: ${Math.min(i + batchSize, mappedData.length)}/${mappedData.length}`);
        }

        console.log('\n✅ IMPORT SELESAI!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Terjadi kesalahan fatal:');
        console.error(error);
        process.exit(1);
    }
}

importFromJSON();
