const API_URL = 'http://localhost:5000/api/locations';

export interface LocationData {
    desa: string;
    x: number;
    y: number;
}

export interface LocationStats {
    summary: {
        totalKabupatenKota: number;
        totalKecamatan: number;
        totalDesa: number;
    };
    details: Array<{
        kabupatenKota: string;
        kecamatanCount: number;
        desaCount: number;
    }>;
}

export const locationService = {
    /**
     * Get all kabupaten/kota
     */
    async getKabupatenKota(): Promise<string[]> {
        try {
            const response = await fetch(`${API_URL}/kabupaten-kota`);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error fetching kabupaten/kota:', error);
            return [];
        }
    },

    /**
     * Get kecamatan by kabupaten/kota
     */
    async getKecamatan(kabupatenKota: string): Promise<string[]> {
        try {
            const response = await fetch(
                `${API_URL}/kecamatan/${encodeURIComponent(kabupatenKota)}`
            );
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error fetching kecamatan:', error);
            return [];
        }
    },

    /**
     * Get desa by kabupaten/kota and kecamatan
     */
    async getDesa(
        kabupatenKota: string,
        kecamatan: string
    ): Promise<LocationData[]> {
        try {
            const response = await fetch(
                `${API_URL}/desa/${encodeURIComponent(kabupatenKota)}/${encodeURIComponent(kecamatan)}`
            );
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error fetching desa:', error);
            return [];
        }
    },

    /**
     * Get all locations with optional filters
     */
    async getAllLocations(filters?: {
        kabupatenKota?: string;
        kecamatan?: string;
    }): Promise<any[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.kabupatenKota) {
                params.append('kabupatenKota', filters.kabupatenKota);
            }
            if (filters?.kecamatan) {
                params.append('kecamatan', filters.kecamatan);
            }

            const url = `${API_URL}/all${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error fetching all locations:', error);
            return [];
        }
    },

    /**
     * Get location statistics
     */
    async getStats(): Promise<LocationStats | null> {
        try {
            const response = await fetch(`${API_URL}/stats`);
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    },
};
