# 🚀 How to Run StreamLux Android App in Android Studio

Follow these steps to run the app directly in Android Studio using the green play button.

## Prerequisites

1. **Android Studio** installed (latest version recommended)
   - Download: https://developer.android.com/studio
2. **Java JDK 11 or higher** installed
3. **Android SDK** installed (via Android Studio SDK Manager)

## Step-by-Step Instructions

### 1. Build Your React App First

Before opening in Android Studio, always build your React app:

```bash
npm run build
```

This creates the optimized production build that Capacitor will use.

### 2. Sync with Android

```bash
npx cap sync android
```

This copies your web assets to the Android project.

### 3. Open in Android Studio

**Option A: Using Command Line**
```bash
npx cap open android
```

**Option B: Manual**
1. Open Android Studio
2. Click **File** → **Open**
3. Navigate to your project folder
4. Select the `android` folder
5. Click **OK**

### 4. Wait for Gradle Sync

Android Studio will automatically:
- Download Gradle (if needed)
- Sync project files
- Download dependencies
- Index files

**This may take 5-10 minutes the first time.**

### 5. Set Up Android SDK Location (if needed)

If you see an error about SDK location:

1. Go to **File** → **Project Structure** (or press `Ctrl+Alt+Shift+S`)
2. Click **SDK Location** on the left
3. Set **Android SDK location** to your SDK path (usually `C:\Users\YourName\AppData\Local\Android\Sdk` on Windows)
4. Click **Apply** → **OK**

Or create `android/local.properties` manually:
```properties
sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

### 6. Create/Select a Device

**Option A: Use Emulator**
1. Click **Device Manager** icon (phone icon) in toolbar
2. Click **Create Device**
3. Select a device (e.g., Pixel 5)
4. Select a system image (API 33 or higher recommended)
5. Click **Finish**
6. Wait for emulator to download and start

**Option B: Use Real Device**
1. Enable **Developer Options** on your Android phone:
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
2. Enable **USB Debugging**:
   - Go to **Settings** → **Developer Options**
   - Enable **USB Debugging**
3. Connect phone via USB
4. Allow USB debugging on phone when prompted

### 7. Select Your Device

In Android Studio toolbar, you'll see a device dropdown. Select:
- Your emulator (if using emulator)
- Your connected phone (if using real device)

### 8. Run the App! 🎉

Click the **green play button** (▶️) in the toolbar, or press `Shift+F10`.

The app will:
1. Build the APK
2. Install on your device/emulator
3. Launch automatically

## Troubleshooting

### "SDK location not found"

**Solution:**
1. Create `android/local.properties` file
2. Add:
   ```properties
   sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
   ```
   (Replace `YourName` with your Windows username)

### "Gradle sync failed"

**Solution:**
1. Click **File** → **Invalidate Caches / Restart**
2. Select **Invalidate and Restart**
3. Wait for Android Studio to restart
4. Try syncing again

### "Build failed" or "Gradle build errors"

**Solution:**
1. Click **Build** → **Clean Project**
2. Wait for clean to complete
3. Click **Build** → **Rebuild Project**
4. Try running again

### "No devices found"

**Solution:**
- **For Emulator:** Make sure emulator is running (start from Device Manager)
- **For Real Device:** 
  - Check USB connection
  - Enable USB Debugging
  - Install USB drivers for your phone (if needed)

### "App crashes on launch"

**Solution:**
1. Check **Logcat** in Android Studio (bottom panel)
2. Look for red error messages
3. Common fixes:
   - Run `npm run build` again
   - Run `npx cap sync android` again
   - Clean and rebuild project

### "Changes not appearing"

**Solution:**
1. Always run `npm run build` first
2. Then run `npx cap sync android`
3. In Android Studio: **Build** → **Clean Project**
4. Then **Build** → **Rebuild Project**
5. Run again

## Quick Workflow

Every time you make code changes:

```bash
# 1. Build React app
npm run build

# 2. Sync with Android
npx cap sync android

# 3. In Android Studio: Click Run (green play button)
```

## Tips

✅ **Always build React app first** before syncing  
✅ **Use Logcat** to see app logs and debug issues  
✅ **Keep Android Studio updated** for best compatibility  
✅ **Use emulator for testing** - faster than real device  
✅ **Check Gradle sync** - make sure it completes successfully  

## What Happens When You Click Run

1. **Gradle Build** - Compiles your Android code
2. **APK Generation** - Creates the installable app file
3. **Installation** - Installs APK on device/emulator
4. **Launch** - Opens the app automatically

## Success Indicators

You'll know it worked when:
- ✅ Build completes without errors
- ✅ "BUILD SUCCESSFUL" appears in Build output
- ✅ App installs on device
- ✅ App launches and shows your StreamLux interface

---

**That's it! Your app should now run when you click the green play button! 🎉**

If you encounter any issues, check the Logcat window in Android Studio for error messages.

