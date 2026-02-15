import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";

const _rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5055';
const API_URL = _rawUrl.replace(/\/+$/, '');







interface Dusun {
    nama: string;
    status: string;
}

interface LocationData {
    _id: string;
    kabupatenKota: string;
    kecamatan: string;
    desa: string;
    dusuns: Dusun[];
}

export default function DusunDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"stable" | "warning">("stable");

    useEffect(() => {
        const fetchLocation = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/locations/${id}`);
                const json = await response.json();
                if (json.success) {
                    setLocation(json.data);
                }
            } catch (error) {
                console.error("Error fetching location details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocation();
    }, [id]);

    const listDusun = location?.dusuns || [];

    // Filter berdasarkan status
    const filteredList = listDusun.filter((dusun) => {
        const status = dusun.status.toLowerCase();
        const isStable = status === "berlistrik pln" || status === "berlistrik";
        return activeTab === "stable" ? isStable : !isStable;
    });

    const countStable = listDusun.filter(d => {
        const s = d.status.toLowerCase();
        return s === "berlistrik pln" || s === "berlistrik";
    }).length;
    const countWarning = listDusun.length - countStable;

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
            </div>
        );
    }

    if (!location) {
        return <div className="p-8 text-center">Data tidak ditemukan</div>;
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
                    <h1 className="text-3xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight font-outfit text-wrap">
                        Dusun di {location.desa}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1 font-outfit uppercase">
                        {location.kecamatan}, {location.kabupatenKota}
                    </p>
                </div>
            </div>

            <div className="p-8">
                {/* Tab Filter Button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <button
                        onClick={() => setActiveTab("stable")}
                        className={`p-8 rounded-3xl border transition-all text-left group overflow-hidden relative ${activeTab === "stable" ? "border-green-500 bg-green-50/30 dark:bg-green-500/10 shadow-lg" : "border-gray-100 bg-white dark:bg-gray-800 hover:shadow-xl"
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeTab === "stable" ? "bg-green-500 text-white" : "bg-green-50 text-green-600 dark:bg-green-900/20"}`}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Terjangkau Listrik</p>
                        <h3 className={`text-4xl font-black leading-none mb-6 font-outfit ${activeTab === "stable" ? "text-green-700 dark:text-green-400" : "text-[#1C2434] dark:text-white"}`}>
                            {countStable}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Lihat Daftar Dusun ⚡
                        </p>
                    </button>

                    <button
                        onClick={() => setActiveTab("warning")}
                        className={`p-8 rounded-3xl border transition-all text-left group overflow-hidden relative ${activeTab === "warning" ? "border-yellow-500 bg-yellow-50/30 dark:bg-yellow-500/10 shadow-lg" : "border-gray-100 bg-white dark:bg-gray-800 hover:shadow-xl"
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeTab === "warning" ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-600 dark:bg-green-900/20"}`}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Belum Terjangkau Listrik</p>
                        <h3 className={`text-4xl font-black leading-none mb-6 font-outfit ${activeTab === "warning" ? "text-yellow-700 dark:text-yellow-400" : "text-[#1C2434] dark:text-white"}`}>
                            {countWarning}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Perlu Perhatian Khusus ⚡
                        </p>
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {filteredList.map((dusun, idx) => {
                        const s = dusun.status.toLowerCase();
                        const isStable = s === "berlistrik pln" || s === "berlistrik";

                        return (
                            <div
                                key={idx}
                                className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex justify-between items-center group"
                            >
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase font-outfit mb-1">
                                        {dusun.nama}
                                    </h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-outfit transition-colors group-hover:text-[#0052CC]">
                                        {dusun.status}
                                    </p>
                                    {!isStable && (() => {
                                        const nameUpper = dusun.nama.toUpperCase();
                                        if (nameUpper.includes('PERPOLIN') || nameUpper.includes('PERABIS')) {
                                            return (
                                                <span className="text-[9px] font-bold text-blue-600 mt-2 uppercase tracking-widest bg-blue-50 border border-blue-200 px-2 py-1 rounded-md w-fit">
                                                    🏗️ SUDAH DIKERJAKAN PADA ROADMAP 2025
                                                </span>
                                            );
                                        }
                                        if (nameUpper.includes('LHOK PINEUNG')) {
                                            return (
                                                <span className="text-[9px] font-bold text-purple-600 mt-2 uppercase tracking-widest bg-purple-50 border border-purple-200 px-2 py-1 rounded-md w-fit">
                                                    📅 SUDAH MASUK PADA ROADMAP 2026
                                                </span>
                                            );
                                        }
                                        return (
                                            <span className="text-[9px] font-bold text-orange-600 mt-2 uppercase tracking-widest bg-orange-50 border border-orange-200 px-2 py-1 rounded-md w-fit">
                                                🏠 RUMAH KEBUN | TIDAK BERLISTRIK 24 JAM
                                            </span>
                                        );
                                    })()}
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${isStable ? "bg-[#22AD5C] shadow-[#22AD5C]" : "bg-[#F2C94C] shadow-[#F2C94C]"}`}></span>
                                </div>
                            </div>
                        );
                    })}

                    {filteredList.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100">
                            <span className="text-4xl opacity-20">🏝️</span>
                            <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Tidak ada data dusun pada kategori ini</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
