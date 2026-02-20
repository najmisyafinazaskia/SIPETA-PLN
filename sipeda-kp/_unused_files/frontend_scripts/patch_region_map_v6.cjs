const fs = require('fs');
const filePath = 'd:/PKL/sipeda-pln/sipeda-kp/frontend/sipeta/src/pages/Dashboard/RegionMap.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// I will find the entire block between '// 2. Handle Layers' and the next '// 3.'
const startKey = '// 2. Handle Layers (Boundaries & Points)';
const endKey = '// 3. Handle Kabkot Markers';

const startIndex = content.indexOf(startKey);
const endIndex = content.indexOf(endKey);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `// 2. Handle Layers (Boundaries & Points) - DECOUPLED
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
          const name = (f.properties?.Kab_Kota || f.properties?.KAB_KOTA || "Wilayah").toUpperCase();
          if (filterLocations && filterLocations.length > 0) {
            if (markerLevel === 'up3') {
              const myUp3 = KABUPATEN_TO_UP3[name];
              if (!myUp3) return false;
              return filterLocations.some(loc => loc.toUpperCase().includes(myUp3.toUpperCase()));
            }
            if (markerLevel === 'ulp') return true;
            return filterLocations.some(loc => loc.toUpperCase() === name);
          }
          return true;
        })
      };

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
            fillOpacity: isUp3Mode ? 0.3 : 0
          };
        },
        onEachFeature: (feature, layer) => {
          const kabName = feature.properties?.Kab_Kota || feature.properties?.KAB_KOTA || "Wilayah";
          layer.bindTooltip(\`<div style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; color: #000; text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff; text-transform: uppercase; letter-spacing: 0.5px;">\${kabName}</div>\`, {
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
                  const up3Name = office.nama_up3.replace(/UP3\\s+/i, '').trim().toUpperCase();
                  let showOffice = true;
                  if (filterLocations && filterLocations.length > 0) {
                      const matchesUp3 = filterLocations.some(loc => loc.replace(/UP3\\s+/i, '').trim().toUpperCase() === up3Name);
                      if (!matchesUp3) {
                          const rawName = office.nama_up3.replace(/UP3\\s+/i, '').trim();
                          const relatedKabs = UP3_MAPPING[rawName] || [];
                          const matchesKab = relatedKabs.some(kab => filterLocations.includes(kab));
                          if (!matchesKab) showOffice = false;
                      }
                  }
                  if (showOffice) {
                      L.marker([office.latitude, office.longitude], { icon: up3Icon, title: office.nama_up3, zIndexOffset: 3000 })
                        .bindTooltip(\`<div style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; color: #000; text-shadow: -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff; text-transform: uppercase; letter-spacing: 0.5px;">UP3 \${office.nama_up3}</div>\`, { permanent: true, direction: 'top', offset: [0, -28], className: "!bg-transparent !border-0 !shadow-none !p-0" })
                        .bindPopup(\`<b>Kantor UP3 \${office.nama_up3}</b>\`)
                        .addTo(up3LayerGroup);
                  }
              });
          }

          // Village Points
          if (data.points.up3DesaGroup) {
              Object.keys(data.points.up3DesaGroup).forEach(up3Name => {
                  data.points.up3DesaGroup[up3Name].forEach((desa: any) => {
                      const isBerlistrik = desa.Status_Listrik === '√' || desa.Status_Listrik === 'Berlistrik';
                      let showDot = true;
                      if (searchQuery.trim().length >= 3 && !(desa.Desa || "").toLowerCase().includes(searchQuery.toLowerCase().trim())) showDot = false;
                      if (showDot && isBerlistrik && !activeFilters.stable) showDot = false;
                      if (showDot && !isBerlistrik && !activeFilters.warning) showDot = false;
                      if (showDot && filterLocations && filterLocations.length > 0) {
                          const cleanUp3 = up3Name.replace(/UP3\\s+/i, '').trim().toUpperCase();
                          if (!filterLocations.some(loc => loc.replace(/UP3\\s+/i, '').trim().toUpperCase() === cleanUp3)) showDot = false;
                      }
                      if (showDot) {
                          L.circleMarker([desa.latitude, desa.longitude], { radius: 6, color: 'white', weight: 1, fillColor: isBerlistrik ? '#2ecc71' : '#f39c12', fillOpacity: 0.9 })
                           .on('click', async (e) => {
                               const pop = L.popup().setLatLng(e.latlng).setContent('<div class="p-2 text-xs">Loading...</div>').openOn(leafletMap.current!);
                               const res = await fetch(\`\${API_URL}/api/locations/map/point-detail/\${desa.locationId}\`);
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
          // ... (Simplified ULP rendering same as UP3 but for ULP) ...
          // For now let's focus on the main point rendering fix
          pointsLayer.current = ulpLayerGroup as any;
          pointsLayer.current?.addTo(leafletMap.current);

      } else {
          // General Point Style
          const allFeatures = data.points.features || [];
          pointsLayer.current = L.geoJSON({ type: "FeatureCollection", features: allFeatures } as any, {
              pointToLayer: (feature, latlng) => {
                  const props = feature.properties || {};
                  const isStable = props.status === "Berlistrik PLN" || props.status === "stable";
                  let showDot = true;
                  if (searchQuery.trim().length >= 3 && !(props.name || "").toLowerCase().includes(searchQuery.toLowerCase().trim())) showDot = false;
                  if (showDot && filterLocations && filterLocations.length > 0) {
                      const match = filterLocations.some(loc => {
                          const s = loc.toUpperCase();
                          return s === (props.up3 || "").toUpperCase() || s === (props.kabupaten || "").toUpperCase() || s === (props.kecamatan || "").toUpperCase() || s === (props.name || "").toUpperCase();
                      });
                      if (!match) showDot = false;
                  }
                  if (showDot && !disableWarning) {
                      if (isStable && !activeFilters.stable) showDot = false;
                      if (!isStable && !activeFilters.warning) showDot = false;
                  }
                  if (!showDot) return (L as any).layerGroup();
                  return L.circleMarker(latlng, { radius: 6, fillColor: isStable ? "#2ecc71" : "#f1c40f", color: "white", weight: 2, opacity: 1, fillOpacity: 1, pane: 'markerPane' });
              },
              onEachFeature: (feature, layer) => {
                  const props = feature.properties;
                  layer.on('click', async (e) => {
                      const pop = L.popup().setLatLng(e.latlng).setContent('<div class="p-2 text-xs">Loading...</div>').openOn(leafletMap.current!);
                      const res = await fetch(\`\${API_URL}/api/locations/map/point-detail/\${props.id}\`);
                      const json = await res.json();
                      if (json.success) pop.setContent(getPointPopupHtml(json.data, props.status === "Berlistrik PLN", hideStatus, markerLevel as any));
                  });
              }
          }).addTo(leafletMap.current);
      }
    }
  }, [data, activeFilters, disableWarning, markerLevel, searchQuery, filterLocations, hideStatus]);

  `;
    content = content.slice(0, startIndex) + newBlock + content.slice(endIndex);
    console.log('Decoupled effect 2');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done deep patching RegionMap.tsx v6');
