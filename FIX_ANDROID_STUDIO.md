# 🔧 Fix: Green Run Button Not Showing in Android Studio

If the green run button is not showing or working in Android Studio, follow these steps:

## Step 1: Close and Reopen Project Properly

1. **Close Android Studio completely**
2. **Open Android Studio again**
3. **File** → **Open**
4. Navigate to your project folder
5. **Select the `android` folder** (NOT the root project folder)
6. Click **OK**

**Important:** You must open the `android` folder, not the root project folder!

## Step 2: Create local.properties File

Android Studio needs to know where your Android SDK is located.

1. In the `android` folder, create a file named `local.properties`
2. Add this content (replace YOUR_USERNAME with your Windows username):

```properties
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

**To find your username:**
- Press `Win + R`
- Type `%USERPROFILE%` and press Enter
- Look at the path (e.g., `C:\Users\mukht`)
- Use that username in the path

**Example:**
If your username is `mukht`, the file should contain:
```properties
sdk.dir=C\:\\Users\\mukht\\AppData\\Local\\Android\\Sdk
```

## Step 3: Sync Gradle

1. In Android Studio, click **File** → **Sync Project with Gradle Files**
2. Wait for sync to complete (check bottom status bar)
3. If you see errors, read them carefully

## Step 4: Check Build Variants

1. Click **Build** → **Select Build Variant**
2. Make sure **app** module shows:
   - **debug** (for testing)
   - **release** (for production)

## Step 5: Select a Device

The run button won't show if no device is selected!

**Option A: Use Emulator**
1. Click **Device Manager** icon (phone icon in toolbar)
2. If no emulator exists, click **Create Device**
3. Choose a device (e.g., Pixel 5)
4. Download a system image (API 33 or higher)
5. Click **Finish**
6. Click the **Play** button next to the emulator to start it
7. Wait for emulator to fully boot

**Option B: Use Real Phone**
1. Enable **Developer Options** on your Android phone
2. Enable **USB Debugging**
3. Connect phone via USB
4. Allow USB debugging when prompted

## Step 6: Verify Project Structure

Make sure Android Studio recognizes the project:

1. Look at the left panel (Project view)
2. You should see:
   - `app` (module)
   - `capacitor-cordova-android-plugins` (module)
   - `Gradle Scripts` folder
3. If you see "Gradle project sync failed", see troubleshooting below

## Step 7: Try Running Again

1. Make sure a device/emulator is selected (top toolbar, device dropdown)
2. The green play button should now be visible
3. Click it to run!

## Troubleshooting

### "SDK location not found"

**Fix:**
1. Create `android/local.properties` file
2. Add: `sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk`
3. Replace YOUR_USERNAME with your actual username
4. Sync Gradle again

### "Gradle sync failed"

**Fix:**
1. Click **File** → **Invalidate Caches / Restart**
2. Select **Invalidate and Restart**
3. Wait for Android Studio to restart
4. Sync Gradle again: **File** → **Sync Project with Gradle Files**

### "No devices found"

**Fix:**
- Start an emulator from Device Manager
- Or connect a real device with USB debugging enabled
- The device must appear in the device dropdown (top toolbar)

### "Build failed" or errors

**Fix:**
1. Click **Build** → **Clean Project**
2. Wait for clean to complete
3. Click **Build** → **Rebuild Project**
4. Check the **Build** tab at the bottom for specific errors

### Project not recognized

**Fix:**
1. Make sure you opened the `android` folder (not root project)
2. Close Android Studio
3. Delete `.idea` folder in `android` directory (if exists)
4. Reopen the `android` folder in Android Studio
5. Let it re-index

### Still not working?

**Last resort:**
1. Close Android Studio
2. Delete `android/.idea` folder (if exists)
3. Delete `android/.gradle` folder (if exists)
4. Delete `android/app/build` folder (if exists)
5. Reopen `android` folder in Android Studio
6. Let it sync and re-index

## Quick Checklist

Before clicking run, make sure:
- ✅ Opened the `android` folder (not root project)
- ✅ `local.properties` file exists with correct SDK path
- ✅ Gradle sync completed successfully
- ✅ A device/emulator is selected and running
- ✅ Build variant is set to "debug"
- ✅ No red error messages in Build output

## Still Need Help?

1. Check the **Build** tab at the bottom for errors
2. Check the **Logcat** tab for runtime errors
3. Check the **Gradle** tab for sync errors
4. Take a screenshot of any error messages

---

**The key is: Open the `android` folder, not the root project folder!**

