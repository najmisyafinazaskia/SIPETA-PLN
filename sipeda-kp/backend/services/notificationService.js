const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
    async getNotifications(userId) {
        return await Notification.find({
            deletedBy: { $ne: userId }
        })
            .sort({ createdAt: -1 })
            .limit(20);
    }

    async createNotification(data, userId) {
        const { title, message, type, userName } = data;
        const notification = new Notification({
            title,
            message,
            type,
            user: userId,
            userName
        });
        return await notification.save();
    }

    async markAsRead(id, userId) {
        return await Notification.findByIdAndUpdate(id, {
            $addToSet: { readBy: userId }
        });
    }

    async markAllAsRead(userId) {
        const now = new Date();
        await User.findByIdAndUpdate(userId, { lastReadNotificationsAt: now });
        await Notification.updateMany(
            { deletedBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );
        return now;
    }

    async updateLastReadAt(userId) {
        const now = new Date();
        await User.findByIdAndUpdate(userId, { lastReadNotificationsAt: now });
        return now;
    }

    async clearAll(userId) {
        return await Notification.updateMany(
            {},
            { $addToSet: { deletedBy: userId } }
        );
    }
}

module.exports = new NotificationService();
