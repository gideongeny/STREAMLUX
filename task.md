# Feature Fixes Task

## 1. Fix Google Login (stuck on loading screen)
- [x] Add `getRedirectResult()` call in App.tsx/auth context to handle redirect result on native
- [x] Add timeout/error display so loading doesn't spin forever
- [x] Set redirect pending flag in localStorage before redirecting

## 2. Fix Sidebar Mobile Scroll (last item unreachable)
- [x] Add `overflow-y-auto` + `pb-20` to mobile sidebar container

## 3. Fix Must-Watch Shorts HOT (empty section)
- [x] Update `fetchYouTubeVideos` to support `videoDuration="short"`
- [x] Update `getYouTubeShorts` service to utilize short duration parameter
- [x] Relax filtering logic to ensure section is populated

## 4. Make Playback & Experience Settings Functional
- [x] Auto-Play: Wire setting to VideoPlayer (`StreamLuxPlayer`)
- [x] Background Audio: Wire `backgroundAudioService` to player and lifecycle
- [x] Update backgroundAudioService to support HTMLMediaElement

## 5. Push Notifications (Netflix-style trending alerts)
- [x] Create `trendingNotificationService` to check TMDB trending daily
- [x] Wire existing `pushNotificationService` to schedule local notifications
- [x] Initialize trend checking and push service in App.tsx

## 6. Profile Page Themes — Make Functional
- [x] Refactor theme logic into a centralized `themeService`
- [x] Wire theme buttons in Profile to service
- [x] Add localStorage persistence and auto-initialization in App.tsx

## 7. Build & Deploy
- [ ] Run `npm run build`
- [ ] `firebase deploy --only hosting`
