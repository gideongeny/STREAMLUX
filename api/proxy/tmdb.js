const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
const TMDB_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMDllNmYwZTIxMzYwM2IxY2RhNmY0ODk5ODdjZmY3NCIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.G0DnSMJ9PjLOM8Q9uBf6YruODK27kipmcFshPn0VfL0";
const BASE_URL = 'https://api.themoviedb.org/3';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const query = req.query || {};
  const body = req.body || {};

  // Extract endpoint
  let endpoint = body.endpoint || query.endpoint;
  
  if (!endpoint && req.url) {
      const urlParts = req.url.split('?');
      const path = urlParts[0];
      if (path.includes('/api/proxy/tmdb/')) {
          endpoint = path.split('/api/proxy/tmdb')[1];
      }
  }

  if (!endpoint) {
    return res.status(400).json({ success: false, error: 'TMDB endpoint is required' });
  }

  // Ensure endpoint starts with /
  if (!endpoint.startsWith('/')) endpoint = '/' + endpoint;

  const params = { ...(body.params || {}), ...(query || {}) };
  delete params.endpoint;

  // We append api_key anyway as a fallback, but primary is Bearer
  params.api_key = TMDB_API_KEY;

  try {
    const qs = new URLSearchParams(params).toString();
    const separator = endpoint.includes('?') ? '&' : '?';
    const fullUrl = `${BASE_URL}${endpoint}${separator}${qs}`;
    
    const response = await fetch(fullUrl, {
      headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch from TMDB', 
        details: error.message 
    });
  }
};
