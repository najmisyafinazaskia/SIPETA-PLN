const Location = require('../models/Location');
const Up3 = require('../models/Up3');
const Up3Desa = require('../models/Up3Desa');
const Ulp = require('../models/Ulp');
const UlpDesa = require('../models/UlpDesa');

// Konfigurasi pemetaan Wilayah UP3 ke daftar Kabupaten/Kota di Aceh
const UP3_TO_KABUPATEN = {
    "UP3 Banda Aceh": ["KOTA BANDA ACEH", "ACEH BESAR", "KOTA SABANG"],
    "UP3 Langsa": ["KOTA LANGSA", "ACEH TIMUR", "ACEH TAMIANG"],
    "UP3 Sigli": ["PIDIE", "PIDIE JAYA"],
    "UP3 Lhokseumawe": ["KOTA LHOKSEUMAWE", "ACEH UTARA", "BIREUEN"],
    "UP3 Meulaboh": ["ACEH BARAT", "NAGAN RAYA", "ACEH JAYA", "SIMEULUE"],
    "UP3 Subulussalam": ["KOTA SUBULUSSALAM", "ACEH SINGKIL", "ACEH SELATAN", "ACEH BARAT DAYA"]
};

// Objek bantuan untuk membalik pemetaan: Kabupaten ke UP3
const KABUPATEN_TO_UP3 = {};
Object.entries(UP3_TO_KABUPATEN).forEach(([up3, kabs]) => {
    kabs.forEach(kab => {
        KABUPATEN_TO_UP3[kab.toUpperCase()] = up3;
    });
});

// Mengambil seluruh daftar Kabupaten/Kota yang unik dari database
exports.getKabupatenKota = async (req, res) => {
    try {
        const kabupaten = await Location.distinct('kabupaten');
        res.json({ success: true, data: kabupaten.sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mengambil daftar Kecamatan berdasarkan nama Kabupaten tertentu
exports.getKecamatan = async (req, res) => {
    try {
        const { kabupatenKota } = req.params;
        const kecamatan = await Location.distinct('kecamatan', { kabupaten: kabupatenKota });
        res.json({ success: true, data: kecamatan.sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mengambil daftar Desa berdasarkan Kabupaten dan Kecamatan
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

// Mengambil semua data lokasi dengan filter opsional (Kabupaten/Kecamatan)
// Digunakan untuk daftar di tabel/dashboard
exports.getAllLocations = async (req, res) => {
    try {
        const { kabupatenKota, kecamatan } = req.query;
        const filter = {};

        if (kabupatenKota) filter.kabupaten = kabupatenKota;
        if (kecamatan) filter.kecamatan = kecamatan;

        // Mengambil data lokasi dan data statistik kecamatan dalam satu waktu
        const [locations, stats] = await Promise.all([
            Location.find(filter).sort({
                kabupaten: 1,
                kecamatan: 1,
                desa: 1
            }).lean(),
            require('../models/KecamatanStat').find({}).lean()
        ]);

        // Membuat peta referensi jumlah warga untuk lookup cepat
        const normalize = (str) => (str || "").replace(/^(KABUPATEN|KAB\.|KOTA)\s+/i, "").trim().toUpperCase();

        const wargaMap = {};
        stats.forEach(s => {
            const key = `${normalize(s.Kabkot)}-${normalize(s.Kecamatan)}`;
            wargaMap[key] = s.Warga;
        });

        // Menggabungkan data populasi/warga ke dalam hasil pencarian lokasi
        const enriched = locations.map(l => ({
            ...l,
            kecamatan_warga: wargaMap[`${normalize(l.kabupaten)}-${normalize(l.kecamatan)}`] || 0
        }));

        res.json({ success: true, data: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mengambil statistik ringkasan tingkat Kabupaten (Jumlah desa, dusun, dll)
exports.getLocationStats = async (req, res) => {
    try {
        const Kabupaten = require('../models/Kabupaten');

        // Mengelompokkan data berdasarkan Kabupaten dan menghitung total desa/dusun
        const [stats, kabMetadata] = await Promise.all([
            Location.aggregate([
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
                                        cond: { $ne: ["$$d.status", "REFF!"] } // Abaikan item error
                                    }
                                }
                            }
                        },
                        pelanggan: { $sum: { $ifNull: ["$pelanggan", 0] } }
                    }
                },
                {
                    $project: {
                        kabupaten: '$_id',
                        kecamatanCount: { $size: '$kecamatanList' },
                        desaCount: 1,
                        dusunCount: 1,
                        pelanggan: 1,
                        hasUnpowered: { $literal: false },
                        _id: 0
                    }
                },
                {
                    $sort: { kabupaten: 1 }
                }
            ]),
            Kabupaten.find({})
        ]);

        // Create metadata map from Kabupaten collection
        const metaMap = {};
        kabMetadata.forEach(k => {
            if (k.nama) {
                metaMap[k.nama.toUpperCase()] = {
                    koordinat: k.koordinat,
                    warga: k.warga,
                    lembaga_warga: k.lembaga_warga,
                    tahun: k.tahun
                };
            }
        });

        // Menggabungkan koordinat dan jumlah warga ke dalam hasil statistik
        const mergedStats = stats.map(s => {
            const meta = metaMap[s.kabupaten.toUpperCase()] || {};
            const coords = meta.koordinat;
            const officialWarga = meta.warga || 0;

            return {
                ...s,
                koordinat: coords || null,
                warga: officialWarga,
                lembaga_warga: meta.lembaga_warga || "BPS",
                tahun: meta.tahun || 2024,
                x: coords ? coords[0] : 0,
                y: coords ? coords[1] : 0
            };
        });

        // Ringkasan total untuk seluruh provinsi
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
                details: mergedStats
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
                // Filter out error dusuns
                const filteredDusuns = data.dusun_detail?.filter(d =>
                    d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!'
                ) || [];

                return res.json({
                    success: true, data: {
                        name: data.desa,
                        category: 'Desa',
                        kecamatan: 1,
                        desa: 1,
                        dusun: filteredDusuns.length,
                        dusunList: filteredDusuns.map(d => d.nama),
                        dusuns: filteredDusuns,
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
            const Kabupaten = require('../models/Kabupaten');
            const KecamatanStat = require('../models/KecamatanStat');
            const data = await Location.find({ kabupaten: new RegExp(`^${decodedName}$`, 'i') });
            const kabMeta = await Kabupaten.findOne({ nama: new RegExp(`^${decodedName}$`, 'i') });

            if (data.length > 0) {
                const uniqueKec = [...new Set(data.map(item => item.kecamatan))].sort();

                // Fetch kecamatan metadata
                const kecStats = await KecamatanStat.find({
                    kabupaten: new RegExp(`^${decodedName}$`, 'i')
                }).lean();

                // Create map for quick lookup
                const kecStatMap = {};
                kecStats.forEach(k => {
                    kecStatMap[k.nama.toUpperCase()] = k;
                });

                // Build kecamatanList with metadata
                const kecamatanList = uniqueKec.map(kecName => {
                    const stat = kecStatMap[kecName.toUpperCase()];
                    return {
                        nama: kecName,
                        lembaga_warga: stat?.Lembaga_Warga || "-",
                        tahun: stat?.tahun || "-"
                    };
                });

                const uniqueDesa = [...new Set(data.map(item => item.desa))].sort();
                const allDusuns = data.reduce((acc, curr) => {
                    const validDusuns = curr.dusun_detail ? curr.dusun_detail.filter(d =>
                        d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!'
                    ) : [];
                    return acc + validDusuns.length;
                }, 0);
                const dusunList = [...new Set(data.reduce((acc, curr) => {
                    if (curr.dusun_detail) {
                        const validNames = curr.dusun_detail
                            .filter(d => d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!')
                            .map(d => d.nama);
                        acc.push(...validNames);
                    }
                    return acc;
                }, []))].sort();

                const dusuns = data.reduce((acc, curr) => {
                    if (curr.dusun_detail) {
                        curr.dusun_detail.forEach(d => {
                            if (d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!') {
                                acc.push({ nama: d.nama, status: d.status || "" });
                            }
                        });
                    }
                    return acc;
                }, []).sort((a, b) => a.nama.localeCompare(b.nama));

                locationData = {
                    name: kabMeta?.nama || decodedName,
                    category: 'Kabupaten',
                    kecamatan: uniqueKec.length,
                    desa: uniqueDesa.length,
                    dusun: allDusuns,
                    kecamatanList: kecamatanList,
                    desaList: uniqueDesa,
                    dusunList: dusunList,
                    dusuns: dusuns,
                    warga: kabMeta?.warga || 0,
                    lembaga_warga: kabMeta?.lembaga_warga || "BPS",
                    tahun: kabMeta?.tahun || 2024,
                    pelanggan: 0
                };
            }
        } else if (category === 'Kecamatan') {
            const KecamatanStat = require('../models/KecamatanStat');
            const filter = { kecamatan: new RegExp(`^${decodedName}$`, 'i') };
            if (kab) filter.kabupaten = new RegExp(`^${kab}$`, 'i');

            const statFilter = { Kecamatan: new RegExp(`^${decodedName}$`, 'i') };
            if (kab) statFilter.Kabkot = new RegExp(`^${kab}$`, 'i');

            const [data, kecMeta] = await Promise.all([
                Location.find(filter),
                KecamatanStat.findOne(statFilter)
            ]);

            if (data.length > 0) {
                const uniqueDesa = [...new Set(data.map(item => item.desa))].sort();
                const allDusuns = data.reduce((acc, curr) => {
                    const validDusuns = curr.dusun_detail ? curr.dusun_detail.filter(d =>
                        d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!'
                    ) : [];
                    return acc + validDusuns.length;
                }, 0);
                const dusunList = [...new Set(data.reduce((acc, curr) => {
                    if (curr.dusun_detail) {
                        const validNames = curr.dusun_detail
                            .filter(d => d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!')
                            .map(d => d.nama);
                        acc.push(...validNames);
                    }
                    return acc;
                }, []))].sort();

                const dusuns = data.reduce((acc, curr) => {
                    if (curr.dusun_detail) {
                        curr.dusun_detail.forEach(d => {
                            if (d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!') {
                                acc.push({ nama: d.nama, status: d.status || "" });
                            }
                        });
                    }
                    return acc;
                }, []).sort((a, b) => a.nama.localeCompare(b.nama));

                locationData = {
                    name: decodedName,
                    category: 'Kecamatan',
                    kab: data[0].kabupaten,
                    kecamatan: 1,
                    desa: uniqueDesa.length,
                    dusun: allDusuns,
                    desaList: uniqueDesa,
                    dusunList: dusunList,
                    dusuns: dusuns,
                    warga: kecMeta?.Warga || 0,
                    lembaga_warga: kecMeta?.Lembaga_Warga || "-",
                    tahun: kecMeta?.tahun || "-",
                    pelanggan: 0
                };
            }
        } else if (category === 'Desa') {
            const filter = { desa: new RegExp(`^${decodedName}$`, 'i') };
            if (kab) filter.kabupaten = new RegExp(`^${kab}$`, 'i');
            if (kec) filter.kecamatan = new RegExp(`^${kec}$`, 'i');

            const data = await Location.findOne(filter);
            if (data) {
                const filteredDusuns = data.dusun_detail?.filter(d =>
                    d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!'
                ) || [];

                locationData = {
                    name: data.desa,
                    category: 'Desa',
                    kab: data.kabupaten,
                    kec: data.kecamatan,
                    kecamatan: 1,
                    desa: 1,
                    dusun: filteredDusuns.length,
                    dusunList: filteredDusuns.map(d => d.nama),
                    dusuns: filteredDusuns,
                    warga: data.warga || 0,
                    lembaga_warga: data.sumber_warga || "-",
                    tahun: data.tahun_warga || "-",
                    pelanggan: data.pelanggan || 0
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
        const KecamatanStat = require('../models/KecamatanStat');

        for (const [up3Name, kabList] of Object.entries(UP3_TO_KABUPATEN)) {
            const [data, kecStats, up3Meta] = await Promise.all([
                Location.find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean(),
                require('../models/KecamatanStat').find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean(),
                Up3.findOne({ nama_up3: new RegExp(`^${up3Name.replace(/^UP3\s+/i, '').trim()}$`, 'i') }).lean()
            ]);

            // Calculate totalWarga from village data for consistency with Detail Page
            const totalWarga = data.reduce((sum, item) => sum + (item.warga || 0), 0);

            // Calculate total dusuns, filtering out REFF! items
            const totalDusuns = data.reduce((sum, loc) => {
                const validDusuns = (loc.dusun_detail || []).filter(d =>
                    d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!'
                );
                return sum + validDusuns.length;
            }, 0);

            // Calculate aggregated pelanggan if meta doesn't have it
            const aggregatedPelanggan = data.reduce((sum, loc) => sum + (loc.pelanggan || 0), 0);

            stats.push({
                name: up3Name,
                type: "stable",
                region: kabList[0].split(' ')[0],
                kecamatanCount: [...new Set(data.map(i => i.kecamatan))].length,
                dusunCount: totalDusuns,
                warga: totalWarga,
                pelanggan: up3Meta?.pelanggan || aggregatedPelanggan,
                update_pelanggan: up3Meta?.update_pelanggan || "Desember, 2025",
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

        const [data, kecStats, ulpDesaList, up3Meta] = await Promise.all([
            Location.find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean(),
            require('../models/KecamatanStat').find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean(),
            require('../models/UlpDesa').find({ "Kabupaten/Kota": { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean(),
            Up3.findOne({ nama_up3: new RegExp(`^${decodedName.replace(/^UP3\s+/i, '').trim()}$`, 'i') }).lean()
        ]);

        // Get unique ULPs
        const uniqueUlps = [...new Set(ulpDesaList.map(u => (u.ULP || "").trim()))].filter(Boolean).sort();

        // Recalculate totalWarga and totalPelanggan from village data
        const totalWarga = data.reduce((sum, item) => sum + (item.warga || 0), 0);
        const totalPelanggan = data.reduce((sum, item) => sum + (item.pelanggan || 0), 0);

        // Find most frequent source and year for the update notice
        const sources = data.map(item => item.sumber_warga).filter(s => s && s !== "-");
        const years = data.map(item => item.tahun_warga).filter(y => y && y !== "-");

        const mostFrequent = (arr) => {
            if (arr.length === 0) return null;
            const map = {};
            arr.forEach(val => map[val] = (map[val] || 0) + 1);
            return Object.keys(map).reduce((a, b) => map[a] > map[b] ? a : b);
        };

        const representativeSource = mostFrequent(sources) || "-";
        const representativeYear = mostFrequent(years) || "-";

        const uniqueKec = [...new Set(data.map(item => item.kecamatan))].sort();

        // Create map for kecamatan metadata
        const kecStatMap = {};
        kecStats.forEach(k => {
            kecStatMap[k.nama.toUpperCase()] = k;
        });

        // Build kecamatanList with metadata
        const kecamatanList = uniqueKec.map(kecName => {
            const stat = kecStatMap[kecName.toUpperCase()];
            return {
                nama: kecName,
                lembaga_warga: stat?.Lembaga_Warga || "-",
                tahun: stat?.tahun || "-"
            };
        });

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
                kecamatanList: kecamatanList,
                kecamatanCount: uniqueKec.length,
                desaCount: uniqueDesa.length,
                dusunCount: dusuns.length,
                desaList: uniqueDesa,
                dusuns: dusuns,
                warga: totalWarga,
                lembaga_warga: representativeSource,
                tahun: representativeYear,
                pelanggan: up3Meta?.pelanggan || totalPelanggan,
                update_pelanggan: up3Meta?.update_pelanggan || "Desember, 2025",
                ulpCount: uniqueUlps.length,
                ulpList: uniqueUlps
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mengambil data koordinat kantor UP3 dari koleksi up3_db
exports.getUp3Offices = async (req, res) => {
    try {
        const offices = await Up3.find({});
        res.json(offices); // Mengikuti format dari index.html lama
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mengambil data desa yang dikelompokkan berdasarkan UP3 dari koleksi up3_desa
exports.getUp3DesaGrouped = async (req, res) => {
    try {
        const up3DesaList = await Up3Desa.find({}).lean();
        const locations = await Location.find({}, {
            desa: 1,
            kecamatan: 1,
            kabupaten: 1,
            X: 1,
            Y: 1,
            x: 1,
            y: 1,
            pelanggan: 1,
            warga: 1,
            sumber_warga: 1,
            tahun_warga: 1,
            dusun_detail: 1
        }).lean();

        // Index locations by desa name for fast lookup
        const locIndex = {};
        locations.forEach(l => {
            const name = (l.desa || "").trim().toUpperCase();
            if (!locIndex[name]) locIndex[name] = [];
            locIndex[name].push(l);
        });

        const grouped = up3DesaList.reduce((acc, curr) => {
            if (!acc[curr.up3]) acc[curr.up3] = [];

            // Find matching location for dusun_detail
            const desaUpper = (curr.desa || "").trim().toUpperCase();
            const kecUpper = (curr.kecamatan || "").trim().toUpperCase();
            const kabUpper = (curr.kabupaten || "").trim().toUpperCase();

            const matches = locIndex[desaUpper] || [];
            const match = matches.find(l =>
                (l.kecamatan || "").trim().toUpperCase() === kecUpper &&
                (l.kabupaten || "").trim().toUpperCase() === kabUpper
            );

            // Synchronize dusun details with filtering
            const rawDusuns = match?.dusun_detail || [];
            const filteredDusuns = rawDusuns.filter(d =>
                d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!'
            );

            acc[curr.up3].push({
                Desa: curr.desa,
                Kabupaten: curr.kabupaten || "-",
                Kecamatan: curr.kecamatan || "-",
                ULP: curr.ulp || "-",
                latitude: curr.latitude,
                longitude: curr.longitude,
                Status_Listrik: curr.Status_Listrik || "Berlistrik",
                warga: match?.warga || 0,
                pelanggan: match?.pelanggan || 0,
                lembaga_warga: match?.sumber_warga || "-",
                tahun: match?.tahun_warga || "-",
                dusuns: filteredDusuns.map(d => ({
                    name: d.nama,
                    status: d.status
                }))
            });
            return acc;
        }, {});

        res.json(grouped);
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

            // Logic Coloring:
            const rawDusuns = l.dusun_detail || [];
            const filteredDusuns = rawDusuns.filter(d =>
                d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!'
            );

            const isStrictMode = req.query.strict === 'true'; // Strict = Dusun Map Logic
            let statusText = "Berlistrik PLN";

            if (isStrictMode) {
                // Dusun Map Logic: Yellow if ANY dusun is bad
                const badDusunsCount = filteredDusuns.filter(d => {
                    const s = (d.status || "").toUpperCase();
                    const isGood = s.includes('PLN') && !s.includes('NON PLN') && !s.includes('BELUM');
                    return !isGood;
                }).length;

                if (badDusunsCount > 0) {
                    statusText = "Belum Berlistrik";
                }
            } else {
                // Desa Map Logic: Always Green (Stable)
                statusText = "Berlistrik PLN";
            }

            return {
                type: "Feature",
                properties: {
                    id: l._id,
                    kabupaten: l.kabupaten,
                    kecamatan: l.kecamatan,
                    name: l.desa,
                    status: statusText,
                    dusun_count: filteredDusuns.length,
                    // Pass dusuns details for popup
                    dusuns: filteredDusuns.map(d => ({
                        name: d.nama,
                        status: d.status
                    })),
                    up3: KABUPATEN_TO_UP3[(l.kabupaten || "").toUpperCase()] || "",
                    warga: l.warga || 0,
                    pelanggan: l.pelanggan || 0,
                    lembaga_warga: l.sumber_warga || "-",
                    tahun: l.tahun_warga || "-"
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
        const KecamatanStat = require('../models/KecamatanStat');

        const [dataKec, stats] = await Promise.all([
            Location.aggregate([
                {
                    $group: {
                        _id: "$kecamatan",
                        kabupaten: { $first: "$kabupaten" },
                        nama_kecamatan: { $first: "$kecamatan" },
                        koordinat: { $first: "$location" },
                        X: { $first: "$X" },
                        Y: { $first: "$Y" },
                        all_dusuns: { $push: "$dusun_detail" } // Collect all dusun arrays
                    }
                },
                { $sort: { nama_kecamatan: 1 } }
            ]),
            KecamatanStat.find({})
        ]);

        const wargaMap = {};
        stats.forEach(s => {
            wargaMap[s.nama] = s.warga;
        });

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

            // Flatten and format dusuns from all desas in this kecamatan
            let flattenedDusuns = [];
            if (k.all_dusuns) {
                k.all_dusuns.forEach(desaDusuns => {
                    if (Array.isArray(desaDusuns)) {
                        desaDusuns.forEach(d => {
                            // Filter out error statuses
                            if (d.status === 'REFF!' || d.status === '#REF!') return;

                            const s = (d.status || "").toUpperCase();
                            // Standardize status logic as per getGeoJSON
                            const isGood = s.includes('PLN') && !s.includes('NON PLN') && !s.includes('BELUM');
                            flattenedDusuns.push({
                                name: d.nama,
                                status: isGood ? "Berlistrik PLN" : (d.status || "Belum Berlistrik")
                            });
                        });
                    }
                });
            }

            // Determine Overall Status for the point - For Kecamatan Map, always show as green (Stable)
            const statusText = "Berlistrik PLN";

            return {
                type: "Feature",
                properties: {
                    name: k.nama_kecamatan,
                    kabupaten: k.kabupaten,
                    kecamatan: k.nama_kecamatan,
                    status: statusText,
                    dusuns: flattenedDusuns, // This will populate the "Rincian Dusun" in popup
                    warga: wargaMap[k.nama_kecamatan] || 0
                },
                geometry: coords
            };
        }).filter(k => k.geometry);

        res.json({
            type: "FeatureCollection",
            features: formatted
        });
    } catch (err) {
        console.error(err);
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
const Notification = require('../models/Notification'); // Import Notification model

// ... (existing code)

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

        // --- NEW: Create Notification ---
        // --- NEW: Create Notification ---
        try {
            console.log("Update Dusun Status Body:", req.body); // Debugging

            let actorName = req.body.userName;
            if (!actorName || actorName.trim() === "") {
                actorName = KABUPATEN_TO_UP3[location.kabupaten.toUpperCase()] || "Admin Wilayah";
            }

            await Notification.create({
                title: "Pembaruan Status Dusun",
                message: `Status Dusun ${dusunName} di Desa ${location.desa} telah diubah menjadi ${newStatus}`,
                type: newStatus === 'Belum Berlistrik' ? 'warning' : 'success',
                userName: actorName,
                // Optional: Add reference or metadata if you schema supports it, otherwise reliance on parsing logic is fine for now
            });
        } catch (notifErr) {
            console.error("Failed to create notification:", notifErr);
            // Don't fail the request if notification fails
        }
        // --------------------------------

        res.json({ success: true, message: "Status dusun berhasil diperbarui", data: location });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ULP 1: Data Kantor ULP (from gis_pln_db)
// ULP 1: Data Kantor ULP (from ulp_db in Atlas)
exports.getUlpOffices = async (req, res) => {
    try {
        const [offices, desaMappings, locations] = await Promise.all([
            Ulp.find({}).lean(),
            UlpDesa.find({}).lean(),
            Location.find({}, {
                desa: 1,
                kecamatan: 1,
                kabupaten: 1,
                dusun_detail: 1,
                warga: 1,
                pelanggan: 1
            }).lean()
        ]);

        // Index locations by Kec-Desa for fast lookup
        const locIndex = {};
        locations.forEach(l => {
            const key = `${(l.kecamatan || "").toUpperCase()}|${(l.desa || "").toUpperCase()}`;
            locIndex[key] = l;
        });

        const stats = offices.map(office => {
            const ulpName = (office.nama_ulp || office.ULP || "").trim();
            const villagesInUlp = desaMappings.filter(dm =>
                (dm.ULP || "").trim().toUpperCase() === ulpName.toUpperCase()
            );

            let totalDusun = 0;
            let totalPelanggan = 0;
            let totalWarga = 0;

            villagesInUlp.forEach(v => {
                const dName = (v["NAMA KELURAHAN/DESA"] || v.Desa || "").toUpperCase();
                const kName = (v.KECAMATAN || "").toUpperCase();

                // Try specific match first
                let loc = locIndex[`${kName}|${dName}`];

                // Fallback: try just desa name match if no exact match found
                if (!loc) {
                    loc = locations.find(l => (l.desa || "").toUpperCase() === dName);
                }

                if (loc) {
                    const validDusuns = (loc.dusun_detail || []).filter(dd =>
                        dd.status !== 'REFF!' && dd.status !== '#REF!' && dd.status !== '0' && dd.nama !== 'REFF!'
                    );
                    totalDusun += validDusuns.length;
                    totalPelanggan += (loc.pelanggan || 0);
                    totalWarga += (loc.warga || 0);
                }
            });

            return {
                ...office,
                name: ulpName, // Ensure consistent name property
                desaCount: villagesInUlp.length,
                dusunCount: totalDusun,
                pelanggan: office.pelanggan || totalPelanggan,
                update_pelanggan: office.update_pelanggan || "Desember, 2025",
                warga: totalWarga
            };
        });

        // Sort by name for consistency
        stats.sort((a, b) => a.name.localeCompare(b.name));

        res.json(stats);
    } catch (error) {
        console.error("Failed to fetch ULP Offices:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ULP 2: Data Desa Dikelompokkan Per ULP (from ulp_desa in Atlas)
exports.getUlpDesaGrouped = async (req, res) => {
    try {
        const semuaDesa = await UlpDesa.find({}).lean();
        const locations = await Location.find({}, {
            desa: 1,
            kecamatan: 1,
            kabupaten: 1,
            pelanggan: 1,
            warga: 1,
            sumber_warga: 1,
            tahun_warga: 1,
            dusun_detail: 1
        }).lean();

        // Index locations by Kab-Kec-Desa for fast lookup
        const locIndex = {};
        locations.forEach(l => {
            const key = `${(l.kabupaten || "").toUpperCase()}|${(l.kecamatan || "").toUpperCase()}|${(l.desa || "").toUpperCase()}`;
            locIndex[key] = l;
        });

        // Pengelompokan (Grouping) secara manual di server
        const grouped = semuaDesa.reduce((acc, desa) => {
            // Trim whitespace untuk hindari duplikat "Idi " vs "Idi"
            let namaULP = desa.ULP ? desa.ULP.trim() : 'Lainnya';

            if (!acc[namaULP]) acc[namaULP] = [];

            const desaName = (desa.Desa || desa["NAMA KELURAHAN/DESA"] || "").trim();
            const kecName = (desa.KECAMATAN || "").trim();
            const kabName = (desa["Kabupaten/Kota"] || "").trim();

            const key = `${kabName.toUpperCase()}|${kecName.toUpperCase()}|${desaName.toUpperCase()}`;
            const match = locIndex[key];

            // Synchronize dusun details with filtering
            const rawDusuns = match?.dusun_detail || [];
            const filteredDusuns = rawDusuns.filter(d =>
                d.status !== 'REFF!' && d.status !== '#REF!' && d.status !== '0' && d.nama !== 'REFF!'
            );

            acc[namaULP].push({
                ...desa,
                latitude: desa.latitude,
                longitude: desa.longitude,
                Status_Listrik: desa.Status_Listrik || "Berlistrik",
                Desa: desaName,
                Kecamatan: kecName,
                Kabupaten: kabName,
                UP3: desa.UP3,
                warga: match?.warga || 0,
                pelanggan: match?.pelanggan || 0,
                lembaga_warga: match?.sumber_warga || "-",
                tahun: match?.tahun_warga || "-",
                dusuns: filteredDusuns.map(d => ({
                    name: d.nama,
                    status: d.status
                }))
            });
            return acc;
        }, {});

        res.json(grouped);
    } catch (error) {
        console.error("Failed to fetch ULP Desa Groups:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ULP 3: Get ULP Detail with Stats
exports.getUlpDetail = async (req, res) => {
    try {
        const { name } = req.params;
        const decodedName = decodeURIComponent(name).trim();

        // Cari semua desa yang memiliki ULP ini
        // Kita            // Cari semua desa yang memiliki ULP ini
        const desaList = await UlpDesa.find({
            ULP: { $regex: new RegExp(`^${decodedName}\\s*$`, 'i') }
        }).lean();

        if (!desaList || desaList.length === 0) {
            // return res.status(404).json({ success: false, message: "ULP not found" });
            // Return empty data instead to prevent frontend error
            return res.json({
                success: true,
                data: {
                    name: decodedName,
                    stats: {
                        desa: 0,
                        dusun: 0,
                        warga: 0,
                        pelanggan: 0
                    },
                    kecamatan: [],
                    dusuns: []
                }
            });
        }

        // 2. Extract village names for query
        const desaNames = desaList.map(d => d["NAMA KELURAHAN/DESA"] || d.Desa);

        // 3. Get Location details from 'desas' collection
        // Optimize: match by desa name (+ optionally kecamatan if we trust the mapping)
        const [locations, ulpMeta] = await Promise.all([
            Location.find({ desa: { $in: desaNames } }).lean(),
            Ulp.findOne({ nama_ulp: new RegExp(`^${decodedName.replace(/^ULP\s+/i, '').trim()}$`, 'i') }).lean()
        ]);

        // 4. Calculate Stats
        const totalDesa = desaList.length;
        let totalDusun = 0;
        let totalWarga = 0;
        let totalPelanggan = 0;
        let sources = [];
        let years = [];

        let dusunList = []; // Collect all dusuns

        // Map for quick lookup
        const locMap = {};
        locations.forEach(l => {
            const key = `${(l.kecamatan || "").toUpperCase()}-${(l.desa || "").toUpperCase()}`;
            locMap[key] = l;
        });

        desaList.forEach(d => {
            const dName = (d["NAMA KELURAHAN/DESA"] || d.Desa || "").toUpperCase();
            const kName = (d.KECAMATAN || "").toUpperCase();

            // Try specific match first
            let loc = locMap[`${kName}-${dName}`];

            // Fallback: try just desa name match
            if (!loc) {
                loc = locations.find(l => (l.desa || "").toUpperCase() === dName);
            }

            if (loc) {
                // Sum Dusun
                const dCount = loc.dusun_count || (loc.dusun_detail ? loc.dusun_detail.length : 0);
                totalDusun += dCount;

                // Sum Warga & Pelanggan
                if (loc.warga) totalWarga += loc.warga;
                if (loc.pelanggan) totalPelanggan += loc.pelanggan;
                if (loc.sumber_warga && loc.sumber_warga !== "-") sources.push(loc.sumber_warga);
                if (loc.tahun_warga && loc.tahun_warga !== "-") years.push(loc.tahun_warga);

                // Collect Dusun Details
                if (loc.dusun_detail && Array.isArray(loc.dusun_detail)) {
                    loc.dusun_detail.forEach(dd => {
                        dusunList.push({
                            nama: dd.nama,
                            status: dd.status,
                            desa: d["NAMA KELURAHAN/DESA"]
                        });
                    });
                } else if (loc.dusuns && Array.isArray(loc.dusuns)) {
                    loc.dusuns.forEach(dd => {
                        dusunList.push({
                            nama: dd.nama,
                            status: dd.status,
                            desa: d["NAMA KELURAHAN/DESA"]
                        });
                    });
                }
            }
        });
        // 4. Group by Kecamatan for list
        const kecamatanGroups = {};
        desaList.forEach(desa => {
            const kec = desa.KECAMATAN || "LAINNYA";
            if (!kecamatanGroups[kec]) {
                kecamatanGroups[kec] = {
                    name: kec,
                    desaCount: 0,
                    desaList: []
                };
            }
            kecamatanGroups[kec].desaCount++;
            kecamatanGroups[kec].desaList.push(desa["NAMA KELURAHAN/DESA"] || desa.Desa);
        });

        const mostFrequent = (arr) => {
            if (!arr || arr.length === 0) return null;
            const map = {};
            arr.forEach(val => map[val] = (map[val] || 0) + 1);
            return Object.keys(map).reduce((a, b) => map[a] > map[b] ? a : b);
        };

        res.json({
            success: true,
            data: {
                name: decodedName,
                stats: {
                    desa: totalDesa,
                    dusun: totalDusun,
                    warga: totalWarga,
                    pelanggan: ulpMeta?.pelanggan || totalPelanggan,
                    update_pelanggan: ulpMeta?.update_pelanggan || "Desember, 2025",
                    lembaga_warga: mostFrequent(sources) || "-",
                    tahun: mostFrequent(years) || "-"
                },
                kecamatan: Object.values(kecamatanGroups),
                dusuns: dusunList
            }
        });
    } catch (error) {
        console.error("Error fetching ULP Detail:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update UP3 Pelanggan Count
exports.updateUp3Pelanggan = async (req, res) => {
    try {
        const { name, pelanggan, update_pelanggan } = req.body;
        const cleanName = (name || "").replace(/^UP3\s+/i, '').trim();

        const result = await Up3.findOneAndUpdate(
            { nama_up3: new RegExp(`^${cleanName}$`, 'i') },
            {
                pelanggan: parseInt(pelanggan),
                update_pelanggan: update_pelanggan || "Desember, 2025"
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update ULP Pelanggan Count
exports.updateUlpPelanggan = async (req, res) => {
    try {
        const { name, pelanggan, update_pelanggan } = req.body;
        const cleanName = (name || "").replace(/^ULP\s+/i, '').trim();

        const result = await Ulp.findOneAndUpdate(
            { nama_ulp: new RegExp(`^${cleanName}$`, 'i') },
            {
                pelanggan: parseInt(pelanggan),
                update_pelanggan: update_pelanggan || "Desember, 2025"
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
