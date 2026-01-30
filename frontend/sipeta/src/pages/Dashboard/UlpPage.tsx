import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UlpMap from "./UlpMap";
import MapFilter from "../../components/ui/MapFilter";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface RegionItem {
    name: string;
    type: "stable" | "warning";
    category: string;
}

export default function UlpPage() {
    const navigate = useNavigate();
    const [allRegions, setAllRegions] = useState<RegionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tampilkan Semua");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Filter Logic
    const [showStable, setShowStable] = useState(true);
    const [showWarning, setShowWarning] = useState(true);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [locationsInitialized, setLocationsInitialized] = useState(false);

    useEffect(() => {
        if (allRegions.length > 0 && !locationsInitialized) {
            setSelectedLocations(allRegions.map(k => k.name));
            setLocationsInitialized(true);
        }
    }, [allRegions, locationsInitialized]);

    const toggleAllLocations = () => {
        if (selectedLocations.length === allRegions.length) {
            setSelectedLocations([]);
        } else {
            setSelectedLocations(allRegions.map(k => k.name));
        }
    };

    const toggleLocation = (name: string) => {
        if (selectedLocations.includes(name)) {
            setSelectedLocations(selectedLocations.filter(L => L !== name));
        } else {
            setSelectedLocations([...selectedLocations, name]);
        }
    };

    // ... (existing fetchRegions useEffect) ...

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/locations/stats`);
                const json = await res.json();
                if (json.success) {
                    const mapped = json.data.details.map((k: any) => ({
                        name: k.kabupatenKota,
                        type: "stable", // Default stable at ULP level
                        category: k.kabupatenKota.toLowerCase().includes("kota") ? "Kota" : "Kabupaten"
                    }));
                    setAllRegions(mapped);
                }
            } catch (err) {
                console.error("Error fetching regions for ULP:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRegions();
    }, []);

    // ... (existing search useEffect) ...

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length > 2) {
                try {
                    setIsSearching(true);
                    const res = await fetch(`${API_URL}/api/locations/search?q=${encodeURIComponent(searchTerm)}`);
                    const json = await res.json();
                    if (json.success) {
                        setSearchResults(json.data);
                    }
                } catch (err) {
                    console.error("Search error:", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredList = useMemo(() => {
        // ... (existing logic) ...
        if (searchTerm.trim().length > 2) {
            const matchingKabNames = new Set(
                searchResults.map(r => r.kab || r.name).filter(Boolean)
            );
            return allRegions.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                matchingKabNames.has(item.name.toUpperCase()) ||
                matchingKabNames.has(item.name)
            );
        }
        return allRegions.filter((item) => {
            const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCat = selectedCategory === "Tampilkan Semua" || item.category === selectedCategory;
            return matchSearch && matchCat;
        });
    }, [searchTerm, selectedCategory, allRegions, searchResults]);

    const handleCardClick = (name: string) => {
        navigate(`/dashboard/ulp/kabupaten/${encodeURIComponent(name)}`);
    };

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
                    showStable={showStable}
                    setShowStable={setShowStable}
                    showWarning={showWarning}
                    setShowWarning={setShowWarning}
                    selectedLocations={selectedLocations}
                    toggleLocation={toggleLocation}
                    toggleAllLocations={toggleAllLocations}
                    uniqueLocations={allRegions}
                />
                <UlpMap filters={{ stable: showStable, warning: showWarning, locations: selectedLocations }} disableWarning={true} />
            </div>

            <div className="p-8 bg-gray-50/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight">Daftar Wilayah</h2>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {allRegions.length} Kabupaten/Kota</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-gray-800/40 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 w-full md:w-auto">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Cari wilayah, kec, desa..."
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white transition-all min-w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 scale-75">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                </div>
                            )}
                        </div>
                        <select
                            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0052CC] dark:text-white cursor-pointer"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {["Tampilkan Semua", "Kabupaten", "Kota"].map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredList.map((item, idx) => (
                        <div key={idx}
                            onClick={() => handleCardClick(item.name)}
                            className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-[#1C2434] dark:text-white uppercase leading-tight group-hover:text-[#0052CC]">
                                    {item.name}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                    WILAYAH {item.category.toUpperCase()}
                                </span>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#22AD5C]"></div>
                        </div>
                    ))}
                    {filteredList.length === 0 && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100">
                            <span className="text-4xl">🔎</span>
                            <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Wilayah tidak ditemukan</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
