# StreamLux v2.4.3 Release Notes

## 🚀 Overview
Version 2.4.3 is a hotfix release resolving critical interaction issues specifically impacting Android TV users in the video player screen.

## 🐛 Bug Fixes & Improvements

### 📺 Android TV Experience
- **Video Player Focus Fix (Android TV D-pad trap):** Fixed a major issue where users were unable to click the "Play" button or the "Back" button within the video player screen on Android TV. Previously, the full-screen transparent overlay responsible for toggling the UI controls was stealing the D-pad focus, trapping the user. This has been resolved by switching to mobile-specific tap gestures, ensuring the D-pad seamlessly focuses on the `WebView` play buttons and the navigation Back button without interference.

## ⚙️ Build Info
- **Version Code:** 35
- **Version Name:** 2.4.3
- **Artifact:** `app-release.aab` (Android App Bundle)
