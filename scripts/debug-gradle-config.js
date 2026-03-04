const fs = require('fs');
const path = require('path');

const files = [
    '../android/variables.gradle',
    '../android/app/src/main/res/xml/continue_watching_widget.xml'
];

files.forEach(f => {
    const fullPath = path.join(__dirname, f);
    console.log(`--- READ: ${f} ---`);
    if (fs.existsSync(fullPath)) {
        console.log(fs.readFileSync(fullPath, 'utf8'));
    } else {
        console.log('File not found');
    }
});
