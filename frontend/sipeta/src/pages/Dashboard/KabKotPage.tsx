import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KabkotMap from "./KabkotMap";
import MapFilter from "../../components/ui/MapFilter";
import SearchableSelect from "../../components/ui/SearchableSelect";

const _rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = _rawUrl.replace(/\/+$/, '');







interface LocationItem {
  name: string;
  type: "stable" | "warning";
  category: string;
  region: string;
  desaCount: number;
  kecamatanCount: number;
  dusunCount: number;
  warga?: number;
  pelanggan?: number;
  lembaga_warga?: string;
  tahun?: number | string;
}

export default function KabKotPage() {
  const navigate = useNavigate();
  const [allLocations, setAllLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Tampilkan Semua");
  const [activeTab, setActiveTab] = useState<"stable" | "warning">("stable");
  const [showStable, setShowStable] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // New Filter Logic
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationsInitialized, setLocationsInitialized] = useState(false);

  useEffect(() => {
    if (allLocations.length > 0 && !locationsInitialized) {
      setSelectedLocations(allLocations.map(k => k.name));
      setLocationsInitialized(true);
    }
  }, [allLocations, locationsInitialized]);

  const toggleAllLocations = () => {
    if (selectedLocations.length === allLocations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(allLocations.map(k => k.name));
    }
  };

  const toggleLocation = (name: string) => {
    if (selectedLocations.includes(name)) {
      setSelectedLocations(selectedLocations.filter(L => L !== name));
    } else {
      setSelectedLocations([...selectedLocations, name]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/locations/stats`);
        const json = await response.json();

        if (json.success) {
          const mapped = json.data.details.map((item: any) => ({
            name: item.kabupaten,
            type: "stable", // Reverted to hardcoded stable for list items
            category: "Kabupaten",
            region: item.kabupaten.toLowerCase().includes('kota') ? "Kota" : "Kabupaten",
            desaCount: item.desaCount,
            kecamatanCount: item.kecamatanCount,
            dusunCount: item.dusunCount,
            warga: item.warga,
            pelanggan: item.pelanggan || 0,
            lembaga_warga: item.lembaga_warga,
            tahun: item.tahun
          }));
          setAllLocations(mapped);
        }
      } catch (error) {
        console.error("Error fetching kabupaten data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync Map Filter with Tabs
  useEffect(() => {
    if (showStable && !showWarning) {
      setActiveTab("stable");
    } else if (!showStable && showWarning) {
      setActiveTab("warning");
    }
  }, [showStable, showWarning]);

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

  const daftarWilayah = useMemo(() => {
    return ["Tampilkan Semua", "Kabupaten", "Kota"];
  }, []);

  const filteredList = useMemo(() => {
    // ... existing logic ...
    if (searchTerm.trim().length > 2) {
      const matchingKabNames = new Set(
        searchResults.map(r => r.kab || r.name).filter(Boolean)
      );
      return allLocations.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matchingKabNames.has(item.name.toUpperCase()) ||
        matchingKabNames.has(item.name)
      );
    }
    return allLocations.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRegion = selectedRegion === "Tampilkan Semua" || item.region === selectedRegion;
      const matchTab = item.type === activeTab;
      return matchSearch && matchRegion && matchTab;
    });
  }, [searchTerm, selectedRegion, allLocations, activeTab, searchResults]);



  const handleCardClick = (name: string) => {
    navigate(`/dashboard/region/detail/${encodeURIComponent(name)}?cat=Kabupaten`);
  };

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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 font-outfit uppercase tracking-tight">
          Distribusi Elektrifikasi Tingkat Kabupaten / Kota
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
          uniqueLocations={allLocations}
        />
        <div className="w-full h-full">
          <KabkotMap activeFilters={{ stable: showStable, warning: showWarning }} filterLocations={selectedLocations} />
        </div>
      </div>

      <div className="p-8 bg-gray-50/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight">Daftar Wilayah</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {allLocations.length} Kabupaten/Kota</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-gray-800/40 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari wilayah, kec, gampong..."
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
            <SearchableSelect
              options={daftarWilayah}
              value={selectedRegion}
              onChange={setSelectedRegion}
              placeholder="Pilih Wilayah"
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
            <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded-lg">
              {allLocations.filter(l => l.type === "stable").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("warning")}
            className={`flex-1 flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${activeTab === "warning" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
              }`}
          >
            <span className={`font-bold ${activeTab === "warning" ? "text-yellow-700 dark:text-yellow-400" : "text-gray-500"}`}>Belum Terjangkau Listrik</span>
            <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-1 rounded-lg">
              {allLocations.filter(l => l.type === "warning").length}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleCardClick(item.name)}
              className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#1C2434] dark:text-white uppercase leading-tight group-hover:text-[#0052CC]">
                  {item.name}
                </span>
                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest transition-colors group-hover:text-[#0052CC]">
                  {item.region.toUpperCase()} • {(item.warga || 0).toLocaleString()} JIWA
                </span>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${item.type === "stable" ? "bg-[#22AD5C]" : "bg-[#F2C94C] shadow-[0_0_10px_#F2C94C]"}`}></div>
            </div>
          ))}
          {filteredList.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100">
              <span className="text-4xl opacity-50">🔎</span>
              <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Wilayah tidak ditemukan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}