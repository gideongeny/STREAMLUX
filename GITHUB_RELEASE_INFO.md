# GitHub Release Information: v1.1.0

Use the following details to create your release on GitHub. This will enable the direct download link on the StreamLux website.

### 1. Basic Info
- **Tag version**: `v1.1.0`
- **Release title**: `StreamLux Android Release v1.1.0`
- **Target**: `main`

### 2. Description (Copy/Paste this)
```markdown
## StreamLux Android v1.1.0

This release enables direct APK downloads from the StreamLux website and resolves several critical build issues.

### 🚀 Key Improvements
- **Direct Link Support**: Integrated with the website's new redirect system.
- **SDK 35 Support**: Upgraded to the latest Android Target SDK.
- **Stability**: Fixed Android Gradle Plugin and resource linking conflicts.
- **Performance**: Removed outdated community plugins (AdMob, Http) for a cleaner, ad-free native experience.

### 📦 Asset to Upload
Go to this path on your computer:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

**IMPORTANT**: When you upload it to the GitHub Release, rename the asset in the web interface to:
`streamlux.apk`
```

### 3. How to Create
1. Go to: https://github.com/gideongeny/STREAMLUX/releases/new
2. Select the tag `v1.1.0` (I have already created it locally for you, you may need to push it).
3. Paste the description above.
4. Drag and drop the `.apk` file from the build folder.
5. Click **Publish Release**.
