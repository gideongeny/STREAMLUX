// Vercel API Route: /api/proxy/youtube
// Context-aware YouTube API key rotation for StreamLux

// Default rotating keys (used when no context is specified)
const ROTATING_KEYS = [
  "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
  "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
  "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
  "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY",
  "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
  "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
];

const SPECIAL_KEYS = {
  "sports":        "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
  "entertainment": "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
};

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const deadKeys = new Set();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const query = req.query || {};
  const body = req.body || {};
  
  const endpoint = body.endpoint || query.endpoint;
  const context = body.context || query.context;
  const params = { ...(body.params || {}), ...(query || {}) };
  delete params.endpoint;
  delete params.context;
  delete params.retryCount;

  if (!endpoint) return res.status(400).json({ error: 'YouTube endpoint is required' });

  const candidates = [];
  if (context && SPECIAL_KEYS[context] && !deadKeys.has(SPECIAL_KEYS[context])) {
    candidates.push(SPECIAL_KEYS[context]);
  }
  for (const k of ROTATING_KEYS) {
    if (!deadKeys.has(k) && k !== SPECIAL_KEYS[context]) candidates.push(k);
  }
  
  if (candidates.length === 0) {
    deadKeys.clear();
    candidates.push(...ROTATING_KEYS);
  }

  let lastError = null;
  for (const key of candidates) {
    try {
      const qs = new URLSearchParams({ ...params, key }).toString();
      const separator = endpoint.includes('?') ? '&' : '?';
      const response = await fetch(`${BASE_URL}${endpoint}${separator}${qs}`);
      const data = await response.json();
      
      if (response.status === 403 || data?.error?.code === 403) {
        deadKeys.add(key);
        lastError = data;
        continue;
      }
      return res.status(response.status).json(data);
    } catch (err) {
      lastError = err;
    }
  }

  return res.status(500).json({ 
    error: 'All YouTube keys exhausted or an error occurred.', 
    details: lastError?.message || 'Unknown error'
  });
};
