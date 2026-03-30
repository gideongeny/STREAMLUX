import axios from '../../shared/axios'; // Use shared instance — handles native vs web base URL
import { SportsDataResponse } from './types';

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
      // The shared axios instance already unwraps {success, data} envelope
      // so response.data IS the array directly — NOT response.data.data
      const response = await axios.get('/sports/live');
      let data = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      if (!data.length) {
        console.warn('[SportsAPI] Primary live source empty. Trying aggregator...');
        const worldResponse = await axios.get('/sports/aggregator/live').catch(() => null);
        const wd = worldResponse?.data;
        data = Array.isArray(wd) ? wd : (wd?.data || []);
      }

      return {
        success: true,
        data: (data).map((m: any) => ({ ...normalizeMatchData(m), isLive: true }))
      };
    } catch (error) {
      console.error('Error fetching live matches:', error);
      const fallback = await axios.get('/sports/aggregator/live').catch(() => null);
      const fd = fallback?.data;
      const fallbackData = Array.isArray(fd) ? fd : (fd?.data || []);
      return {
        success: true,
        data: fallbackData.map((m: any) => ({ ...normalizeMatchData(m), isLive: true }))
      };
    }
  },

  getUpcomingMatches: async (): Promise<SportsDataResponse> => {
    try {
      const response = await axios.get('/sports/upcoming');
      // Shared axios already unwraps {success, data} — so response.data IS the array
      let data = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      if (!data.length) {
        const worldResponse = await axios.get('/sports/aggregator/upcoming').catch(() => null);
        const wd = worldResponse?.data;
        data = Array.isArray(wd) ? wd : (wd?.data || []);
      }

      // Filter out matches that kicked off more than 4 hours ago (stale cache)
      const STALE_THRESHOLD = Date.now() - (4 * 60 * 60 * 1000);
      const filteredData = data.filter((match: any) => {
        if (!match.kickoffTimeFormatted) return true;
        const timeValue = new Date(match.kickoffTimeFormatted).getTime();
        if (isNaN(timeValue)) return true;
        return timeValue > STALE_THRESHOLD;
      }).map(normalizeMatchData);

      return { success: true, data: filteredData };
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      const fallback = await axios.get('/sports/aggregator/upcoming').catch(() => null);
      const fd = fallback?.data;
      const fallbackData = (Array.isArray(fd) ? fd : (fd?.data || [])).map(normalizeMatchData);
      return { success: true, data: fallbackData };
    }
  }
};



