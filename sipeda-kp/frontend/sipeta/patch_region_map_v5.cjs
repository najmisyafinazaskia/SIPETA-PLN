const fs = require('fs');
const filePath = 'd:/PKL/sipeda-pln/sipeda-kp/frontend/sipeta/src/pages/Dashboard/RegionMap.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// I will extract the parts and rebuild the effect.

const boundaryPartRegex = /\/\/ Filter Logic for GeoJSON Boundaries[\s\S]+?\}\)\.addTo\(leafletMap\.current\);/;
const up3PartRegex = /\/\/ Handle Specialized UP3 Mode[\s\S]+?pointsLayer\.current = up3LayerGroup as any;\s+pointsLayer\.current\?\.addTo\(leafletMap\.current\);\s+return; \/\/ Skip default point rendering\s+\}/;
const ulpPartRegex = /\/\/ Handle Specialized ULP Mode[\s\S]+?pointsLayer\.current = ulpLayerGroup as any;\s+pointsLayer\.current\?\.addTo\(leafletMap\.current\);\s+return;\s+\}/;
const unifiedPartRegex = /\/\/ UNIFIED POINT STYLE[\s\S]+?\}\)\.addTo\(leafletMap\.current\);/;

const boundaryPart = content.match(boundaryPartRegex)?.[0] || "";
const up3Part = content.match(up3PartRegex)?.[0] || "";
const ulpPart = content.match(ulpPartRegex)?.[0] || "";
const unifiedPart = content.match(unifiedPartRegex)?.[0] || "";

// Now rebuild the effect body
const newEffectBody = `
  useEffect(() => {
    if (!leafletMap.current) return;

    // Clear old layers
    if (boundaryLayer.current) leafletMap.current.removeLayer(boundaryLayer.current);
    if (pointsLayer.current) leafletMap.current.removeLayer(pointsLayer.current);

    // 1. Render Boundaries (Independent)
    if (data.boundaries && data.boundaries.features) {
      ${boundaryPart.replace('if (data.boundaries && data.boundaries.features) {', '').trim().replace(/}$/, '').trim()}
    }

    // 2. Render Points (Independent)
    if (data.points) {
      if (markerLevel === 'up3' && data.points.up3Offices) {
        ${up3Part.replace('// Handle Specialized UP3 Mode', '').replace(/markerLevel === 'up3' && data.points\.up3Offices/g, 'true').replace('return; // Skip default point rendering', '').trim().replace(/}$/, '').trim()}
      } else if (markerLevel === 'ulp' && data.points.ulpOffices) {
        ${ulpPart.replace('// Handle Specialized ULP Mode', '').replace(/markerLevel === 'ulp' && data.points\.ulpOffices/g, 'true').replace('return;', '').trim().replace(/}$/, '').trim()}
      } else {
        ${unifiedPart.trim()}
      }
    }
  }, [data, activeFilters, disableWarning, markerLevel, searchQuery, filterLocations, hideStatus]);
`;

// Replace the existing logic
const effectRegex = /\/\/ 2\. Handle Layers \(Boundaries & Points\)[\s\S]+?\}\s+\[data, activeFilters, disableWarning, markerLevel, searchQuery, filterLocations\]\);/;
if (content.match(effectRegex)) {
    content = content.replace(effectRegex, newEffectBody);
    console.log('Reorganized effect 2');
} else {
    // try the version I might have just broken
    const effectRegexBroken = /\/\/ 2\. Handle Layers \(Boundaries & Points\)[\s\S]+?\}\s+\[data, activeFilters, disableWarning, markerLevel, searchQuery, filterLocations\]\);/;
    // ... actually let's just use a simpler match
    console.log('FAILED to match effect 2');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done deep patching RegionMap.tsx v5');
