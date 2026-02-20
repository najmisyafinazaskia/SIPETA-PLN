const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5055";

// Menghapus trailing slash jika ada untuk mencegah double slash (//) di URL
// Kita bersihkan secara agresif (menggunakan regex untuk menghapus lebih dari satu / di akhir)
export const API_URL = rawUrl.replace(/\/+$/, '');

console.log("Global API URL set to:", API_URL);
