const fs = require('fs');
const path = require('path');

const ANDROID_ROOT = path.join(__dirname, '../android/app/src/main');
const RES_DIR = path.join(ANDROID_ROOT, 'res');

// Helper to ensure directory existence
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

// Helper to write file
function writeFile(relativePath, content) {
    const filePath = path.join(RES_DIR, relativePath);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content.trim());
    console.log(`Created file: ${filePath}`);
}

async function installResources() {
    console.log('🚀 Starting Android Resource Installation...');

    if (!fs.existsSync(ANDROID_ROOT)) {
        console.error('❌ Android project not found. Make sure you have run "npx cap add android"');
        return;
    }

    // 1. Create Widget Provider XML
    writeFile('xml/continue_watching_widget.xml', `
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_continue_watching"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:previewImage="@drawable/ic_launcher" />
`);

    // 2. Create Widget Layout
    writeFile('layout/widget_continue_watching.xml', `
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="8dp"
    android:background="@drawable/widget_background">
    
    <TextView
        android:id="@+id/widget_title"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Continue Watching"
        android:textSize="16sp"
        android:textColor="#FFFFFF"
        android:textStyle="bold"
        android:paddingBottom="8dp" />
    
    <LinearLayout
        android:id="@+id/widget_items"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal" />
</LinearLayout>
`);

    // 3. Create Widget Background
    writeFile('drawable/widget_background.xml', `
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#1a1a1a" />
    <corners android:radius="16dp" />
    <stroke
        android:width="1dp"
        android:color="#333333" />
</shape>
`);

    // 4. Update AndroidManifest.xml
    const manifestPath = path.join(ANDROID_ROOT, 'AndroidManifest.xml');
    console.log(`Updating Manifest: ${manifestPath}`);

    let manifest = fs.readFileSync(manifestPath, 'utf8');
    let modified = false;

    // A. Add Permissions
    const permissions = [
        '<uses-permission android:name="android.permission.INTERNET" />',
        '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />',
        '<uses-permission android:name="android.permission.WAKE_LOCK" />',
        '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
        '<uses-permission android:name="android.permission.USE_BIOMETRIC" />',
        '<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />',
    ];

    // Find location to insert permissions (after opening manifest tag)
    if (!manifest.includes('ACCESS_NETWORK_STATE')) {
        const manifestTagEnd = manifest.indexOf('>') + 1;
        const before = manifest.substring(0, manifestTagEnd);
        const after = manifest.substring(manifestTagEnd);
        manifest = before + '\n    ' + permissions.join('\n    ') + after;
        modified = true;
        console.log('✅ Added permissions');
    }

    // B. Configure Activity (PiP & LaunchMode)
    if (!manifest.includes('pictureInPicture')) {
        manifest = manifest.replace(
            /android:configChanges="([^"]+)"/,
            'android:configChanges="$1|pictureInPicture|smallestScreenSize"'
        );
        manifest = manifest.replace(
            '<activity',
            '<activity android:supportsPictureInPicture="true" android:launchMode="singleTask"'
        );
        modified = true;
        console.log('✅ Configured Activity for PiP');
    }

    // C. Add Widget Receiver
    if (!manifest.includes('ContinueWatchingWidget')) {
        const appTagEnd = manifest.lastIndexOf('</application>');
        const receiver = `
        <receiver android:name=".ContinueWatchingWidget" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/continue_watching_widget" />
        </receiver>
        `;
        manifest = manifest.substring(0, appTagEnd) + receiver + manifest.substring(appTagEnd);
        modified = true;
        console.log('✅ Added Widget Receiver');
    }

    // D. Add TV Leanback Feature (Optional, maybe check if user wants it enabled by default)
    // We'll add the feature declaration but set required=false for hybrid app
    if (!manifest.includes('android.software.leanback')) {
        const afterPermissions = manifest.indexOf('<application');
        const leanback = `
    <uses-feature android:name="android.software.leanback" android:required="false" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
        `;
        manifest = manifest.substring(0, afterPermissions) + leanback + manifest.substring(afterPermissions);
        modified = true;
        console.log('✅ Added Android TV features');
    }

    // E. Add Deep Linking Intent
    if (!manifest.includes('android:scheme="streamlux"')) {
        const activtyEnd = manifest.indexOf('</activity>');
        const deepLink = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="streamlux" />
            </intent-filter>
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="streamlux.app" />
            </intent-filter>
        `;
        manifest = manifest.substring(0, activtyEnd) + deepLink + manifest.substring(activtyEnd);
        modified = true;
        console.log('✅ Added Deep Links');
    }

    if (modified) {
        fs.writeFileSync(manifestPath, manifest);
        console.log('💾 Validated and saved AndroidManifest.xml');
    } else {
        console.log('✨ AndroidManifest.xml already configured');
    }

    console.log('🎉 Android configuration complete!');
}

installResources().catch(console.error);
