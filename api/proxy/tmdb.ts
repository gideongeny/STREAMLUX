import type { IncomingMessage, ServerResponse } from 'http';
import axios from 'axios';

const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
const BASE_URL = 'https://api.themoviedb.org/3';

export default async function handler(req: IncomingMessage & { query?: any; body?: any }, res: ServerResponse & { status?: any; json?: any; setHeader?: any; end?: any }) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const query: Record<string, any> = (req as any).query || {};
  const body: Record<string, any> = (req as any).body || {};

  const endpoint = (query.endpoint || body.endpoint) as string;
  const params: Record<string, any> = { ...query, ...body };

  if (!endpoint) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'TMDB endpoint is required' }));
    return;
  }

  // Clean up internal proxy params
  delete params.endpoint;

  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        ...params,
        api_key: TMDB_API_KEY,
      },
      headers: {
        'Accept': 'application/json',
      }
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
