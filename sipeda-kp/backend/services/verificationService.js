const Verification = require('../models/Verification');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

const storageService = require('./storageService');

class VerificationService {
    async uploadFile(userId, dusunId, dusunName, file) {
        console.log(`[UPLOAD] Memulai upload untuk Dusun: ${dusunName} (${dusunId})`);
        if (!file) {
            console.error('[UPLOAD] File tidak ditemukan di request');
            throw new Error("File wajib diunggah.");
        }

        // Upload ke Supabase
        const uploadResult = await storageService.uploadFile(file);

        console.log('[UPLOAD] File berhasil diunggah ke Supabase:', uploadResult.path);

        let verification = await Verification.findOne({ dusunId });

        if (verification) {
            // Hapus file lama di Supabase jika ada
            if (verification.publicId) {
                await storageService.deleteFile(verification.publicId);
            }

            verification.fileName = file.originalname;
            verification.filePath = uploadResult.path;
            verification.publicId = uploadResult.publicId;
            verification.uploadedBy = userId;
            verification.status = 'Menunggu Verifikasi';
            verification.message = null; // Clear previous message
            await verification.save();
        } else {
            verification = new Verification({
                dusunId,
                fileName: file.originalname,
                filePath: uploadResult.path,
                publicId: uploadResult.publicId,
                uploadedBy: userId,
                status: 'Menunggu Verifikasi'
            });
            await verification.save();
        }

        const user = await User.findById(userId);

        // Buat nama tampilan yang lebih spesifik: "Unit - Nama"
        const displayName = user
            ? (user.unit ? `${user.unit} - ${user.name}` : user.name)
            : "Admin";

        const newNotif = new Notification({
            title: "Pembaruan Verifikasi",
            message: `${displayName} telah mengunggah dokumen baru untuk ${dusunName || 'Dusun (' + dusunId + ')'}`,
            type: "upload",
            user: userId,
            userName: displayName
        });
        await newNotif.save();

        // Populate uploadedBy before returning to ensure frontend has latest info
        const populatedVerification = await Verification.findById(verification._id).populate('uploadedBy', 'name username unit');

        return { verification: populatedVerification, notification: newNotif };
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

        // Hapus file di Supabase
        if (verification.publicId) {
            await storageService.deleteFile(verification.publicId);
        }

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
        const displayName = user
            ? (user.unit ? `${user.unit} - ${user.name}` : user.name)
            : "Admin";

        const displayDusunName = dusunName ? `Berita Acara ${dusunName}` : `Dokumen verifikasi untuk ${dusunId}`;
        let notificationMessage = `Status ${displayDusunName} telah diubah menjadi "${status}" oleh ${displayName}`;

        if (message && (status === 'Tidak Sesuai' || status === 'Sesuai (Perlu Perbaikan)')) {
            notificationMessage += `. Alasan: ${message}`;
        }

        const newNotif = new Notification({
            title: "Pembaruan Status Verifikasi",
            message: notificationMessage,
            type: "update",
            user: userId,
            userName: displayName
        });
        await newNotif.save();

        return verification;
    }

    async getFilePath(dusunId) {
        const verification = await Verification.findOne({ dusunId });
        if (!verification) throw new Error("Data tidak ditemukan");

        if (verification.filePath.startsWith('http')) {
            return {
                absolutePath: verification.filePath,
                fileName: verification.fileName,
                publicId: verification.publicId,
                isRemote: true
            };
        }
        const absolutePath = path.join(__dirname, '..', verification.filePath);
        if (!fs.existsSync(absolutePath)) throw new Error("File fisik tidak ditemukan di server");
        return { absolutePath, fileName: verification.fileName, isRemote: false };
    }
}

module.exports = new VerificationService();
