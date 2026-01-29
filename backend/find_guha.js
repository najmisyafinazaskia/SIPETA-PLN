const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'data', 'locationData.json');
let fileContent = fs.readFileSync(jsonPath, 'utf-8').trim();
// Fix JSON format (trailing comma)
fileContent = fileContent.replace(/,\s*\]$/, ']');

try {
    const data = JSON.parse(fileContent);
    const matches = data.filter(d =>
        (d['NAMA KELURAHAN/DESA'] || '').toLowerCase().includes('guha')
    );

    console.log('Matches found:', matches.length);
    matches.forEach(m => {
        console.log(`- ${m['NAMA KELURAHAN/DESA']} (${m['Kabupaten/Kota']}, ${m['KECAMATAN']})`);
        console.log('  Dusuns:',
            [m['Nama Dusun A'], m['Nama Dusun B'], m['Nama Dusun C'], m['Nama Dusun D']]
                .filter(x => x && x !== '0').join(', ')
        );
    });
} catch (e) {
    console.error('JSON Parse Error:', e.message);
}
