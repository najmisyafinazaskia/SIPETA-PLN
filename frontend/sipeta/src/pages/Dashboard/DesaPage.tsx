import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DesaMap from "./DesaMap";
import MapFilter from "../../components/ui/MapFilter";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface DesaItem {
  id: string; // _id dari mongo
  name: string;
  type: "stable" | "warning";
  kec: string;
  kab: string;
  dusuns: any[];
}

export default function DesaPage() {
  const navigate = useNavigate();
  const [allDesa, setAllDesa] = useState<DesaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKec, setSelectedKec] = useState("Tampilkan Semua");
  const [activeTab, setActiveTab] = useState<"stable" | "warning">("stable");
  const [showStable, setShowStable] = useState(true);
  const [showWarning, setShowWarning] = useState(true);

  // Filter Logic
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationsInitialized, setLocationsInitialized] = useState(false);

  // Compute unique locations for filter (Kabupaten)
  const uniqueLocations = useMemo(() => {
    const kabs = new Set(allDesa.map(k => k.kab));
    return Array.from(kabs).sort().map(name => ({ name }));
  }, [allDesa]);

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

  // ... (existing effects remain the same) ...

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/locations/all`);
        const json = await response.json();

        if (json.success && isMounted) {
          const mapped = json.data.map((item: any) => {
            // 1. Definisikan kondisi "Dusun Bermasalah"
            const isDusunProblematic = (d: any) =>
              d.status === "0" ||
              d.status === "REFF!" ||
              d.status === "Dusun tidak diketahui" ||
              d.status?.toLowerCase().includes("belum");

            const dusuns = item.dusun_detail || [];
            const hasDusuns = dusuns.length > 0;

            // 2. Cek apakah SEMUA dusun bermasalah
            const allDusunsBad = hasDusuns && dusuns.every(isDusunProblematic);

            // 3. Cek apakah ada MINIMAL SATU dusun yang baik
            const hasGoodDusun = hasDusuns && dusuns.some((d: any) => !isDusunProblematic(d));

            // 4. Tentukan status akhir
            let finalType: "stable" | "warning" = "stable";

            // SPECIAL CASE: Pulau Bunta harus selalu warning
            const isPulauBunta = item.desa.toLowerCase().includes("pulau bunta") ||
              item.desa.toLowerCase().includes("pulo bunta");

            if (isPulauBunta) {
              finalType = "warning";
            } else if (allDusunsBad) {
              // Jika semua dusun bermasalah -> Pasti Warning
              finalType = "warning";
            } else if (hasGoodDusun) {
              // Jika ada minimal 1 yang baik -> Pasti Stable (Meskipun status desa "REFF!")
              finalType = "stable";
            } else {
              // Jika tidak ada data dusun, default ke stable (sesuai permintaan user)
              finalType = "stable";
            }

            return {
              id: item._id,
              name: item.desa,
              type: finalType,
              kec: item.kecamatan,
              kab: item.kabupaten,
              dusuns: dusuns
            };
          });
          setAllDesa(mapped);
        }
      } catch (error) {
        console.error("Error fetching desa data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const daftarKecamatan = useMemo(() => {
    const kecs = allDesa.map((item) => item.kec);
    return ["Tampilkan Semua", ...Array.from(new Set(kecs))];
  }, [allDesa]);

  const filteredList = useMemo(() => {
    if (!allDesa || !Array.isArray(allDesa)) return [];

    return allDesa.filter((item) => {
      const term = (searchTerm || "").toLowerCase();
      const matchSearch =
        (item.name || "").toLowerCase().includes(term) ||
        (item.dusuns || []).some((d: any) => (d.nama || "").toLowerCase().includes(term));
      const matchKec = selectedKec === "Tampilkan Semua" || (item.kec || "") === selectedKec;
      const matchTab = item.type === activeTab;
      return matchSearch && matchKec && matchTab;
    });
  }, [searchTerm, selectedKec, allDesa, activeTab]);

  const handleCardClick = (name: string) => {
    navigate(`/dashboard/region/detail/${encodeURIComponent(name)}?cat=Desa`);
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
          Distribusi Elektrifikasi Tingkat Desa
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
          <DesaMap activeFilters={{ stable: showStable, warning: showWarning }} filterLocations={selectedLocations} />
        </div>
      </div>

      <div className="p-8 bg-gray-50/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight">Daftar Desa / Gampong</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {allDesa.length} Desa</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-gray-800/40 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari desa..."
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
            className={`flex-1 flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${activeTab === "stable" ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
              }`}
          >
            <span className={`font-bold ${activeTab === "stable" ? "text-green-700 dark:text-green-400" : "text-gray-500"}`}>Terjangkau Listrik</span>
            <span className="text-xs font-bold bg-[#22c55e] text-white px-2 py-1 rounded-lg">
              {allDesa.filter(l => l.type === "stable").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("warning")}
            className={`flex-1 flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${activeTab === "warning" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
              }`}
          >
            <span className={`font-bold ${activeTab === "warning" ? "text-yellow-700 dark:text-yellow-400" : "text-gray-500"}`}>Belum Terjangkau Listrik</span>
            <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-1 rounded-lg">
              {allDesa.filter(l => l.type === "warning").length}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item, idx) => (
            <div
              key={idx}
              className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
              onClick={() => handleCardClick(item.name)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#1C2434] dark:text-white uppercase leading-tight group-hover:text-[#0052CC]">
                  {item.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {item.kec}, {item.kab}
                  </span>
                  <span className="text-[10px] text-gray-300">|</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/dusun/${item.id}`);
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#0052CC] transition-colors"
                  >
                    {item.dusuns.length} DUSUN
                  </button>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${item.type === "stable" ? "bg-[#22c55e]" : "bg-[#F2C94C] shadow-[0_0_10px_#F2C94C]"}`}></div>
            </div>
          ))}
          {filteredList.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100">
              <span className="text-4xl opacity-50">🔎</span>
              <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Gampong tidak ditemukan</span>
            </div>
          )}
        </div>
      </div >
    </div >
  );
}
