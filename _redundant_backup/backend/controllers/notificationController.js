const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        // Fetch last 20 notifications that haven't been deleted by this user
        const notifications = await Notification.find({
            deletedBy: { $ne: req.userId }
        })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const { title, message, type, userName } = req.body;
        const notification = new Notification({
            title,
            message,
            type,
            user: req.userId,
            userName
        });
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const User = require('../models/User');
        const now = new Date();
        await User.findByIdAndUpdate(req.userId, { lastReadNotificationsAt: now });
        res.json({ message: "All notifications marked as read", lastReadAt: now });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateLastReadAt = async (req, res) => {
    try {
        const User = require('../models/User');
        const now = new Date();
        await User.findByIdAndUpdate(req.userId, { lastReadNotificationsAt: now });
        res.json({ message: "User's last read timestamp updated", lastReadAt: now });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.clearAll = async (req, res) => {
    try {
        // Soft delete for the current user only
        await Notification.updateMany(
            {},
            { $addToSet: { deletedBy: req.userId } }
        );
        res.json({ message: "All notifications cleared for this user" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
