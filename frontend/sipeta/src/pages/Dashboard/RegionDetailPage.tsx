import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, GroupIcon, GridIcon, BoxCubeIcon, BoltIcon } from "../../icons";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface RegionData {
    name: string;
    category: string;
    kecamatan: number;
    desa: number;
    dusun: number;
    kecamatanList?: string[];
    desaList?: string[];
    dusunList?: string[];
    dusuns?: { nama: string; status: string }[];
    warga: number | string;
    pelanggan: number | string;
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

    const [data, setData] = useState<RegionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        list: (string | { nama: string; status: string })[];
        type: string
    }>({
        isOpen: false,
        title: "",
        list: [],
        type: ""
    });
    const [activeModalTab, setActiveModalTab] = useState<"stable" | "warning">("stable");

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

    const openModal = (title: string, list: (string | { nama: string; status: string })[] | undefined, type: string) => {
        const safeList = Array.isArray(list) && list.length > 0 ? list : ["Data tidak tersedia"];
        setModal({
            isOpen: true,
            title,
            list: safeList,
            type
        });
        setActiveModalTab("stable");
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

    // Helper to determine status
    const getDusunStatus = (status: string) => {
        const safeStatus = (status || "").toLowerCase();
        const isProblematic =
            status === "0" ||
            status === "REFF!" ||
            status === "Dusun tidak diketahui" ||
            safeStatus.includes("belum");
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
                    <p className="text-lg text-gray-500 font-medium mt-1 font-outfit">Provinsi Aceh • Informasi Detail Wilayah</p>
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
                            {data.category === "Desa" ? <BoltIcon className="w-7 h-7" /> : <GridIcon className="w-7 h-7" />}
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">
                            {data.category === "Kecamatan" ? "Desa / Gampong" :
                                data.category === "Desa" ? "Status Per Dusun" : "Kecamatan"}
                        </p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {data.category === "Kecamatan" ? (data.desa || 0).toLocaleString() :
                                data.category === "Desa" ? (data.dusun || 0).toLocaleString() : (data.kecamatan || 0).toLocaleString()}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            {data.category === "Desa" ? "Data Dusun • Klik untuk Detail" : "Wilayah Administrasi • Klik untuk Detail"}
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
                    <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group cursor-default">
                        <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-6 text-green-600 transition-transform group-hover:scale-105">
                            <GroupIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Warga</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">-</h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">Jiwa Terdata</p>
                    </div>

                    {/* Pelanggan */}
                    <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group cursor-default">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-6 text-orange-600 transition-transform group-hover:scale-105">
                            <BoltIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Pelanggan Aktif</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">-</h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">Koneksi Terdaftar</p>
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
                                    .filter((item) => {
                                        if (modal.type === "Dusun" && typeof item !== "string") {
                                            return getDusunStatus(item.status) === activeModalTab;
                                        }
                                        return true;
                                    })
                                    .map((item, idx) => {
                                        const isClickable = item !== "Data tidak tersedia" && modal.type !== "Dusun";
                                        const itemName = typeof item === "string" ? item : item.nama;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => handleListItemClick(itemName)}
                                                className={`p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 transition-colors group ${isClickable ? "cursor-pointer hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10" : ""}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${isClickable ? "bg-white dark:bg-gray-800 text-gray-400 group-hover:text-blue-500 group-hover:scale-110" : "bg-gray-200 dark:bg-gray-800 text-gray-400"}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                                        {itemName}
                                                    </span>
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
