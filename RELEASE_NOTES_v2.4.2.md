# StreamLux v2.4.2 Release Notes

## 🚀 Overview
Version 2.4.2 is a maintenance release that introduces critical bug fixes and improvements specifically tailored for the Android TV and mobile web experience.

## 🐛 Bug Fixes & Improvements

### 📺 Android TV Experience
- **Disclaimer Dialog Focus (TV Navigation):** Fixed an issue where clicking "I Agree" or "Exit" did not work when navigating with an Android TV D-Pad. The disclaimer popup now uses proper `Button` and `OutlinedButton` components that natively display focus highlights and correctly intercept center-clicks from a remote.
- **Sidebar Visibility:** Fixed a UI bug where the expanded sidebar (`SideRail`) would incorrectly display over the full-screen Onboarding, Auth, and Profile Setup screens on Android TV and large tablets.

### 📱 Mobile Web Player
- **Autoplay Black Screen Fix:** Resolved an issue where live streams and videos would get stuck on a black screen on mobile web browsers (iOS Safari, Chrome for Android) due to strict autoplay policies. Videos will now start muted by default to successfully bypass autoplay restrictions and play properly.

### 🌐 Brand Hub Interaction
- **Video Hover Fix:** The Brand Universe tiles now properly trigger background videos on mouse hover. This was fixed by resolving an invalid Tailwind CSS class and adjusting pointer-events so the overlays don't block interaction.

## ⚙️ Build Info
- **Version Code:** 34
- **Version Name:** 2.4.2
- **Artifact:** `app-release.aab` (Android App Bundle)
