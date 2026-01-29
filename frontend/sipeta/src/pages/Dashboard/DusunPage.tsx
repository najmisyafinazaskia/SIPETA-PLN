import { useState, useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom"; // Navigation might not be needed if this is the lowest level, or maybe to detail?
import DusunMap from "./DusunMap";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface DusunItem {
    id: string; // Composite ID or just index
    name: string;
    type: "stable" | "warning";
    desa: string;
    kec: string;
    kab: string;
    status: string;
}

export default function DusunPage() {
    // const navigate = useNavigate(); // Dusun detail page usually doesn't exist deep enough, but let's keep it if needed.
    const [allDusuns, setAllDusuns] = useState<DusunItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedKec, setSelectedKec] = useState("Tampilkan Semua");
    const [activeTab, setActiveTab] = useState<"stable" | "warning">("stable");
    const [showStable, setShowStable] = useState(true);
    const [showWarning, setShowWarning] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/locations/all`);
                const json = await response.json();
                if (json.success && isMounted) {
                    const flattenedDusuns: DusunItem[] = [];

                    json.data.forEach((desa: any) => {
                        const dusuns = desa.dusun_detail || [];
                        if (dusuns.length > 0) {
                            dusuns.forEach((d: any, idx: number) => {
                                // Determine status for this specific dusun
                                const isProblematic =
                                    d.status === "0" ||
                                    d.status === "REFF!" ||
                                    d.status === "Dusun tidak diketahui" ||
                                    d.status?.toLowerCase().includes("belum");

                                // Special case Pulau Bunta (inherited from Desa)
                                const isPulauBunta = desa.desa.toLowerCase().includes("pulau bunta") ||
                                    desa.desa.toLowerCase().includes("pulo bunta");

                                const isWarning = isProblematic || isPulauBunta;

                                flattenedDusuns.push({
                                    id: `${desa._id}_${idx}`,
                                    name: d.nama || `Dusun ${idx + 1}`,
                                    type: isWarning ? "warning" : "stable",
                                    desa: desa.desa,
                                    kec: desa.kecamatan,
                                    kab: desa.kabupaten,
                                    status: d.status
                                });
                            });
                        } else {
                            // Option: If a desa has no dusuns, maybe we don't show anything in DusunPage? 
                            // Or show a placeholder? The user request implies showing actual dusuns.
                            // However, if we want to catch "Desa with status yet no dusuns", we might skip them here
                            // as this is specifically "DusunPage".
                        }
                    });

                    setAllDusuns(flattenedDusuns);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false };
    }, []);

    const daftarKecamatan = useMemo(() => {
        const kecs = allDusuns.map((item) => item.kec);
        return ["Tampilkan Semua", ...Array.from(new Set(kecs))];
    }, [allDusuns]);

    const filteredList = useMemo(() => {
        return allDusuns.filter((item) => {
            const matchSearch =
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.desa.toLowerCase().includes(searchTerm.toLowerCase());
            const matchKec = selectedKec === "Tampilkan Semua" || item.kec === selectedKec;
            const matchTab = item.type === activeTab;
            return matchSearch && matchKec && matchTab;
        });
    }, [searchTerm, selectedKec, allDusuns, activeTab]);


    // const handleCardClick = (id: string) => {
    //     // navigate(`/dashboard/dusun/${id}`); // Maybe no detail page for individual dusun?
    // };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-white/[0.03] font-outfit">
            <div className="p-8 pb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 font-outfit uppercase tracking-tight">
                    Demografi Pasokan Listrik Tingkat Dusun
                </h1>
            </div>

            <div className="relative w-full h-[700px] border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 group">
                <div className="absolute top-6 right-6 z-[1001] bg-white/95 dark:bg-gray-800/95 p-5 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-100 dark:border-gray-700 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-[#465FFF] rounded-full"></div>
                        <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Filter Monitoring</span>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={showStable}
                                        onChange={() => setShowStable(!showStable)}
                                        className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                                    />
                                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${showStable ? 'bg-[#14B8A6] border-[#14B8A6]' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {showStable && (
                                            <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Terjangkau Listrik</span>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] shadow-sm"></div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={showWarning}
                                        onChange={() => setShowWarning(!showWarning)}
                                        className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                                    />
                                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${showWarning ? 'bg-[#F2C94C] border-[#F2C94C]' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {showWarning && (
                                            <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Belum Terjangkau</span>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F2C94C] shadow-sm shadow-yellow-500/50"></div>
                        </label>
                    </div>
                </div>
                <div className="w-full h-full">
                    <DusunMap activeFilters={{ stable: showStable, warning: showWarning }} />
                </div>
            </div>

            <div className="p-8 bg-gray-50/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight">Daftar Dusun</h2>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {allDusuns.length} Dusun</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-gray-800/40 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Cari dusun, desa..."
                            className="pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white min-w-[200px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white cursor-pointer"
                            value={selectedKec}
                            onChange={(e) => setSelectedKec(e.target.value)}
                        >
                            {daftarKecamatan.map((kec) => (
                                <option key={kec} value={kec}>{kec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabs Filter */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("stable")}
                        className={`flex-1 flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${activeTab === "stable" ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
                            }`}
                    >
                        <span className={`font-bold ${activeTab === "stable" ? "text-teal-700 dark:text-teal-400" : "text-gray-500"}`}>Terjangkau Listrik</span>
                        <span className="text-xs font-bold bg-[#14B8A6] text-white px-2 py-1 rounded-lg">
                            {allDusuns.filter(l => l.type === "stable").length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("warning")}
                        className={`flex-1 flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${activeTab === "warning" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
                            }`}
                    >
                        <span className={`font-bold ${activeTab === "warning" ? "text-yellow-700 dark:text-yellow-400" : "text-gray-500"}`}>Belum Terjangkau Listrik</span>
                        <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-1 rounded-lg">
                            {allDusuns.filter(l => l.type === "warning").length}
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredList.map((item, idx) => (
                        <div
                            key={idx}
                            // onClick={() => handleCardClick(item.id)} // Disabled interaction for now
                            className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-[#1C2434] dark:text-white uppercase leading-tight group-hover:text-[#0052CC]">
                                    {item.name}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                    DESA {item.desa} • {item.kec}
                                </span>
                            </div>
                            <div className={`w-2.5 h-2.5 rounded-full ${item.type === "stable" ? "bg-[#14B8A6]" : "bg-[#F2C94C] shadow-[0_0_10px_#F2C94C]"}`}></div>
                        </div>
                    ))}
                    {filteredList.length === 0 && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100">
                            <span className="text-4xl opacity-50">🔎</span>
                            <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Dusun tidak ditemukan</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
