const Verification = require('../models/Verification');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

class VerificationService {
    async uploadFile(userId, dusunId, dusunName, file) {
        if (!file) throw new Error("File wajib diunggah.");

        let verification = await Verification.findOne({ dusunId });

        if (verification) {
            const oldPath = path.join(__dirname, '..', verification.filePath);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

            verification.fileName = file.originalname;
            verification.filePath = file.path.replace(/\\/g, '/');
            verification.uploadedBy = userId;
            verification.status = 'Menunggu Verifikasi';
            await verification.save();
        } else {
            verification = new Verification({
                dusunId,
                fileName: file.originalname,
                filePath: file.path.replace(/\\/g, '/'),
                uploadedBy: userId,
                status: 'Menunggu Verifikasi'
            });
            await verification.save();
        }

        const user = await User.findById(userId);
        const newNotif = new Notification({
            title: "Pembaruan Verifikasi",
            message: `${user ? user.name : 'Seorang pengguna'} telah mengunggah dokumen baru untuk ${dusunName || 'Dusun (' + dusunId + ')'}`,
            type: "upload",
            user: userId,
            userName: user ? user.name : "Admin"
        });
        await newNotif.save();

        return { verification, notification: newNotif };
    }

    async getVerification(dusunId) {
        return await Verification.findOne({ dusunId }).populate('uploadedBy', 'name');
    }

    async getAllVerifications() {
        return await Verification.find().populate('uploadedBy', 'name');
    }

    async deleteVerification(dusunId) {
        const verification = await Verification.findOne({ dusunId });
        if (!verification) throw new Error("Data tidak ditemukan");

        const filePath = path.join(__dirname, '..', verification.filePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await Verification.deleteOne({ _id: verification._id });
        return true;
    }

    async updateStatus(userId, dusunId, status, message, dusunName) {
        const validStatuses = ['Menunggu Verifikasi', 'Terverifikasi', 'Tidak Sesuai', 'Sesuai (Perlu Perbaikan)'];
        if (!validStatuses.includes(status)) throw new Error("Status tidak valid");

        const verification = await Verification.findOne({ dusunId });
        if (!verification) throw new Error("Data verifikasi tidak ditemukan");

        verification.status = status;
        verification.message = message || "";
        await verification.save();

        const user = await User.findById(userId);
        const displayDusunName = dusunName ? `Berita Acara ${dusunName}` : `Dokumen verifikasi untuk ${dusunId}`;
        let notificationMessage = `Status ${displayDusunName} telah diubah menjadi "${status}" oleh ${user ? user.name : 'Admin'}`;

        if (message && (status === 'Tidak Sesuai' || status === 'Sesuai (Perlu Perbaikan)')) {
            notificationMessage += `. Alasan: ${message}`;
        }

        const newNotif = new Notification({
            title: "Pembaruan Status Verifikasi",
            message: notificationMessage,
            type: "update",
            user: userId,
            userName: user ? user.name : "Admin"
        });
        await newNotif.save();

        return verification;
    }

    async getFilePath(dusunId) {
        const verification = await Verification.findOne({ dusunId });
        if (!verification) throw new Error("Data tidak ditemukan");
        const absolutePath = path.join(__dirname, '..', verification.filePath);
        if (!fs.existsSync(absolutePath)) throw new Error("File fisik tidak ditemukan di server");
        return { absolutePath, fileName: verification.fileName };
    }
}

module.exports = new VerificationService();
