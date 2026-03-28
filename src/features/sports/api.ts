import axios from 'axios';
import { SportsDataResponse } from './types';

const API_BASE = '/api'; // Assuming the gateway is proxied via vite or relative to base

const normalizeMatchData = (match: any): any => {
    let minute = match.minute || '';
    let period = match.period || '';
    let clock = match.clock || '';
    let isFinished = match.isFinished || false;
    let status = match.status;

    // Intelligence: If minute contains a period description (e.g. "1st Quarter"), split it
    if (minute.toLowerCase().includes('quarter') || minute.toLowerCase().includes('period') || minute.toLowerCase().includes('half')) {
        const parts = minute.split(' ');
        if (parts.length > 1) {
            clock = parts[0];
            period = parts.slice(1).join(' ');
        }
    }

    // Intelligence: Detect finished games
    if (minute.toLowerCase() === 'final' || minute.toLowerCase() === 'ft' || minute.toLowerCase() === '90') {
        isFinished = true;
        status = 'finished';
    }

    // If scores are present, force isLive if not already set and not finished
    const hasScores = (match.homeScore !== undefined && match.homeScore !== null && match.homeScore > 0) ||
                      (match.awayScore !== undefined && match.awayScore !== null && match.awayScore > 0);
    
    return {
        ...match,
        minute,
        period,
        clock,
        isFinished,
        status: isFinished ? 'finished' : (match.isLive || hasScores ? 'live' : status),
        isLive: !isFinished && (match.isLive || hasScores || !!minute)
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
