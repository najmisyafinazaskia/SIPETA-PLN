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
}

const RegionMap: React.FC<RegionMapProps> = ({ activeFilters, disableWarning, filterLocations }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const boundaryLayer = useRef<L.GeoJSON | null>(null);
  const pointsLayer = useRef<L.GeoJSON | null>(null);

  const [data, setData] = useState<{ boundaries: any; points: any }>({ boundaries: null, points: null });
  const [loading, setLoading] = useState(true);

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
      zoomControl: false
    });

    // Base Layer (Satellite)
    L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      attribution: "&copy; Google Maps"
    }).addTo(leafletMap.current);

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

    // Fetch Data
    const fetchData = async () => {
      try {
        const [boundRes, pointRes] = await Promise.all([
          fetch(`${API_URL}/api/locations/map/boundaries`),
          fetch(`${API_URL}/api/locations/map/geojson`)
        ]);
        if (boundRes.ok && pointRes.ok) {
          const boundaries = await boundRes.json();
          const points = await pointRes.json();
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
      style: {
        fillColor: "transparent",
        weight: 1.5,
        opacity: 0.8,
        color: 'white',
        dashArray: '4, 4',
        fillOpacity: 0
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

    // Filter points
    const filteredFeatures = data.points.features.filter((f: any) => {
      // 1. Location Filter
      if (filterLocations && filterLocations.length > 0) {
        const props = f.properties || {};
        const match = filterLocations.some(loc => {
          const search = loc.toUpperCase();
          return (
            search === (props.up3 || "").toUpperCase() ||
            search === (props.kabupaten || "").toUpperCase() ||
            search === (props.kecamatan || "").toUpperCase() ||
            search === (props.name || "").toUpperCase()
          );
        });
        if (!match) return false;
      }

      if (disableWarning) return true;
      const status = f.properties?.status;
      const isStable = status === "Berlistrik PLN";
      if (isStable) return activeFilters.stable;
      return activeFilters.warning;
    });

    // Create Points Layer
    pointsLayer.current = L.geoJSON({ type: "FeatureCollection", features: filteredFeatures } as any, {
      pointToLayer: (feature, latlng) => {
        const isStable = feature.properties?.status === "Berlistrik PLN";
        return L.circleMarker(latlng, {
          radius: 7,
          fillColor: isStable ? "#14B8A6" : "#F2C94C", // Hijau Tosca
          color: "white",
          weight: 2.5,
          opacity: 1,
          fillOpacity: 1
        });
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const isStable = props.status === 'Berlistrik PLN';
        layer.bindPopup(`
          <div style="font-family: 'Outfit', sans-serif; padding: 4px; min-width: 200px;">
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px;">
              <span style="font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase;">
                ${props.kabupaten || "-"} • ${props.kecamatan || "-"}
              </span>
              <h3 style="font-size: 14px; font-weight: 800; color: #1e293b; margin: 0;">Gampong ${props.name || "N/A"}</h3>
            </div>
            <div style="background: ${isStable ? '#f0fdfa' : '#fffbeb'}; border: 1px solid ${isStable ? '#99f6e4' : '#fde68a'}; padding: 6px 10px; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${isStable ? '#14B8A6' : '#F2C94C'};"></div>
              <span style="font-size: 11px; font-weight: 700; color: ${isStable ? '#115e59' : '#92400e'};">${props.status}</span>
            </div>
          </div>
        `);
      }
    }).addTo(leafletMap.current);

  }, [data, activeFilters, disableWarning]);

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
