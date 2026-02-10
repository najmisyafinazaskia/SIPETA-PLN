const mongoose = require('mongoose');

const up3Schema = new mongoose.Schema({
    nama_up3: String,
    longitude: Number,
    latitude: Number,
    total_desa: Number,
    pelanggan: Number,
    update_pelanggan: String
}, { collection: 'up3_db' });

module.exports = mongoose.model('Up3', up3Schema);
