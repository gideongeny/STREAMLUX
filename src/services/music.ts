import axios from '../shared/axios';
import { Capacitor } from '@capacitor/core';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  album?: string;
  streamUrl?: string;
  source: 'saavn' | 'youtube';
}

// normalize saavn song from multiple API response shapes
const mapSaavnSong = (item: any): MusicTrack => {
  // 1. YouTube API Structure (Explicitly marked as 'youtube' or having YouTube snippet)
  if (item.source === 'youtube' || item.kind?.includes('youtube') || item.snippet) {
    const videoId = item.id?.videoId || item.id || String(Math.random());
    return {
      id: typeof videoId === 'string' ? videoId : String(videoId),
      title: item.snippet?.title || item.title || 'Unknown',
      artist: item.snippet?.channelTitle || item.artist || 'Official Video',
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      streamUrl: undefined,
      source: 'youtube', 
    };
  }

  // 2. Saavn API Structure (Normalized JioSaavn metadata)
  return {
    id: item.id || String(Math.random()),
    title: item.name || item.title || 'Unknown',
    artist:
      (Array.isArray(item.artists?.primary)
        ? item.artists.primary.map((a: any) => a.name).join(', ')
        : item.primaryArtists || item.artist || 'Independent Artist'),
    thumbnail:
      item.image?.[2]?.link ||
      item.image?.[2]?.url ||
      item.image?.[1]?.link ||
      item.image?.[1]?.url ||
      (typeof item.image === 'string' ? item.image : '') ||
      item.thumbnail ||
      '',
    album: item.album?.name || (typeof item.album === 'string' ? item.album : undefined),
    duration: item.duration ? String(item.duration) : undefined,
    streamUrl:
      item.downloadUrl?.[4]?.link ||
      item.downloadUrl?.[4]?.url ||
      item.downloadUrl?.[3]?.link ||
      item.downloadUrl?.[3]?.url ||
      item.url ||
      undefined,
    source: 'saavn',
  };
};

// Extract array of songs from any Saavn or YouTube response shape
const extractSongs = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  // YouTube endpoints: data.items
  if (data.items) return data.items;
  
  // modules endpoint: data.trending.songs
  if (data.trending?.songs) return data.trending.songs;
  if (data.songs?.data) return data.songs.data; // search
  if (data.songs?.results) return data.songs.results;
  if (data.songs) return data.songs;
  if (data.results) return data.results;
  if (data.data) return extractSongs(data.data); // recurse one level
  return [];
};

export const musicService = {
  getTrending: async (): Promise<MusicTrack[]> => {
    // ── Primary: Firebase gateway (same path as web) ──────────────────
    try {
      const response = await axios.get('/music/trending');
      const raw = response.data;
      const songs = extractSongs(raw);
      if (songs.length > 0) {
        console.log(`[Music] Gateway returned ${songs.length} trending tracks`);
        return songs.slice(0, 30).map(mapSaavnSong);
      }
    } catch (e) {
      console.warn('[Music] Gateway trending failed:', e);
    }

    // ── Fallback: direct Saavn API (native only) ──────────────────────
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('[Music] Trying saavn.dev direct...');
        const res = await fetch(
          'https://saavn.dev/api/modules?lang=hindi,english&page=1'
        );
        const json = await res.json();
        const songs = extractSongs(json?.data || json);
        if (songs.length > 0) {
          return songs.slice(0, 30).map(mapSaavnSong);
        }
        // last resort: search for global hits
        const searchRes = await fetch(
          'https://saavn.dev/api/search/songs?query=top+hits+2024&limit=30'
        );
        const searchJson = await searchRes.json();
        const searchSongs = extractSongs(searchJson?.data || searchJson);
        return searchSongs.slice(0, 30).map(mapSaavnSong);
      } catch (e2) {
        console.error('[Music] saavn.dev fallback failed:', e2);
      }
    }

    return [];
  },

  search: async (query: string): Promise<MusicTrack[]> => {
    // ── Primary: Firebase gateway ─────────────────────────────────────
    try {
      const response = await axios.get('/music/search', { params: { q: query } });
      const raw = response.data;
      const songs = extractSongs(raw);
      if (songs.length > 0) {
        console.log(`[Music] Gateway search returned ${songs.length} tracks`);
        return songs.map(mapSaavnSong);
      }
    } catch (e) {
      console.warn('[Music] Gateway search failed:', e);
    }

    // ── Fallback: direct Saavn (native only) ──────────────────────────
    if (Capacitor.isNativePlatform()) {
      try {
        const res = await fetch(
          `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=30`
        );
        const json = await res.json();
        const songs = extractSongs(json?.data || json);
        return songs.map(mapSaavnSong);
      } catch (e2) {
        console.error('[Music] saavn.dev search fallback failed:', e2);
      }
    }

    return [];
  },
};
