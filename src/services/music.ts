import axios from 'axios';

import axios from 'axios';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  album?: string;
  streamUrl?: string; // Direct audio stream from Saavn
  source: 'saavn' | 'youtube';
}

export const musicService = {
  getTrending: async (): Promise<MusicTrack[]> => {
    try {
      const response = await axios.get('/api/music/trending');
      
      // If Saavn response
      if (response.data?.status === 'success' || response.data?.data?.trending) {
        const trendingArr = response.data.data.trending?.songs || response.data.data.songs || [];
        return trendingArr.map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.primaryArtists || item.artist,
          thumbnail: item.image?.[2]?.link || item.image?.[1]?.link || item.image,
          album: item.album?.name,
          duration: item.duration,
          streamUrl: item.downloadUrl?.[4]?.link || item.downloadUrl?.[3]?.link, // 320kbps or 192kbps
          source: 'saavn'
        }));
      }

      // Fallback to YouTube mapped response
      return (response.data.items || []).map((item: any) => ({
        id: item.id?.videoId || item.id,
        title: item.snippet?.title,
        artist: item.snippet?.channelTitle,
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
        source: 'youtube'
      }));
    } catch (e) {
      console.error('Error fetching trending music:', e);
      return [];
    }
  },

  search: async (query: string): Promise<MusicTrack[]> => {
    try {
      const response = await axios.get('/api/music/search', { params: { q: query } });
      
      if (response.data?.status === 'success' && response.data.data?.songs?.results) {
        return response.data.data.songs.results.map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.primaryArtists,
          thumbnail: item.image?.[2]?.link || item.image?.[1]?.link,
          album: item.album?.name,
          duration: item.duration,
          streamUrl: item.downloadUrl?.[4]?.link || item.downloadUrl?.[3]?.link,
          source: 'saavn'
        }));
      }

      return (response.data.items || []).map((item: any) => ({
        id: item.id?.videoId,
        title: item.snippet?.title,
        artist: item.snippet?.channelTitle,
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
        source: 'youtube'
      }));
    } catch (e) {
      console.error('Error searching music:', e);
      return [];
    }
  }
};

