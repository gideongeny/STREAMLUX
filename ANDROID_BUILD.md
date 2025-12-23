# StreamLux Android App - Build Guide

This guide will help you build and deploy the StreamLux Android app.

## Prerequisites

1. **Node.js** (v18.0.0 or higher)
2. **Java JDK** (11 or higher)
3. **Android Studio** (latest version)
4. **Android SDK** (API level 21 or higher)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the React App

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### 3. Sync with Android

```bash
npx cap sync android
```

This copies your web assets to the Android project.

### 4. Open in Android Studio

```bash
npx cap open android
```

Or manually open the `android` folder in Android Studio.

## Building the APK

### Debug APK (for testing)

1. Open Android Studio
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for the build to complete
4. The APK will be in `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for distribution)

1. **Generate a keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore streamlux-release-key.keystore -alias streamlux -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Create `android/key.properties`**:
   ```properties
   storePassword=your_store_password
   keyPassword=your_key_password
   keyAlias=streamlux
   storeFile=../streamlux-release-key.keystore
   ```

3. **Update `android/app/build.gradle`** to use the keystore (already configured if you follow the steps)

4. **Build Release APK**:
   - In Android Studio: **Build** → **Generate Signed Bundle / APK**
   - Select **APK**
   - Choose your keystore and enter passwords
   - Select **release** build variant
   - Click **Finish**

5. The APK will be in `android/app/build/outputs/apk/release/app-release.apk`

## Building AAB (Android App Bundle) for Google Play

1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Choose your keystore
4. Select **release** build variant
5. Click **Finish**

The AAB will be in `android/app/build/outputs/bundle/release/app-release.aab`

## Quick Build Commands

```bash
# Build React app and sync with Android
npm run android:build

# Build and sync only
npm run android:run

# Open Android Studio
npm run cap:open:android
```

## App Configuration

### App ID
- Package: `com.streamlux.app`
- App Name: `StreamLux`

### Permissions
The app requests the following permissions:
- Internet access (required)
- Network state (for offline detection)
- Storage (for downloads, Android 9 and below)

### Features
- Full-screen video playback
- Download support
- Offline detection
- Deep linking support

## Testing on Device

### Using USB Debugging

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. In Android Studio, click **Run** (green play button)
5. Select your device from the list

### Using Android Emulator

1. Open Android Studio
2. Go to **Tools** → **Device Manager**
3. Create a new virtual device
4. Click **Run** in Android Studio
5. Select the emulator

## Troubleshooting

### Build Errors

**Error: SDK location not found**
- Set `ANDROID_HOME` environment variable
- Or set `sdk.dir` in `android/local.properties`

**Error: Java version mismatch**
- Ensure Java JDK 11+ is installed
- Set `JAVA_HOME` environment variable

### Runtime Errors

**App crashes on launch**
- Check Android Studio Logcat for errors
- Ensure all Capacitor plugins are installed
- Run `npx cap sync android` again

**Video not playing**
- Check internet permissions in AndroidManifest.xml
- Ensure video sources allow embedding

### Sync Issues

**Changes not appearing in app**
- Run `npm run build` first
- Then run `npx cap sync android`
- Rebuild the app in Android Studio

## Publishing to Google Play Store

1. **Create a Google Play Console account** ($25 one-time fee)
2. **Create a new app** in the console
3. **Upload the AAB** file
4. **Fill in store listing**:
   - App name: StreamLux
   - Short description: Watch movies and TV shows
   - Full description: (use your README content)
   - Screenshots: Take screenshots from the app
   - App icon: Use your icon.png
5. **Set content rating** (likely "Teen" for movies/TV)
6. **Set pricing** (Free)
7. **Submit for review**

## App Updates

To update the app:

1. Update version in `package.json`
2. Update version in `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment this
   versionName "1.0.1"  // Update this
   ```
3. Build new AAB
4. Upload to Google Play Console

## Development Workflow

1. Make changes to React code
2. Test in browser: `npm start`
3. Build: `npm run build`
4. Sync: `npx cap sync android`
5. Test in Android Studio emulator or device
6. Repeat

## Notes

- The app uses Capacitor to wrap your React web app
- All your existing React code works without changes
- Native features (status bar, splash screen, keyboard) are handled automatically
- Deep linking is configured for `streamlux://` URLs
- The app supports both portrait and landscape orientations

## Support

For issues or questions:
- Check Capacitor docs: https://capacitorjs.com/docs
- Check Android Studio logs
- Review the main README.md for app features

