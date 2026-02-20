const mongoose = require('mongoose');

const up3DesaSchema = new mongoose.Schema({
    up3: String,
    ulp: String,
    desa: String,
    latitude: Number,
    longitude: Number,
    kabupaten: String,
    kecamatan: String,
    Status_Listrik: { type: String, default: 'Berlistrik' } // Default if missing in JSON
}, { collection: 'up3_desa' });

module.exports = mongoose.model('Up3Desa', up3DesaSchema);
