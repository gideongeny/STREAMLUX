import axios from 'axios';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
}

export const musicService = {
  getTrending: async (): Promise<MusicTrack[]> => {
    try {
      const response = await axios.get('/api/music/trending');
      return (response.data.items || []).map((item: any) => ({
        id: item.id?.videoId || item.id,
        title: item.snippet?.title,
        artist: item.snippet?.channelTitle,
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
      }));
    } catch (e) {
      console.error('Error fetching trending music:', e);
      return [];
    }
  },

  search: async (query: string): Promise<MusicTrack[]> => {
    try {
      const response = await axios.get('/api/music/search', { params: { q: query } });
      return (response.data.items || []).map((item: any) => ({
        id: item.id?.videoId,
        title: item.snippet?.title,
        artist: item.snippet?.channelTitle,
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
      }));
    } catch (e) {
      console.error('Error searching music:', e);
      return [];
    }
  }
};
