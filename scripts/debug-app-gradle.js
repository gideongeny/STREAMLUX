const fs = require('fs');
const path = require('path');
const targetPath = path.join(__dirname, '../android/app/build.gradle');
try {
    if (fs.existsSync(targetPath)) {
        console.log(fs.readFileSync(targetPath, 'utf8'));
    } else {
        console.log('File not found');
    }
} catch (e) { console.error(e); }
