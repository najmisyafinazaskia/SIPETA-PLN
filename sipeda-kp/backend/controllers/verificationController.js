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

exports.downloadFile = async (req, res) => {
    try {
        const { absolutePath, fileName } = await verificationService.getFilePath(req.params.dusunId);
        res.download(absolutePath, fileName);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
