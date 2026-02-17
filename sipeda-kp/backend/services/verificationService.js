const Verification = require('../models/Verification');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

const storageService = require('./storageService');

class VerificationService {
    async uploadFile(userId, dusunId, dusunName, file) {
        console.log(`[UPLOAD] Memulai upload untuk Dusun: ${dusunName} (${dusunId})`);

        // --- GUARD: Blokir Fallback ID agar tidak merusak database ---
        if (userId === "fallback-id") {
            console.error('[UPLOAD] Percobaan upload menggunakan session fallback ditolak.');
            throw new Error("Sesi Anda tidak valid (Session Fallback). Silakan Keluar (Logout) dan Masuk kembali untuk melanjutkan.");
        }

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

    async getUploadUrl(fileName) {
        return await storageService.createSignedUploadUrl(fileName);
    }

    async finalizeDirectUpload(userId, dusunId, dusunName, fileInfo) {
        console.log(`[FINALIZE] Memfinalisasi upload untuk Dusun: ${dusunName} (${dusunId})`);

        if (userId === "fallback-id") {
            throw new Error("Sesi tidak valid.");
        }

        const filter = { dusunId };
        const update = {
            fileName: fileInfo.fileName,
            filePath: fileInfo.filePath, // Public URL
            publicId: fileInfo.publicId, // Storage path
            uploadedBy: userId,
            status: 'Menunggu Verifikasi',
            message: null
        };

        const existingVerification = await Verification.findOne({ dusunId });
        if (existingVerification && existingVerification.publicId) {
            try {
                await storageService.deleteFile(existingVerification.publicId);
            } catch (err) {
                console.error("[FINALIZE] Gagal menghapus file lama:", err.message);
            }
        }

        const verification = await Verification.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        });

        const user = await User.findById(userId);
        const displayName = user ? (user.unit ? `${user.unit} - ${user.name}` : user.name) : "Admin";

        const newNotif = new Notification({
            title: "Pembaruan Verifikasi",
            message: `${displayName} telah mengunggah dokumen baru untuk ${dusunName || 'Dusun (' + dusunId + ')'}`,
            type: "upload",
            user: userId,
            userName: displayName
        });
        await newNotif.save();

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

        // SMART DELETE: Hanya hapus file fisik jika tidak ada desa lain yang menggunakannya
        if (verification.publicId) {
            const usageCount = await Verification.countDocuments({ publicId: verification.publicId });
            if (usageCount <= 1) {
                try {
                    await storageService.deleteFile(verification.publicId);
                } catch (err) {
                    console.error(`[DELETE_FILE_ERR] Gagal hapus file fisico: ${err.message}`);
                }
            } else {
                console.log(`[SMART_DELETE] Skip hapus fisik. File masih digunakan oleh ${usageCount - 1} desa lain.`);
            }
        }

        await Verification.deleteOne({ _id: verification._id });
        return true;
    }

    async updateStatus(userId, dusunId, status, message, dusunName) {
        // --- GUARD: Blokir Fallback ID ---
        if (userId === "fallback-id") {
            throw new Error("Sesi Anda tidak valid. Silakan Keluar (Logout) dan Masuk kembali untuk memproses verifikasi.");
        }

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

    async uploadKecamatan(userId, kabupaten, kecamatan, file) {
        console.log(`[UPLOAD_KECAMATAN] Memulai upload massal untuk Kecamatan: ${kecamatan}, Kabupaten: ${kabupaten}`);

        if (userId === "fallback-id") {
            throw new Error("Sesi Anda tidak valid. Silakan Keluar (Logout) dan Masuk kembali.");
        }

        const Location = require('../models/Location');
        // Cari semua desa di kecamatan tersebut
        const desas = await Location.find({
            kabupaten: new RegExp(`^${kabupaten}$`, 'i'),
            kecamatan: new RegExp(`^${kecamatan}$`, 'i')
        });

        if (desas.length === 0) {
            throw new Error("Kecamatan tidak ditemukan atau tidak memiliki desa.");
        }

        if (!file) {
            throw new Error("File wajib diunggah.");
        }

        // 1. Upload file ke storage (sekali saja untuk semua desa)
        const uploadResult = await storageService.uploadFile(file);
        console.log('[UPLOAD_KECAMATAN] File berhasil diunggah ke Supabase:', uploadResult.path);

        // 2. Update verifikasi untuk setiap desa
        for (const desa of desas) {
            const dusunId = desa._id.toString();
            const filter = { dusunId };
            const update = {
                fileName: file.originalname,
                filePath: uploadResult.path,
                publicId: uploadResult.publicId,
                uploadedBy: userId,
                status: 'Menunggu Verifikasi',
                message: null
            };

            // Opsional: Hapus file lama jika ada
            const existingVerification = await Verification.findOne({ dusunId });
            if (existingVerification && existingVerification.publicId) {
                // Hanya hapus jika publicId-nya berbeda dengan yang baru (mencegah penghapusan file yang baru diupload jika script error/retry)
                if (existingVerification.publicId !== uploadResult.publicId) {
                    try {
                        await storageService.deleteFile(existingVerification.publicId);
                    } catch (err) {
                        console.error(`[UPLOAD_KECAMATAN] Gagal menghapus file lama untuk ${desa.desa}:`, err.message);
                    }
                }
            }

            await Verification.findOneAndUpdate(filter, update, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            });
        }

        // 3. Buat notifikasi tunggal
        const user = await User.findById(userId);
        const displayName = user ? (user.unit ? `${user.unit} - ${user.name}` : user.name) : "Admin";

        const newNotif = new Notification({
            title: "Pembaruan Verifikasi Massal",
            message: `${displayName} telah mengunggah dokumen baru untuk seluruh desa di Kecamatan ${kecamatan}`,
            type: "upload",
            user: userId,
            userName: displayName
        });
        await newNotif.save();

        return {
            message: `Berhasil mengunggah dokumen untuk ${desas.length} desa di Kecamatan ${kecamatan}`,
            count: desas.length,
            fileName: file.originalname,
            notification: newNotif
        };
    }

    async deleteKecamatan(userId, kabupaten, kecamatan) {
        console.log(`[DELETE_KECAMATAN] Memulai hapus massal untuk Kecamatan: ${kecamatan}`);

        if (userId === "fallback-id") {
            throw new Error("Sesi Anda tidak valid.");
        }

        const Location = require('../models/Location');
        const desas = await Location.find({
            kabupaten: new RegExp(`^${kabupaten}$`, 'i'),
            kecamatan: new RegExp(`^${kecamatan}$`, 'i')
        });

        const dusunIds = desas.map(d => d._id.toString());
        const verifications = await Verification.find({ dusunId: { $in: dusunIds } });

        if (verifications.length === 0) {
            throw new Error("Tidak ada dokumen yang ditemukan di kecamatan ini.");
        }

        // Kumpulkan publicId yang perlu dicek penghapusannya
        const uniquePublicIds = [...new Set(verifications.map(v => v.publicId).filter(Boolean))];

        // Hapus record di database
        await Verification.deleteMany({ dusunId: { $in: dusunIds } });

        // SMART DELETE untuk massal
        for (const pid of uniquePublicIds) {
            const usageCount = await Verification.countDocuments({ publicId: pid });
            if (usageCount === 0) {
                try {
                    await storageService.deleteFile(pid);
                } catch (err) {
                    console.error(`[DELETE_KECAMATAN_FILE_ERR] publicId: ${pid}, Error: ${err.message}`);
                }
            }
        }

        // Notifikasi
        const user = await User.findById(userId);
        const displayName = user ? (user.unit ? `${user.unit} - ${user.name}` : user.name) : "Admin";
        const newNotif = new Notification({
            title: "Penghapusan Berita Acara Massal",
            message: `${displayName} telah menghapus seluruh dokumen berita acara di Kecamatan ${kecamatan}`,
            type: "delete",
            user: userId,
            userName: displayName
        });
        await newNotif.save();

        return {
            message: `Berhasil menghapus ${verifications.length} dokumen di Kecamatan ${kecamatan}`,
            count: verifications.length,
            notification: newNotif
        };
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
