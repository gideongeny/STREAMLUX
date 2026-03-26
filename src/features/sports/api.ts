import axios from 'axios';
import { SportsDataResponse } from './types';

const API_BASE = '/api'; // Assuming the gateway is proxied via vite or relative to base

export const sportsService = {
  getLiveMatches: async (): Promise<SportsDataResponse> => {
    try {
      const response = await axios.get(`${API_BASE}/sports/live`);
      return response.data;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return { success: false, data: [] };
    }
  },

  getUpcomingMatches: async (): Promise<SportsDataResponse> => {
    try {
      const response = await axios.get(`${API_BASE}/sports/upcoming`);
      
      // Strict frontend filtering to remove any stale "upcoming" matches stuck in ESPN cache
      const STALE_THRESHOLD = Date.now() - (4 * 60 * 60 * 1000); // 4 hours ago
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.filter((match: any) => {
          if (!match.kickoffTimeFormatted) return true;
          
          const timeValue = new Date(match.kickoffTimeFormatted).getTime();
          // If the date string is something like "TBD" or "Live Now", parsing fails (isNaN) - keep it
          if (isNaN(timeValue)) return true;
          
          return timeValue > STALE_THRESHOLD;
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return { success: false, data: [] };
    }
  }
};
