const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    dusunId: {
        type: String,
        required: true,
        unique: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['Menunggu Verifikasi', 'Terverifikasi', 'Tidak Sesuai', 'Sesuai (Perlu Perbaikan)'],
        default: 'Menunggu Verifikasi'
    }
}, { timestamps: true });

module.exports = mongoose.model('Verification', verificationSchema);
