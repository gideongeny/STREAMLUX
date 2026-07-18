import { postInnertube, pipedSearch, pipedStreams } from '../shared/musicGateway';
import { pipedService } from './piped';

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

// Extract and parse InnerTube response structure safely
const extractInnerTubeSongs = (data: any): MusicTrack[] => {
  if (!data) return [];
  try {
    let allItems: any[] = [];
    
    const findItems = (obj: any) => {
      if (!obj) return;
      if (Array.isArray(obj)) {
        obj.forEach(findItems);
      } else if (typeof obj === 'object') {
        if (obj.musicResponsiveListItemRenderer) {
          allItems.push(obj.musicResponsiveListItemRenderer);
        }
        if (obj.videoRenderer?.videoId) {
          allItems.push({ _videoRenderer: obj.videoRenderer });
        }
        if (obj.playlistVideoRenderer?.videoId) {
          allItems.push({ _playlistVideoRenderer: obj.playlistVideoRenderer });
        }
        Object.values(obj).forEach(findItems);
      }
    };
    
    findItems(data.contents || data);

    const mapped = allItems.map((data: any) => {
      const vr = data._videoRenderer;
      const pvr = data._playlistVideoRenderer;
      if (vr?.videoId) {
        return {
          id: vr.videoId,
          title: vr.title?.runs?.[0]?.text || vr.title?.simpleText || 'Unknown Title',
          artist: vr.ownerText?.runs?.[0]?.text || vr.shortBylineText?.runs?.[0]?.text || 'YouTube',
          thumbnail: vr.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
          source: 'youtube' as const,
        } as MusicTrack;
      }
      if (pvr?.videoId) {
        return {
          id: pvr.videoId,
          title: pvr.title?.runs?.[0]?.text || pvr.title?.simpleText || 'Unknown Title',
          artist: pvr.shortBylineText?.runs?.[0]?.text || 'YouTube',
          thumbnail: pvr.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${pvr.videoId}/hqdefault.jpg`,
          source: 'youtube' as const,
        } as MusicTrack;
      }

      const videoId = data.playlistItemData?.videoId || data.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId;
      if (!videoId) return null;
      
      const columns = data.flexColumns || [];
      const titleObj = columns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0];
      
      const runs = columns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
      const artistText = runs.map((r: any) => r.text).filter((t: string) => t !== ' • ').join('') || 'Unknown Artist';
      
      const thumbnails = data.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
      const thumbnail = thumbnails[thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      return {
        id: videoId,
        title: titleObj?.text || 'Unknown Title',
        artist: artistText,
        thumbnail: thumbnail,
        source: 'youtube'
      } as MusicTrack;
    }).filter(Boolean);

    // Deduplicate by ID
    const unique = Array.from(new Map(mapped.map(item => [item.id, item])).values());
    return unique as MusicTrack[];
  } catch (e) {
    console.error('[Music] Failed to parse InnerTube response', e);
    return [];
  }
};

const mergeUniqueTracks = (lists: MusicTrack[][]): MusicTrack[] => {
  const map = new Map<string, MusicTrack>();
  for (const list of lists) {
    for (const t of list) {
      if (!map.has(t.id)) map.set(t.id, t);
    }
  }
  return Array.from(map.values());
};

const mapPipedToTracks = (pipedVideos: { id: string; title: string; channelTitle?: string; thumbnail: string }[]): MusicTrack[] =>
  pipedVideos.map((v) => ({
    id: v.id,
    title: v.title,
    artist: v.channelTitle || 'Unknown Artist',
    thumbnail: v.thumbnail,
    source: 'youtube' as const,
  }));

/** Yung-Music style: InnerTube browse on music.youtube.com (no API quota). */
const fetchInnertubeBrowse = async (browseId: string): Promise<MusicTrack[]> => {
  try {
    const data = await postInnertube({
      endpoint: '/browse',
      browseId,
      client: 'WEB_REMIX',
    });
    return extractInnerTubeSongs(data);
  } catch (e) {
    console.warn(`[Music] InnerTube browse ${browseId} failed:`, e);
    return [];
  }
};

const FALLBACK_GENRE_QUERIES = [
  'Global Top Hits 2025 official music',
  'Hip Hop Classics playlist official',
  'Afrobeats hits 2025 official',
  'Pop hits 2025 official audio',
];

const fetchPipedTracks = async (query: string): Promise<MusicTrack[]> => {
  try {
    const data = await pipedSearch(query, 'music_songs');
    const items = (data.items || []) as Array<{
      type?: string;
      url?: string;
      id?: string;
      title?: string;
      thumbnail?: string;
      uploaderName?: string;
    }>;
    const videos = items
      .filter((item) => item.type === 'stream')
      .map((item) => ({
        id: item.url?.split('v=')[1] || item.id || '',
        title: item.title || 'Unknown',
        channelTitle: item.uploaderName,
        thumbnail: item.thumbnail || '',
      }))
      .filter((v) => v.id);
    if (videos.length > 0) return mapPipedToTracks(videos);
  } catch {
    /* piped failed */
  }
  try {
    return mapPipedToTracks(await pipedService.search(query, 'music_songs'));
  } catch {
    return [];
  }
};

export const musicService = {
  /** Charts + home shelves (same approach as Yung-Music innertube module). */
  getCharts: async (): Promise<MusicTrack[]> => {
    const charts = await fetchInnertubeBrowse('FEmusic_charts');
    if (charts.length >= 12) return charts.slice(0, 30);
    const home = await fetchInnertubeBrowse('FEmusic_home');
    return mergeUniqueTracks([charts, home]).slice(0, 30);
  },

  getTrending: async (): Promise<MusicTrack[]> => {
    const charts = await fetchInnertubeBrowse('FEmusic_charts');
    const home = charts.length < 12 ? await fetchInnertubeBrowse('FEmusic_home') : [];
    const fromCharts = mergeUniqueTracks([charts, home]);
    if (fromCharts.length > 0) return fromCharts.slice(0, 30);

    for (const query of FALLBACK_GENRE_QUERIES) {
      const piped = await fetchPipedTracks(query);
      if (piped.length > 0) return piped.slice(0, 30);
      try {
        const data = await postInnertube({ endpoint: '/search', query, client: 'WEB_REMIX' });
        const songs = extractInnerTubeSongs(data);
        if (songs.length > 0) return songs.slice(0, 30);
      } catch (e) {
        console.warn('[Music] InnerTube trending failed:', e);
      }
    }
    return [];
  },

  search: async (query: string): Promise<MusicTrack[]> => {
    const searchQ = query.includes('playlist') ? query : `${query} music official audio`;
    try {
      const data = await postInnertube({ endpoint: '/search', query: searchQ, client: 'WEB_REMIX' });
      const songs = extractInnerTubeSongs(data);
      if (songs.length > 0) return songs;
    } catch (e) {
      console.warn('[Music] InnerTube search failed:', e);
    }
    return fetchPipedTracks(searchQ);
  },

  getStreamUrl: async (videoId: string): Promise<string | undefined> => {
    try {
      const data = (await postInnertube({ endpoint: '/player', videoId })) as {
        streamingData?: { adaptiveFormats?: Array<{ mimeType?: string; url?: string; audioQuality?: string }> };
      };

      const formats = data?.streamingData?.adaptiveFormats || [];
      // Prioritize high quality mp4/m4a audio, fallback to webm
      let audioFormat = formats.find((f: any) => f.mimeType?.includes('audio/mp4') && f.audioQuality === 'AUDIO_QUALITY_HIGH');
      if (!audioFormat) {
          audioFormat = formats.find((f: any) => f.mimeType?.includes('audio/mp4'));
      }
      if (!audioFormat) {
          audioFormat = formats.find((f: any) => f.mimeType?.includes('audio/webm'));
      }
      
      return audioFormat?.url;
    } catch (e) {
      console.error('[Music] InnerTube getStreamUrl failed:', e);
      try {
       const streams = (await pipedStreams(videoId)) as {
         audioStreams?: Array<{ mimeType?: string; url?: string; quality?: string }>;
       } | null;
       if (!streams?.audioStreams?.length) {
         const viaAxios = await pipedService.getStreams(videoId);
         if (viaAxios?.audioStreams?.length) {
           const audioStreams = viaAxios.audioStreams;
           let audio = audioStreams.find((s: { mimeType?: string; quality?: string }) => s.mimeType?.includes('mp4') && s.quality === 'HIGH');
           if (!audio) audio = audioStreams.find((s: { mimeType?: string }) => s.mimeType?.includes('mp4'));
           if (!audio) audio = audioStreams[0];
           if (audio?.url) return audio.url;
         }
       }
       if (streams && streams.audioStreams && streams.audioStreams.length > 0) {
           let audio = streams.audioStreams.find((s:any) => s.mimeType?.includes('mp4') && s.quality === 'HIGH');
           if (!audio) audio = streams.audioStreams.find((s:any) => s.mimeType?.includes('mp4'));
           if (!audio) audio = streams.audioStreams.find((s:any) => s.mimeType?.includes('webm'));
           if (!audio) audio = streams.audioStreams[0];
           
           if (audio && audio.url) return audio.url;
       }
    } catch (pipedErr) {
       console.error('[Music] Piped getStreamUrl failed:', pipedErr);
    }
    return undefined;
    }
  },
};
