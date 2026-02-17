const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Middleware Proteksi
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

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Hanya file PDF dan Gambar (JPG/PNG) yang diperbolehkan!"), false);
        }
    }
});

router.get('/', verificationController.getAllVerifications);
router.get('/:dusunId', verificationController.getVerification);
router.get('/download/:dusunId', verificationController.downloadFile);
router.post('/upload/:dusunId', verifyToken, (req, res, next) => {
    upload.single('document')(req, res, (err) => {
        if (err) {
            console.error('❌ Multer Error:', err);
            return res.status(500).json({
                message: "Gagal memproses file",
                error: err.message
            });
        }
        next();
    });
}, verificationController.uploadFile);
router.put('/status/:dusunId', verifyToken, verificationController.updateStatus);
router.delete('/:dusunId', verifyToken, verificationController.deleteVerification);

module.exports = router;
