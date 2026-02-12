export type ULPData = {
    kabupaten: string;
    ulps: {
        name: string;
        kecamatans: {
            name: string;
            desas: string[];
        }[];
    }[];
};

export const ulpData: ULPData[] = [
    {
        kabupaten: "ACEH SELATAN",
        ulps: [
            {
                name: "ULP Kota Fajar",
                kecamatans: [
                    { name: "Bakongan", desas: ["Keude Bakongan", "Ujong Mangki", "Gampong Drien"] }
                ]
            },
            {
                name: "ULP Aceh Selatan",
                kecamatans: [
                    { name: "Kluet Utara", desas: ["Fajar Harapan", "Krueng Batee", "Pulo Kambing", "Kotafajar"] },
                    { name: "Kluet Selatan", desas: ["Suaq Bakung", "Rantau Binuang", "Pasie Lembang"] },
                    { name: "Pasi Raja", desas: ["Ladang Teungoh", "Pucok Krueng", "Silolo", "Gampong Baro"] },
                    { name: "Kluet Tengah", desas: ["Koto", "Malaka", "Simpang Tiga", "Mersak"] },
                    { name: "Trumon Timur", desas: ["Pinto Rimba", "Krueng Luas", "Seuneubok Jaya"] }
                ]
            },
            {
                name: "ULP Labuhan Haji",
                kecamatans: [
                    { name: "Labuhanhaji", desas: ["Bakau Hulu", "Pasar Lama", "Pawoh", "Kota Palak"] },
                    { name: "Meukek", desas: ["Kuta Buloh", "Ie Dingen", "Drien Jalo", "Keude Meukek"] },
                    { name: "Labuhan Haji Barat", desas: ["Tutong", "Peulokan", "Blang Baru", "Pulo Ie"] }
                ]
            },
            {
                name: "ULP Tapak Tuan",
                kecamatans: [
                    { name: "Samadua", desas: ["Dalam", "Subarang", "Madat", "Suaq Hulu", "Arafah"] },
                    { name: "Sawang", desas: ["Sikulat", "Meuligo", "Lhok Pawoh", "Sawang Ba'u"] },
                    { name: "Tapaktuan", desas: ["Lhok Keutapang", "Hilir", "Hulu", "Pasar", "Batu Itam"] },
                    { name: "Trumon", desas: ["Keude Trumon", "Sigleng", "Raket", "Padang Harapan"] }
                ]
            }
        ]
    },
    {
        kabupaten: "ACEH TENGGARA",
        ulps: [
            {
                name: "ULP Kuta Cane",
                kecamatans: [
                    { name: "Lawe Alas", desas: ["Engkeran", "Pasir Bangun", "Muara Baru", "Pulo Gadung"] },
                    { name: "Babussalam", desas: ["Kota Kutacane", "Pulonas", "Gumpang Jaya", "Mendabe"] },
                    { name: "Badar", desas: ["Salang Alas", "Kuta Tinggi", "Natam", "Tanah Merah"] },
                    { name: "Babul Makmur", desas: ["Pardomuan", "Lawe Desky", "Kute Bakti", "Sejahtera"] },
                    { name: "Leuser", desas: ["Tanjung Sari", "Naga Timbul", "Suka Damai", "Sepakat"] }
                ]
            }
        ]
    },
    {
        kabupaten: "ACEH TIMUR",
        ulps: [
            {
                name: "ULP Idi",
                kecamatans: [
                    { name: "Darul Aman", desas: ["Alue Luddin", "Buket Kulam", "Peukan Idi Cut"] },
                    { name: "Julok", desas: ["Blang Keumahang", "Keude Kuta Binjei", "Paya Pasi"] },
                    { name: "Idi Rayeuk", desas: ["Gampong Jawa", "Tanoh Anoe", "Kuta Blang", "Titi Baro"] },
                    { name: "Simpang Ulim", desas: ["Peulalu", "Teupin Breuh", "Kuala Simpang Ulim"] }
                ]
            }
        ]
    },
    {
        kabupaten: "KOTA LANGSA",
        ulps: [
            {
                name: "ULP Langsa Kota",
                kecamatans: [
                    { name: "Langsa Barat", desas: ["Lhok Banie", "Matang Seulimeng", "Kuala Langsa"] }
                ]
            }
        ]
    },
    {
        kabupaten: "ACEH TAMIANG",
        ulps: [
            {
                name: "ULP Aceh Tamiang",
                kecamatans: [
                    { name: "Manyak Payed", desas: ["Simpang Lhee", "Paya Ketenggar", "Matang Ara"] }
                ]
            }
        ]
    },

    {
        kabupaten: "ACEH BARAT",
        ulps: [
            {
                name: "ULP Meulaboh Kota",
                kecamatans: [
                    { name: "Johan Pahlawan", desas: ["Ujong Kalak", "Rundeng", "Drien Rampak", "Lapang"] },
                    { name: "Meureubo", desas: ["Meureubo", "Langung", "Gunong Kleng", "Paya Peunaga"] }
                ]
            }
        ]
    },
    {
        kabupaten: "SIMEULUE",
        ulps: [
            {
                name: "ULP Sinabang",
                kecamatans: [
                    { name: "Simeulue Timur", desas: ["Air Dingin", "Suka Jaya", "Sinabang", "Ganting"] }
                ]
            },
            {
                name: "ULP Simeulue",
                kecamatans: [
                    { name: "Teupah Barat", desas: ["Silengas", "Inor", "Salur", "Pulau Teupah"] }
                ]
            }
        ]
    },
    {
        kabupaten: "ACEH SINGKIL",
        ulps: [
            {
                name: "ULP Singkil",
                kecamatans: [
                    { name: "Singkil", desas: ["Pulo Sarok", "Kilangan", "Ujong Bawang"] },
                    { name: "Pulau Banyak", desas: ["Pulau Balai", "Pulau Baguk", "Teluk Nibung"] }
                ]
            }
        ]
    },
    {
        kabupaten: "PIDIE JAYA",
        ulps: [
            {
                name: "ULP Meureudu",
                kecamatans: [
                    { name: "Meureudu", desas: ["Meunasah Balek", "Kota Meureudu", "Rhieng Blang"] },
                    { name: "Bandar Dua", desas: ["Ulee Gle", "Kumba", "Adan", "Kuta Krueng"] }
                ]
            }
        ]
    }
];
