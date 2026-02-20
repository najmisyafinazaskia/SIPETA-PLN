const fs = require('fs');

// ==========================================
// KONFIGURASI
// ==========================================
const API_KEY = '115419b79e952e6e3e1631cfd196c214'; // User's key
const API_URL = 'https://webapi.bps.go.id/v1/api';

// Domain Aceh = 1100
const DOMAIN_ACEH = '1100';
const MODEL_SUBJECT = 'subject';

// ==========================================
// SCRIPT
// ==========================================

async function fetchSubjects() {
    console.log(`🔍 Sedang mencari kategori Kependudukan di Aceh (${DOMAIN_ACEH})...`);
    try {
        const url = `${API_URL}/list/model/${MODEL_SUBJECT}/domain/${DOMAIN_ACEH}/key/${API_KEY}`;

        // Native fetch
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            let output = '✅ Berhasil terhubung ke BPS!\n';
            output += 'DEBUG DATA STRUCTURE: ' + JSON.stringify(data).slice(0, 500) + '\n';

            const subjects = data.data[1];
            output += `\n--- DAFTAR KATEGORI (Total: ${subjects.length}) ---\n`;

            subjects.forEach(sub => {
                output += `[${sub.sub_id}] ${sub.title}\n`;
            });
            output += '-----------------------\n';

            fs.writeFileSync('scripts/debug_bps.txt', output);
            console.log('✅ Output saved to scripts/debug_bps.txt');
        } else {
            console.error('❌ Gagal mengambil data:', data.message || JSON.stringify(data));
            fs.writeFileSync('scripts/debug_bps.txt', 'ERROR: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('❌ Error Script:', error.message);
    }
}

fetchSubjects();
