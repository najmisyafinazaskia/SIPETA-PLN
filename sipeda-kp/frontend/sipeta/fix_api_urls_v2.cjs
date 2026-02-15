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

            // Pattern 1: Fixed variables (already handled partly, but let's make it more robust)
            const varPattern = /const\s+API_URL\s+=\s+(import\.meta\.env\.VITE_API_URL|rawApiUrl)\s*\|\|\s*['"](.+?)['"];/g;
            if (content.match(varPattern)) {
                // If it's already there, ensure it's the sanitized version
                if (!content.includes('const API_URL = rawApiUrl.endsWith')) {
                    content = content.replace(varPattern, (match, env, fallback) => {
                        changed = true;
                        return `const rawApiUrl = import.meta.env.VITE_API_URL || '${fallback}';\nconst API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;`;
                    });
                }
            } else if (content.includes('import.meta.env.VITE_API_URL')) {
                // Pattern 2: Direct usage without local API_URL variable
                // Add the variable at the top after imports
                changed = true;
                const lines = content.split('\n');
                let lastImportIndex = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('import ')) lastImportIndex = i;
                }

                const apiDef = `\nconst rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5055';\nconst API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;\n`;
                lines.splice(lastImportIndex + 1, 0, apiDef);
                content = lines.join('\n');

                // Now replace the direct usages with API_URL
                content = content.replace(/import\.meta\.env\.VITE_API_URL/g, 'API_URL');
            }

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Fixed: ${filePath}`);
            }
        }
    });
}

walk(directory);
console.log('Final cleanup done.');
