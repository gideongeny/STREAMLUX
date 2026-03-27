import axios from 'axios';
import { SportsDataResponse } from './types';

const API_BASE = '/api'; // Assuming the gateway is proxied via vite or relative to base

export const sportsService = {
  getLiveMatches: async (): Promise<SportsDataResponse> => {
    try {
      // Primary Source
      const response = await axios.get(`${API_BASE}/sports/live`);
      
      // Secondary Aggregator - If primary fails or returns empty, try the global World Stadium endpoint
      if (!response.data?.success || !response.data.data?.length) {
          console.warn('[SportsAPI] Primary live source empty. Fetching from World Stadium aggregator...');
          const worldResponse = await axios.get(`${API_BASE}/sports/aggregator/live`).catch(() => null);
          if (worldResponse?.data?.success) return worldResponse.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      // Last resort fallback to the aggregator
      const fallback = await axios.get(`${API_BASE}/sports/aggregator/live`).catch(() => null);
      return fallback?.data || { success: false, data: [] };
    }
  },

  getUpcomingMatches: async (): Promise<SportsDataResponse> => {
    try {
      const response = await axios.get(`${API_BASE}/sports/upcoming`);
      
      // Aggregation Fallback for upcoming fixtures
      if (!response.data?.success || !response.data.data?.length) {
          const worldResponse = await axios.get(`${API_BASE}/sports/aggregator/upcoming`).catch(() => null);
          if (worldResponse?.data?.success) return worldResponse.data;
      }

      // Strict frontend filtering to remove any stale "upcoming" matches stuck in ESPN cache
      const STALE_THRESHOLD = Date.now() - (4 * 60 * 60 * 1000); // 4 hours ago
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.filter((match: any) => {
          if (!match.kickoffTimeFormatted) return true;
          
          const timeValue = new Date(match.kickoffTimeFormatted).getTime();
          if (isNaN(timeValue)) return true;
          
          return timeValue > STALE_THRESHOLD;
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      const fallback = await axios.get(`${API_BASE}/sports/aggregator/upcoming`).catch(() => null);
      return fallback?.data || { success: false, data: [] };
    }
  }
};
