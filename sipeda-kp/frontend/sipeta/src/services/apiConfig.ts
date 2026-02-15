
const rawApiUrl = API_URL || 'http://localhost:5055';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

const rawUrl = API_URL || "http://localhost:5055";

// Menghapus trailing slash jika ada untuk mencegah double slash (//) di URL
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
