const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../android/app/google-services.json');

if (!fs.existsSync(configPath)) {
    console.log('❌ google-services.json does NOT exist.');
    process.exit(0);
}

try {
    const content = fs.readFileSync(configPath, 'utf8');
    const json = JSON.parse(content);
    const projectId = json.project_info?.project_id;

    if (projectId === 'mock-project-id') {
        console.log('⚠️ File exists but appears to be the DUMMY/MOCK version.');
        console.log('   Project ID: mock-project-id');
    } else {
        console.log('✅ File exists and appears to be a REAL configuration.');
        console.log(`   Project ID: ${projectId}`);
    }
} catch (e) {
    console.error('❌ Error reading or parsing google-services.json:', e.message);
}
