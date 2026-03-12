const TMDB_API_KEY = "a09e6f0e213603b1cda6f489987cff74";
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

  // Extract endpoint from body or query param
  let endpoint = body.endpoint || query.endpoint;
  
  // If still no endpoint, try to extract from req.url (supports direct paths)
  if (!endpoint && req.url) {
      const urlParts = req.url.split('?');
      const path = urlParts[0];
      if (path.startsWith('/api/proxy/tmdb/')) {
          endpoint = path.replace('/api/proxy/tmdb', '');
      }
  }

  if (!endpoint) {
    return res.status(400).json({ success: false, error: 'TMDB endpoint is required' });
  }

  const bodyParams = body.params || {};
  const extraQueryParams = { ...query };
  delete extraQueryParams.endpoint;

  const mergedParams = { ...extraQueryParams, ...bodyParams, api_key: TMDB_API_KEY };

  try {
    const qs = new URLSearchParams(mergedParams).toString();
    // Handle cases where endpoint might already have query params
    const separator = endpoint.includes('?') ? '&' : '?';
    const fullUrl = `${BASE_URL}${endpoint}${separator}${qs}`;
    
    console.log(`Fetching from: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      headers: { 'Accept': 'application/json' }
    });
    
    const data = await response.json();
    
    // Wrap the response in { success: true, data } as expected by the frontend
    return res.status(response.status).json({
        success: response.ok,
        data: data
    });
  } catch (error) {
    return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch from TMDB', 
        details: error.message 
    });
  }
};
