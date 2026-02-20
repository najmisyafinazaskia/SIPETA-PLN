const mongoose = require('mongoose');

const kecamatanSchema = new mongoose.Schema({
    Kabkot: { type: String, required: true },
    Kecamatan: { type: String, required: true },
    Warga: { type: Number },
    Lembaga_Warga: { type: String },
    tahun: { type: Number }
}, { timestamps: true });

// We can store this in a separate collection or try to update existing locations. 
// However, since we don't have a dedicated 'Kecamatan' collection that stores metadata like this 
// (the 'kecamatans' collection might fail if it's just a view or doesn't exist yet),
// Point to the 'kecamatans' collection as specified by user requirements
module.exports = mongoose.model('KecamatanStat', kecamatanSchema, 'kecamatans');
