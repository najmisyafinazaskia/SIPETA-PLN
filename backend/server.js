const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const locationRoutes = require('./routes/locationRoutes');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (untuk akses PDF)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sipeta_db', {
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('👉 Pastikan layanan MongoDB (mongod) sudah berjalan di sistem Anda.');
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/locations', locationRoutes);

app.get('/', (req, res) => res.send('SIPETA Backend API Running'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
