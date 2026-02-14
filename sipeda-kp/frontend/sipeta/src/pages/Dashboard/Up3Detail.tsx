import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, BoxCubeIcon, BoltIcon, GroupIcon, PencilIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Up3Stats {
    name: string;
    kecamatanList: (string | { nama: string; lembaga_warga?: string; tahun?: string | number })[];
    kecamatanCount: number;
    desaCount: number;
    dusunCount: number;
    desaList: string[];
    dusuns: { nama: string; status: string }[];
    pelanggan: number;
    warga?: number;
    lembaga_warga?: string;
    tahun?: string | number;
    ulpCount?: number;
    ulpList?: string[];
    update_pelanggan?: string;
    sumber_pelanggan?: string;
    tahun_pelanggan?: string;
}

export default function Up3Detail() {
    const { user } = useAuth();
    const { name } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(name || "");
    const [stats, setStats] = useState<Up3Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [newPelanggan, setNewPelanggan] = useState("");
    const [newSumber, setNewSumber] = useState("Data Induk Layanan");
    const [newTahun, setNewTahun] = useState("PLN 2025");
    const [isUpdating, setIsUpdating] = useState(false);
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

    const handleUpdatePelanggan = async () => {
        try {
            setIsUpdating(true);
            const response = await fetch(`${API_URL}/api/locations/up3/update-pelanggan`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: decodedName,
                    pelanggan: newPelanggan,
                    sumber: newSumber,
                    tahun: newTahun
                })
            });
            const json = await response.json();
            if (json.success) {
                // Refresh data
                const responseDetail = await fetch(`${API_URL}/api/locations/up3/detail/${encodeURIComponent(decodedName)}`);
                const jsonDetail = await responseDetail.json();
                if (jsonDetail.success) {
                    setStats(jsonDetail.data);
                }
                setIsInputModalOpen(false);
            }
        } catch (error) {
            console.error("Error updating pelanggan:", error);
        } finally {
            setIsUpdating(false);
        }
    };

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
            navigate(`/dashboard/up3/kecamatan/${encodeURIComponent(itemName)}`);
        } else if (modal.type === "Desa") {
            navigate(`/dashboard/up3/desa/${encodeURIComponent(itemName)}`);
        } else if (modal.type === "ULP") {
            navigate(`/dashboard/ulp/unit/${encodeURIComponent(itemName)}`);
        }
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

    // Helper to get item name from string or object
    const getItemName = (item: any): string => {
        if (typeof item === "string") return item;
        return item.nama || item.name || "";
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
                            <BoxCubeIcon className="w-7 h-7" />
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

                    {/* Card 4: ULP */}
                    <div
                        onClick={() => openModal("Daftar ULP", stats.ulpList, "ULP")}
                        className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all cursor-pointer group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-green-600">
                            <BoxCubeIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Unit Layanan (ULP)</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {(stats.ulpCount || 0).toLocaleString()}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Unit Pelayanan • Lihat Detail
                        </p>
                    </div>
                    {/* Card 5: Pelanggan */}
                    <div
                        onClick={() => {
                            if (user?.role !== "superadmin") return;
                            setNewPelanggan(stats.pelanggan?.toString() || "");
                            setNewSumber((stats.sumber_pelanggan && stats.sumber_pelanggan !== "-") ? stats.sumber_pelanggan : "Data Induk Layanan");
                            setNewTahun((stats.tahun_pelanggan && stats.tahun_pelanggan !== "-") ? stats.tahun_pelanggan : "PLN 2025");
                            setIsInputModalOpen(true);
                        }}
                        className={`p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group relative ${user?.role === "superadmin" ? "cursor-pointer" : ""}`}
                    >
                        {user?.role === "superadmin" && (
                            <div className="absolute top-6 right-6 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                                <PencilIcon className="w-5 h-5" />
                            </div>
                        )}
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-6 text-orange-600 transition-transform group-hover:scale-105">
                            <BoltIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Pelanggan Aktif</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {stats.pelanggan || stats.pelanggan === 0 ? stats.pelanggan.toLocaleString() : "-"}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Sumber : {(stats.sumber_pelanggan && stats.sumber_pelanggan !== "-") ? stats.sumber_pelanggan : "Data Induk Layanan"}, {(stats.tahun_pelanggan && stats.tahun_pelanggan !== "-") ? stats.tahun_pelanggan : "PLN 2025"}
                        </p>
                    </div>

                    {/* Card 6: Warga */}
                    <div
                        onClick={() => {
                            const link = 'https://data.acehprov.go.id/ru/dataset/jumlah-penduduk-desa-berdasarkan-jenis-kelamin-idm/resource/3f4f7fd0-5c2c-4067-adfe-d9b007c02bd3';
                            window.open(link, '_blank');
                        }}
                        className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mb-6 text-pink-600 transition-transform group-hover:scale-110">
                            <GroupIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Warga ( Desa )</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {(stats.warga || 0).toLocaleString()}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            {stats.lembaga_warga && stats.tahun && stats.lembaga_warga !== "-" ? (
                                `Sumber : ${stats.lembaga_warga}, ${stats.tahun}`
                            ) : (
                                "Jiwa • Agregasi Kecamatan"
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
                                                        {modal.type === "Dusun" && getDusunStatus(item.status) === "warning" && (() => {
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
            )}

            {/* Modal Input Pelanggan */}
            {isInputModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10">
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 mb-8">
                                    <BoltIcon className="w-10 h-10" />
                                </div>
                                <h2 className="text-[1.5rem] font-black text-[#1C2434] dark:text-white uppercase tracking-tight font-outfit mb-3">
                                    Update Data Pelanggan
                                </h2>
                                <p className="text-[14px] font-medium text-gray-400 font-outfit max-w-[90%]">
                                    Masukkan jumlah pelanggan baru untuk <span className="text-blue-600 font-bold">{decodedName}</span>
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1 font-outfit opacity-70">
                                        Jumlah Pelanggan (Koneksi)
                                    </label>
                                    <input
                                        type="number"
                                        value={newPelanggan}
                                        onChange={(e) => setNewPelanggan(e.target.value)}
                                        className="w-full px-8 py-5 rounded-[2rem] border-none bg-gray-100 dark:bg-white/5 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit text-xl font-black text-gray-800 dark:text-white text-center"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1 font-outfit opacity-70">
                                            Sumber Data
                                        </label>
                                        <input
                                            type="text"
                                            value={newSumber}
                                            onChange={(e) => setNewSumber(e.target.value)}
                                            className="w-full px-6 py-4 rounded-3xl border-none bg-gray-100 dark:bg-white/5 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit text-sm font-bold text-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1 font-outfit opacity-70">
                                            Tahun Data
                                        </label>
                                        <input
                                            type="text"
                                            value={newTahun}
                                            onChange={(e) => setNewTahun(e.target.value)}
                                            className="w-full px-6 py-4 rounded-3xl border-none bg-gray-100 dark:bg-white/5 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit text-sm font-bold text-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>



                                <div className="flex flex-col gap-4 pt-4">
                                    <button
                                        onClick={handleUpdatePelanggan}
                                        disabled={isUpdating}
                                        className="w-full bg-[#22AD5C] hover:bg-[#1C8C4A] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] flex items-center justify-center font-outfit disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                    <button
                                        onClick={() => setIsInputModalOpen(false)}
                                        className="w-full bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all font-outfit"
                                    >
                                        Batalkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
