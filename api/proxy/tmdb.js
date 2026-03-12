const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
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

  const endpoint = body.endpoint || query.endpoint;
  const bodyParams = body.params || {};
  const extraQueryParams = { ...query };
  delete extraQueryParams.endpoint;

  const mergedParams = { ...extraQueryParams, ...bodyParams, api_key: TMDB_API_KEY };

  if (!endpoint) {
    return res.status(400).json({ error: 'TMDB endpoint is required' });
  }

  try {
    const qs = new URLSearchParams(mergedParams).toString();
    const response = await fetch(`${BASE_URL}${endpoint}?${qs}`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from TMDB', details: error.message });
  }
};
