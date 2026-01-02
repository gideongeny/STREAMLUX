const fs = require('fs');
const path = require('path');

const RES_DIR = path.join(__dirname, '../android/app/src/main/res');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeFile(relativePath, content) {
    const filePath = path.join(RES_DIR, relativePath);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content.trim());
    console.log(`Updated resource: ${filePath}`);
}

async function fixResources() {
    console.log('🔧 Fixing Android Resources...');

    // 1. Create file_paths.xml
    writeFile('xml/file_paths.xml', `
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="my_images" path="." />
    <cache-path name="my_cache" path="." />
    <files-path name="my_files" path="." />
</paths>
`);

    // 2. Update strings.xml
    const stringsPath = path.join(RES_DIR, 'values/strings.xml');
    let stringsContent = '';

    if (fs.existsSync(stringsPath)) {
        stringsContent = fs.readFileSync(stringsPath, 'utf8');
    } else {
        stringsContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">StreamLux</string>
    <string name="title_activity_main">StreamLux</string>
    <string name="package_name">com.streamlux.app</string>
</resources>`;
    }

    if (!stringsContent.includes('custom_url_scheme')) {
        stringsContent = stringsContent.replace(
            '</resources>',
            '    <string name="custom_url_scheme">com.streamlux.app</string>\n</resources>'
        );
        fs.writeFileSync(stringsPath, stringsContent);
        console.log('✅ Added custom_url_scheme to strings.xml');
    }

    // 3. Create dummy google-services.json
    const googleServicesPath = path.join(__dirname, '../android/app/google-services.json');
    if (!fs.existsSync(googleServicesPath)) {
        const dummy = {
            project_info: {
                project_number: "000000000000",
                project_id: "mock-project-id",
                storage_bucket: "mock-project-id.appspot.com"
            },
            client: [{
                client_info: {
                    mobilesdk_app_id: "1:000000000000:android:0000000000000000",
                    android_client_info: {
                        package_name: "com.streamlux.app"
                    }
                },
                oauth_client: [],
                api_key: [{
                    current_key: "AIzaSyMockKeyForBuildPurposesOnly"
                }],
                services: {
                    appinvite_service: {
                        other_platform_oauth_client: []
                    }
                }
            }],
            configuration_version: "1"
        };
        fs.writeFileSync(googleServicesPath, JSON.stringify(dummy, null, 2));
        console.log('⚠️ Created dummy google-services.json');
    }

    console.log('🎉 Resources fixed!');
}

fixResources();
