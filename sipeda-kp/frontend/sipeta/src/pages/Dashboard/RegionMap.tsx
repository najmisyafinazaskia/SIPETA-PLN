import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icon assets for Leaflet in Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');







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
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40]
});

const ulpIcon = L.icon({
  iconUrl: '/assets/icons/ulp_temp.png',
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -30]
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
  kabs.forEach(kab => {
    KABUPATEN_TO_UP3[kab.toUpperCase().trim()] = up3;
  });
});

const getUp3Color = (nama: string) => {
  if (!nama) return "#95a5a6";
  const cleanNama = nama.replace(/^UP3\s+/i, '').trim();
  return up3Colors[cleanNama] || up3Colors[nama] || "#3498db";
};

const getPointPopupHtml = (props: any, isBerlistrik: boolean, hideStatus: boolean = false, type: string = "desa") => {
  const displayPrefix = type === "kecamatan" ? "Kec." : "Desa";
  let rawName = props.name || props.Desa || props.desa || "N/A";
  let cleanName = rawName.replace(/^Desa\s+/i, "");

  return `
    <div style="font-family: 'Outfit', sans-serif; min-width: 220px; padding: 2px; animation: fadeIn 0.3s ease-out;">
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
        <div style="display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; padding-right: 4px;">
          ${(props.dusuns && props.dusuns.length > 0) ? props.dusuns.map((d: any) => {
    const statusText = (d.status || "").toUpperCase();
    const isProblem = statusText.includes('BELUM') || statusText.includes('NON PLN') || statusText.includes('ROADMAP') || statusText === '0' || statusText === 'REFF!' || statusText === '#REF!' || statusText.includes('TIDAK DIKETAHUI');
    const color = (!isProblem && statusText.includes('PLN')) ? '#22c55e' : '#eab308';

    // Sinkronkan Nama (Handle d.nama dari backend atau d.name)
    const dNameRaw = d.nama || d.name || "N/A";
    const dNameUpper = dNameRaw.toUpperCase();

    // Logika Label Khusus (Penting: Sesuai DusunPage)
    let specialLabel = "";
    let displayStatus = d.status;
    let displayColor = color;

    if (isProblem) {
      if (dNameUpper.includes('PERPOLIN') || dNameUpper.includes('PERABIS') || dNameUpper.includes('LHOK SANDENG')) {
        displayStatus = "BELUM BERLISTRIK PLN";
        displayColor = "#eab308";
        specialLabel = `
          <div style="margin-top: 4px;">
            <div style="font-size: 9px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 6px; border-radius: 4px; width: fit-content;">🏗️ SUDAH DIKERJAKAN PADA ROADMAP 2025</div>
          </div>
        `;
      } else if (dNameUpper.includes('LHOK PINEUNG')) {
        displayStatus = "BELUM BERLISTRIK PLN";
        displayColor = "#eab308";
        specialLabel = `<div style="margin-top: 4px; font-size: 9px; font-weight: 800; color: #9333ea; text-transform: uppercase; letter-spacing: 0.5px; background: #f5f3ff; border: 1px solid #ddd6fe; padding: 2px 6px; border-radius: 4px; width: fit-content;">📅 SUDAH MASUK PADA ROADMAP 2026</div>`;
      } else if (!statusText.includes('ROADMAP')) {
        specialLabel = `<div style="margin-top: 4px; font-size: 9px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">🏠 RUMAH KEBUN | TIDAK BERLISTRIK 24 JAM</div>`;
      }
    }

    return `
              <div class="popup-dusun-item">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                    <span class="popup-dusun-name">${dNameRaw}</span>
                    <span style="font-weight: 800; white-space: nowrap; color: ${displayColor}; font-size: 9px; text-align: right;">${displayStatus}</span>
                  </div>
                  ${specialLabel}
                </div>
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
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
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
          properties: {
            name: desa.Desa,
            up3: up3Name,
            kabupaten: desa.Kabupaten,
            ulp: desa.ULP,
            kecamatan: desa.Kecamatan,
            id: desa.locationId // Include ID for selection
          },
          geometry: { type: "Point", coordinates: [desa.longitude, desa.latitude] }
        }))
      );
    }

    if (markerLevel === 'ulp' && data.points.ulpDesaGroup) {
      searchSource = Object.entries(data.points.ulpDesaGroup).flatMap(([ulpName, desaList]: any) =>
        desaList.map((desa: any) => ({
          type: "Feature",
          properties: {
            name: desa.Desa,
            ulp: ulpName,
            kabupaten: desa.Kabupaten,
            up3: desa.UP3,
            kecamatan: desa.Kecamatan,
            id: desa.locationId // Include ID for selection
          },
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

    if (markerLevel === 'kecamatan' && data.points.features) {
      searchSource = data.points.features.map((f: any) => ({
        ...f,
        properties: {
          ...f.properties,
          id: f.properties.id || f.properties.locationId // Normalize ID for search
        }
      }));
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
    console.log("RegionMap initialized - v2.1.2 - Robust Search & Boundary Fix");

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
        setLoading(false);
      } finally {
        setTimeout(() => setLoading(false), 500);
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

  // 2. Handle Layers (Boundaries & Points) - DECOUPLED
  useEffect(() => {
    if (!leafletMap.current) return;
    console.log("Rendering Map Layers...", { hasBoundaries: !!data.boundaries, hasPoints: !!data.points });

    // Clear old layers
    if (boundaryLayer.current) leafletMap.current.removeLayer(boundaryLayer.current);
    if (pointsLayer.current) leafletMap.current.removeLayer(pointsLayer.current);

    // 2.1 Render Boundaries (Independent)
    if (data.boundaries && data.boundaries.features) {
      const filteredBoundaries = {
        ...data.boundaries,
        features: data.boundaries.features.filter((f: any) => {
          const props = f.properties || {};
          const rawName = props.Kab_Kota || props.KAB_KOTA || props.kabupaten || props.KABUPATEN || "Wilayah";
          const name = String(rawName).toUpperCase().trim();

          if (filterLocations) {
            // Keep boundaries visible if no locations selected (Show all background)
            if (filterLocations.length === 0) return true;
            if (markerLevel === 'up3') {
              const myUp3 = KABUPATEN_TO_UP3[name];
              if (!myUp3) return false;
              // Check for exact or partial match (handle 'UP3 Banda Aceh' vs 'Banda Aceh')
              return filterLocations.some(loc => {
                const uLoc = loc.toUpperCase();
                const uMyUp3 = myUp3.toUpperCase();
                return uLoc.includes(uMyUp3) || uMyUp3.includes(uLoc);
              });
            }
            if (markerLevel === 'ulp') return true; // Show all boundaries on ULP map
            return filterLocations.some(loc => loc.toUpperCase().trim() === name);
          }
          return true;
        })
      };

      boundaryLayer.current = L.geoJSON(filteredBoundaries, {
        style: (feature) => {
          const props = feature?.properties || {};
          const rawName = props.Kab_Kota || props.KAB_KOTA || props.kabupaten || props.KABUPATEN || "Wilayah";
          const kabName = String(rawName).toUpperCase().trim();
          const isUp3Mode = markerLevel === 'up3' || markerLevel === 'ulp';

          const up3Name = KABUPATEN_TO_UP3[kabName] || "Lainnya";
          const fillColor = isUp3Mode ? getUp3Color(up3Name) : "transparent";

          return {
            fillColor: fillColor,
            weight: 2,
            opacity: 0.9,
            color: isUp3Mode ? "white" : getBrightColor(kabName),
            dashArray: isUp3Mode ? '' : '4, 4',
            fillOpacity: isUp3Mode ? 0.45 : 0
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
    }

    // 2.2 Render Points (Independent)
    if (data.points) {
      if (markerLevel === 'up3' && data.points.up3Offices) {
        const up3LayerGroup = L.layerGroup();

        // Office Markers
        if (showUp3Markers) {
          data.points.up3Offices.forEach((office: any) => {
            const up3Name = office.nama_up3.replace(/UP3\s+/i, '').trim().toUpperCase();
            let showOffice = true;
            if (filterLocations) {
              if (filterLocations.length === 0) {
                showOffice = false;
              } else {
                const matchesUp3 = filterLocations.some(loc => loc.replace(/UP3\s+/i, '').trim().toUpperCase() === up3Name);
                if (!matchesUp3) {
                  const rawName = office.nama_up3.replace(/UP3\s+/i, '').trim();
                  const relatedKabs = UP3_MAPPING[rawName] || [];
                  const matchesKab = relatedKabs.some(kab => filterLocations.includes(kab));
                  if (!matchesKab) showOffice = false;
                }
              }
            }
            if (showOffice) {
              L.marker([office.latitude, office.longitude], { icon: up3Icon, title: office.nama_up3, zIndexOffset: 3000 })
                .bindTooltip(`<div style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; color: #000; text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff; text-transform: uppercase; letter-spacing: 0.5px;">UP3 ${office.nama_up3}</div>`, { permanent: true, direction: 'top', offset: [0, -28], className: "!bg-transparent !border-0 !shadow-none !p-0" })
                .bindPopup(`<b>Kantor UP3 ${office.nama_up3}</b>`)
                .addTo(up3LayerGroup);
            }
          });
        }

        // Village Points
        if (data.points.up3DesaGroup) {
          Object.keys(data.points.up3DesaGroup).forEach(up3Name => {
            data.points.up3DesaGroup[up3Name].forEach((desa: any) => {
              const isBerlistrik = desa.Status_Listrik === '√' || desa.Status_Listrik === 'Berlistrik';
              const isMatch = searchQuery.trim().length >= 3 && (desa.Desa || "").toLowerCase().includes(searchQuery.toLowerCase().trim());
              const isSelected = selectedPointId === desa.locationId;
              let showDot = true;

              if (isSelected || isMatch) {
                showDot = true; // Always show if selected or search match
              } else {
                if (isBerlistrik && !activeFilters.stable) showDot = false;
                if (!isBerlistrik && !activeFilters.warning) showDot = false;
                if (showDot && filterLocations) {
                  if (filterLocations.length === 0) {
                    showDot = false;
                  } else {
                    const cleanUp3 = up3Name.replace(/UP3\s+/i, '').trim().toUpperCase();
                    if (!filterLocations.some(loc => loc.replace(/UP3\s+/i, '').trim().toUpperCase() === cleanUp3)) showDot = false;
                  }
                }
              }

              if (showDot) {
                const marker = L.circleMarker([desa.latitude, desa.longitude], {
                  radius: 6,
                  color: 'white',
                  weight: 1,
                  fillColor: isBerlistrik ? '#2ecc71' : '#f39c12',
                  fillOpacity: 0.9,
                  locationId: desa.locationId // Attach ID to options
                } as any);

                // Add identity for search lookup
                (marker as any).options.title = desa.Desa;
                (marker as any).options.desaName = desa.Desa;

                marker.on('click', async (e) => {
                  const pop = L.popup().setLatLng(e.latlng).setContent('<div class="p-2 text-xs">Loading...</div>').openOn(leafletMap.current!);
                  const res = await fetch(`${API_URL}/api/locations/map/point-detail/${desa.locationId}`);
                  const json = await res.json();
                  if (json.success) pop.setContent(getPointPopupHtml(json.data, isBerlistrik, hideStatus, "up3"));
                })
                  .addTo(up3LayerGroup);
              }
            });
          });
        }
        pointsLayer.current = up3LayerGroup as any;
        pointsLayer.current?.addTo(leafletMap.current);

      } else if (markerLevel === 'ulp' && data.points.ulpOffices) {
        const ulpLayerGroup = L.layerGroup();

        // 1. Render UP3 Offices as background (unfiltered)
        if (data.points.up3Offices) {
          data.points.up3Offices.forEach((off: any) => {
            L.marker([off.latitude, off.longitude], { icon: up3Icon, opacity: 0.6 })
              .bindTooltip(`<div class="text-[9px] font-bold text-gray-400 capitalize">UP3 ${off.nama_up3}</div>`)
              .addTo(ulpLayerGroup);
          });
        }

        // 2. Render ULP Offices
        if (showUlpMarkers) {
          data.points.ulpOffices.forEach((office: any) => {
            const ulpName = office.nama_ulp.replace(/ULP\s+/i, '').trim().toUpperCase();
            let showOffice = true;
            if (filterLocations) {
              if (filterLocations.length === 0) {
                showOffice = true;
              } else {
                showOffice = filterLocations.some(loc => loc.replace(/ULP\s+/i, '').trim().toUpperCase() === ulpName);
              }
            }
            if (showOffice) {
              L.marker([office.latitude, office.longitude], { icon: ulpIcon, title: office.nama_ulp, zIndexOffset: 3000 })
                .bindTooltip(`<div style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; color: #000; text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff; text-transform: uppercase; letter-spacing: 0.5px;">ULP ${office.nama_ulp}</div>`, { permanent: true, direction: 'top', offset: [0, -28], className: "!bg-transparent !border-0 !shadow-none !p-0" })
                .bindPopup(`<b>Unit Layanan Pelanggan ${office.nama_ulp}</b>`)
                .addTo(ulpLayerGroup);
            }
          });
        }

        // 3. Render Desa Points for ULP
        if (data.points.ulpDesaGroup) {
          Object.keys(data.points.ulpDesaGroup).forEach(ulpName => {
            const cleanUlp = ulpName.replace(/ULP\s+/i, '').trim().toUpperCase();
            let showGroup = true;
            if (filterLocations) {
              if (filterLocations.length === 0) {
                showGroup = false;
              } else {
                if (!filterLocations.some(loc => loc.replace(/ULP\s+/i, '').trim().toUpperCase() === cleanUlp)) showGroup = false;
              }
            }

            if (showGroup) {
              data.points.ulpDesaGroup[ulpName].forEach((desa: any) => {
                const isBerlistrik = desa.Status_Listrik === '√' || desa.Status_Listrik === 'Berlistrik';
                const isMatch = searchQuery.trim().length >= 3 && (desa.Desa || "").toLowerCase().includes(searchQuery.toLowerCase().trim());
                const isSelected = selectedPointId === desa.locationId;
                let showDot = true;

                if (isSelected || isMatch) {
                  showDot = true; // Always show if selected or search match
                } else {
                  if (isBerlistrik && !activeFilters.stable) showDot = false;
                  if (!isBerlistrik && !activeFilters.warning) showDot = false;
                }
                if (showDot) {
                  const marker = L.circleMarker([desa.latitude, desa.longitude], {
                    radius: 6,
                    color: 'white',
                    weight: 1,
                    fillColor: isBerlistrik ? '#2ecc71' : '#f39c12',
                    fillOpacity: 0.9,
                    locationId: desa.locationId // Attach ID to options
                  } as any);

                  // Add identity for search lookup
                  (marker as any).options.title = desa.Desa;
                  (marker as any).options.desaName = desa.Desa;

                  marker.on('click', async (e) => {
                    const pop = L.popup().setLatLng(e.latlng).setContent('<div class="p-2 text-xs">Loading...</div>').openOn(leafletMap.current!);
                    const res = await fetch(`${API_URL}/api/locations/map/point-detail/${desa.locationId}`);
                    const json = await res.json();
                    if (json.success) pop.setContent(getPointPopupHtml(json.data, isBerlistrik, hideStatus, "ulp"));
                  })
                    .addTo(ulpLayerGroup);
                }
              });
            }
          });
        }

        pointsLayer.current = ulpLayerGroup as any;
        pointsLayer.current?.addTo(leafletMap.current);

      } else {
        // General Point Style
        const allFeatures = data.points.features || [];
        pointsLayer.current = L.geoJSON({ type: "FeatureCollection", features: allFeatures } as any, {
          pointToLayer: (feature, latlng) => {
            const props = feature.properties || {};
            const isStable = props.status === "Berlistrik PLN" || props.status === "stable";
            const isMatch = searchQuery.trim().length >= 3 && (props.name || "").toLowerCase().includes(searchQuery.toLowerCase().trim());
            const isSelected = selectedPointId === props.id;
            let showDot = true;

            if (isSelected || isMatch) {
              showDot = true; // Always show if selected or search match
            } else {
              if (filterLocations) {
                if (filterLocations.length === 0) {
                  showDot = false;
                } else {
                  const match = filterLocations.some(loc => {
                    const s = loc.toUpperCase();
                    return s === (props.up3 || "").toUpperCase() || s === (props.kabupaten || "").toUpperCase() || s === (props.kecamatan || "").toUpperCase() || s === (props.name || "").toUpperCase();
                  });
                  if (!match) showDot = false;
                }
              }
              if (showDot && !disableWarning) {
                if (isStable && !activeFilters.stable) showDot = false;
                if (!isStable && !activeFilters.warning) showDot = false;
              }
            }
            if (!showDot) return (L as any).layerGroup();
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: isStable ? "#2ecc71" : "#f1c40f",
              color: "white",
              weight: 2,
              opacity: 1,
              fillOpacity: 1,
              pane: 'markerPane',
              locationId: props.id || props.locationId // Attach for robust search popup
            } as any);
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.on('click', async (e) => {
              const pop = L.popup().setLatLng(e.latlng).setContent('<div class="p-2 text-xs">Loading...</div>').openOn(leafletMap.current!);
              const res = await fetch(`${API_URL}/api/locations/map/point-detail/${props.id}`);
              const json = await res.json();
              if (json.success) pop.setContent(getPointPopupHtml(json.data, props.status === "Berlistrik PLN", hideStatus, markerLevel as any));
            });
          }
        }).addTo(leafletMap.current);
      }
    }
  }, [data, activeFilters, disableWarning, markerLevel, searchQuery, filterLocations, hideStatus, selectedPointId]);

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
      if (filterLocations) {
        if (filterLocations.length === 0) {
          showLabel = true; // Always show labels if no filters are active
        } else {
          showLabel = filterLocations.includes(kab.name);
        }
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

  // 4. Handle auto-opening popup for selected point (Hyper-Robust Version)
  useEffect(() => {
    if (!selectedPointId || !leafletMap.current || loading) return;

    console.log("Auto-popup effector triggered for ID:", selectedPointId);

    const tryOpenPopupRecursive = (retryCount = 0) => {
      if (!leafletMap.current) return;
      let found = false;

      const searchInLayer = (layer: any) => {
        if (found) return;

        const props = layer.feature?.properties || {};
        const options = layer.options || {};

        // Match against multiple possible ID locations
        const lId = (props.id || props.locationId || options.locationId || options.id || layer.locationId || "").toString();
        const targetId = selectedPointId.toString();

        if (targetId && lId && (targetId === lId)) {
          console.log(`[MAP] Match found at retry ${retryCount} for ID: ${lId}`);

          if (layer.fire) {
            // Get coordinates: from layer itself, or as fallback from search metadata
            const latlng = layer.getLatLng ? layer.getLatLng() : leafletMap.current?.getCenter();

            // Highlight marker temporarily for visual feedback
            if (layer.setStyle) {
              const originalRadius = layer.options.radius || 6;
              layer.setStyle({ radius: 12, weight: 4, color: '#fff' });
              setTimeout(() => layer.setStyle({ radius: originalRadius, weight: 1, color: 'white' }), 1000);
            }

            layer.fire('click', { latlng: latlng });
            found = true;
          }
        }

        // Deep search into groups/GeoJSON
        if (!found && layer.eachLayer) {
          layer.eachLayer((child: any) => searchInLayer(child));
        }
      };

      searchInLayer(leafletMap.current);

      if (!found && retryCount < 8) {
        // Exponential-ish backoff or just steady retries
        const nextDelay = 300 + (retryCount * 200);
        setTimeout(() => tryOpenPopupRecursive(retryCount + 1), nextDelay);
      } else if (found) {
        // Reset selected ID after successful open to prevent loops, 
        // BUT we might want to keep it so the marker stays visible even if filters hide it.
        // For now, let's keep it until next search.
      }
    };

    // Wait for the flyTo animation (1.5s) to finish before the first attempt
    const timeout = setTimeout(() => tryOpenPopupRecursive(0), 1600);
    return () => clearTimeout(timeout);
  }, [selectedPointId, data, loading]);

  // View manipulation when search item is clicked
  const handleSelectResult = (feature: any) => {
    if (!leafletMap.current) return;

    const coords = feature.geometry.coordinates;
    const id = feature.properties.id || feature.properties.locationId;

    setSelectedPointId(id);

    // Smooth fly to location
    leafletMap.current.flyTo([coords[1], coords[0]], 15, { duration: 1.5 });

    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full h-full bg-[#0f172a] overflow-hidden rounded-xl shadow-2xl border border-white/10 group/map">
      {/* Version Indicator for Debugging */}
      <div className="absolute bottom-2 left-2 z-[1001] pointer-events-none opacity-40 group-hover/map:opacity-100 transition-opacity">
        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">MAP v2.1.3-RL</span>
      </div>
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
