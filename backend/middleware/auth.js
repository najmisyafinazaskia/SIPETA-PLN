const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "No token provided." });

    const bearer = token.split(' ');
    const tokenVal = bearer[bearer.length - 1];

    jwt.verify(tokenVal, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized." });
        req.userId = decoded.id;
        next();
    });
};

const authorizeUploader = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verifikator (UP2K) dilarang upload/delete karena tugas mereka memverifikasi
        if (user.unit === "UP2K") {
            return res.status(403).json({
                message: "Akses Ditolak: Unit UP2K bertugas sebagai verifikator dan tidak diperbolehkan mengunggah atau menghapus dokumen."
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server saat validasi peran." });
    }
};

const authorizeVerifier = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Hanya UP2K atau Superadmin yang boleh verifikasi
        if (user.unit !== "UP2K" && user.role !== "superadmin") {
            return res.status(403).json({
                message: "Akses Ditolak: Hanya tim UP2K atau Super Admin yang diperbolehkan melakukan verifikasi dokumen."
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server saat validasi peran." });
    }
};

module.exports = { verifyToken, authorizeUploader, authorizeVerifier };
