const supabase = require('../config/supabase');
const path = require('path');

class StorageService {
    async uploadFile(file, folder = 'verifications') {
        if (!file) throw new Error('File tidak ditemukan');

        const fileExt = path.extname(file.originalname);
        const fileName = `${path.parse(file.originalname).name}-${Date.now()}${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('SIPETA') // Nama bucket di Supabase
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) {
            console.error('❌ Supabase Storage Error:', error);
            throw new Error(`Gagal mengunggah file ke Supabase: ${error.message}`);
        }

        // Dapatkan URL publik
        const { data: { publicUrl } } = supabase.storage
            .from('SIPETA')
            .getPublicUrl(filePath);

        return {
            path: publicUrl,
            publicId: filePath, // Kita gunakan filePath sebagai ID untuk delete nanti
            fileName: file.originalname
        };
    }

    async createSignedUploadUrl(fileName, folder = 'verifications') {
        const fileExt = path.extname(fileName);
        const nameOnly = path.parse(fileName).name;
        const storagePath = `${folder}/${nameOnly}-${Date.now()}${fileExt}`;

        // Create a signed upload URL that lasts for 60 seconds
        const { data, error } = await supabase.storage
            .from('SIPETA')
            .createSignedUploadUrl(storagePath, 60);

        if (error) {
            console.error('❌ Supabase Signed URL Error:', error);
            throw new Error(`Gagal membuat upload URL: ${error.message}`);
        }

        return {
            signedUrl: data.signedUrl,
            token: data.token, // Some Supabase versions might return token separately or in URL
            path: storagePath,
            publicUrl: supabase.storage.from('SIPETA').getPublicUrl(storagePath).data.publicUrl
        };
    }

    async deleteFile(publicId) {
        if (!publicId) return;

        const { error } = await supabase.storage
            .from('SIPETA')
            .remove([publicId]);

        if (error) {
            console.error('❌ Supabase Delete Error:', error);
            // Jangan throw error agar proses utama (delete record) tetap jalan
        }
    }
}

module.exports = new StorageService();
