const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./backend/data/locationData.json', 'utf8'));

let totalDesa = data.length;
let totalDusunRaw = 0;
let totalDusunClean = 0;

data.forEach(item => {
    for (let charCode = 65; charCode <= 70; charCode++) {
        const char = String.fromCharCode(charCode);
        const name = item[`Nama Dusun ${char}`];
        if (name) {
            totalDusunRaw++;
            if (name !== '0' && name !== 0) {
                totalDusunClean++;
            }
        }
    }
});

console.log('JSON Stats:');
console.log('Total Desa in JSON:', totalDesa);
console.log('Total Dusun (including "0"):', totalDusunRaw);
console.log('Total Dusun (excluding "0"):', totalDusunClean);
