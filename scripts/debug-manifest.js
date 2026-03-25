const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');

try {
    if (fs.existsSync(manifestPath)) {
        const content = fs.readFileSync(manifestPath, 'utf8');
        console.log(content);
    } else {
        console.log('Manifest not found');
    }
} catch (error) {
    console.error('Error reading manifest:', error);
}
