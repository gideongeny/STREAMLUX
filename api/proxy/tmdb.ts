import type { IncomingMessage, ServerResponse } from 'http';
import axios from 'axios';

const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
const BASE_URL = 'https://api.themoviedb.org/3';

// Helper to parse the raw body from the request
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

// Helper to parse query string
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const query = parseQuery(req.url);
  const body = req.method === 'POST' ? await parseBody(req) : {};

  // Support both: GET ?endpoint=... and POST body {endpoint, params}
  const endpoint = (body.endpoint || query.endpoint) as string;
  // params from body (nested object) or from query string
  const bodyParams: Record<string, any> = body.params || {};
  const extraQueryParams: Record<string, any> = { ...query };
  delete extraQueryParams.endpoint;

  const mergedParams: Record<string, any> = { ...extraQueryParams, ...bodyParams };

  if (!endpoint) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'TMDB endpoint is required' }));
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { ...mergedParams, api_key: TMDB_API_KEY },
      headers: { 'Accept': 'application/json' }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response.data));

  } catch (error: any) {
    console.error('TMDB Proxy Error:', error.message);
    const status = error.response?.status || 500;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch from TMDB', details: error.message }));
  }
}
