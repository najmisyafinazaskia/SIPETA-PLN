import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const _rawUrl = import.meta.env.VITE_API_URL || '';
const API_URL = _rawUrl.replace(/\/+$/, '');







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


            if (item.koordinat && Array.isArray(item.koordinat) && item.koordinat.length === 2) {
              coords = item.koordinat as [number, number];
            } else if (item.x && item.y) {
              // Fallback to legacy x/y if koordinat is missing (Note: check backend mapping)
              // My backend now maps result.x = coords[0] (Lat) and result.y = coords[1] (Lng)
              // But legacy aggregation mapped x=X(Lng), y=Y(Lat).
              // To be safe, rely on 'koordinat' first. 
              // If falling back to legacy x/y from 'details' which might be raw stats if no coordMap match:
              // The legacy code used [y, x]. 
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
              html: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; pointer-events: none;">
                        <div style="
                          width: 12px; 
                          height: 12px; 
                          background: #2ecc71; 
                          border: 2px solid white; 
                          border-radius: 50%; 
                          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
                          display: ${showDot ? 'block' : 'none'};
                        "></div>
                        <div style="
                          font-family: 'Outfit', sans-serif;
                          font-size: 11px; 
                          font-weight: 600; 
                          color: #000; 
                          text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff; 
                          white-space: nowrap; 
                          margin-top: 2px;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          display: block;
                        ">
                          ${kab.name}
                        </div>
                      </div>`,
              iconSize: [120, 40],
              iconAnchor: [60, 5],
            })}
          >

          </Marker>
        );
      })}

      <MapController center={[4.3, 96.8]} />
    </MapContainer>
  );
};

export default KabkotMap;