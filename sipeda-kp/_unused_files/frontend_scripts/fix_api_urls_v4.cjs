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

            // 1. Remove ANY previous broken definitions
            const lines = content.split('\n');
            const filteredLines = lines.filter(line => {
                return !(/const\s+(_rawUrl|rawApiUrl|API_URL|rawUrl)\s*=/.test(line));
            });

            if (filteredLines.length !== lines.length) changed = true;

            // 2. Also replace any remaining direct usages of the env variable
            let newContent = filteredLines.join('\n');
            if (newContent.includes('import.meta.env.VITE_API_URL')) {
                newContent = newContent.replace(/import\.meta\.env\.VITE_API_URL/g, 'API_URL');
                changed = true;
            }

            if (changed) {
                // 3. Add the clean definition at the top after imports
                const finalLines = newContent.split('\n');
                let lastImportIndex = -1;
                for (let i = 0; i < finalLines.length; i++) {
                    if (finalLines[i].startsWith('import ')) lastImportIndex = i;
                }

                const apiDef = `\nconst _rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5055';\nconst API_URL = _rawUrl.replace(/\\/+$/, '');\n`;
                finalLines.splice(lastImportIndex + 1, 0, apiDef);

                fs.writeFileSync(filePath, finalLines.join('\n'), 'utf8');
                console.log(`Final Fix Applied: ${filePath}`);
            }
        }
    });
}

const apiConfigPath = 'd:/PKL/sipeda-pln/sipeda-kp/frontend/sipeta/src/services/apiConfig.ts';
const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');

walk(directory);

fs.writeFileSync(apiConfigPath, apiConfigContent, 'utf8');

console.log('Final robust cleanup v4 done.');
