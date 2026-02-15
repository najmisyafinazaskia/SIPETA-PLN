import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, BoxCubeIcon, GroupIcon } from "../../icons";

const _rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = _rawUrl.replace(/\/+$/, '');







interface Dusun {
    nama: string;
    status: string;
}

export default function Up3DesaDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(name || "");
    const [dusuns, setDusuns] = useState<Dusun[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"stable" | "warning">("stable");

    useEffect(() => {
        const fetchDesaDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/locations/search/${encodeURIComponent(decodedName)}?category=Desa`);
                const json = await response.json();
                if (json.success) {
                    setDusuns(json.data.dusuns || []);
                    setStats(json.data);
                }
            } catch (error) {
                console.error("Error fetching desa detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDesaDetail();
    }, [decodedName]);

    const filteredList = dusuns.filter((d) => {
        const isStable = d.status.toLowerCase() === "berlistrik pln";
        return activeTab === "stable" ? isStable : !isStable;
    });

    const countStable = dusuns.filter(d => d.status.toLowerCase() === "berlistrik pln").length;
    const countWarning = dusuns.length - countStable;

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
                        Desa {decodedName}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mt-1 font-outfit">List Dusun & Status Pasokan Listrik</p>
                </div>
            </div>

            <div className="p-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Card 1: Dusun */}
                    <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group cursor-default">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-amber-600">
                            <BoxCubeIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Total Dusun</p>
                        <h3 className="text-4xl font-black text-[#1C2434] dark:text-white leading-none mb-6 font-outfit">
                            {dusuns.length}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Titik Distribusi • Lihat Detail
                        </p>
                    </div>

                    {/* Card 2: Warga */}
                    <div
                        onClick={() => {
                            let link = 'https://data.acehprov.go.id/ru/dataset/jumlah-penduduk-desa-berdasarkan-jenis-kelamin-idm/resource/3f4f7fd0-5c2c-4067-adfe-d9b007c02bd3';
                            const desaName = decodedName.toUpperCase();
                            if (desaName.includes("PULO BUNTA") || desaName.includes("PULAU BUNTA")) {
                                link = 'https://web-api.bps.go.id/download.php?f=emrs2PeaH0a6WJZEdd9a61lrbE5kd1BRM1I0ckwydlIzUGVPV0dWbUxJWXJ5cGFIRkxScUtPWjJSejFjVUcxakFIbER5MzgyZmNudkpsVnJXeG12U0xwS1VoZFJGNnUzVFlmUHFoMC9INHRXYy84NC9XT0pVVmRoWmp2dGpvVkI1cWtlNit3UTR1clVFS0xhUTdiWDJKQXY5VHNTcXplYkpvZTNqSWYzY2FuSW9WSmswVUcxUklqWTYrYlVwRnRiVjRRNDJjRGdra1V0TG9NYWxMTFU0bkkwWnZQdXBSVXZ3WXozeW1INmZJUTZqTGsyUi9UVGdWQ0xKb3kxVHNHRFU2K0duVVk3MW9kMk8zKzI';
                            } else if (desaName.includes("PERKEBUNAN ALUR JAMBU")) {
                                link = 'https://web-api.bps.go.id/download.php?f=iLRij3EaVTd32UpTcGwhbzk3elg4RDI4c0h1NnE5QjY3V055MWlsMHZncStGZ0wrVVBUbmJUcEZSRU1KQmJvaDVLS0kyKzh5QTA1TklrSStvNTIwRTh2anhKeVhjNkJRRWZQS2xRRG5FNXBzU1VkL3VWOCtuRkNBK2hLamltcVloZHU5aU5wMk5TZ01tYTBlTkVhUFBUa043ZHpseUxIUFlDcWpqTnR6YlV4MElyTUtYS3IzZmN0aFNLMHZOTHNna2pEek10M0ZlRjE1ZElnV2pxWk9zNUhaVmFkR2dKZnRoZFZRbjZXV3RHdlFvUkIzdWdRL1MwNk9wM0dKMTIwcEw2WlZuekp1c1M2MVRlVjE%3D&utm_source=chatgpt.com';
                            } else if (desaName.includes("BATU JAYA")) {
                                link = 'https://disdukcapil.acehbaratkab.go.id/media/2020.08/DATA_AGREGAT_KEPENDUDUKAN_SEMESTER_I_TAHUN_2020.pdf';
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
                            {stats.lembaga_warga && stats.lembaga_warga !== '-' ? `Sumber : ${stats.lembaga_warga}, ${stats.tahun}` : "Estimasi Populasi"}
                        </p>
                    </div>


                </div>

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
                            Lihat Daftar Dusun
                        </p>
                    </button>

                    <button
                        onClick={() => setActiveTab("warning")}
                        className={`p-8 rounded-3xl border transition-all text-left group overflow-hidden relative ${activeTab === "warning" ? "border-yellow-500 bg-yellow-50/30 dark:bg-yellow-500/10 shadow-lg" : "border-gray-100 bg-white dark:bg-gray-800 hover:shadow-xl"
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeTab === "warning" ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20"}`}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 font-outfit">Belum Terjangkau Listrik</p>
                        <h3 className={`text-4xl font-black leading-none mb-6 font-outfit ${activeTab === "warning" ? "text-yellow-700 dark:text-yellow-400" : "text-[#1C2434] dark:text-white"}`}>
                            {countWarning}
                        </h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[#0052CC] font-outfit">
                            Perlu Perhatian Khusus
                        </p>
                    </button>
                </div>

                {/* List Dusun */}
                <div className="flex flex-col gap-4">
                    {filteredList.map((dusun, idx) => (
                        <div
                            key={idx}
                            className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all flex justify-between items-center group"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase font-outfit mb-1">
                                    {dusun.nama}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-outfit transition-colors group-hover:text-[#0052CC]">
                                    {decodedName.toUpperCase()} • {dusun.status}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${dusun.status.toLowerCase() === "berlistrik pln" ? "bg-[#22AD5C] shadow-[#22AD5C]" : "bg-[#F2C94C] shadow-[#F2C94C]"}`}></span>
                            </div>
                        </div>
                    ))}

                    {filteredList.length === 0 && (
                        <div className="py-10 text-center flex flex-col items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100">
                            <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Tidak ada data dusun pada kategori ini</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
