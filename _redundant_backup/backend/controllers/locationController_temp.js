
// ... existing code ...

// ULP 1: Data Kantor ULP (from gis_pln_db)
exports.getUlpOffices = async (req, res) => {
    try {
        // Access raw mongo client to query a different database
        const client = require('mongoose').connection.client;
        const db = client.db('gis_pln_db');
        const collection = db.collection('kantor_ulp');

        const data = await collection.find({}).project({ _id: 0 }).toArray();
        res.json(data);
    } catch (error) {
        console.error("Failed to fetch ULP Offices:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ULP 2: Data Desa Dikelompokkan Per ULP (from gis_pln_db)
exports.getUlpDesaGrouped = async (req, res) => {
    try {
        const client = require('mongoose').connection.client;
        const db = client.db('gis_pln_db');
        const collection = db.collection('sebaran_desa');

        const semuaDesa = await collection.find({}).project({ _id: 0 }).toArray();

        // Pengelompokan (Grouping) secara manual di server
        const grouped = semuaDesa.reduce((acc, desa) => {
            // Trim whitespace untuk hindari duplikat "Idi " vs "Idi"
            let namaULP = desa.ULP ? desa.ULP.trim() : 'Lainnya';

            if (!acc[namaULP]) acc[namaULP] = [];

            // Normalize field names to match frontend RegionMap expectations (latitude, longitude)
            acc[namaULP].push({
                ...desa,
                latitude: desa.latitude || desa.Latitude, // Handle casing variations
                longitude: desa.longitude || desa.Longitude
            });
            return acc;
        }, {});

        res.json(grouped);
    } catch (error) {
        console.error("Failed to fetch ULP Desa Groups:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
