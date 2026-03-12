const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
const BASE_URL = 'https://api.themoviedb.org/3';

export default async function handler(req, res) {
  // Direct CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const query = req.query || {};
  const body = req.body || {};

  const endpoint = (body.endpoint || query.endpoint);
  const bodyParams = body.params || {};
  const extraQueryParams = { ...query };
  delete extraQueryParams.endpoint;

  const mergedParams = { ...extraQueryParams, ...bodyParams, api_key: TMDB_API_KEY };

  if (!endpoint) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'TMDB endpoint is required' }));
    return;
  }

  try {
    const qs = new URLSearchParams(mergedParams).toString();
    const fullUrl = `${BASE_URL}${endpoint}?${qs}`;
    
    const response = await fetch(fullUrl, {
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    res.statusCode = response.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error(`TMDB Proxy Error [${endpoint}]:`, error.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Failed to fetch from TMDB', 
      details: error.message,
      endpoint: endpoint
    }));
  }
}
