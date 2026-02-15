import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PencilIcon, BoltIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";
import UlpMap from "./UlpMap";
import MapFilter from "../../components/ui/MapFilter";

const _rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = _rawUrl.replace(/\/+$/, '');








interface UlpData {
    name: string;
    dusunCount?: number;
    pelanggan?: number;
    desaCount?: number;
    warga?: number;
    update_pelanggan?: string;
    sumber?: string;
    tahun?: string;
}

export default function UlpPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [ulpList, setUlpList] = useState<UlpData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter State
    const [showStable, setShowStable] = useState(true);
    const [showWarning, setShowWarning] = useState(true);
    const [showUlpMarkers, setShowUlpMarkers] = useState(true);

    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [locationsInitialized, setLocationsInitialized] = useState(false);

    // Edit Modal State
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [editingUlp, setEditingUlp] = useState<UlpData | null>(null);
    const [newPelanggan, setNewPelanggan] = useState("");
    const [newSumber, setNewSumber] = useState("Data Induk Layanan");
    const [newTahun, setNewTahun] = useState("PLN 2025");
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleLocation = (name: string) => {
        if (selectedLocations.includes(name)) {
            setSelectedLocations(selectedLocations.filter(L => L !== name));
        } else {
            setSelectedLocations([...selectedLocations, name]);
        }
    };

    const fetchUlpData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/locations/ulp/office`);
            const offices = await response.json();
            if (Array.isArray(offices)) {
                const mapped = offices.map((u: any) => ({
                    ...u,
                    name: (u.name || u.nama_ulp || u.ULP || "Unknown").trim(),
                }));
                mapped.sort((a, b) => a.name.localeCompare(b.name));
                setUlpList(mapped);
            }
        } catch (error) {
            console.error("Error fetching ULP data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePelanggan = async () => {
        if (!editingUlp) return;
        try {
            setIsUpdating(true);
            const response = await fetch(`${API_URL}/api/locations/ulp/update-pelanggan`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editingUlp.name,
                    pelanggan: newPelanggan,
                    sumber: newSumber,
                    tahun: newTahun
                })
            });
            const json = await response.json();
            if (json.success) {
                await fetchUlpData();
                setIsInputModalOpen(false);
            }
        } catch (error) {
            console.error("Error updating pelanggan:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        fetchUlpData();
    }, []);

    useEffect(() => {
        if (ulpList.length > 0 && !locationsInitialized) {
            setSelectedLocations(ulpList.map(k => k.name));
            setLocationsInitialized(true);
        }
    }, [ulpList, locationsInitialized]);

    const toggleAllLocations = () => {
        if (selectedLocations.length === ulpList.length) {
            setSelectedLocations([]);
        } else {
            setSelectedLocations(ulpList.map(k => k.name));
        }
    };

    const filteredUlpList = useMemo(() => {
        let filtered = ulpList;

        if (searchTerm.trim().length > 0) {
            filtered = filtered.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return filtered;
    }, [searchTerm, ulpList]);

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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 font-outfit uppercase tracking-tight">
                    Distribusi Elektrifikasi Berdasarkan ULP
                </h1>
            </div>

            <div className="relative w-full h-[700px] border-y border-gray-100 dark:border-gray-800 bg-gray-50/30">
                <MapFilter
                    title="Wilayah ULP"
                    showStable={showStable}
                    setShowStable={setShowStable}
                    showWarning={showWarning}
                    setShowWarning={setShowWarning}
                    showUp3Markers={showUlpMarkers}
                    setShowUp3Markers={setShowUlpMarkers}
                    selectedLocations={selectedLocations}
                    toggleLocation={toggleLocation}
                    toggleAllLocations={toggleAllLocations}
                    uniqueLocations={ulpList.map(u => ({ name: u.name }))}
                    markerLabel="Titik Kantor ULP"
                />
                <UlpMap
                    filters={{ stable: showStable, warning: showWarning, locations: selectedLocations }}
                    showUlpMarkers={showUlpMarkers}
                    disableWarning={true}
                />
            </div>

            <div className="p-8 bg-gray-50/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight">Daftar ULP</h2>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {ulpList.length} Unit Layanan</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-gray-800/40 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 w-full md:w-auto">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Cari ULP..."
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white transition-all min-w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUlpList.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(`/dashboard/ulp/unit/${encodeURIComponent(item.name)}`)}
                            className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-[#1C2434] dark:text-white uppercase leading-tight group-hover:text-[#0052CC]">
                                    {item.name.toUpperCase().startsWith('ULP') ? item.name : `ULP ${item.name}`}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest transition-colors group-hover:text-[#0052CC]">
                                    {item.dusunCount?.toLocaleString() || 0} DUSUN • {(item.warga || 0).toLocaleString()} JIWA • {(item.pelanggan || 0).toLocaleString()} PELANGGAN
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                {user?.role === "superadmin" && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingUlp(item);
                                            setNewPelanggan(item.pelanggan?.toString() || "");
                                            setNewSumber((item.sumber && item.sumber !== "-") ? item.sumber : "Data Induk Layanan");
                                            setNewTahun((item.tahun && item.tahun !== "-") ? item.tahun : "PLN 2025");
                                            setIsInputModalOpen(true);
                                        }}
                                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <div className="w-2.5 h-2.5 rounded-full bg-[#22AD5C]"></div>
                            </div>
                        </div>
                    ))}
                    {filteredUlpList.length === 0 && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100">
                            <span className="text-4xl">🔎</span>
                            <span className="text-gray-400 font-black uppercase text-xs tracking-widest">ULP tidak ditemukan</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Modal */}
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
                                    Masukkan jumlah pelanggan baru untuk <span className="text-blue-600 font-bold">{editingUlp?.name}</span>
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
