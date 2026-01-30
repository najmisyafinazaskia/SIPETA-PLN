const Location = require('../models/Location');

const UP3_TO_KABUPATEN = {
    "UP3 Banda Aceh": ["KOTA BANDA ACEH", "ACEH BESAR", "KOTA SABANG"],
    "UP3 Langsa": ["KOTA LANGSA", "ACEH TIMUR", "ACEH TAMIANG"],
    "UP3 Sigli": ["PIDIE", "PIDIE JAYA"],
    "UP3 Lhokseumawe": ["KOTA LHOKSEUMAWE", "ACEH UTARA", "BIREUEN"],
    "UP3 Meulaboh": ["ACEH BARAT", "NAGAN RAYA", "ACEH JAYA", "SIMEULUE"],
    "UP3 Subulussalam": ["KOTA SUBULUSSALAM", "ACEH SINGKIL", "ACEH SELATAN", "ACEH BARAT DAYA"]
};

// Map Kabupaten to UP3
const KABUPATEN_TO_UP3 = {};
Object.entries(UP3_TO_KABUPATEN).forEach(([up3, kabs]) => {
    kabs.forEach(kab => {
        KABUPATEN_TO_UP3[kab.toUpperCase()] = up3;
    });
});

// Get all kabupaten/kota
exports.getKabupatenKota = async (req, res) => {
    try {
        const kabupaten = await Location.distinct('kabupaten');
        res.json({ success: true, data: kabupaten.sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get kecamatan by kabupaten
exports.getKecamatan = async (req, res) => {
    try {
        const { kabupatenKota } = req.params; // Parameter still named kabupatenKota in route
        const kecamatan = await Location.distinct('kecamatan', { kabupaten: kabupatenKota });
        res.json({ success: true, data: kecamatan.sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get desa
exports.getDesa = async (req, res) => {
    try {
        const { kabupatenKota, kecamatan } = req.params;
        const desa = await Location.find(
            { kabupaten: kabupatenKota, kecamatan },
            { desa: 1, X: 1, Y: 1, dusun_detail: 1, _id: 1 }
        ).sort({ desa: 1 });
        res.json({ success: true, data: desa });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all locations
exports.getAllLocations = async (req, res) => {
    try {
        const { kabupatenKota, kecamatan } = req.query;
        const filter = {};

        if (kabupatenKota) filter.kabupaten = kabupatenKota;
        if (kecamatan) filter.kecamatan = kecamatan;

        const locations = await Location.find(filter).sort({
            kabupaten: 1,
            kecamatan: 1,
            desa: 1
        }).lean();

        // Filter out REFF!
        locations.forEach(loc => {
            if (loc.dusun_detail) {
                loc.dusun_detail = loc.dusun_detail.filter(d => d.status !== 'REFF!');
            }
        });

        res.json({ success: true, data: locations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Stats
exports.getLocationStats = async (req, res) => {
    try {
        const stats = await Location.aggregate([
            {
                $group: {
                    _id: '$kabupaten',
                    kecamatanList: { $addToSet: '$kecamatan' },
                    desaCount: { $sum: 1 },
                    dusunCount: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ["$dusun_detail", []] },
                                    as: "d",
                                    cond: { $ne: ["$$d.status", "REFF!"] }
                                }
                            }
                        }
                    },
                    xSample: { $first: "$X" },
                    ySample: { $first: "$Y" }
                }
            },
            {
                $project: {
                    kabupaten: '$_id', // Changed from kabupatenKota to kabupaten
                    kecamatanCount: { $size: '$kecamatanList' },
                    desaCount: 1,
                    dusunCount: 1,
                    x: "$xSample",
                    y: "$ySample",
                    hasUnpowered: { $literal: false },
                    _id: 0
                }
            },
            {
                $sort: { kabupaten: 1 }
            }
        ]);

        const totalStats = {
            totalKabupatenKota: stats.length,
            totalKecamatan: stats.reduce((sum, s) => sum + s.kecamatanCount, 0),
            totalDesa: stats.reduce((sum, s) => sum + s.desaCount, 0),
            totalDusun: stats.reduce((sum, s) => sum + s.dusunCount, 0)
        };

        res.json({
            success: true,
            data: {
                summary: totalStats,
                details: stats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single location by name/id
exports.getLocationByName = async (req, res) => {
    try {
        const { name } = req.params;
        const { category, kab, kec, id } = req.query;
        const decodedName = decodeURIComponent(name);

        let locationData = null;

        // 1. Prioritas ID
        if (id && id !== 'undefined' && id.length === 24) {
            const data = await Location.findById(id);
            if (data) {
                if (data.dusun_detail) {
                    data.dusun_detail = data.dusun_detail.filter(d => d.status !== 'REFF!');
                }
                return res.json({
                    success: true, data: {
                        name: data.desa,
                        category: 'Desa',
                        kecamatan: 1,
                        desa: 1,
                        dusun: data.dusun_detail?.length || 0,
                        dusunList: data.dusun_detail?.map(d => d.nama) || [],
                        dusuns: data.dusun_detail || [],
                        warga: 0,
                        pelanggan: 0,
                        kab: data.kabupaten,
                        kec: data.kecamatan
                    }
                });
            }
        }

        // 2. Berdasarkan Kategori
        if (category === 'Kabupaten') {
            const data = await Location.find({ kabupaten: new RegExp(`^${decodedName}$`, 'i') });
            if (data.length > 0) {
                const uniqueKec = [...new Set(data.map(item => item.kecamatan))].sort();
                const uniqueDesa = [...new Set(data.map(item => item.desa))].sort();
                const allDusuns = data.reduce((acc, curr) => {
                    const validDusuns = curr.dusun_detail ? curr.dusun_detail.filter(d => d.status !== 'REFF!') : [];
                    return acc + validDusuns.length;
                }, 0);
                const dusunList = [...new Set(data.reduce((acc, curr) => {
                    if (curr.dusun_detail) {
                        const validNames = curr.dusun_detail
                            .filter(d => d.status !== 'REFF!')
                            .map(d => d.nama);
                        acc.push(...validNames);
                    }
                    return acc;
                }, []))].sort();

                const dusuns = data.reduce((acc, curr) => {
                    if (curr.dusun_detail) {
                        curr.dusun_detail.forEach(d => {
                            if (d.status !== 'REFF!') {
                                acc.push({ nama: d.nama, status: d.status || "" });
                            }
                        });
                    }
                    return acc;
                }, []).sort((a, b) => a.nama.localeCompare(b.nama));

                locationData = {
                    name: data[0].kabupaten,
                    category: 'Kabupaten',
                    kecamatan: uniqueKec.length,
                    desa: uniqueDesa.length,
                    dusun: allDusuns,
                    kecamatanList: uniqueKec,
                    desaList: uniqueDesa,
                    dusunList: dusunList,
                    dusuns: dusuns,
                    warga: 0,
                    pelanggan: 0
                };
            }
        } else if (category === 'Kecamatan') {
            const filter = { kecamatan: new RegExp(`^${decodedName}$`, 'i') };
            if (kab) filter.kabupaten = new RegExp(`^${kab}$`, 'i');

            const data = await Location.find(filter);
            if (data.length > 0) {
                const uniqueDesa = [...new Set(data.map(item => item.desa))].sort();
                const allDusuns = data.reduce((acc, curr) => {
                    const validDusuns = curr.dusun_detail ? curr.dusun_detail.filter(d => d.status !== 'REFF!') : [];
                    return acc + validDusuns.length;
                }, 0);
                const dusunList = [...new Set(data.reduce((acc, curr) => {
                    if (curr.dusun_detail) {
                        const validNames = curr.dusun_detail
                            .filter(d => d.status !== 'REFF!')
                            .map(d => d.nama);
                        acc.push(...validNames);
                    }
                    return acc;
                }, []))].sort();

                const dusuns = data.reduce((acc, curr) => {
                    if (curr.dusun_detail) {
                        curr.dusun_detail.forEach(d => {
                            if (d.status !== 'REFF!') {
                                acc.push({ nama: d.nama, status: d.status || "" });
                            }
                        });
                    }
                    return acc;
                }, []).sort((a, b) => a.nama.localeCompare(b.nama));

                locationData = {
                    name: data[0].kecamatan,
                    category: 'Kecamatan',
                    kab: data[0].kabupaten,
                    kecamatan: 1,
                    desa: uniqueDesa.length,
                    dusun: allDusuns,
                    desaList: uniqueDesa,
                    dusunList: dusunList,
                    dusuns: dusuns,
                    warga: 0,
                    pelanggan: 0
                };
            }
        } else if (category === 'Desa') {
            const filter = { desa: new RegExp(`^${decodedName}$`, 'i') };
            if (kab) filter.kabupaten = new RegExp(`^${kab}$`, 'i');
            if (kec) filter.kecamatan = new RegExp(`^${kec}$`, 'i');

            const data = await Location.findOne(filter);
            if (data) {
                if (data.dusun_detail) {
                    data.dusun_detail = data.dusun_detail.filter(d => d.status !== 'REFF!');
                }
                locationData = {
                    name: data.desa,
                    category: 'Desa',
                    kab: data.kabupaten,
                    kec: data.kecamatan,
                    kecamatan: 1,
                    desa: 1,
                    dusun: data.dusun_detail?.length || 0,
                    dusunList: data.dusun_detail?.map(d => d.nama) || [],
                    dusuns: data.dusun_detail || [],
                    warga: 0,
                    pelanggan: 0
                };
            }
        }

        if (!locationData) {
            return res.status(404).json({ success: false, message: 'Lokasi tidak ditemukan' });
        }

        res.json({ success: true, data: locationData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UP3 Stats
exports.getUp3Stats = async (req, res) => {
    try {
        const stats = [];
        for (const [up3Name, kabList] of Object.entries(UP3_TO_KABUPATEN)) {
            const data = await Location.find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } });

            stats.push({
                name: up3Name,
                type: "stable",
                region: kabList[0].split(' ')[0],
                kecamatanCount: [...new Set(data.map(i => i.kecamatan))].length,
                x: data[0]?.X || "0",
                y: data[0]?.Y || "0"
            });
        }
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UP3 Detail
exports.getUp3Detail = async (req, res) => {
    try {
        const { name } = req.params;
        const decodedName = decodeURIComponent(name);
        const kabList = UP3_TO_KABUPATEN[decodedName];

        if (!kabList) {
            return res.status(404).json({ success: false, message: 'UP3 tidak ditemukan' });
        }

        const data = await Location.find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean();
        const uniqueKec = [...new Set(data.map(item => item.kecamatan))].sort();
        const uniqueDesa = [...new Set(data.map(item => item.desa))].sort();

        const dusuns = data.reduce((acc, curr) => {
            if (curr.dusun_detail) {
                curr.dusun_detail.forEach(d => {
                    if (d.status !== 'REFF!') {
                        acc.push({ nama: d.nama, status: d.status || "" });
                    }
                });
            }
            return acc;
        }, []).sort((a, b) => a.nama.localeCompare(b.nama));

        res.json({
            success: true,
            data: {
                name: decodedName,
                kecamatanList: uniqueKec,
                kecamatanCount: uniqueKec.length,
                desaCount: uniqueDesa.length,
                dusunCount: dusuns.length,
                desaList: uniqueDesa,
                dusuns: dusuns,
                warga: 0,
                pelanggan: 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Hierarchy
exports.getHierarchy = async (req, res) => {
    try {
        const hierarchy = await Location.aggregate([
            {
                $group: {
                    _id: {
                        kab: "$kabupaten",
                        kec: "$kecamatan",
                        desa: "$desa",
                        desaId: "$_id"
                    },
                    dusuns: { $first: "$dusun_detail" }
                }
            },
            {
                $group: {
                    _id: { kab: "$_id.kab", kec: "$_id.kec" },
                    desa: {
                        $push: {
                            id: "$_id.desaId",
                            name: "$_id.desa",
                            dusun: {
                                $map: {
                                    input: "$dusuns",
                                    as: "d",
                                    in: {
                                        id: { $concat: [{ $toString: "$_id.desaId" }, "-", "$$d.nama"] },
                                        name: "$$d.nama",
                                        file: null,
                                        uploadTime: null
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.kab",
                    kecamatan: {
                        $push: {
                            name: "$_id.kec",
                            desa: "$desa"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    name: "$_id",
                    kecamatan: 1
                }
            },
            { $sort: { name: 1 } }
        ]);

        res.json({ success: true, data: hierarchy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Global Search
exports.globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: [] });

        const regex = new RegExp(q, 'i');

        const results = await Location.aggregate([
            {
                $match: {
                    $or: [
                        { kabupaten: regex },
                        { kecamatan: regex },
                        { desa: regex },
                        { "dusun_detail.nama": regex }
                    ]
                }
            },
            {
                $facet: {
                    kabupaten: [
                        { $match: { kabupaten: regex } },
                        { $group: { _id: "$kabupaten", type: { $first: "Kabupaten" } } },
                        { $limit: 10 }
                    ],
                    kecamatan: [
                        { $match: { kecamatan: regex } },
                        {
                            $group: {
                                _id: { kab: "$kabupaten", kec: "$kecamatan" },
                                name: { $first: "$kecamatan" },
                                kab: { $first: "$kabupaten" }
                            }
                        },
                        { $limit: 10 }
                    ],
                    desa: [
                        {
                            $match: {
                                $or: [
                                    { desa: regex },
                                    { "dusun_detail.nama": regex }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: "$desa",
                                kab: "$kabupaten",
                                kec: "$kecamatan",
                                matchedDusun: {
                                    $filter: {
                                        input: "$dusun_detail",
                                        as: "d",
                                        cond: { $regexMatch: { input: "$$d.nama", regex: q, options: "i" } }
                                    }
                                }
                            }
                        },
                        { $limit: 20 }
                    ]
                }
            }
        ]);

        const formatted = [];
        const { kabupaten, kecamatan, desa } = results[0];

        kabupaten.forEach(k => formatted.push({
            name: k._id,
            category: "Kabupaten",
            type: "stable",
            kab: k._id,
            up3: KABUPATEN_TO_UP3[k._id.toUpperCase()]
        }));
        kecamatan.forEach(k => formatted.push({
            name: k.name,
            category: "Kecamatan",
            parent: k.kab,
            kab: k.kab,
            kec: k.name,
            type: "stable",
            up3: KABUPATEN_TO_UP3[k.kab.toUpperCase()]
        }));
        desa.forEach(d => {
            const dusunLabel = d.matchedDusun && d.matchedDusun.length > 0
                ? ` (Dusun: ${d.matchedDusun[0].nama})`
                : "";
            formatted.push({
                id: d._id,
                name: d.name + dusunLabel,
                realName: d.name,
                category: "Desa",
                parent: `${d.kec}, ${d.kab}`,
                kab: d.kab,
                kec: d.kec,
                type: "stable",
                up3: KABUPATEN_TO_UP3[d.kab.toUpperCase()]
            });
        });

        res.json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single location by ID
exports.getLocationById = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ success: false, message: 'Lokasi tidak ditemukan' });
        }
        res.json({ success: true, data: location });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get locations as GeoJSON
exports.getGeoJSON = async (req, res) => {
    try {
        const locations = await Location.find({}).lean(); // Fetch everything first

        const features = locations.filter(l => {
            // Validasi keberadaan koordinat
            // Cek X, Y (string float) - case insensitive check
            const X = l.X || l.x;
            const Y = l.Y || l.y;
            const hasXY = X && Y && !isNaN(parseFloat(X)) && !isNaN(parseFloat(Y));

            // Cek location (GeoJSON geometry)
            const hasLoc = l.location && l.location.coordinates && l.location.coordinates.length === 2;

            return hasXY || hasLoc;
        }).map(l => {
            let geometry = null;

            const X = l.X || l.x;
            const Y = l.Y || l.y;

            // Prioritas 1: Gunakan X dan Y
            if (X && Y) {
                const lng = parseFloat(X);
                const lat = parseFloat(Y);
                if (!isNaN(lng) && !isNaN(lat)) {
                    geometry = {
                        type: "Point",
                        coordinates: [lng, lat]
                    };
                }
            }

            // Prioritas 2: Fallback ke location field
            if (!geometry && l.location) {
                geometry = l.location;
            }

            return {
                type: "Feature",
                properties: {
                    id: l._id,
                    kabupaten: l.kabupaten,
                    kecamatan: l.kecamatan,
                    name: l.desa,
                    status: (l.dusun_detail && l.dusun_detail.filter(d => d.status !== 'REFF!').some(d => d.status.toUpperCase().includes('PLN'))) ? "Berlistrik PLN" : "Belum Berlistrik PLN",
                    dusun_count: l.dusun_detail ? l.dusun_detail.filter(d => d.status !== 'REFF!').length : 0,
                    dusuns: l.dusun_detail ? l.dusun_detail.filter(d => d.status !== 'REFF!').map(d => ({
                        name: d.nama,
                        status: (d.status && d.status.toUpperCase().includes('PLN')) ? "Berlistrik PLN" : (d.status || "-")
                    })) : [],
                    up3: KABUPATEN_TO_UP3[(l.kabupaten || "").toUpperCase()] || ""
                },
                geometry: geometry
            };
        });

        res.json({
            type: "FeatureCollection",
            features: features
        });
    } catch (error) {
        console.error("GeoJSON Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Kecamatan points for map (Aggregated from Desa)
exports.getKecamatanPoints = async (req, res) => {
    try {
        const dataKec = await Location.aggregate([
            {
                $group: {
                    _id: "$kecamatan",
                    kabupaten: { $first: "$kabupaten" },
                    nama_kecamatan: { $first: "$kecamatan" },
                    koordinat: { $first: "$location" },
                    // Fallback to X/Y
                    X: { $first: "$X" },
                    Y: { $first: "$Y" }
                }
            },
            { $sort: { nama_kecamatan: 1 } }
        ]);

        const formatted = dataKec.map(k => {
            let coords = null;
            if (k.koordinat && k.koordinat.coordinates) {
                coords = k.koordinat;
            } else if (k.X && k.Y) {
                const x = parseFloat(k.X);
                const y = parseFloat(k.Y);
                if (!isNaN(x) && !isNaN(y)) {
                    coords = { type: "Point", coordinates: [x, y] };
                }
            }
            return {
                type: "Feature",
                properties: {
                    name: k.nama_kecamatan,
                    kabupaten: k.kabupaten,
                    kecamatan: k.nama_kecamatan,
                    status: "Berlistrik PLN" // Default status as per user request/mini-project
                },
                geometry: coords
            };
        }).filter(k => k.geometry);

        res.json({
            type: "FeatureCollection",
            features: formatted
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal ambil data kecamatan" });
    }
};

// Get Boundary GeoJSON
exports.getBoundaries = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../data/geojson/aceh_kabupaten.geojson');
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Update Dusun Status (Manual Override)
exports.updateDusunStatus = async (req, res) => {
    try {
        const { desaId, dusunName, newStatus } = req.body;

        if (!desaId || !dusunName || !newStatus) {
            return res.status(400).json({ success: false, message: "Data tidak lengkap (desaId, dusunName, newStatus diperlukan)" });
        }

        const location = await Location.findOneAndUpdate(
            { _id: desaId, "dusun_detail.nama": dusunName },
            { $set: { "dusun_detail.$.status": newStatus } },
            { new: true }
        );

        if (!location) {
            return res.status(404).json({ success: false, message: "Dusun atau Desa tidak ditemukan" });
        }

        res.json({ success: true, message: "Status dusun berhasil diperbarui", data: location });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
