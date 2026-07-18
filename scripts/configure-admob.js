const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');

// AdMob App ID (Test ID: ca-app-pub-3940256099942544~3347511713)
const ADMOB_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

function configureAdMob() {
    console.log('🔧 Configuring AdMob in AndroidManifest.xml...');

    if (!fs.existsSync(manifestPath)) {
        console.error('❌ AndroidManifest.xml not found.');
        return;
    }

    let manifest = fs.readFileSync(manifestPath, 'utf8');

    if (manifest.includes('com.google.android.gms.ads.APPLICATION_ID')) {
        console.log('✨ AdMob App ID already configured.');
        return;
    }

    // Insert meta-data tag inside <application>
    const metaDataTag = `
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="${ADMOB_APP_ID}"/>`;

    const appTagStart = manifest.indexOf('<application');
    if (appTagStart === -1) {
        console.error('❌ Invalid manifest: <application> tag not found.');
        return;
    }

    // Insert just after <application ...> opening tag
    // Find the end of the opening tag '>'
    const appTagOpenEnd = manifest.indexOf('>', appTagStart) + 1;

    // Insert safely
    const newManifest = manifest.slice(0, appTagOpenEnd) + metaDataTag + manifest.slice(appTagOpenEnd);

    fs.writeFileSync(manifestPath, newManifest);
    console.log('✅ AdMob App ID added to Manifest.');
}

configureAdMob();
