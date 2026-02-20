const fs = require('fs');
const path = require('path');
const targetPath = path.join(__dirname, '../android/build.gradle');
try {
    if (fs.existsSync(targetPath)) {
        const content = fs.readFileSync(targetPath, 'utf8');
        const match = content.match(/com\.android\.tools\.build:gradle:([0-9.]+)/);
        if (match) {
            console.log('AGP Version:', match[1]);
        } else {
            console.log('AGP Version not found in regex');
            console.log(content.substring(0, 1000)); // Print first 1000 chars
        }
    } else {
        console.log('File not found');
    }
} catch (e) { console.error(e); }
