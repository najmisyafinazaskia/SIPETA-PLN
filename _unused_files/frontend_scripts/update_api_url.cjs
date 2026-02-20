const fs = require('fs');
const files = [
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\services\\locationService.ts",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\VerifikasiPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Landing\\LandingPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\Up3Page.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\Up3KecamatanDetail.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\Up3Detail.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\Up3DesaDetail.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\UlpPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\UlpKecamatanDetail.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\UlpDesaDetail.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\RegionPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\RegionMap.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\RegionDetailPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\KecamatanPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\KabKotPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\KabkotMap.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\DusunPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\DusunDetailPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\pages\\Dashboard\\DesaPage.tsx",
    "d:\\PKL\\sipeta-pln\\sipeta-kp\\frontend\\sipeta\\src\\components\\auth\\SignInForm.tsx"
];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('http://localhost:5000')) {
            // Replace with empty string
            const newContent = content.replace(/http:\/\/localhost:5000/g, '');
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Updated: ${file}`);
        } else {
            console.log(`Skipped (no match): ${file}`);
        }
    } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
    }
});
