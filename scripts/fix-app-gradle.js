const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../android/app/build.gradle');

try {
    if (!fs.existsSync(targetPath)) {
        console.error('File not found:', targetPath);
        process.exit(1);
    }

    let content = fs.readFileSync(targetPath, 'utf8');

    // Force compileSdkVersion 34
    if (content.match(/compileSdkVersion/)) {
        content = content.replace(/compileSdkVersion\s+\d+/, 'compileSdkVersion 34');
        content = content.replace(/compileSdkVersion\s+rootProject\.ext\.compileSdkVersion/, 'compileSdkVersion 34'); // Handle variable usage
    } else {
        // If not found (weird), insert it? No, probably in block.
        console.log('compileSdkVersion not found regex');
    }

    // Force targetSdkVersion 34
    if (content.match(/targetSdkVersion/)) {
        content = content.replace(/targetSdkVersion\s+\d+/, 'targetSdkVersion 34');
        content = content.replace(/targetSdkVersion\s+rootProject\.ext\.targetSdkVersion/, 'targetSdkVersion 34');
    }

    fs.writeFileSync(targetPath, content);
    console.log('✅ Updated android/app/build.gradle to force SDK 34');

} catch (e) {
    console.error('Error:', e);
}
