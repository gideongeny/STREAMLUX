import axios from 'axios';

const API_KEYS = [
  "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
  "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
  "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
  "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY"
];

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const deadKeys = new Set<string>();

function getActiveKey(): string {
  for (const key of API_KEYS) {
    if (!deadKeys.has(key)) return key;
  }
  deadKeys.clear();
  return API_KEYS[0];
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const query = req.query || {};
  const body = req.body || {};

  const endpoint = (body.endpoint || query.endpoint) as string;
  const bodyParams = body.params || {};
  const extraQueryParams = { ...query };
  delete extraQueryParams.endpoint;

  const mergedParams = { ...extraQueryParams, ...bodyParams };

  if (!endpoint) {
    return res.status(400).json({ error: 'YouTube endpoint is required' });
  }

  let lastError: any;
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const key = getActiveKey();
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params: { ...mergedParams, key }
      });
      return res.status(200).json(response.data);
    } catch (error: any) {
      lastError = error;
      if (error?.response?.status === 403) {
        deadKeys.add(key);
      } else {
        break;
      }
    }
  }

  const status = lastError?.response?.status || 500;
  return res.status(status).json({ error: 'Failed to fetch from YouTube', details: lastError?.message, endpoint });
}
