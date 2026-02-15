const fs = require('fs');
const filePath = 'd:/PKL/sipeda-pln/sipeda-kp/backend/controllers/locationController.js';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Patch getUp3DesaGrouped
const up3Target = /acc\[curr\.up3\]\.push\(\{[\s\S]+?\}\);\s+return acc;/;
const up3Replacement = `acc[curr.up3].push({
                locationId: match?._id,
                Desa: curr.desa,
                Kabupaten: curr.kabupaten || "-",
                Kecamatan: curr.kecamatan || "-",
                ULP: curr.ulp || "-",
                latitude: curr.latitude,
                longitude: curr.longitude,
                Status_Listrik: curr.Status_Listrik || "Berlistrik",
                warga: match?.warga || 0,
                pelanggan: match?.pelanggan || 0,
                lembaga_warga: match?.sumber_warga || "-",
                tahun: match?.tahun_warga || "-"
            });
            return acc;`;

if (content.match(up3Target)) {
    content = content.replace(up3Target, up3Replacement);
    console.log('Patched getUp3DesaGrouped');
} else {
    console.log('FAILED to patch getUp3DesaGrouped');
}

// 2. Patch getUlpDesaGrouped
const ulpTarget = /acc\[namaULP\]\.push\(\{[\s\S]+?\}\);\s+return acc;/;
const ulpReplacement = `acc[namaULP].push({
                ...desa,
                locationId: match?._id,
                latitude: desa.latitude,
                longitude: desa.longitude,
                Status_Listrik: desa.Status_Listrik || "Berlistrik",
                Desa: desaName,
                Kecamatan: kecName,
                Kabupaten: kabName,
                UP3: desa.UP3,
                warga: match?.warga || 0,
                pelanggan: match?.pelanggan || 0,
                lembaga_warga: match?.sumber_warga || "-",
                tahun: match?.tahun_warga || "-"
            });
            return acc;`;

if (content.match(ulpTarget)) {
    content = content.replace(ulpTarget, ulpReplacement);
    console.log('Patched getUlpDesaGrouped');
} else {
    console.log('FAILED to patch getUlpDesaGrouped');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done patching locationController.js');
