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
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return { success: false, data: [] };
    }
  }
};
