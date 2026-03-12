import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9"; 
const BASE_URL = 'https://api.themoviedb.org/3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const endpoint = req.query.endpoint as string || req.body.endpoint;
    const params = { ...(req.query || {}), ...(req.body || {}) };

    if (!endpoint) {
      return res.status(400).json({ error: 'TMDB endpoint is required' });
    }

    // Clean up internal proxy params
    delete params.endpoint;

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        ...params,
        api_key: TMDB_API_KEY,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json(response.data);

  } catch (error: any) {
    console.error('TMDB Proxy Error:', error.message);
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch from TMDB',
      details: error.message
    });
  }
}
