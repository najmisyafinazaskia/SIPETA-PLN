const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    kabupaten: { type: String, required: true, index: true },
    kecamatan: { type: String, required: true, index: true },
    desa: { type: String, required: true, index: true },
    X: { type: String },
    Y: { type: String },
    x: { type: String }, // Lowercase variant
    y: { type: String }, // Lowercase variant
    location: { type: Object },
    dusun_detail: [
        {
            nama: String,
            status: String
        }
    ],
    // Allow other fields
}, { timestamps: true, strict: false });

// Compound index untuk query yang lebih cepat
locationSchema.index({ kabupaten: 1, kecamatan: 1, desa: 1 });

module.exports = mongoose.model('Location', locationSchema, 'desas');
