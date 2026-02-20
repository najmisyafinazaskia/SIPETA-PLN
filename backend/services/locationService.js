const Location = require('../models/Location');
const Up3 = require('../models/Up3');
const Up3Desa = require('../models/Up3Desa');
const Ulp = require('../models/Ulp');
const UlpDesa = require('../models/UlpDesa');
const Kabupaten = require('../models/Kabupaten');
const KecamatanStat = require('../models/KecamatanStat');
const fs = require('fs');
const path = require('path');

const UP3_TO_KABUPATEN = {
    "UP3 Banda Aceh": ["KOTA BANDA ACEH", "ACEH BESAR", "KOTA SABANG"],
    "UP3 Langsa": ["KOTA LANGSA", "ACEH TIMUR", "ACEH TAMIANG"],
    "UP3 Sigli": ["PIDIE", "PIDIE JAYA"],
    "UP3 Lhokseumawe": ["KOTA LHOKSEUMAWE", "ACEH UTARA", "BIREUEN"],
    "UP3 Meulaboh": ["ACEH BARAT", "NAGAN RAYA", "ACEH JAYA", "SIMEULUE"],
    "UP3 Subulussalam": ["KOTA SUBULUSSALAM", "ACEH SINGKIL", "ACEH SELATAN", "ACEH BARAT DAYA"]
};

const KABUPATEN_TO_UP3 = {};
Object.entries(UP3_TO_KABUPATEN).forEach(([up3, kabs]) => {
    kabs.forEach(kab => {
        KABUPATEN_TO_UP3[kab.toUpperCase()] = up3;
    });
});

class LocationService {
    async getKabupatenKota() {
        const kabupaten = await Location.distinct('kabupaten');
        return kabupaten.sort();
    }

    async getKecamatan(kabupatenKota) {
        const kecamatan = await Location.distinct('kecamatan', { kabupaten: kabupatenKota });
        return kecamatan.sort();
    }

    async getDesa(kabupatenKota, kecamatan) {
        return await Location.find(
            { kabupaten: kabupatenKota, kecamatan },
            { desa: 1, X: 1, Y: 1, dusun_detail: 1, _id: 1 }
        ).sort({ desa: 1 });
    }

    async getAllLocations(kabupatenKota, kecamatan) {
        const filter = {};
        if (kabupatenKota) filter.kabupaten = kabupatenKota;
        if (kecamatan) filter.kecamatan = kecamatan;
        const [locations, stats] = await Promise.all([
            Location.find(filter).sort({ kabupaten: 1, kecamatan: 1, desa: 1 }).lean(),
            KecamatanStat.find({}).lean()
        ]);
        const normalize = (str) => (str || "").replace(/^(KABUPATEN|KAB\.|KOTA)\s+/i, "").trim().toUpperCase();
        const wargaMap = {};
        stats.forEach(s => {
            const key = `${normalize(s.Kabkot)}-${normalize(s.Kecamatan)}`;
            wargaMap[key] = s.Warga;
        });
        return locations.map(l => ({
            ...l,
            kecamatan_warga: wargaMap[`${normalize(l.kabupaten)}-${normalize(l.kecamatan)}`] || 0
        }));
    }

    async getLocationStats() {
        let totalStats = { totalKabupatenKota: 23, totalKecamatan: 290, totalDesa: 6500, totalDusun: 20000 };
        const ulpDesaPath = path.join(__dirname, '../../db_Aceh/ulp_desa.json');
        if (fs.existsSync(ulpDesaPath)) {
            const ulpData = JSON.parse(fs.readFileSync(ulpDesaPath, 'utf8'));
            const uniqueDesa = new Set();
            let dusunCount = 0;
            ulpData.forEach(item => {
                if (item.desa) uniqueDesa.add(item.desa.toUpperCase());
                const validDusuns = (item.dusun_detail || []).filter(d => d.nama && d.nama !== "REFF!" && d.status !== "REFF!" && d.status !== "#REF!");
                dusunCount += validDusuns.length;
            });
            if (uniqueDesa.size > 0) totalStats.totalDesa = uniqueDesa.size;
            if (dusunCount > 0) totalStats.totalDusun = dusunCount;
        }

        const [dbStats, dbKabMeta] = await Promise.all([
            Location.aggregate([
                { $group: { _id: '$kabupaten', kecamatanList: { $addToSet: '$kecamatan' }, desaCount: { $sum: 1 }, dusunCount: { $sum: { $size: { $filter: { input: { $ifNull: ["$dusun_detail", []] }, as: "d", cond: { $ne: ["$$d.status", "REFF!"] } } } } }, pelanggan: { $sum: { $ifNull: ["$pelanggan", 0] } } } },
                { $project: { kabupaten: '$_id', kecamatanCount: { $size: '$kecamatanList' }, desaCount: 1, dusunCount: 1, pelanggan: 1, _id: 0 } },
                { $sort: { kabupaten: 1 } }
            ]),
            Kabupaten.find({})
        ]);

        if (dbStats.length > 0) {
            totalStats.totalKabupatenKota = dbStats.length;
            totalStats.totalKecamatan = dbStats.reduce((sum, s) => sum + s.kecamatanCount, 0);
            totalStats.totalDesa = Math.max(6500, dbStats.reduce((sum, s) => sum + s.desaCount, 0));
            totalStats.totalDusun = Math.max(20046, dbStats.reduce((sum, s) => sum + s.dusunCount, 0));
        }

        const metaMap = {};
        dbKabMeta.forEach(k => { if (k.nama) metaMap[k.nama.toUpperCase()] = k; });
        const details = dbStats.map(s => {
            const meta = metaMap[s.kabupaten.toUpperCase()] || {};
            return { ...s, koordinat: meta.koordinat || null, warga: meta.warga || 0, lembaga_warga: meta.lembaga_warga || "BPS", tahun: meta.tahun || 2024 };
        });
        return { summary: totalStats, details };
    }

    async getUp3Stats() {
        const stats = [];
        for (const [up3Name, kabList] of Object.entries(UP3_TO_KABUPATEN)) {
            const [data, up3Meta] = await Promise.all([
                Location.find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean(),
                Up3.findOne({ nama_up3: new RegExp(`^${up3Name.replace(/^UP3\s+/i, '').trim()}$`, 'i') }).lean()
            ]);
            stats.push({
                name: up3Name,
                kecamatanCount: [...new Set(data.map(i => i.kecamatan))].length,
                dusunCount: data.reduce((sum, loc) => sum + (loc.dusun_detail ? loc.dusun_detail.filter(d => d.status !== 'REFF!').length : 0), 0),
                warga: data.reduce((sum, l) => sum + (l.warga || 0), 0),
                pelanggan: up3Meta?.pelanggan || data.reduce((sum, l) => sum + (l.pelanggan || 0), 0)
            });
        }
        return stats;
    }

    async getUp3Detail(name) {
        const decodedName = decodeURIComponent(name);
        const kabList = UP3_TO_KABUPATEN[decodedName];
        if (!kabList) throw new Error('UP3 tidak ditemukan');
        const [data, kecStats, ulpDesaList, up3Meta] = await Promise.all([
            Location.find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean(),
            KecamatanStat.find({ kabupaten: { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean(),
            UlpDesa.find({ "Kabupaten/Kota": { $in: kabList.map(k => new RegExp(`^${k}$`, 'i')) } }).lean(),
            Up3.findOne({ nama_up3: new RegExp(`^${decodedName.replace(/^UP3\s+/i, '').trim()}$`, 'i') }).lean()
        ]);
        const uniqueUlps = [...new Set(ulpDesaList.map(u => (u.ULP || "").trim()))].filter(Boolean).sort();
        return {
            name: decodedName,
            kecamatanCount: [...new Set(data.map(i => i.kecamatan))].length,
            desaCount: [...new Set(data.map(i => i.desa))].length,
            warga: data.reduce((sum, l) => sum + (l.warga || 0), 0),
            pelanggan: up3Meta?.pelanggan || data.reduce((sum, l) => sum + (l.pelanggan || 0), 0),
            ulpList: uniqueUlps
        };
    }

    async globalSearch(q) {
        const regex = new RegExp(q, 'i');
        return await Location.aggregate([
            { $match: { $or: [{ kabupaten: regex }, { kecamatan: regex }, { desa: regex }, { "dusun_detail.nama": regex }] } },
            { $limit: 50 }
        ]);
    }
}

module.exports = new LocationService();
