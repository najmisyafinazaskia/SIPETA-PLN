const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' }, // e.g., 'info', 'warning', 'success', 'upload'
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who triggered the notification
    userName: { type: String }, // Cache user name for easy display
    isRead: { type: Boolean, default: false }, // Legacy global read status, prefer readBy
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who have read this notification
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who have cleared this notification
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
