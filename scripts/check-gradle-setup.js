const fs = require('fs');
const path = require('path');

const rootGradlePath = path.join(__dirname, '../android/build.gradle');
const appGradlePath = path.join(__dirname, '../android/app/build.gradle');

function checkFile(filePath, patterns, name) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${name} NOT FOUND at ${filePath}`);
        return false;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    let allFound = true;
    patterns.forEach(p => {
        if (!content.includes(p)) {
            console.log(`❌ ${name} is missing: "${p}"`);
            allFound = false;
        } else {
            console.log(`✅ ${name} contains: "${p}"`);
        }
    });
    return allFound;
}

console.log('--- Checking Gradle Setup ---');
checkFile(rootGradlePath, ['com.google.gms:google-services'], 'Root build.gradle');
checkFile(appGradlePath, ['com.google.gms.google-services'], 'App build.gradle');
