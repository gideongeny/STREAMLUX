import axios from 'axios';

const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
const BASE_URL = 'https://api.themoviedb.org/3';

export default async function handler(req: any, res: any) {
  // Direct CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Vercel automatically populates req.query and req.body
  const query = req.query || {};
  const body = req.body || {};

  const endpoint = (body.endpoint || query.endpoint) as string;
  const bodyParams = body.params || {};
  const extraQueryParams = { ...query };
  delete extraQueryParams.endpoint;

  const mergedParams = { ...extraQueryParams, ...bodyParams };

  if (!endpoint) {
    return res.status(400).json({ 
      error: 'TMDB endpoint is required', 
      debug: { url: req.url, method: req.method, hasBody: !!req.body } 
    });
  }

  try {
    const fullUrl = `${BASE_URL}${endpoint}`;
    const response = await axios.get(fullUrl, {
      params: { ...mergedParams, api_key: TMDB_API_KEY },
      headers: { 'Accept': 'application/json' }
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error(`TMDB Proxy Error [${endpoint}]:`, error.message);
    const status = error.response?.status || 500;
    return res.status(status).json({ 
      error: 'Failed to fetch from TMDB', 
      details: error.message,
      endpoint: endpoint
    });
  }
}
