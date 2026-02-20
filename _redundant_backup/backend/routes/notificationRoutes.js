const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const jwt = require('jsonwebtoken');

// Middleware sederhana untuk proteksi route
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

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.put('/read-all', verifyToken, notificationController.markAllAsRead);
router.put('/update-last-read', verifyToken, notificationController.updateLastReadAt);
router.delete('/clear', verifyToken, notificationController.clearAll);

module.exports = router;
