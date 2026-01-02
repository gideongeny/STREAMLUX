const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');

try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    console.log('--- MANIFEST START ---');
    console.log(content);
    console.log('--- MANIFEST END ---');
} catch (e) {
    console.error('Error reading manifest:', e);
}
