# Android App Icon Fix - Manual Steps

## Problem
The Android app is showing default Capacitor/React icons instead of the StreamLux logo.

## Why Automatic Generation Failed
The `@capacitor/assets` package installation failed due to Sharp image processing library dependency issues.

## Solution: Manual Icon Generation

### Option 1: Using Android Studio (Recommended - Easiest)

1. **Open Android Studio**
   - Navigate to `android` folder in your project
   - Open it with Android Studio

2. **Generate Icons**
   - In Project view, right-click on `app`
   - Select **New** → **Image Asset**
   - Choose "Launcher Icons (Adaptive and Legacy)"

3. **Configure Icon**
   - Path: Select `public/icon.png` or `public/logo.png`
   - Click "Next" → "Finish"
   - Android Studio will auto-generate all icon sizes

4. **Rebuild APK**
   ```bash
   cd android
   gradlew.bat assembleRelease
   ```

### Option 2: Online Icon Generator

1. **Visit Icon Generator**
   - Go to https://icon.kitchen or https://romannurik.github.io/AndroidAssetStudio/

2. **Upload Logo**
   - Upload `public/icon.png`
   - Customize if needed
   - Download the generated ZIP

3. **Extract Resources**
   - Extract all files to `android/app/src/main/res/`
   - Overwrite existing icons

4. **Sync and Rebuild**
   ```bash
   npx cap sync android
   cd android
   gradlew.bat assembleRelease
   ```

### Option 3: Manual Copy (Advanced)

Copy your logo manually to all mipmap folders:
- `android/app/src/main/res/mipmap-hdpi/`
- `android/app/src/main/res/mipmap-mdpi/`
- `android/app/src/main/res/mipmap-xhdpi/`
- `android/app/src/main/res/mipmap-xxhdpi/`
- `android/app/src/main/res/mipmap-xxxhdpi/`

Resize to appropriate dimensions:
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

## After Fixing

1. Run: `npx cap sync android`
2. Rebuild APK: `cd android && gradlew.bat assembleRelease`
3. Install new APK on device
4. StreamLux logo should now appear!

## Note
Your StreamLux logo is already available at:
- `public/icon.png`
- `public/logo.png`

It just needs to be converted to Android's multiple resolution formats.
