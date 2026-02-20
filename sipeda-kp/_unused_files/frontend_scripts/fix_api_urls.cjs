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

            // Pattern 1: const API_URL = import.meta.env.VITE_API_URL || ...
            const pattern = /const\s+API_URL\s+=\s+import\.meta\.env\.VITE_API_URL\s+\|\|\s+['"](.+?)['"];/g;
            if (content.match(pattern)) {
                content = content.replace(pattern, (match, fallback) => {
                    changed = true;
                    return `const rawApiUrl = import.meta.env.VITE_API_URL || '${fallback}';\nconst API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;`;
                });
            }

            // Pattern 2: Directly using import.meta.env.VITE_API_URL in fetch/axios
            // Handle cases where it's used inside template literals
            const templatePattern = /\$\{import\.meta\.env\.VITE_API_URL\}/g;
            if (content.match(templatePattern)) {
                // If we haven't defined API_URL yet, we might need a different approach, 
                // but let's see if there are many such cases.
                // For now, let's just fix the variables.
            }

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

walk(directory);
console.log('Done cleaning up API_URL');
