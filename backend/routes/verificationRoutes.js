const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verificationController = require('../controllers/verificationController');
const jwt = require('jsonwebtoken');

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

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/verifications/';
        // Pastikan folder ada
        const fs = require('fs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Hanya file PDF yang diperbolehkan!"), false);
        }
    }
});

router.get('/', verificationController.getAllVerifications);
router.get('/:dusunId', verificationController.getVerification);
router.post('/upload/:dusunId', verifyToken, upload.single('document'), verificationController.uploadFile);
router.delete('/:dusunId', verifyToken, verificationController.deleteVerification);

module.exports = router;
