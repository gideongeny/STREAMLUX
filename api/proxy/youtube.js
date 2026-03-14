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

// Dedicated high-quota keys for specific sections
const CONTEXT_KEYS = {
  "sports":        "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
  "entertainment": "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
};

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Simple in-memory dead-key tracker (resets on cold start)
const deadKeys = new Set();

function getKeys(context) {
  // Build the ordered key list: context key first (if available and not dead), then rotating keys
  const keys = [];
  
  if (context && CONTEXT_KEYS[context] && !deadKeys.has(CONTEXT_KEYS[context])) {
    keys.push(CONTEXT_KEYS[context]);
  }
  
  for (const k of ROTATING_KEYS) {
    if (!deadKeys.has(k)) keys.push(k);
  }
  
  // If all dead, clear and try context key again
  if (keys.length === 0) {
    deadKeys.clear();
    if (context && CONTEXT_KEYS[context]) keys.push(CONTEXT_KEYS[context]);
    keys.push(...ROTATING_KEYS);
  }
  
  return keys;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const query = req.query || {};
  const body = req.body || {};
  
  let endpoint = body.endpoint || query.endpoint;
  const context = body.context || query.context;
  const bodyParams = body.params || {};
  
  // Build merged params excluding internal proxy fields
  const extraQueryParams = { ...query };
  delete extraQueryParams.endpoint;
  delete extraQueryParams.context;
  delete extraQueryParams.retryCount;
  
  const mergedParams = { ...extraQueryParams, ...bodyParams };

  if (!endpoint) {
    return res.status(400).json({ error: 'YouTube endpoint is required' });
  }

  const keys = getKeys(context);
  let lastError = null;

  for (const key of keys) {
    try {
      const qs = new URLSearchParams({ ...mergedParams, key }).toString();
      const separator = endpoint.includes('?') ? '&' : '?';
      const fullUrl = `${BASE_URL}${endpoint}${separator}${qs}`;
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      if (response.status === 403 || data?.error?.code === 403) {
        console.warn(`[YouTube Proxy] Key quota exceeded, rotating...`);
        deadKeys.add(key);
        lastError = data;
        continue;
      }
      
      // Return the raw YouTube API response directly (no wrapper envelope)
      // This is what the frontend expects: { items: [...], nextPageToken: "..." }
      return res.status(response.status).json(data);
      
    } catch (err) {
      lastError = err;
      console.error(`[YouTube Proxy] Fetch error:`, err.message);
      break;
    }
  }

  return res.status(500).json({ 
    error: 'All YouTube API keys exhausted or an error occurred.', 
    details: lastError?.message || 'Unknown error'
  });
};
