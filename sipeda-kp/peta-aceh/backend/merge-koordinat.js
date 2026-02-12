const fs = require('fs');
const csv = require('csv-parser');

const geojsonPath = './desa-aceh-final.geojson';
const csvKoordinatPath = './Koordinat_Baru.csv';

// Map untuk menyimpan koordinat dari file CSV baru
const koordinatMap = new Map();

// Fungsi membersihkan teks agar pencocokan akurat
const clean = (txt) => {
    if (!txt) return "";
    return txt.toString()
        .toLowerCase()
        .replace(/^\d+\s*/, '') // Hapus angka di depan (misal: "1 Bakongan" -> "bakongan")
        .replace(/[^a-z0-9]/g, '') // Hapus spasi dan simbol
        .trim();
};

// STEP 1: Membaca Koordinat_Baru.csv
fs.createReadStream(csvKoordinatPath)
    .pipe(csv({ separator: ';' })) // Sesuai format titik koma di file Anda
    .on('data', (row) => {
        // Berdasarkan gambar Anda, kolom berada di index tertentu atau nama header
        const kec = row['KECAMATAN'] || row['kecamatan'];
        const desa = row['DESA'] || row['desa'];
        const xLat = row['X'] || row['x']; // Latitude
        const yLon = row['Y'] || row['y']; // Longitude

        if (kec && desa && xLat && yLon && xLat !== "#VALUE!") {
            const key = `${clean(kec)}_${clean(desa)}`;
            // MongoDB/GeoJSON menggunakan format: [Longitude, Latitude]
            const cleanLat = xLat.replace(',', '.');
            const cleanLon = yLon.replace(',', '.');
            koordinatMap.set(key, [parseFloat(cleanLon), parseFloat(cleanLat)]);
        }
    })
    .on('end', () => {
        console.log(`✅ Koordinat dimuat: ${koordinatMap.size} desa.`);
        updateGeoJSON();
    });

// STEP 2: Memperbarui GeoJSON
function updateGeoJSON() {
    const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
    let count = 0;

    geojsonData.features = geojsonData.features.map(feature => {
        const p = feature.properties;
        const key = `${clean(p.kecamatan)}_${clean(p.name)}`;

        if (koordinatMap.has(key)) {
            // Update koordinat di geometri GeoJSON
            feature.geometry.coordinates = koordinatMap.get(key);
            count++;
        }
        return feature;
    });

    // Simpan file baru
    fs.writeFileSync('./desa-aceh-final-updated.geojson', JSON.stringify(geojsonData, null, 2));
    console.log(`🚀 Selesai! ${count} desa telah diperbarui koordinatnya.`);
}