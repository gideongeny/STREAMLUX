# StreamLux v2.4.5 Release Notes

## 🚀 Overview
Version 2.4.5 introduces a highly reliable native fallback for Android TV users to ensure that embedded iframe video players can be clicked using the TV remote.

## 🐛 Bug Fixes & Improvements

### 📺 Android TV Experience
- **Native D-Pad Click Translation:** Some heavily nested or cross-origin video embeds block our auto-play JavaScript due to browser security restrictions. To solve this completely, we have added native key event interception for Android TV. When you press the "Select" (Center D-pad) button while hovering over the video player, the app now translates that remote click into a simulated, physical screen tap precisely in the center of the screen. This bypasses all web security restrictions and physically clicks the play button inside any iframe embed!

## ⚙️ Build Info
- **Version Code:** 37
- **Version Name:** 2.4.5
- **Artifacts:** `app-release.aab` and `app-release.apk`
