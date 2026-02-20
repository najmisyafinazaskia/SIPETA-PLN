const mongoose = require('mongoose');

const ulpSchema = new mongoose.Schema({
    nama_ulp: String,
    longitude: Number,
    latitude: Number,
    pelanggan: Number,
    update_pelanggan: String
}, { collection: 'ulp_db' });

module.exports = mongoose.model('Ulp', ulpSchema);
