const mongoose = require('mongoose');

const ulpDesaSchema = new mongoose.Schema({
    UP3: String,
    "Kabupaten/Kota": String,
    KECAMATAN: String,
    "NAMA KELURAHAN/DESA": String,
    Desa: String, // Normalized field for easier query
    ULP: String, // Important field!
    latitude: Number,
    longitude: Number,
    Status_Listrik: String
}, { collection: 'ulp_desa' });

module.exports = mongoose.model('UlpDesa', ulpDesaSchema);