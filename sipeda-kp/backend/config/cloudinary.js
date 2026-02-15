const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verifikasi config
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary environment variables are missing!');
} else {
    console.log('☁️ Cloudinary Configuration Detected for:', process.env.CLOUDINARY_CLOUD_NAME);
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf';
        const cleanName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
        return {
            folder: 'sipeta/verifications',
            resource_type: 'auto', // Biarkan Cloudinary mendeteksi tipe file (PDF bisa jadi image asset)
            public_id: `${cleanName}-${Date.now()}`,
        };
    },
});

// Assuming this block is intended to be a new function or part of a controller
// This is a placeholder for where this logic might be integrated,
// as the provided snippet is not a complete, standalone function.
// For example, it could be a middleware or a utility function.
/*
const generateSignedUrl = (publicId, fileName, isPreview, isRemote, res) => {
    if (isRemote && publicId) {
        // Tentukan resource_type berdasarkan publicId atau nama file
        const isPdf = fileName.toLowerCase().endsWith('.pdf') || publicId.endsWith('.pdf');
        
        const signedUrl = cloudinary.url(publicId, {
            sign_url: true,
            secure: true,
            resource_type: isPdf ? 'raw' : 'image',
            flags: isPreview ? undefined : 'attachment',
            expires_at: Math.floor(Date.now() / 1000) + 3600
        });
        
        console.log(`[SIGNED_URL] Generated for ${fileName}: ${signedUrl}`);
        return res.redirect(signedUrl);
    }
};
*/

module.exports = {
    cloudinary,
    storage
};
