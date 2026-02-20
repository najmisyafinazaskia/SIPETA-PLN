const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

class AuthService {
    async login(username, password) {
        // --- CHECK DB CONNECTION ---
        // Di Vercel (Serverless), state koneksi bisa bervariasi. 
        // Kita pastikan koneksi siap semaksimal mungkin sebelum lanjut.
        if (mongoose.connection.readyState !== 1) {
            console.log("⏳ Database sedang bersiap (Cold Start)...");

            if (!process.env.MONGO_URI) {
                throw new Error("Konfigurasi Database (MONGO_URI) belum diatur di Environment Variables.");
            }

            try {
                // Tunggu koneksi sampai siap (max 10 detik untuk Vercel Cold Start)
                await Promise.race([
                    mongoose.connect(process.env.MONGO_URI),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
                ]);
                console.log("✅ Database berhasil terhubung.");
            } catch (err) {
                console.error("❌ Database Connection Error:", err.message);
                throw new Error("Layanan sedang sibuk atau Database offline. Silakan coba kembali dalam beberapa detik (Warming up).");
            }
        }

        // Jika setelah ditunggu tetap tidak konek (Error di luar timeout)
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Gagal terhubung ke database. Harap periksa koneksi internet server.");
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
