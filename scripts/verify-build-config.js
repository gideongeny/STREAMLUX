const fs = require('fs');
const path = require('path');

const files = [
    '../android/variables.gradle',
    '../android/gradle/wrapper/gradle-wrapper.properties'
];

files.forEach(f => {
    const fullPath = path.join(__dirname, f);
    console.log(`--- CHECK: ${f} ---`);
    if (fs.existsSync(fullPath)) {
        console.log(fs.readFileSync(fullPath, 'utf8'));
    } else {
        console.log('File not found');
    }
});
