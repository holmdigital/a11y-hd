import fs from 'fs';
import path from 'path';

const packagesRoot = path.join(process.cwd());
const distDir = path.join(packagesRoot, 'dist');
const srcDir = path.join(packagesRoot, 'src');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 1. Copy Templates
const templatesSrc = path.join(srcDir, 'reporting', 'templates');
if (fs.existsSync(templatesSrc)) {
    console.log('Copying templates...');
    copyDir(templatesSrc, path.join(distDir, 'templates'));
    copyDir(templatesSrc, path.join(distDir, 'cli', 'templates'));
}

// 2. Copy Assets
const assetsSrc = path.join(srcDir, 'assets');
if (fs.existsSync(assetsSrc)) {
    console.log('Copying assets...');
    copyDir(assetsSrc, path.join(distDir, 'assets'));
    copyDir(assetsSrc, path.join(distDir, 'cli', 'assets'));
}

console.log('Asset copy complete.');
