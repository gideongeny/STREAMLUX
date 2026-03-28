import axios from 'axios';
import { SportsDataResponse } from './types';

const API_BASE = '/api'; // Assuming the gateway is proxied via vite or relative to base

const normalizeMatchData = (match: any): any => {
    // If scores are present, force isLive if not already set
    const hasScores = (match.homeScore !== undefined && match.homeScore !== null && match.homeScore > 0) ||
                      (match.awayScore !== undefined && match.awayScore !== null && match.awayScore > 0);
    
    return {
        ...match,
        isLive: match.isLive || hasScores || match.minute !== undefined
    };
};

export const sportsService = {
  getLiveMatches: async (): Promise<SportsDataResponse> => {
    try {
      // Primary Source
      const response = await axios.get(`${API_BASE}/sports/live`);
      
      // Secondary Aggregator - If primary fails or returns empty, try the global World Stadium endpoint
      let data = response.data?.data || [];
      
      if (!response.data?.success || !data.length) {
          console.warn('[SportsAPI] Primary live source empty. Fetching from World Stadium aggregator...');
          const worldResponse = await axios.get(`${API_BASE}/sports/aggregator/live`).catch(() => null);
          if (worldResponse?.data?.success) data = worldResponse.data.data;
      }
      
      return {
          success: true,
          data: (data || []).map((m: any) => ({ ...normalizeMatchData(m), isLive: true }))
      };
    } catch (error) {
      console.error('Error fetching live matches:', error);
      // Last resort fallback to the aggregator
      const fallback = await axios.get(`${API_BASE}/sports/aggregator/live`).catch(() => null);
      const fallbackData = fallback?.data?.data || [];
      return {
          success: true,
          data: fallbackData.map((m: any) => ({ ...normalizeMatchData(m), isLive: true }))
      };
    }
  },

  getUpcomingMatches: async (): Promise<SportsDataResponse> => {
    try {
      const response = await axios.get(`${API_BASE}/sports/upcoming`);
      
      // Aggregation Fallback for upcoming fixtures
      let data = response.data?.data || [];
      
      if (!response.data?.success || !data.length) {
          const worldResponse = await axios.get(`${API_BASE}/sports/aggregator/upcoming`).catch(() => null);
          if (worldResponse?.data?.success) data = worldResponse.data.data;
      }

      // Strict frontend filtering to remove any stale "upcoming" matches stuck in ESPN cache
      const STALE_THRESHOLD = Date.now() - (4 * 60 * 60 * 1000); // 4 hours ago
      
      const filteredData = (data || []).filter((match: any) => {
          if (!match.kickoffTimeFormatted) return true;
          
          const timeValue = new Date(match.kickoffTimeFormatted).getTime();
          if (isNaN(timeValue)) return true;
          
          return timeValue > STALE_THRESHOLD;
      }).map(normalizeMatchData);
      
      return { success: true, data: filteredData };
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      const fallback = await axios.get(`${API_BASE}/sports/aggregator/upcoming`).catch(() => null);
      const fallbackData = (fallback?.data?.data || []).map(normalizeMatchData);
      return { success: true, data: fallbackData };
    }
  }
};
