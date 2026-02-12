import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, BoxCubeIcon, BoltIcon, GroupIcon } from "../../icons";

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

interface RegionData {
    name: string;
    category: string;
    kecamatan: number;
    desa: number;
    dusun: number;
    kecamatanList?: (string | { nama: string; lembaga_warga?: string; tahun?: string | number })[];
    desaList?: string[];
    dusunList?: string[];
    dusuns?: { nama: string; status: string }[];
    pelanggan: number | string;
    warga: number;
    lembaga_warga?: string;
    tahun?: string | number;
}

export default function RegionDetailPage() {
    const { name } = useParams();
    const navigate = useNavigate();

    // Deteksi kategori dari query params
    const queryParams = new URLSearchParams(window.location.search);
    const category = queryParams.get('cat') || 'Kabupaten';
    const kab = queryParams.get('kab') || '';
    const kec = queryParams.get('kec') || '';
    const id = queryParams.get('id') || '';
    const highlight = queryParams.get('highlight') || ''; // Name to search/highlight
    const tabParam = queryParams.get('tab') || ''; // 'stable' or 'warning'

    const [data, setData] = useState<RegionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        list: any[];
        type: string
    }>({
        isOpen: false,
        title: "",
        list: [],
        type: ""
    });
    const [activeModalTab, setActiveModalTab] = useState<"stable" | "warning">("stable");
    const [modalSearchTerm, setModalSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!name) return;
            try {
                setLoading(true);
                let url = `${API_URL}/api/locations/search/${encodeURIComponent(name)}?category=${category}`;
                if (id) url += `&id=${id}`;
                if (kab) url += `&kab=${encodeURIComponent(kab)}`;
                if (kec) url += `&kec=${encodeURIComponent(kec)}`;

                const response = await fetch(url);
                const json = await response.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (error) {
                console.error("Error fetching region detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [name, category, id, kab, kec]);

    // Effect to handle auto-opening modal based on query params (e.g. from notification)
    useEffect(() => {
        if (data && tabParam && (data.category === 'Desa' || data.category === 'Kabupaten' || data.category === 'Kecamatan')) {
            // Only applicable if we have dusun list to show
            if (data.category === 'Desa' && data.dusuns) {
                setModal({
                    isOpen: true,
                    title: "Daftar Dusun",
                    list: data.dusuns,
                    type: "Dusun"
                });
                setActiveModalTab(tabParam as "stable" | "warning");
                if (highlight) setModalSearchTerm(highlight);
            }
        }
    }, [data, tabParam, highlight]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Data Tidak Ditemukan</h1>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
                    Kembali
                </button>
            </div>
        );
    }

    const openModal = (title: string, list: any[] | undefined, type: string) => {
        const safeList = Array.isArray(list) && list.length > 0 ? list : ["Data tidak tersedia"];
        setModal({
            isOpen: true,
            title,
            list: safeList,
            type
        });
        setActiveModalTab("stable");
        setModalSearchTerm("");
    };

    const handleListItemClick = (itemName: string) => {
        if (itemName === "Data tidak tersedia") return;

        setModal({ ...modal, isOpen: false });

        if (modal.type === "Kecamatan") {
            navigate(`/dashboard/region/detail/${encodeURIComponent(itemName)}?cat=Kecamatan`);
        } else if (modal.type === "Desa") {
            navigate(`/dashboard/region/detail/${encodeURIComponent(itemName)}?cat=Desa`);
        } else if (modal.type === "Dusun") {
            // Untuk Dusun, kita tidak punya detail page per dusun selain di level Desa
            // Jadi hanya alert atau stay
        }
    };

    // Helper to get item name from string or object
    const getItemName = (item: any): string => {
        if (typeof item === "string") return item;
        return item.nama || item.name || "";
    };

    // Helper to determine status
    const getDusunStatus = (status: string) => {
        const safeStatus = (status || "").toLowerCase();
        const isProblematic =
            status === "0" ||
            status === "REFF!" ||
            status === "Dusun tidak diketahui" ||
            safeStatus.includes("belum") ||
            safeStatus.includes("roadmap");
        return isProblematic ? "warning" : "stable";
    };

    return (
        <div className="relative rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-white/[0.03] font-outfit">
            {/* Header */}
            <div className="p-8 pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight font-outfit">
                        {data.category} {data.name}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mt-1 font-outfit">
                        Provinsi Aceh
                        {(data as any).kab ? ` • ${(data as any).kab}` : ""}
                        {(data as any).kec ? ` • Kec. ${(data as any).kec}` : ""}
                        • Informasi Detail Wilayah
                    </p>
                </div>
            </div>



            <div className="p-8 bg-gray-50/20">
                <div className={`grid gap-6 ${data.category === "Desa" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>

                    {/* Kartu 1: Kecamatan / Desa */}
                    <div
                        onClick={() => {
                            openModal(
                                data.category === "Kecamatan" ? "Daftar Desa / Gampong" :
                                    data.category === "Desa" ? "Daftar Dusun" : "Daftar Kecamatan",
                                data.category === "Kecamatan" ? (data.desaList || []) :
                                    data.category === "Desa" ? (data.dusuns || []) : (data.kecamatanList || []),
                                data.category === "Kecamatan" ? "Desa" :
                                    data.category === "Desa" ? "Dusun" : "Kecamatan"
                            );
                        }}
                        className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all cursor-pointer group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-600">
                            {data.category === "Desa" ? <BoltIcon className="w-7 h-7" /> : <BoxCubeIcon className="w-7 h-7" />}
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">
                            {data.category === "Kecamatan" ? "Desa / Gampong" :
                                data.category === "Desa" ? "Total Dusun" : "Kecamatan"}
                        </p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {data.category === "Kecamatan" ? (data.desa || 0).toLocaleString() :
                                data.category === "Desa" ? (data.dusun || 0).toLocaleString() : (data.kecamatan || 0).toLocaleString()}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            {data.category === "Desa" ? "Status Listrik Dusun • Klik untuk Detail" : "Wilayah Administrasi • Klik untuk Detail"}
                        </p>
                    </div>

                    {/* Kartu 2: Desa (untuk Kabupaten) atau Dusun (untuk Kecamatan) */}
                    {data.category !== "Desa" && (
                        <div
                            onClick={() => openModal(
                                data.category === "Kecamatan" ? "Daftar Dusun / Lingkungan" : "Daftar Desa / Gampong",
                                data.category === "Kecamatan" ? (data.dusuns || []) : (data.desaList || []),
                                data.category === "Kecamatan" ? "Dusun" : "Desa"
                            )}
                            className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all cursor-pointer group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-purple-600">
                                <BoxCubeIcon className="w-7 h-7" />
                            </div>
                            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">
                                {data.category === "Kecamatan" ? "Dusun / Lingkungan" : "Desa / Gampong"}
                            </p>
                            <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                                {data.category === "Kecamatan" ? (data.dusun || 0).toLocaleString() : (data.desa || 0).toLocaleString()}
                            </h3>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                                {data.category === "Kecamatan" ? "Titik Distribusi • Klik untuk Detail" : "Wilayah Desa • Klik untuk Detail"}
                            </p>
                        </div>
                    )}

                    {/* Kartu 3: Dusun (Khusus untuk Kabupaten) */}
                    {data.category === "Kabupaten" && (
                        <div
                            onClick={() => openModal(
                                "Daftar Dusun / Lingkungan",
                                data.dusuns || [],
                                "Dusun"
                            )}
                            className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all cursor-pointer group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-amber-600">
                                <BoxCubeIcon className="w-7 h-7" />
                            </div>
                            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Dusun</p>
                            <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                                {(data.dusun || 0).toLocaleString()}
                            </h3>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">Titik Distribusi • Klik untuk Detail</p>
                        </div>
                    )}





                    {/* Warga */}
                    <div
                        onClick={() => {
                            let link = 'https://aceh.bps.go.id/id/statistics-table/2/NjAyIzI=/-sk-kp-015---proyeksi-sp2020--jumlah-penduduk-hasil-proyeksi-sensus-penduduk-2020-menurut-jenis-kelamin-dan-kabupaten-kota.html';
                            if (data.category === 'Kecamatan') {
                                const kabName = ((data as any).kab || "").toUpperCase().replace(/^(KABUPATEN|KAB\.|KOTA)\s+/i, "").trim();
                                for (const [key, val] of Object.entries(KECAMATAN_SOURCES)) {
                                    if (key.includes(kabName) || kabName.includes(key)) {
                                        link = val;
                                        break;
                                    }
                                }
                            } else if (data.category === 'Desa') {
                                link = 'https://data.acehprov.go.id/ru/dataset/jumlah-penduduk-desa-berdasarkan-jenis-kelamin-idm/resource/3f4f7fd0-5c2c-4067-adfe-d9b007c02bd3';
                                const desaName = data.name.toUpperCase();
                                if (desaName.includes("PULO BUNTA") || desaName.includes("PULAU BUNTA")) {
                                    link = 'https://web-api.bps.go.id/download.php?f=emrs2PeaH0a6WJZEdd9a61lrbE5kd1BRM1I0ckwydlIzUGVPV0dWbUxJWXJ5cGFIRkxScUtPWjJSejFjVUcxakFIbER5MzgyZmNudkpsVnJXeG12U0xwS1VoZFJGNnUzVFlmUHFoMC9INHRXYy84NC9XT0pVVmRoWmp2dGpvVkI1cWtlNit3UTR1clVFS0xhUTdiWDJKQXY5VHNTcXplYkpvZTNqSWYzY2FuSW9WSmswVUcxUklqWTYrYlVwRnRiVjRRNDJjRGdra1V0TG9NYWxMTFU0bkkwWnZQdXBSVXZ3WXozeW1INmZJUTZqTGsyUi9UVGdWQ0xKb3kxVHNHRFU2K0duVVk3MW9kMk8zKzI';
                                } else if (desaName.includes("PERKEBUNAN ALUR JAMBU")) {
                                    link = 'https://web-api.bps.go.id/download.php?f=iLRij3EaVTd32UpTcGwhbzk3elg4RDI4c0h1NnE5QjY3V055MWlsMHZncStGZ0wrVVBUbmJUcEZSRU1KQmJvaDVLS0kyKzh5QTA1TklrSStvNTIwRTh2anhKeVhjNkJRRWZQS2xRRG5FNXBzU1VkL3VWOCtuRkNBK2hLamltcVloZHU5aU5wMk5TZ01tYTBlTkVhUFBUa043ZHpseUxIUFlDcWpqTnR6YlV4MElyTUtYS3IzZmN0aFNLMHZOTHNna2pEek10M0ZlRjE1ZElnV2pxWk9zNUhaVmFkR2dKZnRoZFZRbjZXV3RHdlFvUkIzdWdRL1MwNk9wM0dKMTIwcEw2WlZuekp1c1M2MVRlVjE%3D&utm_source=chatgpt.com';
                                } else if (desaName.includes("BATU JAYA")) {
                                    link = 'https://disdukcapil.acehbaratkab.go.id/media/2020.08/DATA_AGREGAT_KEPENDUDUKAN_SEMESTER_I_TAHUN_2020.pdf';
                                }
                            }
                            window.open(link, '_blank');
                        }}
                        className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mb-6 text-pink-600 transition-transform group-hover:scale-105">
                            <GroupIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Warga</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {(data.warga || 0).toLocaleString()}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            {data.lembaga_warga && data.tahun && data.lembaga_warga !== "-" ? (
                                `Sumber : ${data.lembaga_warga}, ${data.tahun}`
                            ) : (
                                "Jiwa • Berdasarkan Database Terverifikasi"
                            )}
                        </p>
                    </div>
                </div>
            </div>
            {/* Modal List */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl m-4 relative flex flex-col max-h-[90vh] shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight font-outfit">
                                {modal.title}
                            </h2>
                            <button
                                onClick={() => setModal({ ...modal, isOpen: false })}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto font-outfit">
                            <div className="mb-4 relative">
                                <input
                                    type="text"
                                    placeholder="Cari data..."
                                    value={modalSearchTerm}
                                    onChange={(e) => setModalSearchTerm(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-outfit"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>
                            </div>

                            {/* Tabs for Dusun Filter */}
                            {modal.type === "Dusun" && modal.list.length > 0 && typeof modal.list[0] !== "string" && (
                                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                    <button
                                        onClick={() => setActiveModalTab("stable")}
                                        className={`flex-1 flex justify-between items-center p-3 rounded-2xl border-2 transition-all ${activeModalTab === "stable" ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
                                            }`}
                                    >
                                        <span className={`text-xs font-bold uppercase tracking-wide ${activeModalTab === "stable" ? "text-green-700 dark:text-green-400" : "text-gray-500"}`}>Terjangkau Listrik</span>
                                        <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded-lg">
                                            {modal.list.filter((x: any) => getDusunStatus(x.status) === "stable").length}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setActiveModalTab("warning")}
                                        className={`flex-1 flex justify-between items-center p-3 rounded-2xl border-2 transition-all ${activeModalTab === "warning" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
                                            }`}
                                    >
                                        <span className={`text-xs font-bold uppercase tracking-wide ${activeModalTab === "warning" ? "text-yellow-700 dark:text-yellow-400" : "text-gray-500"}`}>Belum Terjangkau</span>
                                        <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-1 rounded-lg">
                                            {modal.list.filter((x: any) => getDusunStatus(x.status) === "warning").length}
                                        </span>
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-2">
                                {modal.list
                                    .filter((item: any) => {
                                        const itemName = typeof item === "string" ? item : item.nama;
                                        if (modalSearchTerm && !itemName.toLowerCase().includes(modalSearchTerm.toLowerCase())) {
                                            return false;
                                        }
                                        if (modal.type === "Dusun" && typeof item !== "string") {
                                            return getDusunStatus(item.status) === activeModalTab;
                                        }
                                        return true;
                                    })
                                    .map((item: any, idx: number) => {
                                        const isClickable = item !== "Data tidak tersedia" && modal.type !== "Dusun";
                                        const itemName = getItemName(item);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => handleListItemClick(itemName)}
                                                className={`p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 transition-colors group ${isClickable ? "cursor-pointer hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10" : ""}`}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${isClickable ? "bg-white dark:bg-gray-800 text-gray-400 group-hover:text-blue-500 group-hover:scale-110" : "bg-gray-200 dark:bg-gray-800 text-gray-400"}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                                            {itemName}
                                                        </span>
                                                        {modal.type === "Dusun" && item.status && getDusunStatus(item.status) === "warning" && (() => {
                                                            const nameUpper = itemName.toUpperCase();
                                                            if (nameUpper.includes('PERPOLIN') || nameUpper.includes('PERABIS')) {
                                                                return (
                                                                    <span className="text-[8px] font-bold text-blue-600 mt-1 uppercase tracking-widest bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md w-fit">
                                                                        🏗️ SUDAH DIKERJAKAN PADA ROADMAP 2025
                                                                    </span>
                                                                );
                                                            }
                                                            if (nameUpper.includes('LHOK PINEUNG')) {
                                                                return (
                                                                    <span className="text-[8px] font-bold text-purple-600 mt-1 uppercase tracking-widest bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md w-fit">
                                                                        📅 SUDAH MASUK PADA ROADMAP 2026
                                                                    </span>
                                                                );
                                                            }
                                                            return (
                                                                <span className="text-[8px] font-bold text-orange-600 mt-1 uppercase tracking-widest bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md w-fit">
                                                                    🏠 RUMAH KEBUN | TIDAK BERLISTRIK 24 JAM
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setModal({ ...modal, isOpen: false })}
                                className="w-full py-4 bg-[#1C2434] dark:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
