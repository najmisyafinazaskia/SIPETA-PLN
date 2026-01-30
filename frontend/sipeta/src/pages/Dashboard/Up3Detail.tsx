import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, GridIcon, BoxCubeIcon, GroupIcon, BoltIcon } from "../../icons";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Up3Stats {
    name: string;
    kecamatanList: string[];
    kecamatanCount: number;
    desaCount: number;
    dusunCount: number;
    desaList: string[];
    dusuns: { nama: string; status: string }[];
    warga: number;
    pelanggan: number;
}

export default function Up3Detail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(name || "");
    const [stats, setStats] = useState<Up3Stats | null>(null);
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
        const fetchUp3Detail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/locations/up3/detail/${encodeURIComponent(decodedName)}`);
                const json = await response.json();
                if (json.success) {
                    setStats(json.data);
                }
            } catch (error) {
                console.error("Error fetching UP3 detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUp3Detail();
    }, [decodedName]);

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
            navigate(`/dashboard/up3/kecamatan/${encodeURIComponent(itemName)}`);
        } else if (modal.type === "Desa") {
            navigate(`/dashboard/up3/desa/${encodeURIComponent(itemName)}`);
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

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex h-96 items-center justify-center flex-col gap-4">
                <div className="text-xl font-bold text-gray-400">Data UP3 Tidak Ditemukan</div>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Kembali</button>
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
                        {decodedName}

                    </h1>
                    <p className="text-lg text-gray-500 font-medium mt-1 font-outfit">Detail Wilayah & Statistik</p>
                </div>
            </div>



            <div className="p-8 bg-gray-50/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1: Kecamatan */}
                    <div
                        onClick={() => openModal("Daftar Kecamatan", stats.kecamatanList, "Kecamatan")}
                        className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all cursor-pointer group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-600">
                            <GridIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Kecamatan</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {stats.kecamatanCount.toLocaleString()}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Wilayah Administratif • Lihat Detail
                        </p>
                    </div>

                    {/* Card 2: Desa */}
                    <div
                        onClick={() => openModal("Daftar Desa / Gampong", stats.desaList, "Desa")}
                        className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all cursor-pointer group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-purple-600">
                            <BoxCubeIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Desa / Gampong</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {stats.desaCount.toLocaleString()}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Wilayah Desa • Lihat Detail
                        </p>
                    </div>

                    {/* Card 3: Dusun */}
                    <div
                        onClick={() => openModal("Daftar Dusun / Lingkungan", stats.dusuns, "Dusun")}
                        className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all cursor-pointer group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-amber-600">
                            <BoxCubeIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Dusun</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {stats.dusunCount.toLocaleString()}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Titik Distribusi • Lihat Detail
                        </p>
                    </div>

                    {/* Card 4: Warga */}
                    <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-default">
                        <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-green-600">
                            <GroupIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Warga</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            -
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Jiwa Terdata
                        </p>
                    </div>

                    {/* Card 5: Pelanggan */}
                    <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-default">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-orange-600">
                            <BoltIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Pelanggan Aktif</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            -
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Koneksi Terdaftar
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
            )}
        </div>
    );
}
