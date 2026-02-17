const dotenv = require('dotenv');
dotenv.config();
// Server restarted after resource type change
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const locationRoutes = require('./routes/locationRoutes');
const path = require('path');
const ensureDbConnected = require('./middleware/dbCheck');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Mengizinkan semua origin (karena origin: '*' tidak bisa digunakan dengan credentials: true)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));
app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json());
app.use(ensureDbConnected); // Penjaga koneksi DB untuk semua rute API

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection Handling for Vercel (Serverless)
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  console.log('🔄 Attemping new MongoDB connection...');
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10, // Dikurangi untuk serverless agar tidak menghabiskan koneksi Atlas
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    cachedDb = db;
    console.log('✅ MongoDB Connected to Atlas');
    return db;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Kita tidak lempar error di sini agar server/fungsi tetap nyala, 
    // middleware dbCheck yang akan menangani request jika koneksi gagal.
  }
}

// Jalankan koneksi awal
connectToDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/locations', locationRoutes);

app.get('/', (req, res) => res.send('SIPETA Backend API Running'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.message);
  res.status(err.status || 500).json({
    message: err.message || "Terjadi kesalahan internal pada server",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Modifikasi untuk Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
