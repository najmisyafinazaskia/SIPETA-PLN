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

        // Gunakan findOneAndUpdate dengan upsert agar atomik dan mencegah race condition
        const filter = { dusunId };
        const update = {
            fileName: file.originalname,
            filePath: uploadResult.path,
            publicId: uploadResult.publicId,
            uploadedBy: userId,
            status: 'Menunggu Verifikasi', // Selalu reset ke status awal setelah upload baru
            message: null // Clear message lama
        };

        // Jika ada file lama, hapus dulu dari cloud storage (opsional, tapi bagus untuk kebersihan)
        // Kita cari dulu dokumen lama untuk mendapatkan publicId-nya
        const existingVerification = await Verification.findOne({ dusunId });
        if (existingVerification && existingVerification.publicId) {
            try {
                await storageService.deleteFile(existingVerification.publicId);
            } catch (err) {
                console.error("[UPLOAD] Gagal menghapus file lama:", err.message);
                // Lanjutkan saja, jangan block upload baru
            }
        }

        const verification = await Verification.findOneAndUpdate(filter, update, {
            new: true, // Return dokumen baru setelah update
            upsert: true, // Jika belum ada, buat baru
            setDefaultsOnInsert: true // Gunakan default schema
        });

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
