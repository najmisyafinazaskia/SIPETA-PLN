const fs = require('fs');
const filePath = 'd:/PKL/sipeda-pln/sipeda-kp/frontend/sipeta/src/pages/Dashboard/RegionMap.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Better API_URL logic
content = content.replace(
    /const _rawUrl = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5055';\s+const API_URL = _rawUrl\.replace\(\/\/\+\$/, ''\);/,
        `const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\\/+$/, '');`
);

// 2. Make Layer rendering independent
content = content.replace(
    /if \(!leafletMap\.current \|\| !data\.boundaries \|\| !data\.points\) return;/,
    `if (!leafletMap.current) return;`
);

// 3. Fix filterLocations empty logic (Show All if empty on first load/dashboard)
// We change: if (!match) showDot = false; 
// to only apply if filterLocations.length > 0 AND it really doesn't match.

const pointToLayerRegex = /pointToLayer: \(feature, latlng\) => \{([\s\S]+?)\},\s+onEachFeature/;
const pointToLayerMatch = content.match(pointToLayerRegex);
if (pointToLayerMatch) {
    let inner = pointToLayerMatch[1];

    // Replace the filterLocations logic inside pointToLayer
    const filterRegex = /if \(showDot && filterLocations && filterLocations\.length > 0\) \{([\s\S]+?)\}/;
    const filterReplacement = `if (showDot && filterLocations && filterLocations.length > 0) {
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
        }`;

    inner = inner.replace(filterRegex, filterReplacement);

    // We also want to ensure that if filterLocations is empty, we don't hide everything
    // UNLESS it's explicitly intended in specific pages.
    // For Dashboard/Landing, empty usually means "initializing".

    content = content.replace(pointToLayerMatch[0], `pointToLayer: (feature, latlng) => {${inner}}, onEachFeature`);
}

// 4. Force boundaries to render even if data.boundaries.features is empty
// (The backend now returns empty collection instead of error)

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done deep patching RegionMap.tsx v4');
