# StreamLux Android App

StreamLux is now available as a native Android app! Watch movies, TV shows, and live sports on your Android device.

## Features

✅ **Native Android App** - Full-featured Android application  
✅ **All Web Features** - Everything from the web version works in the app  
✅ **Offline Detection** - Know when you're offline  
✅ **Download Support** - Download videos for offline viewing  
✅ **Full-Screen Video** - Immersive video playback  
✅ **Deep Linking** - Open content directly from links  
✅ **Push Notifications** - Get notified about new content (coming soon)  
✅ **Native Performance** - Optimized for Android devices  

## Installation

### From Google Play Store (Coming Soon)
The app will be available on Google Play Store soon.

### Manual Installation (APK)

1. Download the APK file
2. Enable "Install from Unknown Sources" on your Android device
3. Open the APK file
4. Follow the installation prompts

## Building from Source

See [ANDROID_BUILD.md](./ANDROID_BUILD.md) for detailed build instructions.

Quick start:
```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

## Requirements

- Android 5.0 (API level 21) or higher
- Internet connection for streaming
- 50MB free storage space

## Permissions

The app requires the following permissions:
- **Internet**: To stream videos and load content
- **Network State**: To detect connectivity
- **Storage** (Android 9 and below): To download videos

## Troubleshooting

**App won't install?**
- Check Android version (needs 5.0+)
- Enable "Install from Unknown Sources"

**Videos won't play?**
- Check your internet connection
- Try a different video source
- Clear app cache: Settings → Apps → StreamLux → Clear Cache

**App crashes?**
- Update to latest version
- Clear app data: Settings → Apps → StreamLux → Clear Data
- Reinstall the app

## Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review [ANDROID_BUILD.md](./ANDROID_BUILD.md) for build help
- Open an issue on GitHub

## Privacy

The app respects your privacy:
- No tracking
- No personal data collection
- All data stored locally on your device
- Secure connections (HTTPS)

## Updates

The app will notify you when updates are available. You can also check manually:
- Google Play Store (when published)
- GitHub Releases (for APK downloads)

---

**Enjoy streaming with StreamLux! 🎬📺**

