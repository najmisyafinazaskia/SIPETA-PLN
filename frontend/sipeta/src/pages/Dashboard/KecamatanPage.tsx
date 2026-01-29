import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KecamatanMap from "./KecamatanMap";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface KecamatanItem {
  name: string;
  type: "stable" | "warning";
  kab: string;
  desaList: any[];
}

export default function KecamatanPage() {
  const navigate = useNavigate();
  const [allKecamatan, setAllKecamatan] = useState<KecamatanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKab, setSelectedKab] = useState("Tampilkan Semua");
  const [activeTab, setActiveTab] = useState<"stable" | "warning">("stable");
  const [showStable, setShowStable] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/locations/all`);
        const json = await response.json();

        if (json.success) {
          const uniqueMap = new Map();
          json.data.forEach((item: any) => {
            const key = `${item.kabupaten}-${item.kecamatan}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, {
                name: item.kecamatan,
                kab: item.kabupaten,
                type: "stable", // Reverted to hardcoded stable
                desaList: []
              });
            }
            uniqueMap.get(key).desaList.push(item);
          });
          setAllKecamatan(Array.from(uniqueMap.values()));
        }
      } catch (error) {
        console.error("Error fetching kecamatan data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const daftarKabupaten = useMemo(() => {
    const kabs = allKecamatan.map((item) => item.kab);
    return ["Tampilkan Semua", ...Array.from(new Set(kabs))];
  }, [allKecamatan]);

  const filteredList = useMemo(() => {
    if (searchTerm.trim().length > 2) {
      const matchingKecNames = new Set(
        searchResults.map(r => r.kec).filter(Boolean)
      );
      return allKecamatan.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matchingKecNames.has(item.name)
      );
    }
    return allKecamatan.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKab = selectedKab === "Tampilkan Semua" || item.kab === selectedKab;
      const matchTab = item.type === activeTab;
      return matchSearch && matchKab && matchTab;
    });
  }, [searchTerm, selectedKab, allKecamatan, activeTab, searchResults]);

  const handleCardClick = (name: string) => {
    navigate(`/dashboard/region/detail/${encodeURIComponent(name)}?cat=Kecamatan`);
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
          Demografi Pasokan Listrik Tingkat Kecamatan
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
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${showStable ? 'bg-[#22AD5C] border-[#22AD5C]' : 'border-gray-300 dark:border-gray-600'}`}>
                    {showStable && (
                      <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" /></svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Terjangkau Listrik</span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#22AD5C] shadow-sm"></div>
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
          <KecamatanMap activeFilters={{ stable: showStable, warning: showWarning }} />
        </div>
      </div>

      <div className="p-8 bg-gray-50/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight">Daftar Kecamatan</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {allKecamatan.length} Kecamatan</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-gray-800/40 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari kec, desa, dusun..."
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
              value={selectedKab}
              onChange={(e) => setSelectedKab(e.target.value)}
            >
              {daftarKabupaten.map((kab) => (
                <option key={kab} value={kab}>{kab}</option>
              ))}
            </select>
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
              {allKecamatan.filter(l => l.type === "stable").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("warning")}
            className={`flex-1 flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${activeTab === "warning" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
              }`}
          >
            <span className={`font-bold ${activeTab === "warning" ? "text-yellow-700 dark:text-yellow-400" : "text-gray-500"}`}>Belum Terjangkau Listrik</span>
            <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-1 rounded-lg">
              {allKecamatan.filter(l => l.type === "warning").length}
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
                  KAB. {item.kab}
                </span>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${item.type === "stable" ? "bg-[#22AD5C]" : "bg-[#F2C94C] shadow-[0_0_10px_#F2C94C]"}`}></div>
            </div>
          ))}
          {filteredList.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100">
              <span className="text-4xl opacity-50">🔎</span>
              <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Kecamatan tidak ditemukan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
