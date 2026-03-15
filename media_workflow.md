# StreamLux Media Workflow & Source Mapping

This document summarizes how StreamLux maps TMDB/IMDb IDs to external video streaming sources and constructs the respective iframe URLs.

## 🏗️ Architecture Overview

1.  **`FilmWatch.tsx`**: The main orchestration component. It extracts metadata (ID, title, season, episode) and calls the `ResolverService`.
2.  **`resolver.ts`**: The core logic engine. It uses constants and dynamic parameters to generate a prioritized list of `ResolvedSource` objects.
3.  **`constants.ts`**: Defnies base URLs for major embedding providers.
4.  **`StreamLuxPlayer.tsx`**: The rendering layer. It receives the sources and determines whether to use a `<video>` tag (for direct links) or an `<iframe>` (for embeds).

---

## 🗺️ TMDB to Source Mapping & URL Construction

The `ResolverService` in `src/services/resolver.ts` is responsible for building the URLs. It primarily uses the **TMDB ID** for mapping.

### 🎥 Movies
URLs are typically constructed by appending the TMDB ID as a path parameter or a query string.

| Provider | URL Template |
| :--- | :--- |
| **VidSrc.me** | `https://vidsrc.me/embed/movie?tmdb=${tmdbId}` |
| **VidSrc.to** | `https://vidsrc.to/embed/movie/${tmdbId}` |
| **VidLink** | `https://vidlink.pro/embed/movie/${tmdbId}` |
| **Embed.su** | `https://embed.su/embed/movie/${tmdbId}` |
| **AutoEmbed** | `https://autoembed.cc/movie/tmdb/${tmdbId}` |
| **SmashyStream** | `https://embed.smashystream.com/playerjsMovie.php?tmdb=${tmdbId}` |

### 📺 TV Shows
TV Show mapping adds `${season}` and `${episode}` parameters to the structure.

| Provider | URL Template |
| :--- | :--- |
| **VidSrc.me** | `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}` |
| **VidSrc.to** | `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}` |
| **VidLink** | `https://vidlink.pro/embed/tv/${tmdbId}/${s}/${e}` |
| **Embed.su** | `https://embed.su/embed/tv/${tmdbId}/${s}/${e}` |
| **AutoEmbed** | `https://autoembed.cc/tv/tmdb/${tmdbId}/${s}/${e}` |
| **SmashyStream** | `https://embed.smashystream.com/playerjs.php?tmdb=${tmdbId}&season=${s}&episode=${e}` |

---

## 🛠️ Specialized Mapping Logic

### 1. YouTube Interception
If an ID is detected as a YouTube string (non-numeric, >10 chars), the resolver skips embeds and maps directly to:
`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`

### 2. Backend Scrapers
The service also queries a backend at `/api/scrapers/resolve` which returns **direct video URLs** from providers like:
- **FZMovies**
- **NetNaija**
- **O2TVSeries**
These are identified as `type: "direct"` and are used for the "Elite Download" feature.

### 3. Smart Prioritization
StreamLux uses a "Health Check" system (`pingSource`) and community success rates (tracked in Firestore) to reorder sources. The healthiest and most successful source is always moved to the top of the list for the user.

---

## 🚀 Supporting "Download for Offline"

To implement Download for Offline:
1.  **Direct Sources**: Use the `type: "direct"` URLs retrieved from scrapers or high-end resolvers.
2.  **Iframe to Stream**: For embeds, the system currently uses the `downloadService.downloadSource` method which likely handles proxying or refers to a backend extraction engine to pull the raw stream from the provided iframe URL.
