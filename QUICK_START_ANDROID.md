# ⚡ Quick Start - Run App in Android Studio

## 3 Simple Steps to Run Your App

### Step 1: Build React App
```bash
npm run build
```

### Step 2: Sync with Android
```bash
npx cap sync android
```

### Step 3: Open & Run in Android Studio
```bash
npx cap open android
```

Then in Android Studio:
1. Wait for Gradle sync to complete (first time: 5-10 minutes)
2. Select a device (emulator or connected phone)
3. Click the **green play button** ▶️

**That's it! Your app will build and run!**

---

## First Time Setup

### If Android Studio asks for SDK location:

Create `android/local.properties` file:
```properties
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```
(Replace `YOUR_USERNAME` with your Windows username)

### If you see "No devices":

**Option 1: Create Emulator**
1. Click **Device Manager** icon (phone icon in toolbar)
2. Click **Create Device**
3. Choose **Pixel 5** or any device
4. Download a system image (API 33+)
5. Click **Finish**

**Option 2: Use Real Phone**
1. Enable **Developer Options** on phone
2. Enable **USB Debugging**
3. Connect via USB
4. Allow USB debugging when prompted

---

## Troubleshooting

**Build fails?**
- Run: `npm run build` first
- Then: `npx cap sync android`
- In Android Studio: **Build** → **Clean Project** → **Rebuild Project**

**App crashes?**
- Check **Logcat** (bottom panel in Android Studio)
- Run `npx cap sync android` again

**Changes not showing?**
- Always run `npm run build` before syncing
- Then `npx cap sync android`
- Clean and rebuild in Android Studio

---

## That's All! 🎉

Your app is ready to run. Just click the green play button!

For detailed instructions, see [RUN_ANDROID_APP.md](./RUN_ANDROID_APP.md)

