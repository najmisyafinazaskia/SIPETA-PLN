const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    unit: { type: String }, // To store Unit/UP3 info
    photo: { type: String }, // Profile photo URL
    phone: { type: String },
    isVerified: { type: Boolean, default: true }, // Auto verified for these seeded users
    lastReadNotificationsAt: { type: Date, default: Date.now }, // Tracking read status per user
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
