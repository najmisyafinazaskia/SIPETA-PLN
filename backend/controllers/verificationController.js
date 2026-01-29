const Verification = require('../models/Verification');
const path = require('path');
const fs = require('fs');

// Konfigurasi Multer biasanya dilakukan di Routes, tapi logic simpan ke DB di sini
exports.uploadFile = async (req, res) => {
    try {
        const { dusunId } = req.params;
        const { dusunName } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "File wajib diunggah." });
        }

        // Cari apakah sudah ada verifikasi untuk dusun ini
        let verification = await Verification.findOne({ dusunId });

        if (verification) {
            // Jika ada, hapus file lama dari storage (Opsional tapi disarankan agar tidak penuh)
            const oldPath = path.join(__dirname, '..', verification.filePath);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            // Update record
            verification.fileName = file.originalname;
            verification.filePath = file.path.replace(/\\/g, '/'); // Normalize path
            verification.uploadedBy = req.userId;
            await verification.save();
        } else {
            // Jika belum ada, buat baru
            verification = new Verification({
                dusunId,
                fileName: file.originalname,
                filePath: file.path.replace(/\\/g, '/'),
                uploadedBy: req.userId
            });
            await verification.save();
        }

        // Create Notification
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        const user = await User.findById(req.userId);

        const newNotif = new Notification({
            title: "Pembaruan Verifikasi",
            message: `${user ? user.name : 'Seorang pengguna'} telah mengunggah dokumen baru untuk ${dusunName || 'Dusun (' + dusunId + ')'}`,
            type: "upload",
            user: req.userId,
            userName: user ? user.name : "Admin"
        });
        await newNotif.save();

        res.status(200).json({
            message: "File berhasil diunggah/diperbarui",
            data: verification,
            notification: newNotif
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Gagal mengunggah file", error: error.message });
    }
};

exports.getVerification = async (req, res) => {
    try {
        const { dusunId } = req.params;
        const verification = await Verification.findOne({ dusunId });

        if (!verification) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        res.json(verification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllVerifications = async (req, res) => {
    try {
        const verifications = await Verification.find();
        res.json(verifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
