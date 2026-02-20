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
            verification.status = 'Menunggu Verifikasi'; // Reset status on re-upload
            await verification.save();
        } else {
            // Jika belum ada, buat baru
            verification = new Verification({
                dusunId,
                fileName: file.originalname,
                filePath: file.path.replace(/\\/g, '/'),
                uploadedBy: req.userId,
                status: 'Menunggu Verifikasi'
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
        const verification = await Verification.findOne({ dusunId }).populate('uploadedBy', 'name');

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
        const verifications = await Verification.find().populate('uploadedBy', 'name');
        res.json(verifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVerification = async (req, res) => {
    try {
        const { dusunId } = req.params;
        const verification = await Verification.findOne({ dusunId });

        if (!verification) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        // Hapus file fisik
        const filePath = path.join(__dirname, '..', verification.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Hapus data dari DB
        await Verification.deleteOne({ _id: verification._id });

        res.status(200).json({ message: "Verifikasi berhasil dihapus" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Gagal menghapus verifikasi", error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { dusunId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Menunggu Verifikasi', 'Terverifikasi', 'Tidak Sesuai', 'Sesuai (Perlu Perbaikan)'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Status tidak valid" });
        }

        const verification = await Verification.findOne({ dusunId });
        if (!verification) {
            return res.status(404).json({ message: "Data verifikasi tidak ditemukan" });
        }

        verification.status = status;
        await verification.save();

        // Create Notification
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        const user = await User.findById(req.userId);

        const newNotif = new Notification({
            title: "Pembaruan Status Verifikasi",
            message: `Status dokumen verifikasi untuk ${dusunId} telah diubah menjadi "${status}" oleh ${user ? user.name : 'Admin'}`,
            type: "update",
            user: req.userId,
            userName: user ? user.name : "Admin"
        });
        await newNotif.save();

        res.status(200).json({
            message: "Status berhasil diperbarui",
            data: verification
        });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: "Gagal memperbarui status", error: error.message });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const { dusunId } = req.params;
        const verification = await Verification.findOne({ dusunId });

        if (!verification) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        const absolutePath = path.join(__dirname, '..', verification.filePath);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: "File fisik tidak ditemukan di server" });
        }

        // Set attachment header explicitly to force download
        res.download(absolutePath, verification.fileName);
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Gagal mengunduh file", error: error.message });
    }
};
