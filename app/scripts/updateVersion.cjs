// Script de mise à jour du numéro de version de package.json
const fs = require('fs');
const path = require('path');

const type = process.argv[2]; // patch | minor | major

const filePath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

let [major, minor, patch] = pkg.version.split('.').map(Number);

if (type === 'patch') {
    patch++;
} else if (type === 'minor') {
    minor++;
    patch = 0;
} else if (type === 'major') {
    major++;
    minor = 0;
    patch = 0;
} else {
    console.error('Type de version invalide.');
    process.exit(1);
}

const newVersion = `${major}.${minor}.${patch}`;
pkg.version = newVersion;

fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`${pkg.version}`);
