const fs = require('fs');
const filePath = 'd:/PKL/sipeda-pln/sipeda-kp/frontend/sipeta/src/pages/Dashboard/RegionMap.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Function to generate the click handler replacement
const getClickHandler = (idSource, popupData, statusCheck, level) => {
    return `.on('click', async (e) => {
                const temporaryPopup = L.popup()
                  .setLatLng(e.latlng)
                  .setContent('<div class="p-4 flex flex-col items-center gap-2 bg-white rounded-xl shadow-2xl border border-slate-100"><div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full"></div><span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memuat Detail...</span></div>')
                  .openOn(leafletMap.current!);

                try {
                  const detailRes = await fetch(\`\${API_URL}/api/locations/map/point-detail/\${${idSource}}\`);
                  const detailJson = await detailRes.json();
                  if (detailJson.success) {
                    temporaryPopup.setContent(getPointPopupHtml(detailJson.data, ${statusCheck}, hideStatus, "${level}"));
                  } else {
                    temporaryPopup.setContent(\`<b>\${${popupData}.Desa || ${popupData}.name}</b><br>Gagal memuat detail.\`);
                  }
                } catch (err) {
                  temporaryPopup.setContent(\` Kesalahan jaringan.\`);
                }
              })`;
};

// 1. Patch UP3 CircleMarker
const up3Target = /\.bindPopup\(getPointPopupHtml\(\{ \.\.\.desa, up3: up3Name \}, isBerlistrik, hideStatus, "up3"\)\)/;
const up3Repl = getClickHandler('desa.locationId', 'desa', 'isBerlistrik', 'up3');
if (content.match(up3Target)) {
    content = content.replace(up3Target, up3Repl);
    console.log('Patched UP3 marker click handler');
}

// 2. Patch ULP CircleMarker
const ulpTarget = /\.bindPopup\(getPointPopupHtml\(\{ \.\.\.desa, ULP: ulpName \}, isBerlistrik, hideStatus, "ulp"\)\)/;
const ulpRepl = getClickHandler('desa.locationId', 'desa', 'isBerlistrik', 'ulp');
if (content.match(ulpTarget)) {
    content = content.replace(ulpTarget, ulpRepl);
    console.log('Patched ULP marker click handler');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done patching RegionMap handlers');
