# Android Manifest Configuration for Premium Features

## Required Permissions

Add these permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Push Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.INTERNET" />

<!-- Offline Downloads -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- Network State -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Picture-in-Picture -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

<!-- Background Audio -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## Activity Configuration

Update the main activity in AndroidManifest.xml:

```xml
<activity
    android:name=".MainActivity"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:supportsPictureInPicture="true"
    android:exported="true">
    
    <!-- Deep Linking -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="streamlux.app" />
        <data android:scheme="streamlux" />
    </intent-filter>
    
    <!-- Main Launcher -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

## Android TV Support

Add TV launcher and leanback feature:

```xml
<!-- TV Support -->
<uses-feature android:name="android.software.leanback" android:required="false" />
<uses-feature android:name="android.hardware.touchscreen" android:required="false" />

<activity
    android:name=".MainActivity"
    android:banner="@drawable/tv_banner">
    
    <!-- TV Launcher -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
    </intent-filter>
</activity>
```

## Firebase Cloud Messaging

Add FCM service:

```xml
<service
    android:name=".FCMService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>

<!-- FCM default notification channel -->
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="@string/default_notification_channel_id" />
```

## Background Services

Add media playback service:

```xml
<service
    android:name=".MediaPlaybackService"
    android:exported="false"
    android:foregroundServiceType="mediaPlayback">
    <intent-filter>
        <action android:name="android.intent.action.MEDIA_BUTTON" />
    </intent-filter>
</service>
```

## Quick Actions (App Shortcuts)

Add shortcuts for long-press app icon:

```xml
<meta-data
    android:name="android.app.shortcuts"
    android:resource="@xml/shortcuts" />
```

Create `res/xml/shortcuts.xml`:

```xml
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
    <shortcut
        android:shortcutId="continue_watching"
        android:enabled="true"
        android:icon="@drawable/ic_play"
        android:shortcutShortLabel="@string/continue_watching"
        android:shortcutLongLabel="@string/continue_watching_long">
        <intent
            android:action="android.intent.action.VIEW"
            android:targetPackage="com.streamlux.app"
            android:targetClass="com.streamlux.app.MainActivity"
            android:data="streamlux://continue-watching" />
    </shortcut>
    
    <shortcut
        android:shortcutId="downloads"
        android:enabled="true"
        android:icon="@drawable/ic_download"
        android:shortcutShortLabel="@string/downloads"
        android:shortcutLongLabel="@string/downloads_long">
        <intent
            android:action="android.intent.action.VIEW"
            android:targetPackage="com.streamlux.app"
            android:targetClass="com.streamlux.app.MainActivity"
            android:data="streamlux://downloads" />
    </shortcut>
</shortcuts>
```

## Notification Channels (strings.xml)

Add to `res/values/strings.xml`:

```xml
<string name="default_notification_channel_id">default</string>
<string name="continue_watching">Continue Watching</string>
<string name="continue_watching_long">Resume your last watched content</string>
<string name="downloads">My Downloads</string>
<string name="downloads_long">View offline downloads</string>
```

## Build Configuration

Update `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        // ... existing config
        
        // Enable multidex for large apps
        multiDexEnabled true
        
        // Vector drawables support
        vectorDrawables.useSupportLibrary = true
    }
    
    buildTypes {
        release {
            // Enable ProGuard
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    // ... existing dependencies
    
    // ExoPlayer for native video playback
    implementation 'com.google.android.exoplayer:exoplayer:2.19.1'
    
    // Firebase Cloud Messaging
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
    
    // Glide for image loading
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    
    // Multidex
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

## Capacitor Configuration

Update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.streamlux.app',
  appName: 'StreamLux',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: false
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
```

## Next Steps

After updating the manifest:
1. Run `npx cap sync android`
2. Build APK: `cd android && ./gradlew assembleDebug`
3. Test on device/emulator

## Testing Checklist

- [ ] Push notifications received
- [ ] Downloads work and persist
- [ ] PiP mode activates
- [ ] Deep links open correctly
- [ ] TV launcher appears on Android TV
- [ ] Quick actions work from home screen
