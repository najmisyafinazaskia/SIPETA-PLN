import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icon assets for Leaflet in Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface RegionMapProps {
  activeFilters: { stable: boolean; warning: boolean };
  disableWarning?: boolean;
  filterLocations?: string[];
  dataSourceUrl?: string; // URL to fetch points from
  markerLevel?: "desa" | "kecamatan" | "up3" | "ulp"; // Level of detail
  hideStatus?: boolean; // New prop to hide status row in popup
  showUp3Markers?: boolean; // Specific filter for UP3 offices
  showUlpMarkers?: boolean; // Specific filter for ULP offices
}

// Icon Gedung UP3 Custom
const up3Icon = L.icon({
  iconUrl: '/assets/icons/up3_office.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Bright neon colors palette for map borders
const getBrightColor = (name: string) => {
  const colors = [
    "#00FFFF", // Cyan
    "#00FF00", // Lime
    "#FFFF00", // Yellow
    "#FF4500", // Orange Red
    "#1E90FF", // Dodger Blue
    "#FF1493", // Deep Pink
    "#32CD32", // Lime Green
    "#FFD700", // Gold
    "#00BFFF", // Deep Sky Blue
    "#FF69B4", // Hot Pink
    "#7FFF00", // Chartreuse
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colors.length);
  return colors[index];
};

const up3Colors: Record<string, string> = {
  "Banda Aceh": "#C07E2F",   // Golden Brown
  "Langsa": "#EEE8AA",       // PaleGoldenRod
  "Lhokseumawe": "#2E86C1",  // Strong Blue
  "Meulaboh": "#229954",     // Forest Green
  "Sigli": "#6C3483",        // Deep Purple
  "Subulussalam": "#922B21", // Dark Red
  "Tapaktuan": "#FF69B4",    // HotPink
  "Lainnya": "#95a5a6"
};

const UP3_MAPPING: Record<string, string[]> = {
  "Banda Aceh": ["KOTA BANDA ACEH", "ACEH BESAR", "KOTA SABANG"],
  "Langsa": ["KOTA LANGSA", "ACEH TIMUR", "ACEH TAMIANG", "GAYO LUES", "ACEH TENGGARA"],
  "Sigli": ["PIDIE", "PIDIE JAYA"],
  "Lhokseumawe": ["KOTA LHOKSEUMAWE", "ACEH UTARA", "BIREUEN", "BENER MERIAH", "ACEH TENGAH"],
  "Meulaboh": ["ACEH BARAT", "NAGAN RAYA", "ACEH JAYA", "SIMEULUE"],
  "Subulussalam": ["KOTA SUBULUSSALAM", "ACEH SINGKIL", "ACEH SELATAN", "ACEH BARAT DAYA"]
};

const KABUPATEN_TO_UP3: Record<string, string> = {};
Object.entries(UP3_MAPPING).forEach(([up3, kabs]) => {
  kabs.forEach(kab => { KABUPATEN_TO_UP3[kab] = up3; });
});

const getUp3Color = (nama: string) => up3Colors[nama] || "#3498db";

const getPointPopupHtml = (props: any, isBerlistrik: boolean, hideStatus: boolean = false, type: string = "desa") => {
  const displayPrefix = type === "kecamatan" ? "Kec." : "Desa";
  let rawName = props.name || props.Desa || "N/A";
  let cleanName = rawName.replace(/^Desa\s+/i, "");

  return `
    <div style="font-family: 'Outfit', sans-serif; min-width: 200px; padding: 2px; animation: fadeIn 0.3s ease-out;">
      <style>
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        
        .popup-title { color: #1C2434; font-size: 14px; font-weight: 800; margin: 0 0 10px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .popup-container { font-size: 11px; color: #475569; display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
        .popup-row { display: flex; align-items: center; }
        .popup-label { min-width: 90px; color: #64748b; font-weight: 500; }
        .popup-value { color: #1C2434; font-weight: 600; }
        .popup-dusun-header { font-weight: 900; color: #334155; margin-bottom: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
        .popup-dusun-item { display: flex; flex-direction: column; margin-bottom: 5px; background: #f8fafc; padding: 6px 8px; border-radius: 8px; border: 1px solid #f1f5f9; transition: all 0.2s ease; }
        .popup-dusun-name { color: #475569; flex: 1; font-weight: 700; font-size: 11px; }

        /* Dark Mode Overrides */
        .dark .popup-title { color: #FFFFFF; border-bottom-color: #334155; }
        .dark .popup-label { color: #94a3B8; }
        .dark .popup-value { color: #F1F5F9; }
        .dark .popup-dusun-header { color: #94a3B8; opacity: 1; }
        .dark .popup-dusun-item { background: #1E293B; border-color: #334155; }
        .dark .popup-dusun-name { color: #F1F5F9; }
      </style>
      
      <h3 class="popup-title">${displayPrefix} ${cleanName}</h3>
      
      <div class="popup-container">
        ${(props.ULP && props.ULP !== "-") || (props.ulp && props.ulp !== "-") ? `
        <div class="popup-row">
          <span class="popup-label">ULP</span>
          <span class="popup-value">: ${props.ULP || props.ulp}</span>
        </div>
        ` : ''}
        <div class="popup-row">
          <span class="popup-label">Kecamatan</span>
          <span class="popup-value">: ${props.kecamatan || props.Kecamatan || "-"}</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Kabupaten</span>
          <span class="popup-value">: ${props.kabupaten || props.Kabupaten || "-"}</span>
        </div>
        ${props.up3 || props.UP3 ? `
        <div class="popup-row">
          <span class="popup-label">UP3</span>
          <span class="popup-value">: ${props.up3 || props.UP3 || "-"}</span>
        </div>
        ` : ''}
        ${!hideStatus ? `
        <div class="popup-row">
          <span class="popup-label">Status ${displayPrefix}</span>
          <span class="popup-value" style="color: ${isBerlistrik ? '#22c55e' : '#eab308'};">: ${isBerlistrik ? 'Berlistrik' : 'Belum Berlistrik'}</span>
        </div>
        ` : ''}
        ${props.warga ? `
        <div class="popup-row">
          <span class="popup-label">Warga</span>
          <span class="popup-value">: ${props.warga.toLocaleString()} JIWA</span>
        </div>
        ` : ''}
        ${props.pelanggan ? `
        <div class="popup-row">
          <span class="popup-label">Pelanggan</span>
          <span class="popup-value">: ${props.pelanggan.toLocaleString()} KONEKSI</span>
        </div>
        ` : ''}
      </div>

      <div>
        <div class="popup-dusun-header">RINCIAN DUSUN:</div>
        <div style="display: flex; flex-direction: column; gap: 4px; max-height: 150px; overflow-y: auto; padding-right: 4px;">
          ${(props.dusuns && props.dusuns.length > 0) ? props.dusuns.map((d: any) => {
    const s = (d.status || "").toUpperCase();
    const isBad = s.includes('BELUM') || s.includes('NON PLN') || s.includes('ROADMAP') || s === '0' || s === 'REFF!' || s === '#REF!';
    const color = (!isBad && s.includes('PLN')) ? '#22c55e' : '#eab308';
    const nameUpper = (d.name || "").toUpperCase();
    const hasSpecialLabel = ['PERPOLIN', 'PERABIS', 'LHOK PINEUNG'].some(n => nameUpper.includes(n));

    return `
              <div class="popup-dusun-item">
                <div style="display: flex; align-items: start; gap: 8px;">
                  <span class="popup-dusun-name">${d.name}</span>
                  <span style="font-weight: 800; white-space: nowrap; color: ${color}; font-size: 10px;">${d.status}</span>
                </div>
                ${(isBad) ? (() => {
      if (nameUpper.includes('PERPOLIN') || nameUpper.includes('PERABIS')) {
        return `
                        <div style="margin-top: 4px; font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 6px; border-radius: 4px; width: fit-content;">
                          🏗️ SUDAH DIKERJAKAN PADA ROADMAP 2025
                        </div>
                        `;
      }
      if (nameUpper.includes('LHOK PINEUNG')) {
        return `
                        <div style="margin-top: 4px; font-size: 10px; font-weight: 800; color: #9333ea; text-transform: uppercase; letter-spacing: 0.5px; background: #f5f3ff; border: 1px solid #ddd6fe; padding: 2px 6px; border-radius: 4px; width: fit-content;">
                          📅 SUDAH MASUK PADA ROADMAP 2026
                        </div>
                        `;
      }
      return `
                      <div style="margin-top: 4px; font-size: 10px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">
                        🏠 RUMAH KEBUN | TIDAK BERLISTRIK 24 JAM
                      </div>
                      `;
    })() : ''}
              </div>
            `;
  }).join('') : '<span style="color: #94a3b8; font-style: italic; font-size: 10px;">Tidak ada data dusun</span>'}
        </div>
      </div>
    </div>
  `;
};

const RegionMap: React.FC<RegionMapProps> = ({
  activeFilters,
  disableWarning,
  filterLocations,
  dataSourceUrl = `${API_URL}/api/locations/map/geojson`,
  markerLevel = "desa",
  hideStatus = false,
  showUp3Markers = true,
  showUlpMarkers = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const boundaryLayer = useRef<L.GeoJSON | null>(null);
  const pointsLayer = useRef<L.GeoJSON | null>(null);

  const [data, setData] = useState<{ boundaries: any; points: any }>({ boundaries: null, points: null });
  const [kabData, setKabData] = useState<any[]>([]); // Data statistik untuk marker kabupaten
  const [loading, setLoading] = useState(true);
  const kabMarkersLayer = useRef<L.LayerGroup | null>(null); // Layer khusus untuk label nama kabupaten
  const [zoomLevel, setZoomLevel] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);


  // Menangani penutupan otomatis saran pencarian saat klik di luar area input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logika Pencarian: Memfilter titik lokasi berdasarkan input pengguna
  useEffect(() => {
    if (!data.points || !searchQuery) {
      setSearchResults([]);
      return;
    }

    const term = searchQuery.toLowerCase().trim();
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }

    // Flatten data desa dari UP3 group jika ada (untuk pencarian)
    let searchSource = data.points.features || [];
    if (markerLevel === 'up3' && data.points.up3DesaGroup) {
      searchSource = Object.entries(data.points.up3DesaGroup).flatMap(([up3Name, desaList]: any) =>
        desaList.map((desa: any) => ({
          type: "Feature",
          properties: { name: desa.Desa, up3: up3Name, kabupaten: desa.Kabupaten, ulp: desa.ULP, kecamatan: desa.Kecamatan },
          geometry: { type: "Point", coordinates: [desa.longitude, desa.latitude] }
        }))
      );
    }

    if (markerLevel === 'ulp' && data.points.ulpDesaGroup) {
      searchSource = Object.entries(data.points.ulpDesaGroup).flatMap(([ulpName, desaList]: any) =>
        desaList.map((desa: any) => ({
          type: "Feature",
          properties: { name: desa.Desa, ulp: ulpName, kabupaten: desa.Kabupaten, up3: desa.UP3, kecamatan: desa.Kecamatan },
          geometry: { type: "Point", coordinates: [desa.longitude, desa.latitude] }
        }))
      );

      // Add ULP Offices to search
      if (data.points.ulpOffices) {
        const ulpFeatures = data.points.ulpOffices.map((office: any) => ({
          type: "Feature",
          properties: {
            name: `ULP ${office.nama_ulp}`,
            isOffice: true,
            ulp: office.nama_ulp
          },
          geometry: { type: "Point", coordinates: [office.longitude, office.latitude] }
        }));
        searchSource = [...searchSource, ...ulpFeatures];
      }

      // Add UP3 Offices to search
      if (data.points.up3Offices) {
        const up3Features = data.points.up3Offices.map((office: any) => ({
          type: "Feature",
          properties: {
            name: `UP3 ${office.nama_up3}`,
            isOffice: true,
            up3: office.nama_up3
          },
          geometry: { type: "Point", coordinates: [office.longitude, office.latitude] }
        }));
        searchSource = [...searchSource, ...up3Features];
      }
    }

    // Filter berdasarkan nama yang cocok dengan kata kunci
    const matches = searchSource.filter((f: any) => {
      const name = (f.properties?.name || "").toLowerCase();
      return name.includes(term);
    });

    // Urutkan hasil agar yang paling mirip muncul di atas
    const sorted = [...matches].sort((a, b) => {
      const nameA = (a.properties?.name || "").toLowerCase();
      const nameB = (b.properties?.name || "").toLowerCase();
      if (nameA === term && nameB !== term) return -1;
      if (nameB === term && nameA !== term) return 1;
      return 0;
    });

    setSearchResults(sorted.slice(0, 10));
  }, [searchQuery, data.points]);

  // Add classes to map container based on zoom level for CSS styling
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.classList.remove('zoom-low', 'zoom-medium', 'zoom-high');
      if (zoomLevel < 10) {
        mapRef.current.classList.add('zoom-low');
      } else if (zoomLevel < 12) {
        mapRef.current.classList.add('zoom-medium');
      } else {
        mapRef.current.classList.add('zoom-high');
      }
    }
  }, [zoomLevel]);

  // Pengaturan awal peta Leaflet dan pengambilan data dari server
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Konfigurasi ikon default Leaflet agar kompatibel dengan sistem bundling Vite
    const DefaultIcon = L.Icon.Default as any;
    delete DefaultIcon.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    // Inisialisasi peta di koordinat tengah Aceh
    leafletMap.current = L.map(mapRef.current, {
      center: [4.1755, 96.7763],
      zoom: 8,
      zoomControl: false,
      preferCanvas: true // Menggunakan canvas untuk performa tinggi saat merender ribuan titik
    });

    // Menggunakan Google Satellite sebagai lapisan dasar peta
    L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      attribution: "&copy; Google Maps"
    }).addTo(leafletMap.current);

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

    // Zoom Listener for Dynamic Font Sizing
    const onZoom = () => {
      if (leafletMap.current) {
        setZoomLevel(leafletMap.current.getZoom());
      }
    };
    leafletMap.current.on('zoomend', onZoom);
    setZoomLevel(leafletMap.current.getZoom()); // Init status



    // Mengambil data GeoJSON batas wilayah dan titik-titik lokasi
    const fetchData = async () => {
      try {
        const promises: any[] = [
          fetch(`${API_URL}/api/locations/map/boundaries`),
          fetch(dataSourceUrl.startsWith('http') ? dataSourceUrl : `${API_URL}${dataSourceUrl.startsWith('/') ? '' : '/'}${dataSourceUrl}`),
          fetch(`${API_URL}/api/locations/stats`)
        ];

        // Jika level UP3, ambil data tambahan kantor dan titik desa
        if (markerLevel === 'up3') {
          promises.push(fetch(`${API_URL}/api/locations/up3/office`));
          promises.push(fetch(`${API_URL}/api/locations/up3/desa-grouped`));
        }

        // Jika level ULP
        if (markerLevel === 'ulp') {
          promises.push(fetch(`${API_URL}/api/locations/ulp/office`));
          promises.push(fetch(`${API_URL}/api/locations/ulp/desa-grouped`));
          // Also fetch UP3 offices to show as background labels
          promises.push(fetch(`${API_URL}/api/locations/up3/office`));
        }

        const responses = await Promise.all(promises);
        const [boundRes, pointRes, statRes, officeRes, desaGroupRes] = responses;

        if (boundRes.ok && pointRes.ok) {
          const boundaries = await boundRes.json();
          let points = await pointRes.json();

          // Jika data dari up3/desa-grouped tersedia, gunakan itu untuk mode UP3
          if (markerLevel === 'up3' && officeRes?.ok && desaGroupRes?.ok) {
            const offices = await officeRes.json();
            const desaGroup = await desaGroupRes.json();
            setData({
              boundaries,
              points: { ...points, up3Offices: offices, up3DesaGroup: desaGroup }
            });
          } else if (markerLevel === 'ulp' && officeRes?.ok && desaGroupRes?.ok) {
            const offices = await officeRes.json();
            const desaGroup = await desaGroupRes.json();
            // Check if UP3 response exists (it's the last one in promises array for ULP)
            // But promise array length is dynamic.
            // Let's rely on checking the result index.
            // In ULP block: [bound, point, stat, ulpOff, ulpDesa, up3Off]
            const up3Offices = responses[5]?.ok ? await responses[5].json() : null;

            setData({
              boundaries,
              points: { ...points, ulpOffices: offices, ulpDesaGroup: desaGroup, up3Offices: up3Offices }
            });
          } else {
            setData({ boundaries, points });
          }

          if (statRes.ok) {
            const statJson = await statRes.json();
            if (statJson.success) {
              const mapped = statJson.data.details.map((item: any) => {
                let coords: [number, number] = [0, 0];
                const name = item.kabupaten.toUpperCase();

                // Koordinat manual untuk penempatan label Kabupaten (sama seperti KabkotMap)
                const manualCoords: Record<string, [number, number]> = {
                  "PIDIE": [5.00, 96.00],
                  "ACEH SINGKIL": [2.40, 97.90],
                  "KOTA SABANG": [5.89, 95.32],
                  "SIMEULUE": [2.62, 96.05],
                  "BIREUEN": [5.05, 96.60],
                  "ACEH UTARA": [4.90, 97.15],
                  "ACEH TIMUR": [4.62, 97.65],
                  "ACEH TENGAH": [4.60, 96.90],
                  "BENER MERIAH": [4.75, 96.85],
                  "GAYO LUES": [3.95, 97.40],
                  "KOTA LHOKSEUMAWE": [5.18, 97.14],
                  "KOTA LANGSA": [4.47, 97.96],
                  "KOTA BANDA ACEH": [5.55, 95.32],
                  "ACEH BESAR": [5.40, 95.50],
                  "ACEH JAYA": [4.80, 95.60],
                  "PIDIE JAYA": [5.10, 96.25],
                  "ACEH BARAT": [4.45, 96.15],
                  "NAGAN RAYA": [4.15, 96.40],
                  "ACEH BARAT DAYA": [3.80, 96.90],
                  "ACEH SELATAN": [3.25, 97.20],
                  "KOTA SUBULUSSALAM": [2.75, 97.95],
                  "ACEH TAMIANG": [4.25, 98.00],
                  "ACEH TENGGARA": [3.35, 97.70],
                };

                if (manualCoords[name]) {
                  coords = manualCoords[name];
                } else if (item.x && item.y) {
                  coords = [item.y, item.x];
                }

                return {
                  name: item.kabupaten,
                  coords: coords,
                  stats: item
                };
              });
              setKabData(mapped.filter((k: any) => k.coords[0] !== 0));
            }
          }
        }
      } catch (err) {
        console.error("Leaflet fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // 2. Handle Layers (Boundaries & Points)
  useEffect(() => {
    if (!leafletMap.current || !data.boundaries || !data.points) return;

    // Clear old layers
    if (boundaryLayer.current) leafletMap.current.removeLayer(boundaryLayer.current);
    if (pointsLayer.current) leafletMap.current.removeLayer(pointsLayer.current);

    // Filter Logic for GeoJSON Boundaries
    const filteredBoundaries = {
      ...data.boundaries,
      features: data.boundaries.features.filter((f: any) => {
        const name = (f.properties?.Kab_Kota || f.properties?.KAB_KOTA || "Wilayah").toUpperCase();
        if (filterLocations && filterLocations.length > 0) {
          if (markerLevel === 'up3') {
            // In UP3 mode, filterBoundaries must check if key belongs to selected UP3
            const myUp3 = KABUPATEN_TO_UP3[name];
            if (!myUp3) return false;
            return filterLocations.some(loc => loc.toUpperCase().includes(myUp3.toUpperCase()));
          }
          // In ULP mode, we show ALL boundaries to maintain the colored background map regardless of filter
          // because we don't have a direct ULP->Kabupaten map for filtering boundaries.
          if (markerLevel === 'ulp') {
            return true;
          }
          return filterLocations.some(loc => loc.toUpperCase() === name);
        }
        return true;
      })
    };

    // Create Boundary Layer
    boundaryLayer.current = L.geoJSON(filteredBoundaries, {
      style: (feature) => {
        const kabName = (feature?.properties?.Kab_Kota || feature?.properties?.KAB_KOTA || "Wilayah").toUpperCase();
        const isUp3Mode = markerLevel === 'up3' || markerLevel === 'ulp';

        return {
          fillColor: isUp3Mode ? getUp3Color(KABUPATEN_TO_UP3[kabName] || "Lainnya") : "transparent",
          weight: 2,
          opacity: 0.9,
          color: isUp3Mode ? "white" : getBrightColor(kabName),
          dashArray: isUp3Mode ? '' : '4, 4',
          fillOpacity: isUp3Mode ? 0.3 : 0 // Reduced opacity for transparency
        };
      },
      onEachFeature: (feature, layer) => {
        const kabName = feature.properties?.Kab_Kota || feature.properties?.KAB_KOTA || "Wilayah";
        layer.bindTooltip(`<div style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; color: #000; text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff; text-transform: uppercase; letter-spacing: 0.5px;">${kabName}</div>`, {
          sticky: true,
          direction: "top",
          className: "!bg-transparent !border-0 !shadow-none !p-0"
        });
      }
    }).addTo(leafletMap.current);

    // Handle Specialized UP3 Mode
    if (markerLevel === 'up3' && data.points.up3Offices) {
      const up3LayerGroup = L.layerGroup();

      // 1. Render UP3 Office Markers
      if (showUp3Markers) {
        data.points.up3Offices.forEach((office: any) => {
          // Filter logic: Show if its name is in filterLocations or if filter is empty/full
          // Filter logic: Show if its name is in filterLocations or if filter is empty/full
          const up3Name = office.nama_up3.replace(/UP3\s+/i, '').trim().toUpperCase();
          let showOffice = true;

          if (filterLocations) {
            // "Hide All" (empty array) usually means hide everything.
            // BUT, per request, "Hide All" should ONLY apply to Desa points, NOT UP3 Office points.
            // So if filterLocations is empty, we force showOffice = true (or simply don't set it to false).

            if (filterLocations.length > 0) {
              const matchesUp3 = filterLocations.some(loc => loc.replace(/UP3\s+/i, '').trim().toUpperCase() === up3Name);

              // Also check related kabupaten
              if (!matchesUp3) {
                // Fallback: check if ANY selected filter is a kabupaten of this UP3
                const rawName = office.nama_up3.replace(/UP3\s+/i, '').trim(); // "Banda Aceh"
                const relatedKabs = UP3_MAPPING[rawName] || [];
                const matchesKab = relatedKabs.some(kab => filterLocations.includes(kab));
                if (!matchesKab) showOffice = false;
              }
            }
          }

          if (showOffice) {
            L.marker([office.latitude, office.longitude], {
              icon: up3Icon,
              title: office.nama_up3,
              zIndexOffset: 3000 // Always on top
            })
              .bindTooltip(`<div style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; color: #000; text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff; text-transform: uppercase; letter-spacing: 0.5px;">UP3 ${office.nama_up3}</div>`, {
                permanent: true,
                direction: 'top',
                offset: [0, -28],
                className: "!bg-transparent !border-0 !shadow-none !p-0"
              })
              .bindPopup(`<b>Kantor UP3 ${office.nama_up3}</b>`)
              .addTo(up3LayerGroup);
          }
        });
      }

      // 2. Render Grouped Desa Points from migration data
      if (data.points.up3DesaGroup) {
        Object.keys(data.points.up3DesaGroup).forEach(up3Name => {
          data.points.up3DesaGroup[up3Name].forEach((desa: any) => {
            const status = desa.Status_Listrik;
            const isBerlistrik = status === '√' || status === 'Berlistrik';

            // Check filters
            let showDot = true;

            // Filter search
            if (searchQuery.trim().length >= 3) {
              const term = searchQuery.toLowerCase().trim();
              const name = (desa.Desa || "").toLowerCase();
              if (!name.includes(term)) showDot = false;
            }

            // Filter status
            if (showDot && isBerlistrik && !activeFilters.stable) showDot = false;
            if (showDot && !isBerlistrik && !activeFilters.warning) showDot = false;

            // Filter location (Kabupaten/UP3 match)
            // Filter location (Kabupaten/UP3 match)
            if (showDot && filterLocations) {
              if (filterLocations.length === 0) {
                showDot = false;
              } else {
                // STRICT MATCH: Only show points that belong to the UP3 group matching the filter.
                // We normalize both sides (remove "UP3", trim, uppercase) to ensure matches works.
                const currentUp3Clean = up3Name.replace(/UP3\s+/i, '').trim().toUpperCase();

                const matchesUp3 = filterLocations.some(loc =>
                  loc.replace(/UP3\s+/i, '').trim().toUpperCase() === currentUp3Clean
                );

                if (!matchesUp3) showDot = false;
              }
            }

            if (showDot) {
              L.circleMarker([desa.latitude, desa.longitude], {
                radius: 6,
                color: 'white',
                weight: 1,
                fillColor: isBerlistrik ? '#2ecc71' : '#f39c12',
                fillOpacity: 0.9,
              }).bindPopup(getPointPopupHtml({ ...desa, up3: up3Name }, isBerlistrik, hideStatus, "up3"))
                .addTo(up3LayerGroup);
            }
          });
        });
      }

      pointsLayer.current = up3LayerGroup as any;
      pointsLayer.current?.addTo(leafletMap.current);
      return; // Skip default point rendering
    }

    // Handle Specialized ULP Mode
    if (markerLevel === 'ulp' && data.points.ulpOffices) {
      const ulpLayerGroup = L.layerGroup();

      // 1. Render ULP Office Markers
      if (showUlpMarkers) {
        data.points.ulpOffices.forEach((office: any) => {
          const ulpName = (office.nama_ulp || office.ULP || "").trim().toUpperCase();
          // Clean up name: Remove " KOTA" suffix if present for cleaner display
          const displayName = ulpName.replace(/\s+KOTA$/i, '');

          let showOffice = true;

          if (filterLocations && filterLocations.length > 0) {
            // STRICT MATCHING for Office Markers
            const matches = filterLocations.some(loc => {
              const filterName = loc.replace(/^ULP\s+/i, '').trim().toUpperCase();
              const currentName = ulpName.replace(/^ULP\s+/i, '').trim().toUpperCase();
              return filterName === currentName;
            });
            if (!matches) showOffice = false;
          }

          const markerHtml = `
            <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); width: 140px;">
              <div style="
                font-family: 'Outfit', sans-serif; 
                font-size: 9px; 
                font-weight: 600; 
                color: #000; 
                text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff; 
                text-transform: uppercase; 
                letter-spacing: 0.5px;
                text-align: center;
                margin-bottom: 0px;
                white-space: normal;
                line-height: 1.1;
                pointer-events: none;
              ">
                ULP ${displayName}
              </div>
              <img 
                src="/assets/icons/ulp_temp.png" 
                alt="ULP Icon" 
                style="
                  width: 48px; 
                  height: 48px; 
                  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
                  margin-top: -2px;
                "
              />
            </div>
          `;

          if (showOffice) {
            L.marker([office.latitude, office.longitude], {
              icon: L.divIcon({
                className: "custom-ulp-icon",
                html: markerHtml,
                iconSize: [20, 20],
                iconAnchor: [0, 0] // Handled by CSS transform in html
              }),
              zIndexOffset: 3000
            })
              .bindPopup(`<b>Kantor ULP ${office.nama_ulp}</b>`)
              .addTo(ulpLayerGroup);
          }
        });
      }

      // 1.5 Render UP3 Office Markers (Background Labels) if available
      if (showUp3Markers && data.points.up3Offices) {
        data.points.up3Offices.forEach((office: any) => {
          const up3Html = `
            <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
              <div style="
                background: white; 
                color: black; 
                font-family: 'Outfit', sans-serif; 
                font-weight: 600; 
                font-size: 10px; 
                padding: 4px 8px; 
                border-radius: 4px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.3); 
                margin-bottom: 4px; 
                white-space: nowrap;
                border: 1px solid #e2e8f0;
                display: flex;
                align-items: center;
                gap: 4px;
                text-transform: uppercase;
              ">
                UP3 ${office.nama_up3}
              </div>
              <div style="position: relative; width: 40px; height: 50px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
                <svg viewBox="0 0 384 512" style="width: 100%; height: 100%; fill: #1a1a1a;">
                  <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
                </svg>
                <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); color: white; width: 18px; height: 18px;">
                  <svg viewBox="0 0 24 24" fill="currentColor" style="width: 100%; height: 100%;">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </div>
              </div>
            </div>
          `;

          L.marker([office.latitude, office.longitude], {
            icon: L.divIcon({
              className: "custom-up3-icon",
              html: up3Html,
              iconSize: [40, 60],
              iconAnchor: [0, 0]
            }),
            zIndexOffset: 4000
          })
            .bindPopup(`<b>Kantor UP3 ${office.nama_up3}</b>`)
            .addTo(ulpLayerGroup);
        });
      }

      // 2. Render Grouped Desa Points
      if (data.points.ulpDesaGroup) {
        Object.keys(data.points.ulpDesaGroup).forEach(ulpName => {
          data.points.ulpDesaGroup[ulpName].forEach((desa: any) => {
            const status = desa.Status_Listrik;
            const isBerlistrik = status === '√' || status === 'Berlistrik';
            let showDot = true;

            if (searchQuery.trim().length >= 3) {
              const term = searchQuery.toLowerCase().trim();
              const name = (desa.Desa || "").toLowerCase();
              if (!name.includes(term)) showDot = false;
            }

            if (showDot && isBerlistrik && !activeFilters.stable) showDot = false;
            if (showDot && !isBerlistrik && !activeFilters.warning) showDot = false;

            if (showDot && filterLocations) {
              if (filterLocations.length === 0) {
                showDot = false;
              } else {
                // STRICT MATCHING: Normalize strings for precise comparison
                // "Blang Pidie" should NOT match "Idi" just because "Pidie" contains "idi" (if logic was fuzzy)
                // But specifically: filterLocations usually has "ULP NAME" format now.
                const matches = filterLocations.some(loc => {
                  const filterName = loc.replace(/^ULP\s+/i, '').trim().toUpperCase();
                  const currentName = ulpName.replace(/^ULP\s+/i, '').trim().toUpperCase();
                  return filterName === currentName;
                });
                if (!matches) showDot = false;
              }
            }

            if (showDot) {
              L.circleMarker([desa.latitude, desa.longitude], {
                radius: 6, // Matched to UP3 map style
                color: 'white',
                weight: 1,
                fillColor: isBerlistrik ? '#2ecc71' : '#f39c12',
                fillOpacity: 0.9,
              }).bindPopup(getPointPopupHtml({ ...desa, ULP: ulpName }, isBerlistrik, hideStatus, "ulp"))
                .addTo(ulpLayerGroup);
            }
          });
        });
      }

      pointsLayer.current = ulpLayerGroup as any;
      pointsLayer.current?.addTo(leafletMap.current);
      return;
    }

    // UNIFIED POINT STYLE (Green Dot for all maps) - PERFORMANCE OPTIMIZED
    // Switched to L.circleMarker with preferCanvas: true for massive performance gain
    const allFeatures = data.points.features || [];

    pointsLayer.current = L.geoJSON({ type: "FeatureCollection", features: allFeatures } as any, {
      pointToLayer: (feature, latlng) => {
        const props = feature.properties || {};
        const isStable = props.status === "Berlistrik PLN" || props.status === "stable";
        const color = isStable ? "#2ecc71" : "#f1c40f";

        // LOGIKA PENENTUAN VISIBILITAS TITIK (DOT):
        let showDot = true;

        // FILTER 1: Pencarian (Search) - Fokus pada nama Desa
        if (searchQuery.trim().length >= 3) {
          const term = searchQuery.toLowerCase().trim();
          const name = (props.name || "").toLowerCase();
          if (!name.includes(term)) {
            showDot = false;
          }
        }

        // FILTER 2: Lokasi (Kabupaten/Kecamatan/UP3)
        if (showDot && filterLocations) {
          if (filterLocations.length === 0) {
            showDot = false; // "Sembunyikan Semua"
          } else {
            const match = filterLocations.some(loc => {
              const search = loc.toUpperCase();
              return (
                search === (props.up3 || "").toUpperCase() ||
                search === (props.kabupaten || "").toUpperCase() ||
                search === (props.kecamatan || "").toUpperCase() ||
                search === (props.name || "").toUpperCase()
              );
            });
            if (!match) showDot = false;
          }
        }

        // FILTER 3: Status (Stable vs Warning)
        if (!disableWarning && showDot) {
          if (isStable && !activeFilters.stable) showDot = false;
          if (!isStable && !activeFilters.warning) showDot = false;
        }

        // Use CircleMarker instead of heavy DOM DivIcon
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: color,
          color: "white",
          weight: 2,
          opacity: showDot ? 1 : 0,
          fillOpacity: showDot ? 1 : 0,
          interactive: showDot // Disable detailed interaction if hidden
        });
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const isStable = props.status === 'Berlistrik PLN' || props.status === 'stable';

        layer.bindPopup(getPointPopupHtml(props, isStable, hideStatus, markerLevel as any));
      }
    }).addTo(leafletMap.current);

  }, [data, activeFilters, disableWarning, markerLevel, searchQuery]);

  // 3. Handle Kabkot Markers (Restored Name Labels with Green Point)
  useEffect(() => {
    if (!leafletMap.current || kabData.length === 0) return;

    if (!kabMarkersLayer.current) {
      kabMarkersLayer.current = L.layerGroup().addTo(leafletMap.current);
    } else {
      kabMarkersLayer.current.clearLayers();
    }

    kabData.forEach(kab => {
      let showLabel = true;
      if (filterLocations && filterLocations.length > 0) {
        showLabel = filterLocations.includes(kab.name);
      }

      if (showLabel) {
        // Show labels up to high zoom levels so they don't disappear
        const showCondition = zoomLevel < 18;

        if (showCondition) {
          const labelHtml = `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              pointer-events: none;
            ">
              <!-- Small Dark Green Point - Above the Text -->
              <div style="
                width: 7px; 
                height: 7px; 
                background: #064e3b; 
                border-radius: 50%; 
                border: 1.5px solid white; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.4);
                margin-bottom: 2px;
              "></div>

              <!-- Non-Bold but Slightly Thicker Black Text with White Halo -->
              <div style="
                font-family: 'Outfit', sans-serif;
                font-weight: 600; 
                font-size: 10.5px; 
                color: #000;
                text-transform: uppercase; 
                letter-spacing: 0.6px;
                text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff; 
                white-space: nowrap;
                text-align: center;
              ">
                ${kab.name}
              </div>
            </div>
          `;

          L.marker(kab.coords, {
            icon: L.divIcon({
              className: "kab-label-vertical",
              html: labelHtml,
              iconSize: [200, 40],
              iconAnchor: [100, 5] // Anchor at the point (top center)
            }),
            interactive: false
          }).addTo(kabMarkersLayer.current!);
        }
      }
    });
  }, [kabData, zoomLevel, markerLevel, filterLocations]);

  // View manipulation when search item is clicked
  const handleSelectResult = (feature: any) => {
    if (!leafletMap.current) return;

    const coords = feature.geometry.coordinates;
    const name = feature.properties.name;

    // Center map and zoom
    leafletMap.current.setView([coords[1], coords[0]], 15);

    // After animation, find and open the popup
    setTimeout(() => {
      if (pointsLayer.current) {
        pointsLayer.current.eachLayer((layer: any) => {
          const p = layer.feature?.properties || layer.options?.title || "";
          if (p === name || p.name === name || p.Desa === name) {
            layer.openPopup();
          }
        });
      }
    }, 500);

    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden rounded-xl shadow-2xl border border-white/5">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <span className="text-white font-medium tracking-wider text-sm">MEMUAT DATA ACEH...</span>
          </div>
        </div>
      )}

      {/* Floating Modern Search Bar - Glass Style Top Left */}
      <div
        ref={searchContainerRef}
        className="absolute top-6 left-6 z-[1000] w-[220px] group"
      >
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={markerLevel === "kecamatan" ? "Cari Kecamatan" : "Cari Desa"}
            className="w-full bg-white/70 backdrop-blur-xl border border-white/20 text-slate-800 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-xs placeholder:text-slate-400 shadow-2xl"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (searchQuery.length >= 3) && (
          <div className="absolute top-full mt-2 w-full bg-white/80 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {searchResults.length > 0 ? (
              <div className="py-1">
                {searchResults.map((res: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectResult(res)}
                    className="w-full px-4 py-2.5 hover:bg-slate-500/10 flex flex-col items-start transition-colors border-b border-black/5 last:border-0"
                  >
                    <span className="text-slate-800 text-[13px] font-medium">{res.properties.name}</span>
                    <span className="text-slate-500 text-[9px] uppercase tracking-wider mt-0.5">
                      {res.properties.kecamatan && `${res.properties.kecamatan}, `}{res.properties.kabupaten}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-slate-400 text-xs italic">Lokasi tidak ditemukan</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={mapRef} className="w-full h-full" />

      {/* Custom Styles for Map Overlays */}
      <style>{`
        .leaflet-container {
          background: #0a0a0a !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: transparent !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          border-radius: 12px !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95) !important;
        }
        /* Custom scrollbar for popups */
        .leaflet-popup-content ::-webkit-scrollbar {
          width: 4px;
        }
        .leaflet-popup-content ::-webkit-scrollbar-track {
          background: transparent;
        }
        .leaflet-popup-content ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .kab-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        /* Auto-scaling fonts based on zoom level */
        .zoom-low .kab-label { transform: scale(0.8) !important; }
        .zoom-medium .kab-label { transform: scale(1) !important; }
        .zoom-high .kab-label { transform: scale(1.2) !important; }

        /* Smooth tooltip transition */
        .leaflet-tooltip {
          transition: opacity 0.3s ease-in-out;
        }

        /* Focus on specific point animation */
        @keyframes pulse-point {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .focus-marker {
          animation: pulse-point 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default RegionMap;
