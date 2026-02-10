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
        console.log(`📊 Ditemukan ${rawData.length} entri data mentah.`);

        // Deteksi Format: Cek apakah ada header "Column2" yang berisi "Kabupaten/Kota"
        let isColumnFormat = false;
        let headerRow = null;
        let dataRows = rawData;

        // Cek item pertama untuk header
        if (rawData.length > 0 && rawData[0]['Column2'] && (rawData[0]['Column2'].includes('Kabupaten') || rawData[0]['Column2'].includes('Kabupaten/Kota'))) {
            isColumnFormat = true;
            headerRow = rawData[0];
            dataRows = rawData.slice(1); // Exclude header row
            console.log('ℹ️ Terdeteksi format data baru dengan header Column.');
        }

        // Helper to clean invalid values
        const isValidValue = (val) => {
            if (val === null || val === undefined) return false;
            const str = String(val).trim();
            return str !== '' && str !== '0' && str.toLowerCase() !== 'null' && str !== '-';
        };

        // Mapping data
        const mappedData = dataRows.map((item) => {
            const dusuns = [];

            if (isColumnFormat) {
                // LOGIKA FORMAT BARU (ColumnX)
                // Mapping berdasarkan struktur yang diberikan user:
                // Col2=Kab, Col3=Kec, Col4=Desa, Col5=X, Col6=Y
                // Col7=Nama1, Col8=Status1, Col9=Nama2, Col10=Status2, dst...

                const kab = String(item['Column2'] || '').trim();
                const kec = String(item['Column3'] || '').trim();
                const des = String(item['Column4'] || '').trim();

                // Skip jika data kosong/header parsing error
                if (!isValidValue(kab) || kab === 'Kabupaten/Kota') return null;

                const xVal = isValidValue(item['Column5']) ? String(item['Column5']).trim() : '0';
                const yVal = isValidValue(item['Column6']) ? String(item['Column6']).trim() : '0';

                // Loop Dusun 1 sampai 6 (Column 7 sampai 18)
                // Pasangan: (7,8), (9,10), (11,12), (13,14), (15,16), (17,18)
                for (let i = 0; i < 6; i++) {
                    const colNameIndex = 7 + (i * 2);
                    const colStatusIndex = 8 + (i * 2);

                    const colNameKey = `Column${colNameIndex}`;
                    const colStatusKey = `Column${colStatusIndex}`;

                    const namaDusun = item[colNameKey];
                    let statusDusun = item[colStatusKey];

                    // Cleaning Status
                    if (!isValidValue(statusDusun)) {
                        statusDusun = "Berlistrik PLN"; // Default jika kosong dianggap Berlistrik
                    }

                    if (isValidValue(namaDusun)) {
                        dusuns.push({
                            nama: String(namaDusun).trim(),
                            status: String(statusDusun).trim()
                        });
                    }
                }

                return {
                    kabupaten: kab,
                    kecamatan: kec,
                    desa: des,
                    X: xVal,
                    Y: yVal,
                    x: xVal,
                    y: yVal,
                    dusun_detail: dusuns
                };

            } else {
                // LOGIKA FORMAT LAMA (Nama Dusun A, dst)
                ['A', 'B', 'C', 'D', 'E', 'F'].forEach(suffix => {
                    const namaDusun = item[`Nama Dusun ${suffix}`];
                    let statusDusun = item[`Status Dusun ${suffix}`];

                    // Cleaning Status
                    if (!isValidValue(statusDusun)) {
                        statusDusun = "Berlistrik PLN"; // Default jika kosong dianggap Berlistrik
                    }

                    if (isValidValue(namaDusun)) {
                        dusuns.push({
                            nama: String(namaDusun).trim(),
                            status: String(statusDusun).trim()
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
            }
        }).filter(item => item !== null); // Hapus null entries

        console.log(`🧹 Memproses ${mappedData.length} entri data valid ke database.`);

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
