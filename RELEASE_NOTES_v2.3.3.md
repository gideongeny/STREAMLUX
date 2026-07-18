# STREAMLUX v2.3.3 — Web Release

## TMDB (20k DAU / free tier)
- Rotated **API key** and **read access token** on edge gateway.
- Cache TTL increased: trending 2h, details 7d, discover 90m, config/genres 7d.
- In-memory cache pool expanded; stale responses served on HTTP 429.
- **Always use** `/api/tmdb?endpoint=...` — never call TMDB from the client.

## Kenya Live TV (YouTube fix)
- Black-screen fix: `youtube-nocookie` embed, `mute=1` for autoplay, Capacitor-safe `allow` list.
- Dedicated `LiveTVYouTubePlayer` with reload + **Open in YouTube** (Browser plugin on app).
- Channels: Citizen, NTV, KTN, TV47, K24, Ramogi — sorted first under **Kenya Live (YouTube)**.

## Deploy checklist
1. `npm run build`
2. `firebase deploy --only hosting`
3. Set Vercel env: `TMDB_API_KEY`, `TMDB_BEARER_TOKEN`
4. `firebase deploy --only functions:gateway` (when billing allows)

**Live site:** https://streamlux-67a84.web.app
