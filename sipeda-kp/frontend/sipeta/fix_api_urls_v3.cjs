const fs = require('fs');
const path = require('path');

const directory = 'd:/PKL/sipeda-pln/sipeda-kp/frontend/sipeta/src';

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;

            // 1. Remove ANY previous broken definitions of rawApiUrl and API_URL
            // This regex matches lines that define rawApiUrl or API_URL locally
            const lines = content.split('\n');
            const filteredLines = lines.filter(line => {
                const isLocalDef = /const\s+(rawApiUrl|API_URL|rawUrl)\s*=/.test(line);
                if (isLocalDef) {
                    changed = true;
                    return false;
                }
                return true;
            });

            if (changed || content.includes('import.meta.env.VITE_API_URL')) {
                // 2. Add the correct definition at the top (or use the one we just removed)
                // Let's use import.meta.env directly to avoid circularity
                const newDef = `\nconst _rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5055';\nconst API_URL = _rawUrl.replace(/\\/+$/, '');\n`;

                // Find where to insert (after imports)
                let lastImportIndex = -1;
                for (let i = 0; i < filteredLines.length; i++) {
                    if (filteredLines[i].startsWith('import ')) lastImportIndex = i;
                }

                filteredLines.splice(lastImportIndex + 1, 0, newDef);

                // 3. Ensure all usages of import.meta.env.VITE_API_URL are replaced by API_URL
                let newContent = filteredLines.join('\n');
                newContent = newContent.replace(/import\.meta\.env\.VITE_API_URL/g, 'API_URL');

                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Cleaned and Fixed: ${filePath}`);
            }
        }
    });
}

// Special case for apiConfig.ts - don't let the script mess it up
const apiConfigPath = 'd:/PKL/sipeda-pln/sipeda-kp/frontend/sipeta/src/services/apiConfig.ts';
const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');

walk(directory);

// Restore apiConfig.ts after walk
fs.writeFileSync(apiConfigPath, apiConfigContent, 'utf8');

console.log('Final robust cleanup done.');
