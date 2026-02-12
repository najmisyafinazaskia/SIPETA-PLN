const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// --- FALLBACK USERS ---
const FALLBACK_USERS = [
    { username: "sipeta_up2k_01", password: "SipetaUp2k#01!", name: "Admin UP2K 01", role: "superadmin", unit: "UP2K" },
    { username: "sipeta_up2k_02", password: "SipetaUp2k#02!", name: "Admin UP2K 02", role: "superadmin", unit: "UP2K" },
    { username: "sipeta_up3_bna", password: "SipetaBNA#26!", name: "Admin UP3 Banda Aceh", role: "admin", unit: "Banda Aceh" },
    { username: "sipeta_up3_lgs", password: "SipetaLGS#26!", name: "Admin UP3 Langsa", role: "admin", unit: "Langsa" },
    { username: "sipeta_up3_sgi", password: "SipetaSGI#26!", name: "Admin UP3 Sigli", role: "admin", unit: "Sigli" },
    { username: "sipeta_up3_lsm", password: "SipetaLSM#26!", name: "Admin UP3 Lhokseumawe", role: "admin", unit: "Lhokseumawe" },
    { username: "sipeta_up3_mbo", password: "SipetaMBO#26!", name: "Admin UP3 Meulaboh", role: "admin", unit: "Meulaboh" },
    { username: "sipeta_up3_sbl", password: "SipetaSBL#26!", name: "Admin UP3 Subulussalam", role: "admin", unit: "Subulussalam" }
];

class AuthService {
    async login(username, password) {
        // --- CHECK DB CONNECTION ---
        if (mongoose.connection.readyState !== 1) {
            console.log("⚠️ DB Offline. Using Fallback Login...");
            const fallbackUser = FALLBACK_USERS.find(u => u.username === username && u.password === password);
            if (fallbackUser) {
                const token = jwt.sign({ id: "fallback-id" }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
                return {
                    token,
                    user: { ...fallbackUser, id: "fallback-id", isVerified: true }
                };
            }
            throw new Error("Database offline dan kredensial tidak cocok.");
        }

        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) throw new Error("User tidak ditemukan.");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Password salah.");

        if (!user.isVerified) throw new Error("Akun belum diverifikasi.");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                phone: user.phone,
                unit: user.unit,
                role: user.role,
                lastReadNotificationsAt: user.lastReadNotificationsAt
            }
        };
    }

    async getProfile(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) throw new Error("User tidak ditemukan.");
        return user;
    }

    async updateProfile(userId, data) {
        const { name, phone, email, password } = data;
        const user = await User.findById(userId);
        if (!user) throw new Error("User tidak ditemukan.");

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (email) user.email = email;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            unit: user.unit
        };
    }
}

module.exports = new AuthService();
