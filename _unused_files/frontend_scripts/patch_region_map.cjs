const fs = require('fs');
const filePath = 'd:/PKL/sipeda-pln/sipeda-kp/frontend/sipeta/src/pages/Dashboard/RegionMap.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Optimize loading finally block
content = content.replace(
    /\} catch \(err\) \{\s+console\.error\("Leaflet fetch error:", err\);\s+\} finally \{\s+setLoading\(false\);\s+\}/,
    '} catch (err) {\n        console.error("Leaflet fetch error:", err);\n        setLoading(false);\n      } finally {\n        setTimeout(() => setLoading(false), 500);\n      }'
);

// 2. Optimize points layer and popups
// Find the block for Unified Point Style
const searchBlock = `// UNIFIED POINT STYLE (Green Dot for all maps) - PERFORMANCE OPTIMIZED
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

  }, [data, activeFilters, disableWarning, markerLevel, searchQuery]);`;

// Note: the indentation in the actual file might differ. 
// I'll try a more robust regex-based replacement for this block.

const newBlock = `// UNIFIED POINT STYLE (Green Dot for all maps) - PERFORMANCE OPTIMIZED
    const allFeatures = data.points?.features || [];
    
    pointsLayer.current = L.geoJSON({ type: "FeatureCollection", features: allFeatures } as any, {
      pointToLayer: (feature, latlng) => {
        const props = feature.properties || {};
        const isStable = props.status === "Berlistrik PLN" || props.status === "stable";
        const color = isStable ? "#2ecc71" : "#f1c40f";

        let showDot = true;
        if (searchQuery.trim().length >= 3) {
            const term = searchQuery.toLowerCase().trim();
            if (!(props.name || "").toLowerCase().includes(term)) showDot = false;
        }

        if (showDot && filterLocations && filterLocations.length > 0) {
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

        if (showDot && !disableWarning) {
          if (isStable && !activeFilters.stable) showDot = false;
          if (!isStable && !activeFilters.warning) showDot = false;
        }

        if (!showDot) return (L as any).layerGroup();

        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: color,
          color: "white",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
          pane: 'markerPane'
        });
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.on('click', async (e) => {
          const temporaryPopup = L.popup()
            .setLatLng(e.latlng)
            .setContent('<div class="p-4 flex flex-col items-center gap-2 bg-white rounded-xl shadow-2xl border border-slate-100"><div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full"></div><span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memuat Detail...</span></div>')
            .openOn(leafletMap.current!);

          try {
            const detailRes = await fetch(\`\${API_URL}/api/locations/map/point-detail/\${props.id}\`);
            const detailJson = await detailRes.json();
            if (detailJson.success) {
              temporaryPopup.setContent(getPointPopupHtml(detailJson.data, props.status === "Berlistrik PLN", hideStatus, markerLevel as any));
            } else {
              temporaryPopup.setContent(\`<b>\${props.name}</b><br>Gagal memuat detail.\`);
            }
          } catch (err) {
            temporaryPopup.setContent(\`<b>\${props.name}</b><br>Kesalahan jaringan.\`);
          }
        });
      }
    }).addTo(leafletMap.current);

  }, [data, activeFilters, disableWarning, markerLevel, searchQuery, filterLocations]);`;

// Greedily replace the unified point block
const unifiedPointRegex = /\/\/ UNIFIED POINT STYLE[\s\S]+?\}\s+\[data, activeFilters, disableWarning, markerLevel, searchQuery\]\);/;
if (content.match(unifiedPointRegex)) {
    content = content.replace(unifiedPointRegex, newBlock);
    console.log('Replaced Unified Point Style block');
} else {
    console.log('FAILED to match Unified Point Style block');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done patching RegionMap.tsx');
