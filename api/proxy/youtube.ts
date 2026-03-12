import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Backend-only YouTube API Keys for Quota Rotation
let API_KEYS = [
  "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
  "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
  "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
  "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY"
];

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const deadKeys = new Set<string>();

function getActiveKey(): { key: string, index: number } | null {
  for (let i = 0; i < API_KEYS.length; i++) {
    const candidate = API_KEYS[i];
    if (!deadKeys.has(candidate)) {
      return { key: candidate, index: i };
    }
  }
  deadKeys.clear();
  return { key: API_KEYS[0], index: 0 };
}

function markKeyAsDead(key: string) {
  deadKeys.add(key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const endpoint = req.query.endpoint as string || req.body.endpoint;
  const params = { ...(req.query || {}), ...(req.body || {}) };
  const retryCount = parseInt(params.retryCount as string || "0");

  if (!endpoint) {
    return res.status(400).json({ error: 'YouTube endpoint is required' });
  }

  const activeParams = getActiveKey();
  if (!activeParams) {
    return res.status(500).json({ error: 'No API keys configured or available.' });
  }

  try {
    // Remove internal proxy params
    delete params.endpoint;
    delete params.retryCount;

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        ...params,
        key: activeParams.key,
      }
    });

    return res.status(200).json(response.data);

  } catch (error: any) {
    const status = error?.response?.status;
    
    // 403 usually means Quota Exceeded for YouTube Data API
    if (status === 403 && retryCount < API_KEYS.length) {
      markKeyAsDead(activeParams.key);
      
      let currentRetry = retryCount + 1;
      let currentKeyParams = getActiveKey();
      
      while (currentRetry < API_KEYS.length && currentKeyParams) {
        try {
          const retryResponse = await axios.get(`${BASE_URL}${endpoint}`, {
            params: { ...params, key: currentKeyParams.key }
          });
          return res.status(200).json(retryResponse.data);
        } catch (err: any) {
          if (err?.response?.status === 403) {
            markKeyAsDead(currentKeyParams.key);
            currentKeyParams = getActiveKey();
            currentRetry++;
          } else {
            throw err;
          }
        }
      }
    }

    console.error('YouTube Proxy Error:', error.message);
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch from YouTube',
      details: error.message
    });
  }
}
