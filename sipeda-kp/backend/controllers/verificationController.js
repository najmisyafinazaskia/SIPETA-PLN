const verificationService = require('../services/verificationService');

exports.uploadFile = async (req, res) => {
    try {
        const { dusunId } = req.params;
        const { dusunName } = req.body;
        const result = await verificationService.uploadFile(req.userId, dusunId, dusunName, req.file);
        res.status(200).json({
            message: "File berhasil diunggah/diperbarui",
            data: result.verification,
            notification: result.notification
        });
    } catch (error) {
        res.status(error.message.includes('wajib') ? 400 : 500).json({ message: error.message });
    }
};

exports.uploadKecamatan = async (req, res) => {
    try {
        const { kabupaten, kecamatan, skipExisting } = req.body;
        if (!kabupaten || !kecamatan) {
            return res.status(400).json({ message: "Kabupaten dan Kecamatan wajib diisi" });
        }
        const result = await verificationService.uploadKecamatan(req.userId, kabupaten, kecamatan, req.file, skipExisting === 'true');
        res.status(200).json(result);
    } catch (error) {
        res.status(error.message.includes('tidak ditemukan') ? 404 : 500).json({ message: error.message });
    }
};

exports.deleteKecamatan = async (req, res) => {
    try {
        const { kabupaten, kecamatan } = req.body;
        if (!kabupaten || !kecamatan) {
            return res.status(400).json({ message: "Kabupaten dan Kecamatan wajib diisi" });
        }
        const result = await verificationService.deleteKecamatan(req.userId, kabupaten, kecamatan);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.message.includes('tidak ditemukan') ? 404 : 500).json({ message: error.message });
    }
};

exports.getUploadUrl = async (req, res) => {
    try {
        const { fileName } = req.query;
        if (!fileName) return res.status(400).json({ message: "Nama file wajib ada" });
        const result = await verificationService.getUploadUrl(fileName);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.finalizeDirectUpload = async (req, res) => {
    try {
        const { dusunId } = req.params;
        const { dusunName, fileInfo } = req.body;
        const result = await verificationService.finalizeDirectUpload(req.userId, dusunId, dusunName, fileInfo);
        res.status(200).json({
            message: "File berhasil diverifikasi dan disimpan",
            data: result.verification,
            notification: result.notification
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getVerification = async (req, res) => {
    try {
        const verification = await verificationService.getVerification(req.params.dusunId);
        if (!verification) return res.status(404).json({ message: "Data tidak ditemukan" });
        res.json(verification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllVerifications = async (req, res) => {
    try {
        const verifications = await verificationService.getAllVerifications();
        res.json(verifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVerification = async (req, res) => {
    try {
        await verificationService.deleteVerification(req.params.dusunId);
        res.status(200).json({ message: "Verifikasi berhasil dihapus" });
    } catch (error) {
        res.status(error.message.includes('tidak ditemukan') ? 404 : 500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { dusunId } = req.params;
        const { status, message, dusunName } = req.body;
        const verification = await verificationService.updateStatus(req.userId, dusunId, status, message, dusunName);
        res.status(200).json({ message: "Status berhasil diperbarui", data: verification });
    } catch (error) {
        res.status(error.message.includes('valid') ? 400 : (error.message.includes('ditemukan') ? 404 : 500)).json({ message: error.message });
    }
};

const { cloudinary } = require('../config/cloudinary');
const https = require('https');

exports.downloadFile = async (req, res) => {
    try {
        const { absolutePath, fileName, isRemote } = await verificationService.getFilePath(req.params.dusunId);
        const isPreview = req.query.preview === 'true';

        if (isRemote) {
            console.log(`[FULL_PROXY] Fetching & Serving: ${absolutePath}`);
            const https = require('https');

            https.get(absolutePath, (remoteRes) => {
                // Hanya layani jika status 200 OK
                if (remoteRes.statusCode === 200) {
                    const disposition = isPreview ? 'inline' : `attachment; filename="${fileName}"`;
                    res.setHeader('Content-Disposition', disposition);
                    res.setHeader('Content-Type', fileName.endsWith('.pdf') ? 'application/pdf' : (remoteRes.headers['content-type'] || 'application/octet-stream'));

                    remoteRes.pipe(res);
                } else {
                    console.error(`[PROXY_FAIL] Status: ${remoteRes.statusCode} for ${absolutePath}`);
                    // Jika file tidak ditemukan di Supabase, kirim status 404
                    // Gunakan res.status(404).send() agar browser/iframe menampilkan error default, bukan JSON redirect
                    res.status(404).send('File tidak ditemukan di cloud storage. Silakan hubungi admin atau unggah ulang.');
                }
            }).on('error', (e) => {
                console.error(`[PROXY_ERR] ${e.message}`);
                res.status(500).send('Terjadi kesalahan saat mengambil file dari storage.');
            });
            return;
        }

        if (isPreview) {
            res.sendFile(absolutePath);
        } else {
            res.download(absolutePath, fileName);
        }
    } catch (error) {
        console.error('[DOWNLOAD_ERROR]:', error.message);
        // Kirim status 404 sederhana agar iframe menampilkan halaman error browser, bukan JSON
        res.status(404).send('File tidak ditemukan');
    }
};
