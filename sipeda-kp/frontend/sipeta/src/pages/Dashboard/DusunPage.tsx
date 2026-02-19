import { useState, useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom"; 
import { useSearchParams } from "react-router-dom";
import DusunMap from "./DusunMap";
import MapFilter from "../../components/ui/MapFilter";
import { useAuth } from "../../context/AuthContext";
import SearchableSelect from "../../components/ui/SearchableSelect";
import ModernAlert from "../../components/ui/ModernAlert";

const _rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = _rawUrl.replace(/\/+$/, '');

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
    const [searchParams] = useSearchParams();
    const { user } = useAuth(); // Get user context
    // const navigate = useNavigate(); 

    // Initial State from URL params logic
    const initialTab = searchParams.get('tab') === 'warning' ? 'warning' : 'stable';
    const initialSearch = searchParams.get('highlight') || '';

    const [allDusuns, setAllDusuns] = useState<DusunItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedKec, setSelectedKec] = useState("Tampilkan Semua");
    const [activeTab, setActiveTab] = useState<"stable" | "warning">(initialTab);
    const [showStable, setShowStable] = useState(true);
    const [showWarning, setShowWarning] = useState(true);

    // Update state if params change later (e.g. click another notification while on page)
    useEffect(() => {
        const tab = searchParams.get('tab');
        const highlight = searchParams.get('highlight');
        if (tab === 'warning' || tab === 'stable') {
            setActiveTab(tab);
        }
        if (highlight) {
            setSearchTerm(highlight);
        }
    }, [searchParams]);

    const [selectedDusun, setSelectedDusun] = useState<DusunItem | null>(null);
    const [customStatus, setCustomStatus] = useState("");
    const [updating, setUpdating] = useState(false);

    // Sync custom status when modal opens
    useEffect(() => {
        if (selectedDusun) {
            const isDefault = ["Berlistrik PLN", "Belum Berlistrik"].includes(selectedDusun.status);
            setCustomStatus(isDefault ? "" : selectedDusun.status);
        } else {
            setCustomStatus("");
        }
    }, [selectedDusun]);

    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, type: "success" | "error" | "warning" | "info" }>({
        isOpen: false,
        title: "",
        message: "",
        type: "success"
    });

    const showAlert = (title: string, message: string, type: "success" | "error" | "warning" | "info" = "success") => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    // Sync Map Filter with Tabs below
    useEffect(() => {
        if (showStable && !showWarning) {
            setActiveTab("stable");
        } else if (!showStable && showWarning) {
            setActiveTab("warning");
        }
    }, [showStable, showWarning]);

    // Filter Logic
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [locationsInitialized, setLocationsInitialized] = useState(false);

    // Compute unique locations for filter (Kabupaten)
    const uniqueLocations = useMemo(() => {
        const kabs = new Set(allDusuns.map(k => k.kab));
        return Array.from(kabs).sort().map(name => ({ name }));
    }, [allDusuns]);

    useEffect(() => {
        if (uniqueLocations.length > 0 && !locationsInitialized) {
            setSelectedLocations(uniqueLocations.map(k => k.name));
            setLocationsInitialized(true);
        }
    }, [uniqueLocations, locationsInitialized]);

    const toggleAllLocations = () => {
        if (selectedLocations.length === uniqueLocations.length) {
            setSelectedLocations([]);
        } else {
            setSelectedLocations(uniqueLocations.map(k => k.name));
        }
    };

    const toggleLocation = (name: string) => {
        if (selectedLocations.includes(name)) {
            setSelectedLocations(selectedLocations.filter(L => L !== name));
        } else {
            setSelectedLocations([...selectedLocations, name]);
        }
    };

    // Main Data Fetcher
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/locations/all`);
            const json = await response.json();
            if (json.success) {
                const flattenedDusuns: DusunItem[] = [];

                json.data.forEach((desa: any) => {
                    const dusuns = desa.dusun_detail || [];
                    if (dusuns.length > 0) {
                        dusuns.forEach((d: any, idx: number) => {
                            const isProblematic =
                                d.status === "0" ||
                                d.status === "REFF!" ||
                                d.status === "Dusun tidak diketahui" ||
                                d.status?.toLowerCase().includes("belum") ||
                                d.status?.toLowerCase().includes("roadmap");

                            const isPulauBunta = desa.desa.toLowerCase().includes("pulau bunta") ||
                                desa.desa.toLowerCase().includes("pulo bunta");

                            const isWarning = isProblematic || isPulauBunta;

                            // Logika Default Status Baru:
                            // Jika Warning dan bukan Perpolin/Perabis/Lhok Sandeng, jadikan "Rumah Kebun | Tidak Berlistrik 24 Jam"
                            let finalStatus = d.status;
                            const dNameUpper = (d.nama || "").toUpperCase();
                            const isException = dNameUpper.includes("PERPOLIN") || dNameUpper.includes("PERABIS") || dNameUpper.includes("LHOK SANDENG");

                            if (isWarning && !isException) {
                                // Hanya ubah jika statusnya masih status default "jelek" (0, REFF, dll)
                                if (d.status === "0" || d.status === "REFF!" || d.status === "Dusun tidak diketahui" || !d.status) {
                                    finalStatus = "Rumah Kebun | Tidak Berlistrik 24 Jam";
                                }
                            }

                            flattenedDusuns.push({
                                id: desa._id, // Store actual Desa ID here for API
                                name: d.nama || `Dusun ${idx + 1}`,
                                type: isWarning ? "warning" : "stable",
                                desa: desa.desa,
                                kec: desa.kecamatan,
                                kab: desa.kabupaten,
                                status: finalStatus
                            });
                        });
                    }
                });

                setAllDusuns(flattenedDusuns);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCardClick = (item: DusunItem) => {
        setSelectedDusun(item);
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedDusun) return;

        try {
            setUpdating(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/locations/dusun/update-status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    desaId: selectedDusun.id,
                    dusunName: selectedDusun.name,
                    newStatus: newStatus,
                    userName: user?.name || "Admin"
                })
            });
            const json = await response.json();

            if (json.success) {
                setSelectedDusun(null);
                await fetchData();
                showAlert("Berhasil!", "Status dusun telah diperbarui.", "success");
            } else {
                showAlert("Gagal!", json.message || "Gagal mengupdate status", "error");
            }
        } catch (error) {
            console.error("Update error:", error);
            showAlert("Error!", "Terjadi kesalahan koneksi ke server.", "error");
        } finally {
            setUpdating(false);
        }
    };

    const daftarKecamatan = useMemo(() => {
        const kecs = allDusuns.map((item) => item.kec);
        return ["Tampilkan Semua", ...Array.from(new Set(kecs))];
    }, [allDusuns]);

    const filteredList = useMemo(() => {
        return allDusuns.filter((item) => {
            const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchKec = selectedKec === "Tampilkan Semua" || item.kec === selectedKec;
            const matchTab = item.type === activeTab;
            return matchSearch && matchKec && matchTab;
        });
    }, [searchTerm, selectedKec, allDusuns, activeTab]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-white/[0.03] font-outfit relative">
            <div className="p-8 pb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 font-outfit uppercase tracking-tight">
                    Distribusi Elektrifikasi Tingkat Dusun
                </h1>
            </div>

            <div className="relative w-full h-[700px] border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 group">
                <MapFilter
                    showStable={showStable}
                    setShowStable={setShowStable}
                    showWarning={showWarning}
                    setShowWarning={setShowWarning}
                    selectedLocations={selectedLocations}
                    toggleLocation={toggleLocation}
                    toggleAllLocations={toggleAllLocations}
                    uniqueLocations={uniqueLocations}
                />
                <div className="w-full h-full">
                    <DusunMap activeFilters={{ stable: showStable, warning: showWarning }} filterLocations={selectedLocations} dataSourceUrl={`${API_URL}/api/locations/map/geojson?strict=true`} />
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
                            placeholder="Cari dusun..."
                            className="pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white min-w-[200px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchableSelect
                            options={daftarKecamatan}
                            value={selectedKec}
                            onChange={setSelectedKec}
                            placeholder="Pilih Kecamatan"
                            className="w-full sm:w-auto min-w-[200px]"
                        />
                    </div>
                </div>

                {/* Tabs Filter */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("stable")}
                        className={`flex-1 flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${activeTab === "stable" ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
                            }`}
                    >
                        <span className={`font-bold ${activeTab === "stable" ? "text-green-700 dark:text-green-400" : "text-gray-500"}`}>Terjangkau Listrik</span>
                        <span className="text-xs font-bold bg-[#22c55e] text-white px-2 py-1 rounded-lg">
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
                            onClick={() => handleCardClick(item)}
                            className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-sm font-black text-[#1C2434] dark:text-white uppercase leading-tight group-hover:text-[#0052CC]">
                                    {item.name}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    DESA {item.desa} • {item.kec}
                                </span>
                                {item.status !== "Berlistrik PLN" && item.status !== "Belum Berlistrik" && (
                                    <span className="text-[9px] font-bold mt-1.5 uppercase tracking-widest px-2 py-1 rounded-md w-fit border text-blue-600 bg-blue-50 border-blue-200">
                                        {item.status}
                                    </span>
                                )}
                            </div>
                            <div className={`w-3 h-3 rounded-full ${item.type === "stable" ? "bg-[#00C851]" : "bg-[#F2C94C] shadow-[0_0_8px_rgba(242,201,76,0.6)]"}`}></div>
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

            {/* Update Status Modal */}
            {selectedDusun && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scaleIn">
                        <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight mb-2">
                            Update Status Dusun
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 font-medium">
                            {selectedDusun.name}, Desa <span className="text-gray-700 dark:text-gray-300 font-bold">{selectedDusun.desa}</span>
                        </p>

                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleStatusUpdate("Berlistrik PLN")}
                                    disabled={updating}
                                    className={`py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedDusun.status === "Berlistrik PLN"
                                        ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                                        : "bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 border border-gray-100"
                                        }`}
                                >
                                    Berlistrik PLN
                                </button>

                                <button
                                    onClick={() => handleStatusUpdate("Belum Berlistrik")}
                                    disabled={updating}
                                    className={`py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedDusun.status === "Belum Berlistrik"
                                        ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20"
                                        : "bg-gray-50 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-100"
                                        }`}
                                >
                                    Belum Berlistrik
                                </button>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Keterangan Khusus / Status Lainnya</label>
                                <textarea
                                    className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-700 dark:text-white"
                                    placeholder="Contoh: Roadmap 2025, Rumah Kebun, dll..."
                                    rows={3}
                                    value={customStatus}
                                    onChange={(e) => setCustomStatus(e.target.value)}
                                />
                                <button
                                    onClick={() => handleStatusUpdate(customStatus.trim())}
                                    disabled={updating || !customStatus.trim()}
                                    className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${customStatus.trim() && customStatus.trim() !== selectedDusun.status
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    {updating ? "Menyimpan..." : "Simpan Keterangan"}
                                </button>
                                <p className="text-[9px] text-gray-400 font-medium italic text-center">Klik tombol di atas untuk menyimpan keterangan khusus.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedDusun(null)}
                            disabled={updating}
                            className="mt-4 w-full py-3 text-gray-500 font-bold uppercase text-xs tracking-widest hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}

            <ModernAlert
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
}
