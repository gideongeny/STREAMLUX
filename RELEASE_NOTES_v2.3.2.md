# STREAMLUX Web + API v2.3.2

## Sports
- **Beautiful match cards** on Home Sports hub: full-bleed covers, stadium fallbacks, live badges.
- **Live games** from:
  - [CricHd auto-updated playlists](https://github.com/abusaeeidx/CricHd-playlists-Auto-Update-permanent) (JSON + m3u8, ~15 min refresh)
  - [streaming-ticker](https://github.com/rmeatto/streaming-ticker) pattern — ESPN public scoreboards (soccer, NBA, NFL, MLB, NHL, F1, UFC)
  - WatchFooty, SofaScore, existing gateway `/api/sports/live`
- Edge API merges CricHd channels into `/api/sports/live` with poster logos as card art.

## Live TV — Kenya (YouTube)
| Channel | Stream |
|---------|--------|
| Citizen TV | youtube.com/watch?v=Cy2Pc0X1P7w |
| NTV Kenya | youtube.com/watch?v=ZRDj5GXNezw |
| KTN News | youtube.com/watch?v=vfnHjFpn1-c |
| TV47 | youtube.com/watch?v=YkU4J25VCxE |
| K24 | youtube.com/watch?v=k8f4ZQAA5MU |
| Ramogi TV | youtube.com/watch?v=u4LWd8kYXIg |

Pinned at the top of the Live TV channel list.

## Deploy
- **Firebase Hosting:** `npm run build` then `firebase deploy --only hosting`
- **Vercel:** production deploy for `/api/*` edge routes
