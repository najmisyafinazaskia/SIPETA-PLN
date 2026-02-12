const notificationService = require('../services/notificationService');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getNotifications(req.userId);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const notification = await notificationService.createNotification(req.body, req.userId);
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await notificationService.markAsRead(req.params.id, req.userId);
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const lastReadAt = await notificationService.markAllAsRead(req.userId);
        res.json({ message: "All notifications marked as read", lastReadAt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateLastReadAt = async (req, res) => {
    try {
        const lastReadAt = await notificationService.updateLastReadAt(req.userId);
        res.json({ message: "User's last read timestamp updated", lastReadAt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.clearAll = async (req, res) => {
    try {
        await notificationService.clearAll(req.userId);
        res.json({ message: "All notifications cleared for this user" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
