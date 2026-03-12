import type { IncomingMessage, ServerResponse } from 'http';
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

async function getBody(req: IncomingMessage & { body?: any }): Promise<any> {
  if (req.body) return req.body;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

function parseQuery(url: string = ''): Record<string, string> {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return {};
  const qs = url.slice(queryStart + 1);
  const result: Record<string, string> = {};
  qs.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k) result[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return result;
}

export default async function handler(req: IncomingMessage & { query?: any; body?: any }, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const query = req.query || parseQuery(req.url);
  const body = req.method === 'POST' ? await getBody(req) : {};

  const endpoint = (body.endpoint || query.endpoint) as string;
  const bodyParams: Record<string, any> = body.params || {};
  const extraQueryParams: Record<string, any> = { ...query };
  delete extraQueryParams.endpoint;

  const mergedParams: Record<string, any> = { ...extraQueryParams, ...bodyParams };

  if (!endpoint) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'YouTube endpoint is required' }));
    return;
  }

  let lastError: any;
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const key = getActiveKey();
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params: { ...mergedParams, key }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response.data));
      return;
    } catch (error: any) {
      lastError = error;
      if (error?.response?.status === 403) {
        deadKeys.add(key);
      } else {
        break;
      }
    }
  }

  console.error('YouTube Proxy Error:', lastError?.message);
  const status = lastError?.response?.status || 500;
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Failed to fetch from YouTube', details: lastError?.message, endpoint }));
}
