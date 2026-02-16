
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:\\PKL\\sipeda-pln\\sipeda-kp\\backend\\data\\geojson\\aceh_kabupaten.geojson', 'utf8'));
const names = data.features.map(f => {
    const name = f.properties.Kab_Kota || f.properties.KAB_KOTA;
    return `|${name}|`;
});
console.log(JSON.stringify(names, null, 2));
