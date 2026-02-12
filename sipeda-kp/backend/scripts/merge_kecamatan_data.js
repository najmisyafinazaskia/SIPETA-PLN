const fs = require('fs');
const path = require('path');

const kecamatanPath = path.join(__dirname, '../db_Aceh/kecamatan/data_kecamatan.json');
const populationPath = path.join(__dirname, '../db_Aceh/kecamatan/data_population_kecamatan.json');

const kecamatanData = JSON.parse(fs.readFileSync(kecamatanPath, 'utf8'));
const populationData = JSON.parse(fs.readFileSync(populationPath, 'utf8'));

// Create a map for population data: name -> warga
const popMap = {};
populationData.forEach(p => {
    if (p.nama) {
        popMap[p.nama.trim()] = p.warga;
    }
});

// Merge data
let matchCount = 0;
const mergedData = kecamatanData.map(k => {
    const w = popMap[k.nama.trim()];
    if (w !== undefined) matchCount++;
    return {
        ...k,
        warga: w || 0
    };
});

console.log(`Merged ${matchCount} population records into ${mergedData.length} kecamatan records.`);

// Write back to data_kecamatan.json
fs.writeFileSync(kecamatanPath, JSON.stringify(mergedData, null, 2), 'utf8');
console.log('Successfully updated data_kecamatan.json');

// Delete the temporary population file
try {
    fs.unlinkSync(populationPath);
    console.log('Deleted data_population_kecamatan.json');
} catch (e) {
    console.log('Could not delete temp file, maybe already gone.');
}
