import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, GroupIcon, BoxCubeIcon } from "../../icons";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const KECAMATAN_SOURCES: Record<string, string> = {
    "ACEH BARAT": "https://disdukcapil.acehbaratkab.go.id/halaman/data-agregat-kependudukan-aceh-barat-per-gampong",
    "ACEH BARAT DAYA": "https://acehbaratdayakab.bps.go.id/statistics-table/2/MzA3IzI=/proyeksi-penduduk-kabupaten-aceh-barat-daya-menurut-kecamatan-.html",
    "ACEH BESAR": "https://acehbesarkab.bps.go.id/indicator/12/43/1/perkembangan-jumlah-penduduk.html",
    "ACEH JAYA": "https://acehjayakab.bps.go.id/indicator/12/140/1/jumlah-penduduk-kabupaten-aceh-jaya-menurut-jenis-kelamin.html",
    "ACEH SELATAN": "https://acehselatankab.bps.go.id/statistics-table/2/MzMjMg==/proyeksi-penduduk-per-kecamatan.html",
    "ACEH SINGKIL": "https://acehsingkilkab.bps.go.id/indicator/12/45/1/jumlah-penduduk-aceh-singkil-menurut-kecamatan.html",
    "ACEH TAMIANG": "https://acehtamiangkab.bps.go.id/indicator/12/117/1/jumlah-penduduk-menurut-kecamatan-di-kabupaten-aceh-tamiang.html",
    "ACEH TENGAH": "https://acehtengahkab.bps.go.id/indicator/12/137/3/jumlah-penduduk-kabupaten-aceh-tengah-berdasarkan-jenis-kelamin-per-kecamatan-.html",
    "ACEH TENGGARA": "https://acehtenggarakab.bps.go.id/indicator/12/119/2/jumlah-penduduk-menurut-jenis-kelamin-dan-kecamatan.html",
    "ACEH TIMUR": "https://dispendukcapil.acehtimurkab.go.id/berita/kategori/berita-dinas/jumlah-penduduk-kabupaten-aceh-timur-mencapai-466225-jiwa-pada-semester-i-tahun-2025",
    "ACEH UTARA": "https://acehutarakab.bps.go.id/id/statistics-table/3/V1ZSbFRUY3lTbFpEYTNsVWNGcDZjek53YkhsNFFUMDkjMw==/penduduk--laju-pertumbuhan-penduduk--distribusi-persentase-penduduk--kepadatan-penduduk--rasio-jenis-kelamin-penduduk-menurut-kecamatan-di-kabupaten-aceh-utara--2021.html?year=2021",
    "BENER MERIAH": "https://benermeriahkab.bps.go.id/id/statistics-table/3/V1ZSbFRUY3lTbFpEYTNsVWNGcDZjek53YkhsNFFUMDkjMw==/penduduk--laju-pertumbuhan-penduduk--distribusi-persentase-penduduk-kepadatan-penduduk--rasio-jenis-kelamin-penduduk-menurut-kecamatan-di-kabupaten-bener-meriah--2024.html",
    "BIREUEN": "https://data.bireuenkab.go.id/dataset/jumlah-penduduk/resource/a6b41a04-30a1-4414-bf4b-0eb89d039877",
    "GAYO LUES": "https://data.go.id/dataset/dataset/jumlah-penduduk-menurut-kecamatan-di-kabupaten-gayo-lues-2023",
    "NAGAN RAYA": "https://naganrayakab.bps.go.id/indicator/12/29/1/jumlah-penduduk.html",
    "PIDIE": "https://pidiekab.bps.go.id/indicator/12/90/1/jumlah-penduduk.html",
    "PIDIE JAYA": "https://pidiejayakab.bps.go.id/indicator/12/42/1/jumlah-penduduk.html",
    "SIMEULUE": "https://dukcapil.simeuluekab.go.id/media/2023.08/jumlah_penduduk_20221.pdf",
    "BANDA ACEH": "https://disdukcapil.bandaacehkota.go.id/download/jumlah-penduduk-kota-banda-aceh/",
    "LANGSA": "https://langsakota.bps.go.id/statistics-table/2/MTQ3IzI=/jumlah-penduduk-berdasarkan-jenis-kelamin.html",
    "LHOKSEUMAWE": "https://data.lhokseumawekota.go.id/dataset/jumlah-penduduk-menurut-kecamatan/resource/926144dc-92c2-4b56-8daa-ff71a0857e13",
    "SABANG": "https://sabangkota.bps.go.id/indicator/12/54/1/jumlah-penduduk-menurut-kecamatan.html",
    "SUBULUSSALAM": "https://subulussalamkota.bps.go.id/id/statistics-table/1/NTQ1IzE=/luas-wilayah-dan-jumlah-penduduk-menurut-kecamatan-di-kota-subulussalam-tahun-2016.html"
};

export default function UlpKecamatanDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(name || "");
    const [searchTerm, setSearchTerm] = useState("");
    const [listDesa, setListDesa] = useState<string[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKecDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/locations/search/${encodeURIComponent(decodedName)}?category=Kecamatan`);
                const json = await response.json();
                if (json.success && json.data) {
                    setListDesa(json.data.desaList || []);
                    setStats(json.data);
                }
            } catch (error) {
                console.error("Error fetching kecamatan detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchKecDetail();
    }, [decodedName]);

    const filteredDesa = listDesa.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleDesaClick = (desaName: string) => {
        navigate(`/dashboard/ulp/desa/${encodeURIComponent(desaName)}`);
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="relative rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-white/[0.03] font-outfit min-h-[600px]">
            <div className="p-8 pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight font-outfit">
                        Kecamatan {decodedName}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mt-1 font-outfit">Daftar Desa / Gampong di Wilayah ULP</p>
                </div>
            </div>

            <div className="p-8 pb-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1: Desa */}
                <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-purple-600">
                        <BoxCubeIcon className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Desa</p>
                    <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                        {listDesa.length}
                    </h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                        Wilayah Desa • Lihat Detail
                    </p>
                </div>

                {/* Card 2: Dusun */}
                <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-amber-600">
                        <BoxCubeIcon className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Dusun</p>
                    <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                        {stats.dusun || "-"}
                    </h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                        Titik Distribusi • Lihat Detail
                    </p>
                </div>

                {/* Card 3: Warga */}
                <div
                    onClick={() => {
                        let link = 'https://aceh.bps.go.id/id/statistics-table/2/NjAyIzI=/-sk-kp-015---proyeksi-sp2020--jumlah-penduduk-hasil-proyeksi-sensus-penduduk-2020-menurut-jenis-kelamin-dan-kabupaten-kota.html';
                        const kabName = (stats.kab || "").toUpperCase().replace(/^(KABUPATEN|KAB\.|KOTA)\s+/i, "").trim();
                        for (const [key, val] of Object.entries(KECAMATAN_SOURCES)) {
                            if (key.includes(kabName) || kabName.includes(key)) {
                                link = val;
                                break;
                            }
                        }
                        window.open(link, '_blank');
                    }}
                    className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-pointer"
                >
                    <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-pink-600">
                        <GroupIcon className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Warga</p>
                    <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                        {stats.warga ? stats.warga.toLocaleString() : "-"}
                    </h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                        {stats.lembaga_warga ? `Sumber : ${stats.lembaga_warga}, ${stats.tahun}` : "Estimasi Populasi"}
                    </p>
                </div>


            </div>

            <div className="p-8">
                {/* Search Bar */}
                <div className="mb-8 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari nama desa..."
                            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {filteredDesa.map((desa, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleDesaClick(desa)}
                            className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex justify-between items-center group cursor-pointer"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase font-outfit mb-1">
                                    {desa}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-outfit transition-colors group-hover:text-[#0052CC]">
                                    DESA / GAMPONG
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-[#22AD5C] shadow-[0_0_8px_#22AD5C]"></div>
                            </div>
                        </div>
                    ))}
                    {filteredDesa.length === 0 && (
                        <div className="py-10 text-center flex flex-col items-center gap-3">
                            <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Data tidak ditemukan</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
