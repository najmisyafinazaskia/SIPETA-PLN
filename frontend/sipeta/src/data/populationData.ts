// Data Sumber: BPS Provinsi Aceh Dalam Angka 2024 (Rilis 28 Feb 2024)
// Satuan: Jiwa (Konversi dari Ribu Jiwa)

export const POPULATION_UPDATE_DATE = "28 Februari 2024";

export const kabKotPopulation: Record<string, number> = {
    "ACEH UTARA": 632000,
    "PIDIE": 452500,
    "BIREUEN": 459100,
    "ACEH TIMUR": 443600,
    "ACEH BESAR": 428300,
    "ACEH TAMIANG": 309000,
    "KOTA BANDA ACEH": 265000,
    "ACEH SELATAN": 242000,
    "ACEH TENGGARA": 234400,
    "ACEH TENGAH": 226700,
    "ACEH BARAT": 206800,
    "KOTA LHOKSEUMAWE": 200400,
    "KOTA LANGSA": 198000,
    "NAGAN RAYA": 176400,
    "BENER MERIAH": 172000,
    "PIDIE JAYA": 166500,
    "ACEH BARAT DAYA": 159200,
    "ACEH SINGKIL": 135700,
    "GAYO LUES": 106800,
    "ACEH JAYA": 99200,
    "KOTA SUBULUSSALAM": 99100,
    "SIMEULUE": 98600,
    "KOTA SABANG": 43500
};

// Helper function to get population with fuzzy matching
export const getPopulation = (name: string): number | null => {
    const cleanName = name.toUpperCase().replace("KABUPATEN", "").replace("KOTA", "").trim();

    // Direct match check
    for (const [key, value] of Object.entries(kabKotPopulation)) {
        if (key.includes(cleanName) || cleanName.includes(key.replace("KOTA ", "").replace("ACEH ", ""))) {
            return value;
        }
    }

    // Specific overrides if needed
    if (cleanName === "BANDA ACEH") return kabKotPopulation["KOTA BANDA ACEH"];
    if (cleanName === "LHOKSEUMAWE") return kabKotPopulation["KOTA LHOKSEUMAWE"];
    if (cleanName === "LANGSA") return kabKotPopulation["KOTA LANGSA"];
    if (cleanName === "SABANG") return kabKotPopulation["KOTA SABANG"];
    if (cleanName === "SUBULUSSALAM") return kabKotPopulation["KOTA SUBULUSSALAM"];

    return null;
};

// --- DATA KECAMATAN ---
// Sumber: 
// - Banda Aceh: BPS (Des 2023)
// - Aceh Utara: Satu Data (Sem I 2023)
export const KECAMATAN_UPDATE_DATE = "2023 / 2024";

export const kecamatanPopulation: Record<string, number> = {
    // KOTA BANDA ACEH
    "BAITURRAHMAN": 32506,
    "KUTA ALAM": 42691,
    "MEURAXA": 27090,
    "SYIAH KUALA": 34247,
    "LUENG BATA": 25702,
    "KUTA RAJA": 14928,
    "BANDAR RAYA": 26607,
    "JAYA BARU": 27157,
    "ULEE KARENG": 28610,

    // KABUPATEN ACEH UTARA
    "BAKTIYA": 39463,
    "DEWANTARA": 46873,
    "KUTA MAKMUR": 28307,
    "LHOKSUKON": 51421,
    "MATANGKULI": 19621,
    "MUARA BATU": 28588,
    "MEURAH MULIA": 22304,
    "SAMUDERA": 28366,
    "SEUNUDDON": 26430,
    "SYAMTALIRA ARON": 19910,
    "SYAMTALIRA BAYU": 22941,
    "TANAH LUAS": 26380,
    "TANAH PASIR": 10136,
    "TANAH JAMBO AYE": 44929,
    "SAWANG": 40135,
    "NISAM": 20721,
    "LANGKAHAN": 23192,
    "BAKTIYA BARAT": 19881,
    "BANDA BARO": 0, // Data to be filled
    "COT GIREK": 0,
    "GEUREUDONG PASE": 0,
    "LAPANG": 0,
    "NIBONG": 0,
    "PAYA BAKONG": 0,
    "IMPAL": 0,
    "SIMPANG KEURAMAT": 0,
};

export const getKecamatanPopulation = (name: string): number | null => {
    const cleanName = name.toUpperCase().replace("KECAMATAN", "").trim();
    return kecamatanPopulation[cleanName] || null;
};

export const getDesaPopulation = (_name: string): number | null => {
    // Placeholder: Belum ada database lengkap desa
    return null;
};
