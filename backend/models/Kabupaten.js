const mongoose = require('mongoose');

const kabupatenSchema = new mongoose.Schema({
    nama: { type: String, required: true, unique: true },
    koordinat: { type: [Number], index: '2dsphere' }, // [lat, lng]
    warga: { type: Number },
    lembaga_warga: { type: String, default: "BPS" },
    tahun: { type: Number, default: 2024 }
}, { timestamps: true });

module.exports = mongoose.model('Kabupaten', kabupatenSchema, 'kabupaten_kotas');
