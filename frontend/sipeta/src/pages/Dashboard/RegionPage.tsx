import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegionMap from "./RegionMap";
import SearchableSelect from "../../components/ui/dropdown/SearchableSelect";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';



interface HierarchyItem {
  id: number;
  kabupaten: string;
  kecamatan: string;
  desa: string;
}

export default function RegionPage() {
  const navigate = useNavigate();
  // Data for the dropdowns (full hierarchy)
  const [allHierarchy, setAllHierarchy] = useState<HierarchyItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [showStable, setShowStable] = useState(true);
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch All Locations for Dropdowns
        const resAll = await fetch(`${API_URL}/api/locations/all`);
        const jsonAll = await resAll.json();
        if (jsonAll.success) {
          setAllHierarchy(jsonAll.data);
        }
      } catch (err) {
        console.error("Error fetching regions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute unique lists for the dropdowns
  const uniqueKabupatens = useMemo(() => {
    const map = new Map();
    allHierarchy.forEach(item => {
      if (!map.has(item.kabupaten)) {
        map.set(item.kabupaten, { id: item.kabupaten, name: item.kabupaten });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allHierarchy]);

  const uniqueKecamatans = useMemo(() => {
    const map = new Map();
    allHierarchy.forEach(item => {
      // Use unique key combining kec + kab
      const key = `${item.kecamatan}-${item.kabupaten}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: `${item.kecamatan} - ${item.kabupaten}`, // Display format: Kecamatan - Kab/Kot
          realName: item.kecamatan,
          searchName: item.kecamatan, // Primacy on Kecamatan name for search
          kabupatenKota: item.kabupaten
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.realName.localeCompare(b.realName));
  }, [allHierarchy]);

  const uniqueDesas = useMemo(() => {
    // Map all items to include Kecamatan in the name for disambiguation
    return allHierarchy.map(item => ({
      id: item.id,
      name: `${item.desa} - ${item.kecamatan}`,
      realName: item.desa,
      searchName: item.desa,
      kecamatan: item.kecamatan,
      kabupatenKota: item.kabupaten
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [allHierarchy]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0052CC] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-white/[0.03] font-outfit">

      {/* 1. Header */}
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
          Demografi Pasokan Listrik Provinsi Aceh
        </h1>
      </div>

      {/* 2. Map Section */}
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
        <RegionMap activeFilters={{ stable: showStable, warning: showWarning }} />
      </div>

      {/* 3. 3-Column Navigation Filter */}
      <div className="p-8 pb-[500px] bg-gray-50/20">
        <div className="flex flex-col mb-8">
          <h2 className="text-xl font-bold text-[#1C2434] dark:text-white uppercase tracking-tight mb-2">Pencarian Wilayah</h2>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
            Telusuri detail data berdasarkan tingkatan wilayah
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Kabupaten/Kota */}
          <SearchableSelect
            label={`Kabupaten / Kota (${uniqueKabupatens.length})`}
            placeholder="Pilih Kabupaten/Kota..."
            items={uniqueKabupatens}
            onSelect={(item) => {
              navigate(`/dashboard/region/detail/${encodeURIComponent(item.name)}?cat=Kabupaten`);
            }}
          />

          {/* Column 2: Kecamatan */}
          <SearchableSelect
            label={`Kecamatan (${uniqueKecamatans.length})`}
            placeholder="Pilih Kecamatan..."
            items={uniqueKecamatans}
            onSelect={(item) => {
              navigate(`/dashboard/region/detail/${encodeURIComponent(item.realName)}?cat=Kecamatan&kab=${encodeURIComponent(item.kabupatenKota)}`);
            }}
          />

          {/* Column 3: Desa */}
          <SearchableSelect
            label={`Desa / Gampong (${uniqueDesas.length})`}
            placeholder="Pilih Desa..."
            items={uniqueDesas}
            onSelect={(item) => {
              // item is the mapped object with realName, kecamatan, kabupatenKota
              navigate(`/dashboard/region/detail/${encodeURIComponent(item.realName)}?cat=Desa&kec=${encodeURIComponent(item.kecamatan)}&kab=${encodeURIComponent(item.kabupatenKota)}&id=${item.id}`);
            }}
          />
        </div>
      </div>
    </div >
  );
}
