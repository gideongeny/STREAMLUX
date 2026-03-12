const API_KEYS = [
  "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
  "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
  "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
  "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY"
];
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
let activeKeyIndex = 0;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const query = req.query || {};
  const body = req.body || {};
  let endpoint = body.endpoint || query.endpoint;
  const bodyParams = body.params || {};
  const extraQueryParams = { ...query };
  delete extraQueryParams.endpoint;
  const mergedParams = { ...extraQueryParams, ...bodyParams };

  if (!endpoint) return res.status(400).json({ success: false, error: 'YouTube endpoint is required' });

  let lastError;
  for (let i = 0; i < API_KEYS.length; i++) {
    const keyIndex = (activeKeyIndex + i) % API_KEYS.length;
    const key = API_KEYS[keyIndex];
    try {
      const qs = new URLSearchParams({ ...mergedParams, key }).toString();
      const separator = endpoint.includes('?') ? '&' : '?';
      const fullUrl = `${BASE_URL}${endpoint}${separator}${qs}`;
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      if (response.status === 403) { 
          lastError = { status: 403, message: 'Quota exceeded or unauthorized' }; 
          continue; 
      }
      
      activeKeyIndex = keyIndex;
      return res.status(response.status).json({
          success: response.ok,
          data: data
      });
    } catch (err) { 
        lastError = err; 
        break; 
    }
  }
  
  return res.status(lastError?.status || 500).json({ 
      success: false, 
      error: 'Failed to fetch from YouTube', 
      details: lastError?.message 
  });
};
