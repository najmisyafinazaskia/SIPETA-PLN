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
            // Tunggu maksimal 8 detik untuk koneksi
            await Promise.race([
                mongoose.connect(process.env.MONGO_URI),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
            ]);
            console.log("✅ DB Connected successfully through middleware.");
            next();
        } catch (err) {
            console.error("❌ DB Connection failed through middleware:", err.message);
            // Tetap lanjut ke next() agar fallback logic di service bisa jalan (khusus login)
            // Tapi untuk rute data lain, next() mungkin akan tetap mengembalikan data kosong.
            next();
        }
    } else {
        next();
    }
};

module.exports = ensureDbConnected;
