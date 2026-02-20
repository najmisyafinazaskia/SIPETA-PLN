const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- HELPER: SEND EMAIL ---
// Untuk production, ganti dengan SMTP Gmail / hosting asli
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // e.g. 'kou.lupa@gmail.com'
        pass: process.env.EMAIL_PASS  // App Password
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        if (!process.env.EMAIL_USER) {
            console.log("\n==================================================================");
            console.log("[PENTING] EMAIL_USER belum diset di .env backend!");
            console.log(`[SIMULASI EMAIL] Ke: ${to}`);
            console.log(`[SIMULASI EMAIL] Subject: ${subject}`);
            console.log(`[SIMULASI EMAIL] Isi Pesan (OTP): ${text}`);
            console.log("==================================================================\n");
            return;
        }
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log(`[SUCCESS] Email sent to ${to}`);
    } catch (error) {
        console.error("\n[ERROR] Gagal mengirim email. Cek koneksi internet atau password aplikasi Gmail Anda.");
        console.error("Detail Error:", error.message);
        console.log("------------------------------------------------------------------");
        console.log(`[FALLBACK LOG] OTP untuk ${to} adalah: ${text}`); // Fallback supaya user tetap bisa login meski email gagal
        console.log("------------------------------------------------------------------\n");
    }
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- CONTROLLERS ---

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            otp,
            otpExpires
        });

        await newUser.save();

        // Kirim OTP
        await sendEmail(email, "Kode Verifikasi SIPETA", `Kode OTP Anda adalah: ${otp}. Berlaku selama 10 menit.`);

        res.status(201).json({ message: "Registrasi berhasil. Silakan cek email untuk kode OTP." });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            message: "Something went wrong during registration.",
            error: error.message,
            suggest: "Pastikan MongoDB sudah berjalan (mongod) dan koneksi internet tersedia."
        });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Kode OTP salah atau kadaluarsa." });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: "Verifikasi berhasil.", token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cek login via username ATAU email (untuk fleksibilitas)
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Password salah." });

        if (!user.isVerified) {
            return res.status(403).json({ message: "Akun belum diverifikasi." });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                phone: user.phone,
                unit: user.unit,
                lastReadNotificationsAt: user.lastReadNotificationsAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email tidak terdaftar." });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendEmail(email, "Reset Password SIPETA", `Kode OTP Reset Password Anda: ${otp}`);

        res.json({ message: "Kode OTP telah dikirim ke email." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User tidak ditemukan." });
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP salah atau kadaluarsa." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: "Password berhasil diubah. Silakan login." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, email, password } = req.body; // Email & Password changes
        const user = await User.findById(req.userId);

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (email) user.email = email;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();
        res.json({ message: "Profil berhasil diperbarui.", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Google login removed.
