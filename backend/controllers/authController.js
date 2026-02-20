const authService = require('../services/authService');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.json(result);
    } catch (error) {
        const statusCode = error.message.includes('offline') ? 503 :
            (error.message.includes('tidak ditemukan') ? 44 : 400);
        // Note: 404 for not found, but let's stick to simple 400 or original logic
        res.status(statusCode === 44 ? 404 : statusCode).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await authService.getProfile(req.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const result = await authService.updateProfile(req.userId, req.body);
        res.json({ message: "Profil berhasil diperbarui.", user: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Placeholder for other routes if needed in the future
exports.register = (req, res) => res.status(501).json({ message: "Not implemented" });
exports.verifyOtp = (req, res) => res.status(501).json({ message: "Not implemented" });
