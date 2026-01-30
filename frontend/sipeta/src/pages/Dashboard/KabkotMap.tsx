import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface KabkotMapProps {
  activeFilters: { stable: boolean; warning: boolean };
  disableWarning?: boolean;
  filterLocations?: string[];
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

// Component to handle map bounds and interactions
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 8);
  }, [center, map]);
  return null;
};

const KabkotMap: React.FC<KabkotMapProps> = ({ activeFilters, filterLocations }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [kabData, setKabData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch Boundaries
    fetch(`${API_URL}/api/locations/map/boundaries`)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Failed to load boundaries:", err));

    // 2. Fetch Kabupaten Stats for Markers
    fetch(`${API_URL}/api/locations/stats`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const mapped = json.data.details.map((item: any) => {
            let coords: [number, number] = [0, 0];
            const name = item.kabupaten.toUpperCase();

            // Manual coordinates for better visual centering
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
              stats: item // keep full stats if needed for popup
            };
          });
          setKabData(mapped.filter((k: any) => k.coords[0] !== 0));
        }
      })
      .catch((err) => console.error("Failed to load locations:", err));
  }, []);

  return (
    <MapContainer
      center={[4.695135, 96.749397]}
      zoom={8}
      className="w-full h-full rounded-2xl z-0"
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
      />

      {/* Render Polygons */}
      {geoData && (
        <GeoJSON
          data={geoData}
          style={(feature) => ({
            fillColor: "transparent",
            fillOpacity: 0,
            color: getBrightColor(feature?.properties?.Kab_Kota || feature?.properties?.name || "Wilayah"),
            weight: 2,
            dashArray: '5, 5', // Dashed lines
            opacity: 0.9
          })}
        />
      )}

      {/* Render Markers - Names always visible, Dots conditional */}
      {kabData.map((kab, idx) => {
        // Filter Logic
        let showDot = true;

        // Location Filter
        if (filterLocations) {
          if (filterLocations.length === 0) showDot = false; // "Hide All"
          else if (!filterLocations.includes(kab.name)) showDot = false;
        }

        // Status Filter (Assuming all Kabkot are considered "stable" or match activeFilters.stable for now, 
        // but previously it was just 'activeFilters.stable'. 
        // If we want to strictly follow previous logic:
        // const isVisible = activeFilters.stable;
        // if (!isVisible) showDot = false;
        // However, KabkotPage logic shows they are all "stable" type.
        if (!activeFilters.stable) showDot = false;

        return (
          <Marker
            key={idx}
            position={kab.coords}
            icon={L.divIcon({
              className: "custom-icon",
              html: `<div style="display:flex; flex-direction:column; align-items:center;">
                       <div style="width:14px; height:14px; background:#00C851; border:2px solid white; border-radius:50%; box-shadow:0 0 5px rgba(0,0,0,0.5); display: ${showDot ? 'block' : 'none'};"></div>
                       <div style="color:#000; font-weight:700; font-size:12px; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff; white-space:nowrap; margin-top:${showDot ? '3px' : '0'}; letter-spacing: 0.5px;">
                         ${kab.name}
                       </div>
                     </div>`,
              iconSize: [100, 40],
              iconAnchor: [50, 7],
            })}
          >
            {showDot && (
              <Popup>
                <div className="text-center">
                  <b className="block text-sm mb-1">{kab.name}</b>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 font-bold">
                    Terjangkau Listrik
                  </span>
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}

      <MapController center={[4.3, 96.8]} />
    </MapContainer>
  );
};

export default KabkotMap;