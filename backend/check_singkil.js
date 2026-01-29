require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const col = mongoose.connection.collection('desas');

        // Find Guha in Aceh Singkil
        const target = await col.findOne({
            kabupaten: { $regex: /singkil/i },
            desa: { $regex: /guha/i }
        });

        if (target) {
            console.log('✅ Found Guha in Aceh Singkil:');
            console.log(JSON.stringify(target, null, 2));
        } else {
            console.log('❌ Not found in DB.');
        }

        // Also check if I accidentally messed up Guhang?
        const guhang = await col.findOne({ desa: 'Guhang' });
        console.log('Current Guhang:', guhang ? guhang.dusun_detail.map(d => d.nama) : 'Not found');

        await mongoose.disconnect();
    } catch (e) { console.error(e); }
}
check();
