# 📱 Building Release APK for Distribution

This guide will help you build a release APK that users can download and install directly, similar to MovieBox.

## 🚀 Quick Build (Recommended)

### Method 1: Using Command Line (Fastest)

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync android
   ```

3. **Build the APK using Gradle:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

   **On Windows:**
   ```bash
   cd android
   gradlew.bat assembleRelease
   ```

4. **Find your APK:**
   The APK will be located at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Method 2: Using Android Studio

1. **Open Android Studio**
2. **File** → **Open** → Select the `android` folder
3. Wait for Gradle sync to complete
4. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
5. Wait for build to complete
6. Click **locate** in the notification to find your APK
7. The APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

## 📦 Creating a Signed Release APK (For Production)

For production distribution, you should create a proper keystore:

### Step 1: Generate Keystore

```bash
cd android/app
keytool -genkey -v -keystore streamlux-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias streamlux
```

**You'll be prompted for:**
- Keystore password (remember this!)
- Key password (can be same as keystore)
- Your name, organization, etc.

**⚠️ IMPORTANT:** Save the keystore file and passwords securely! You'll need them for all future updates.

### Step 2: Configure Signing

Create `android/keystore.properties` file:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=streamlux
storeFile=app/streamlux-release-key.jks
```

### Step 3: Update build.gradle

The build.gradle is already configured to use keystore properties. Just make sure `keystore.properties` exists.

### Step 4: Build Signed APK

```bash
cd android
./gradlew assembleRelease
```

**On Windows:**
```bash
cd android
gradlew.bat assembleRelease
```

## 📥 Distributing the APK

### Option 1: Direct Download (Like MovieBox)

1. **Host the APK on your website:**
   - Upload `app-release.apk` to your web server
   - Create a download page with instructions

2. **Create a download page:**
   - See `DOWNLOAD_PAGE.md` for HTML template
   - Include installation instructions
   - Add QR code for easy mobile download

### Option 2: GitHub Releases

1. Go to your GitHub repository
2. Click **Releases** → **Create a new release**
3. Tag version (e.g., `v1.0.0`)
4. Upload the APK file
5. Users can download directly from GitHub

### Option 3: File Sharing Services

- Upload to Google Drive, Dropbox, or similar
- Share the download link
- Make sure to enable direct download links

## 🔒 Security Considerations

### For Initial Distribution (Testing):
- The current setup uses debug signing (works for testing)
- Users may see "Unknown source" warning (normal for direct APK installs)

### For Production:
- Create a proper release keystore (see Step 1 above)
- Sign all APKs with the same keystore
- Keep keystore file secure and backed up

## 📋 Installation Instructions for Users

Users need to:

1. **Enable "Install from Unknown Sources":**
   - Go to **Settings** → **Security** (or **Apps** → **Special Access**)
   - Enable **"Install unknown apps"** or **"Unknown sources"**
   - Select the browser/app you'll use to download

2. **Download the APK:**
   - Visit your download page
   - Click download link
   - Wait for download to complete

3. **Install:**
   - Open the downloaded APK file
   - Tap **Install**
   - Wait for installation
   - Tap **Open** to launch

## 🔄 Updating the App

When you release updates:

1. **Increment version:**
   - Update `versionCode` in `android/app/build.gradle` (e.g., 1 → 2)
   - Update `versionName` (e.g., "1.0" → "1.1")

2. **Build new APK:**
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleRelease
   ```

3. **Distribute:**
   - Upload new APK
   - Notify users of update
   - Users can install over existing app (no uninstall needed)

## 🐛 Troubleshooting

### "Gradle build failed"
- Make sure you're in the `android` directory
- Try: `./gradlew clean` then `./gradlew assembleRelease`

### "SDK location not found"
- Make sure `android/local.properties` exists with correct SDK path

### "Keystore file not found"
- For testing, the debug keystore will be auto-generated
- For production, create keystore first (see Step 1)

### APK too large
- The first build includes all assets
- Subsequent builds are smaller
- Consider enabling ProGuard for smaller size (advanced)

## 📊 APK Information

After building, you can check APK details:

```bash
# Install Android SDK Build Tools first, then:
aapt dump badging android/app/build/outputs/apk/release/app-release.apk
```

This shows:
- Package name
- Version code
- Version name
- Permissions
- Minimum SDK version

---

**Your APK is ready for distribution!** 🎉

