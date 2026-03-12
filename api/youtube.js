const API_KEYS = [
  "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
  "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
  "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
  "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY"
];

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
let activeKeyIndex = 0;

export default async function handler(req, res) {
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

  const mergedParams = { ...extraQueryParams, ...bodyParams };

  if (!endpoint) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'YouTube endpoint is required' }));
    return;
  }

  let lastError;
  for (let i = 0; i < API_KEYS.length; i++) {
    const keyIndex = (activeKeyIndex + i) % API_KEYS.length;
    const key = API_KEYS[keyIndex];
    
    try {
      const qs = new URLSearchParams({ ...mergedParams, key }).toString();
      const response = await fetch(`${BASE_URL}${endpoint}?${qs}`);
      const data = await response.json();
      
      if (response.status === 403) {
        lastError = { status: 403, message: 'Quota exceeded for key' };
        continue;
      }

      activeKeyIndex = keyIndex;
      res.statusCode = response.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return;
    } catch (error) {
      lastError = error;
      break;
    }
  }

  res.statusCode = lastError?.status || 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Failed to fetch from YouTube', details: lastError?.message }));
}
