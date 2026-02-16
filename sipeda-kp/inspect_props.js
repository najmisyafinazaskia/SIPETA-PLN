
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:\\PKL\\sipeda-pln\\sipeda-kp\\backend\\data\\geojson\\aceh_kabupaten.geojson', 'utf8'));
const features = data.features.map(f => f.properties);
console.log(JSON.stringify(features, null, 2));
