export interface RegionData {
    name: string;
    type: "stable" | "warning";
    category: string;
    kecamatan: number;
    desa: number;
    pelanggan: number;
    isVillage?: boolean;
    kecamatanList?: string[];
    desaList?: string[];
    dusun?: number;
    dusunList?: string[];
}

export const allRegions: RegionData[] = [
    // KOTA (5 Kota di Provinsi Aceh)
    {
        name: "Banda Aceh",
        type: "stable",
        category: "Kota",
        kecamatan: 9,
        desa: 90,
        pelanggan: 64210,
        kecamatanList: ["Baiturrahman", "Kuta Alam", "Meuraxa", "Syiah Kuala", "Lueng Bata", "Kuta Raja", "Banda Raya", "Jaya Baru", "Ulee Kareng"],
        desaList: ["Gampong Pande", "Lampineung", "Neusu Aceh", "Lhong Bata", "Peuniti", "Ulee Lheue", "Lambhuk", "Punge Blang Cut", "Batoh", "Mibo", "Lhong Raya", "Geuceu Komplek"],
        dusun: 360,
        dusunList: ["Dusun Melati", "Dusun Mawar", "Dusun Kamboja", "Dusun Tulipa", "Dusun Melur", "Dusun Bakti", "Dusun Damai", "Dusun Sejahtera"]
    },
    { name: "Langsa", type: "stable", category: "Kota", kecamatan: 5, desa: 66, pelanggan: 46120 },
    { name: "Lhokseumawe", type: "stable", category: "Kota", kecamatan: 4, desa: 68, pelanggan: 47820 },
    { name: "Sabang", type: "stable", category: "Kota", kecamatan: 2, desa: 18, pelanggan: 11230 },
    { name: "Subulussalam", type: "stable", category: "Kota", kecamatan: 5, desa: 82, pelanggan: 22450 },

    // KABUPATEN (18 Kabupaten di Provinsi Aceh)
    { name: "Aceh Barat", type: "stable", category: "Kabupaten", kecamatan: 12, desa: 322, pelanggan: 50210 },
    { name: "Aceh Barat Daya", type: "stable", category: "Kabupaten", kecamatan: 9, desa: 152, pelanggan: 38240 },
    { name: "Aceh Besar", type: "stable", category: "Kabupaten", kecamatan: 23, desa: 604, pelanggan: 102450 },
    { name: "Aceh Jaya", type: "stable", category: "Kabupaten", kecamatan: 9, desa: 172, pelanggan: 24310 },
    { name: "Aceh Selatan", type: "stable", category: "Kabupaten", kecamatan: 18, desa: 260, pelanggan: 58920 },
    { name: "Aceh Singkil", type: "stable", category: "Kabupaten", kecamatan: 11, desa: 116, pelanggan: 32840 },
    { name: "Aceh Tamiang", type: "stable", category: "Kabupaten", kecamatan: 12, desa: 213, pelanggan: 74620 },
    { name: "Aceh Tengah", type: "stable", category: "Kabupaten", kecamatan: 14, desa: 295, pelanggan: 54620 },
    { name: "Aceh Tenggara", type: "stable", category: "Kabupaten", kecamatan: 16, desa: 385, pelanggan: 56210 },
    { name: "Aceh Timur", type: "stable", category: "Kabupaten", kecamatan: 24, desa: 513, pelanggan: 109820 },
    { name: "Aceh Utara", type: "stable", category: "Kabupaten", kecamatan: 27, desa: 852, pelanggan: 152340 },
    { name: "Bener Meriah", type: "stable", category: "Kabupaten", kecamatan: 10, desa: 232, pelanggan: 40820 },
    { name: "Bireuen", type: "stable", category: "Kabupaten", kecamatan: 17, desa: 609, pelanggan: 110820 },
    { name: "Gayo Lues", type: "stable", category: "Kabupaten", kecamatan: 11, desa: 136, pelanggan: 23840 },
    { name: "Nagan Raya", type: "stable", category: "Kabupaten", kecamatan: 10, desa: 222, pelanggan: 42410 },
    { name: "Pidie", type: "stable", category: "Kabupaten", kecamatan: 23, desa: 730, pelanggan: 111920 },
    { name: "Pidie Jaya", type: "stable", category: "Kabupaten", kecamatan: 8, desa: 222, pelanggan: 40120 },
    { name: "Simeulue", type: "stable", category: "Kabupaten", kecamatan: 10, desa: 138, pelanggan: 23920 },

    // DESA / GAMPONG (Hanya muncul saat dicari)
    { name: "Gampong Pande", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 400, isVillage: true },
    { name: "Lampineung", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 550, isVillage: true },
    { name: "Neusu Aceh", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 480, isVillage: true },
    { name: "Lhong Bata", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 800, isVillage: true },
    { name: "Peuniti", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 300, isVillage: true },
    { name: "Baitussalam", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 280, isVillage: true },
    { name: "Ulee Lheue", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 200, isVillage: true },
    { name: "Lambhuk", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 600, isVillage: true },
    { name: "Punge Blang Cut", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 450, isVillage: true },
    { name: "Batoh", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 350, isVillage: true },
    { name: "Mibo", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 300, isVillage: true },
    { name: "Lhong Raya", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 600, isVillage: true },
    { name: "Geuceu Komplek", type: "stable", category: "Desa", kecamatan: 1, desa: 1, pelanggan: 500, isVillage: true },

    // KECAMATAN (Bisa dibuka halaman detailnya)
    {
        name: "Baiturrahman",
        type: "stable",
        category: "Kecamatan",
        kecamatan: 1,
        desa: 10,
        dusun: 45,
        pelanggan: 8500,
        desaList: ["Peuniti", "Neusu Aceh", "Suak Ribee", "Seutui"],
        dusunList: ["Dusun Melati", "Dusun Mawar", "Dusun Kamboja"]
    },
    {
        name: "Kuta Alam",
        type: "stable",
        category: "Kecamatan",
        kecamatan: 1,
        desa: 11,
        dusun: 50,
        pelanggan: 10200,
        desaList: ["Lampineung", "Mulias", "Bandar Baru"],
        dusunList: ["Dusun Bakti", "Dusun Damai"]
    },
];
