# Android TV Configuration Guide

## Overview

StreamLux is optimized for Android TV with leanback UI, D-pad navigation, and voice search integration.

## AndroidManifest.xml Configuration

Add the following to your `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Android TV Support -->
<uses-feature
    android:name="android.software.leanback"
    android:required="false" />

<uses-feature
    android:name="android.hardware.touchscreen"
    android:required="false" />

<application
    android:banner="@drawable/tv_banner"
    android:theme="@style/AppTheme">
    
    <activity
        android:name=".MainActivity"
        android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
        android:label="@string/app_name"
        android:theme="@style/AppTheme.NoActionBarLaunch"
        android:launchMode="singleTask"
        android:screenOrientation="landscape">
        
        <!-- TV Launcher Intent -->
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
        </intent-filter>
        
        <!-- Mobile Launcher Intent -->
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

## TV Banner Image

Create a TV banner image at `android/app/src/main/res/drawable/tv_banner.png`:
- **Size**: 320x180 pixels
- **Format**: PNG with transparency
- **Content**: StreamLux logo with tagline

## D-Pad Navigation

The app automatically supports D-pad navigation. Key mappings:

- **Arrow Keys**: Navigate between elements
- **Enter/Select**: Activate focused element
- **Back**: Go back/exit
- **Menu**: Open options menu

## Voice Search Integration

Add to `AndroidManifest.xml`:

```xml
<activity android:name=".MainActivity">
    <!-- Voice Search -->
    <intent-filter>
        <action android:name="android.intent.action.SEARCH" />
    </intent-filter>
    
    <meta-data
        android:name="android.app.searchable"
        android:resource="@xml/searchable" />
</activity>
```

Create `res/xml/searchable.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<searchable xmlns:android="http://schemas.android.com/apk/res/android"
    android:label="@string/app_name"
    android:hint="@string/search_hint"
    android:voiceSearchMode="showVoiceSearchButton|launchRecognizer" />
```

## Recommendations Row

Add to `AndroidManifest.xml`:

```xml
<service
    android:name=".RecommendationService"
    android:enabled="true" />
```

## Testing on Android TV

### Using Android TV Emulator:
1. Open Android Studio
2. AVD Manager → Create Virtual Device
3. Select TV category
4. Choose Android TV (1080p)
5. Run app on TV emulator

### Using Physical Android TV:
1. Enable Developer Options on TV
2. Enable USB Debugging
3. Connect via ADB: `adb connect <TV_IP>:5555`
4. Deploy: `./gradlew installDebug`

## TV-Specific UI Considerations

### Focus Management:
- All interactive elements must be focusable
- Add `android:focusable="true"` to buttons
- Use `android:nextFocusDown`, `android:nextFocusUp`, etc.

### Text Size:
- Minimum text size: 16sp
- Recommended: 18-24sp for body text
- Titles: 32-48sp

### Touch vs D-Pad:
- Test all interactions with D-pad
- Ensure hover states are visible
- Add visual focus indicators

## Leanback Library (Optional)

For advanced TV UI, add Leanback library:

```gradle
dependencies {
    implementation 'androidx.leanback:leanback:1.0.0'
}
```

## Quick Actions for TV

Add to `res/values/strings.xml`:

```xml
<string name="search_hint">Search movies and TV shows</string>
<string name="app_name">StreamLux</string>
```

## Performance Optimization for TV

- Preload content for smooth scrolling
- Use hardware acceleration
- Optimize images for 1080p/4K
- Implement lazy loading

## Testing Checklist

- [ ] App appears in TV launcher
- [ ] D-pad navigation works
- [ ] Voice search functional
- [ ] All buttons focusable
- [ ] Text readable from 10 feet
- [ ] Smooth scrolling
- [ ] Video playback works
- [ ] Remote control responsive
