const mongoose = require('mongoose');
const Location = require('./models/Location');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Fungsi untuk parse TSV file
function parseTSVFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    const locations = [];

    // Skip header line (line 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        const parts = line.split('\t');
        if (parts.length >= 5) {
            const x = parseFloat(parts[3]);
            const y = parseFloat(parts[4]);

            // Validasi koordinat
            if (!isNaN(x) && !isNaN(y)) {
                locations.push({
                    kabupatenKota: parts[0].trim(),
                    kecamatan: parts[1].trim(),
                    desa: parts[2].trim(),
                    x: x,
                    y: y
                });
            } else {
                console.warn(`Skipping invalid coordinates at line ${i + 1}: ${line}`);
            }
        }
    }

    return locations;
}

// Fungsi untuk import data
async function importLocations() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Path ke file TSV (buat file ini dengan data lengkap Anda)
        const tsvFilePath = path.join(__dirname, 'data', 'aceh_locations.tsv');

        if (!fs.existsSync(tsvFilePath)) {
            console.error(`❌ File not found: ${tsvFilePath}`);
            console.log('📝 Please create the file with your location data in TSV format');
            console.log('   Format: Kabupaten/Kota [TAB] Kecamatan [TAB] Desa [TAB] x [TAB] y');
            process.exit(1);
        }

        console.log('📖 Reading location data from file...');
        const locations = parseTSVFile(tsvFilePath);
        console.log(`📊 Found ${locations.length} locations to import`);

        // Hapus data lama
        console.log('🗑️  Clearing existing location data...');
        await Location.deleteMany({});
        console.log('✅ Cleared existing data');

        // Insert data baru dalam batch
        console.log('💾 Importing new location data...');
        const batchSize = 1000;
        for (let i = 0; i < locations.length; i += batchSize) {
            const batch = locations.slice(i, i + batchSize);
            await Location.insertMany(batch);
            console.log(`   Imported ${Math.min(i + batchSize, locations.length)}/${locations.length} locations`);
        }

        console.log(`✅ Successfully imported ${locations.length} locations`);

        // Tampilkan statistik
        console.log('\n📊 Import Statistics:');
        const stats = await Location.aggregate([
            {
                $group: {
                    _id: '$kabupatenKota',
                    kecamatanList: { $addToSet: '$kecamatan' },
                    desaCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    kabupatenKota: '$_id',
                    kecamatanCount: { $size: '$kecamatanList' },
                    desaCount: 1,
                    _id: 0
                }
            },
            {
                $sort: { kabupatenKota: 1 }
            }
        ]);

        console.log('\nPer Kabupaten/Kota:');
        stats.forEach(stat => {
            console.log(`  ${stat.kabupatenKota}: ${stat.kecamatanCount} kecamatan, ${stat.desaCount} desa`);
        });

        const totalKecamatan = stats.reduce((sum, s) => sum + s.kecamatanCount, 0);
        const totalDesa = stats.reduce((sum, s) => sum + s.desaCount, 0);

        console.log('\nTotal Summary:');
        console.log(`  Kabupaten/Kota: ${stats.length}`);
        console.log(`  Kecamatan: ${totalKecamatan}`);
        console.log(`  Desa: ${totalDesa}`);

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        console.log('🎉 Import completed successfully!');
    } catch (error) {
        console.error('❌ Error importing locations:', error);
        process.exit(1);
    }
}

// Jalankan import
if (require.main === module) {
    importLocations();
}

module.exports = { importLocations, parseTSVFile };
