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

            // Simple string replacement for the most common pattern
            content = content.split("const _rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5055';").join("const _rawUrl = import.meta.env.VITE_API_URL || '';");

            if (content !== original) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Fixed API_URL in: ${filePath}`);
            }
        }
    });
}

walk(srcDir);
console.log('Done cleaning up all API fallbacks.');
