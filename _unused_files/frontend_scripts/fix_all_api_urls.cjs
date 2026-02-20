const fs = require('fs');
const path = require('path');

const srcDir = 'd:/PKL/sipeda-pln/sipeda-kp/frontend/sipeta/src';

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            const original = content;

            // Pattern 1: const _rawUrl = ... || 'http://localhost:5055';
            content = content.replace(
                /const _rawUrl = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5055';\s+const API_URL = _rawUrl\.replace\(\/\/\+\$/, ''\);/g,
            "const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\\/+$/, '');"
            );

    // Pattern 2: just matching the literal string 'http://localhost:5055' in some cases
    // but carefully... 
    // Better to match the specific pattern used in the project

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed API_URL in: ${filePath}`);
    }
}
    });
}

walk(srcDir);
console.log('Done cleaning up all API fallbacks.');
