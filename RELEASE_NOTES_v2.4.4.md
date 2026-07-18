# StreamLux v2.4.4 Release Notes

## 🚀 Overview
Version 2.4.4 includes an important fix for Android TV users to ensure that embedded videos autoplay correctly without requiring a D-pad click.

## 🐛 Bug Fixes & Improvements

### 📺 Android TV Experience
- **Auto-Play Embedded Videos:** Implemented an auto-play JavaScript injection that runs after the page loads. It repeatedly scans for play buttons and video elements in both the main page and any same-origin iframes, and automatically clicks/plays them. This ensures that embedded videos start playing automatically on Android TV without the user needing to manually click the play button inside the iframe.
- **WebView D-pad Focus:** Made the WebView focusable and requested focus so that D-pad events correctly reach the WebView.

## ⚙️ Build Info
- **Version Code:** 36
- **Version Name:** 2.4.4
- **Artifact:** `app-release.aab` (Android App Bundle)
