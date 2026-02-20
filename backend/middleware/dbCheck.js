const mongoose = require('mongoose');

/**
 * Middleware untuk memastikan koneksi database sudah siap 
 * sebelum memproses request (Penting untuk Vercel Cold Start)
 */
const ensureDbConnected = async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        console.log(`⏳ DB state: ${mongoose.connection.readyState}. Waiting for connection fix...`);

        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI missing!");
            return res.status(500).json({ message: "Konfigurasi Database tidak ditemukan." });
        }

        try {
            // Tunggu maksimal 10 detik untuk koneksi (Vercel Cold Start bisa lambat)
            await Promise.race([
                mongoose.connect(process.env.MONGO_URI),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
            ]);
            console.log("✅ DB Connected successfully through middleware.");
            next();
        } catch (err) {
            console.error("❌ DB Connection failed through middleware:", err.message);
            // Jangan gunakan next() jika database mati total agar tidak terjadi data corruption/fallback
            return res.status(503).json({
                message: "Layanan sedang dalam proses warming up (Cold Start). Mohon segarkan halaman dalam 5 detik.",
                error: "DATABASE_CONNECTION_TIMEOUT"
            });
        }
    } else {
        next();
    }
};

module.exports = ensureDbConnected;
