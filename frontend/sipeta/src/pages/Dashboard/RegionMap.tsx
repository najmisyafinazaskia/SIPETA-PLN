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
  markerLevel?: "desa" | "kecamatan"; // Level of detail
}

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

const RegionMap: React.FC<RegionMapProps> = ({
  activeFilters,
  disableWarning,
  filterLocations,
  dataSourceUrl = `${API_URL}/api/locations/map/geojson`,
  markerLevel = "desa"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const boundaryLayer = useRef<L.GeoJSON | null>(null);
  const pointsLayer = useRef<L.GeoJSON | null>(null);

  const [data, setData] = useState<{ boundaries: any; points: any }>({ boundaries: null, points: null });
  const [kabData, setKabData] = useState<any[]>([]); // New state for Kabkot markers
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(8); // Track zoom level

  const kabMarkersLayer = useRef<L.LayerGroup | null>(null); // Layer for Kabkot markers

  // 1. Initial Map Setup
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Fix icons
    const DefaultIcon = L.Icon.Default as any;
    delete DefaultIcon.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    // Initialize Map
    leafletMap.current = L.map(mapRef.current, {
      center: [4.1755, 96.7763],
      zoom: 8,
      zoomControl: false,
      preferCanvas: true // Significant performance boost for thousands of points
    });

    // Base Layer (Satellite)
    L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      attribution: "&copy; Google Maps"
    }).addTo(leafletMap.current);

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

    // Fetch Data
    const fetchData = async () => {
      try {
        const [boundRes, pointRes, statRes] = await Promise.all([
          fetch(`${API_URL}/api/locations/map/boundaries`),
          fetch(dataSourceUrl.startsWith('http') ? dataSourceUrl : `${API_URL}${dataSourceUrl.startsWith('/') ? '' : '/'}${dataSourceUrl}`),
          fetch(`${API_URL}/api/locations/stats`) // Fetch stats for Kabkot markers
        ]);
        if (boundRes.ok && pointRes.ok) {
          const boundaries = await boundRes.json();
          const points = await pointRes.json();

          if (statRes.ok) {
            const statJson = await statRes.json();
            if (statJson.success) {
              const mapped = statJson.data.details.map((item: any) => {
                let coords: [number, number] = [0, 0];
                const name = item.kabupaten.toUpperCase();

                // Manual coordinates (Same as KabkotMap)
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

          setData({ boundaries, points });
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

    // Create Boundary Layer
    boundaryLayer.current = L.geoJSON(data.boundaries, {
      style: (feature) => {
        const kabName = feature?.properties?.Kab_Kota || feature?.properties?.KAB_KOTA || "Wilayah";
        return {
          fillColor: "transparent",
          weight: 2,
          opacity: 0.9,
          color: getBrightColor(kabName),
          dashArray: '4, 4',
          fillOpacity: 0
        };
      },
      onEachFeature: (feature, layer) => {
        const kabName = feature.properties?.Kab_Kota || feature.properties?.KAB_KOTA || "Wilayah";
        layer.bindTooltip(kabName, {
          sticky: true,
          direction: "top",
          className: "bg-black/80 backdrop-blur-md border-none text-white font-bold text-[10px] px-2 py-1 rounded shadow-lg"
        });
      }
    }).addTo(leafletMap.current);

    // UNIFIED POINT STYLE (Green Dot for all maps) - PERFORMANCE OPTIMIZED
    // Switched to L.circleMarker with preferCanvas: true for massive performance gain
    const allFeatures = data.points.features || [];

    pointsLayer.current = L.geoJSON({ type: "FeatureCollection", features: allFeatures } as any, {
      pointToLayer: (feature, latlng) => {
        const props = feature.properties || {};
        const isStable = props.status === "Berlistrik PLN" || props.status === "stable";
        const color = isStable ? "#00C851" : "#F2C94C";

        // Determine DOT visibility
        let showDot = true;

        // 1. Location Filter Check
        if (filterLocations) {
          if (filterLocations.length === 0) {
            showDot = false; // "Hide All" -> Hide Dot
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

        // 2. Status Filter Check
        if (!disableWarning && showDot) { // Only check if not already hidden
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

        layer.bindPopup(`
              <div style="font-family: 'Outfit', sans-serif; min-width: 200px; padding: 4px; animation: fadeIn 0.3s ease-out;">
                <style>
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  ::-webkit-scrollbar { width: 4px; }
                  ::-webkit-scrollbar-track { background: transparent; }
                  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                </style>
    
                <h3 style="color: ${isStable ? '#22c55e' : '#F2C94C'}; font-size: 16px; font-weight: 700; margin: 0 0 10px 0;">${props.name || "N/A"}</h3>
                
                <div style="font-size: 11px; color: #4b5563; display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;">
                  <div style="display: flex;">
                    <span style="min-width: 75px;">Kecamatan</span>
                    <span>: ${props.kecamatan || "-"}</span>
                  </div>
                  <div style="display: flex;">
                    <span style="min-width: 75px;">Kabupaten</span>
                    <span>: ${props.kabupaten || "-"}</span>
                  </div>
                  <div style="display: flex;">
                    <span style="min-width: 75px;">Status</span>
                    <span style="font-weight: 700; color: ${isStable ? '#16a34a' : '#ea580c'};">: ${props.status}</span>
                  </div>
                </div>
    
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 0 0 10px 0;">
    
                <div style="font-size: 11px;">
                  <div style="font-weight: 700; color: #374151; margin-bottom: 6px;">Rincian Dusun:</div>
                  <div style="display: flex; flex-direction: column; gap: 3px; max-height: 150px; overflow-y: auto;">
                    ${(props.dusuns && props.dusuns.length > 0) ? props.dusuns.map((d: any) => `
                      <div style="display: flex; align-items: start;">
                        <span style="color: #6b7280; margin-right: 4px;">•</span>
                        <span style="color: #4b5563; margin-right: 6px;">${d.name}</span>
                        <span style="font-weight: 700; white-space: nowrap; color: ${(d.status === 'Berlistrik PLN' || d.status.includes('PLN')) ? '#16a34a' : '#ea580c'}; font-size: 10px;">${d.status}</span>
                      </div>
                    `).join('') : '<span style="color: #9ca3af; font-style: italic;">Tidak ada data dusun</span>'}
                  </div>
                </div>
              </div>
            `);
      }
    }).addTo(leafletMap.current);

  }, [data, activeFilters, disableWarning, markerLevel]);

  // 3. Handle Kabkot Markers (Separate Effect for Zoom Logic)
  useEffect(() => {
    if (!leafletMap.current || kabData.length === 0) return;

    // Initialize layer group if not exists
    if (!kabMarkersLayer.current) {
      kabMarkersLayer.current = L.layerGroup().addTo(leafletMap.current);
    } else {
      kabMarkersLayer.current.clearLayers();
    }


    kabData.forEach(kab => {
      // Filter Logic
      let showDot = true;
      if (filterLocations) {
        if (filterLocations.length === 0) showDot = false; // Hide All -> Hide Dot
        else if (!filterLocations.includes(kab.name)) showDot = false; // No Match -> Hide Dot
      }

      // Consistent sizing with KabkotMap
      const fontSize = 12;

      const marker = L.marker(kab.coords, {
        zIndexOffset: 1000,
        icon: L.divIcon({
          className: "custom-icon",
          html: `<div style="display:flex; flex-direction:column; align-items:center;">
                   <div style="width:14px; height:14px; background:#00C851; border:2px solid white; border-radius:50%; box-shadow:0 0 5px rgba(0,0,0,0.5); display: ${showDot ? 'block' : 'none'};"></div>
                   <div style="color:#000; font-weight:700; font-size:${fontSize}px; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff; white-space:nowrap; margin-top:${showDot ? '3px' : '0'}; letter-spacing: 0.5px;">
                     ${kab.name}
                   </div>
                 </div>`,
          iconSize: [100, 40],
          iconAnchor: [50, 7], // 7 is roughly half of dot height (14)
        })
      });

      if (showDot) {
        marker.bindPopup(`
                <div class="text-center">
                  <b class="block text-sm mb-1">${kab.name}</b>
                  <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 font-bold">
                    Terjangkau Listrik
                  </span>
                </div>
             `);
      }

      if (kabMarkersLayer.current) {
        kabMarkersLayer.current.addLayer(marker);
      }
    });

  }, [kabData, zoomLevel, filterLocations]);

  // 4. Zoom Listener
  useEffect(() => {
    if (!leafletMap.current) return;

    const onZoom = () => {
      setZoomLevel(leafletMap.current?.getZoom() || 8);
    };

    leafletMap.current.on('zoomend', onZoom);
    return () => {
      leafletMap.current?.off('zoomend', onZoom);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-50">
      <div ref={mapRef} style={{ height: '100%', width: '100%', minHeight: '500px' }} />
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#465FFF] border-t-transparent shadow-lg"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-outfit">Sinkronisasi Peta...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionMap;
