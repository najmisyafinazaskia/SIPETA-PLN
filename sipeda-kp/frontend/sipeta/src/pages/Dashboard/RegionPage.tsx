import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegionMap from "./RegionMap";
import MapFilter from "../../components/ui/MapFilter";
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
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationsInitialized, setLocationsInitialized] = useState(false);

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

  useEffect(() => {
    if (uniqueKabupatens.length > 0 && !locationsInitialized) {
      setSelectedLocations(uniqueKabupatens.map(k => k.name));
      setLocationsInitialized(true);
    }
  }, [uniqueKabupatens, locationsInitialized]);

  const toggleAllLocations = () => {
    if (selectedLocations.length === uniqueKabupatens.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(uniqueKabupatens.map(k => k.name));
    }
  };

  const toggleLocation = (name: string) => {
    if (selectedLocations.includes(name)) {
      setSelectedLocations(selectedLocations.filter(L => L !== name));
    } else {
      setSelectedLocations([...selectedLocations, name]);
    }
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

      {/* 1. Header */}
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 font-outfit uppercase tracking-tight">
          Distribusi Elektrifikasi Wilayah Provinsi Aceh
        </h1>
      </div>

      {/* 2. Map Section */}
      <div className="relative w-full h-[700px] border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 group">
        <MapFilter
          showStable={showStable}
          setShowStable={setShowStable}
          showWarning={showWarning}
          setShowWarning={setShowWarning}
          selectedLocations={selectedLocations}
          toggleLocation={toggleLocation}
          toggleAllLocations={toggleAllLocations}
          uniqueLocations={uniqueKabupatens}
        />
        <RegionMap activeFilters={{ stable: showStable, warning: showWarning }} filterLocations={selectedLocations} />
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
