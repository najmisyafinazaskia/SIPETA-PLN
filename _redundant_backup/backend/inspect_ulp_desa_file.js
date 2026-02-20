const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../db_Aceh/ulp/ulp_desa.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    console.log(`Total Desas: ${data.length}`);

    let hasULP = false;
    let keys = new Set();

    if (data.length > 0) {
        Object.keys(data[0]).forEach(k => keys.add(k));
        hasULP = data.some(item => item.ULP !== undefined);
    }

    console.log('Keys in first item:', Array.from(keys));
    console.log('Has "ULP" field in any item:', hasULP);

    // Check if maybe it's in a different case like "ulp"
    const hasLowerULP = data.some(item => item.ulp !== undefined);
    console.log('Has "ulp" field in any item:', hasLowerULP);

} catch (err) {
    console.error(err);
}
