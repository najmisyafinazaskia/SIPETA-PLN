const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' }, // e.g., 'info', 'warning', 'success', 'upload'
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who triggered the notification
    userName: { type: String }, // Cache user name for easy display
    isRead: { type: Boolean, default: false }, // This might be tricky if "visible to all" means global. Usually we track per user.
    // However, if it's "global" and we don't have many users, maybe we just show the latest.
    // I'll add isRead but maybe not use it strictly per user for now unless specified.
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
