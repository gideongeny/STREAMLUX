const TMDB_CREDENTIALS = [
  {
    apiKey: process.env.TMDB_API_KEY_1 || 'd87dbd2496ba67b311d9012ed55bc3bb',
    bearer:
      process.env.TMDB_BEARER_TOKEN_1 ||
      'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkODdkYmQyNDk2YmE2N2IzMTFkOTAxMmVkNTViYzNiYiIsIm5iZiI6MTc3OTUwMzM2Ni44MjYsInN1YiI6IjZhMTExMTA2NThjZGZhMjFmNGI1YTVjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.tkiRuY9vJkjBVvrJZ-3dLdbj-XPr_m2XsJoJ7C1QWwQ',
  },
  {
    apiKey: process.env.TMDB_API_KEY_2 || 'be86af046da20f5bc823fe58fc7ff33e',
    bearer:
      process.env.TMDB_BEARER_TOKEN_2 ||
      'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZTg2YWYwNDZkYTIwZjViYzgyM2ZlNThmYzdmZjMzZSIsIm5iZiI6MTc3OTUwMzcxNC42MTc5OTk4LCJzdWIiOiI2YTExMTI2MjE3YzM2ZjNjMTBhZWI5ZDkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.FMZGLJpLNhN942QAV4abXjpNPNtMru7uBovIasui9nc',
  },
  {
    apiKey: process.env.TMDB_API_KEY || '7ea638a69773174284507081474e892d',
    bearer:
      process.env.TMDB_BEARER_TOKEN ||
      'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZWE2MzhhNjk3NzMxNzQyODQ1MDcwODE0NzRlODkyZCIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dIHNX2XlReX3c8917Ug5Sw9QLf_SEkIIcakh4jCsOos',
  },
];

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const { getCache, setCache } = require('./_redis.js');

async function fetchTmdb(endpoint, finalParams) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let lastStatus = 500;
  let lastData = { results: [] };

  for (const cred of TMDB_CREDENTIALS) {
    const params = new URLSearchParams(finalParams);
    params.set('api_key', cred.apiKey);
    const tmdbUrl = `${TMDB_BASE_URL}${path}?${params.toString()}`;
    const tRes = await fetch(tmdbUrl, {
      headers: { Authorization: `Bearer ${cred.bearer}`, Accept: 'application/json' },
    });
    const tData = await tRes.json();
    lastStatus = tRes.status;
    lastData = tData;
    if (tRes.ok) return { ok: true, status: tRes.status, data: tData };
    if (tRes.status !== 401 && tRes.status !== 403 && tRes.status !== 429) break;
  }

  return { ok: false, status: lastStatus, data: lastData };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const query = req.query || {};
    let endpoint = String(query.endpoint || '/movie/popular');
    if ((!endpoint || endpoint === '/') && query.query) endpoint = '/search/multi';

    let endpointParams = '';
    if (endpoint.includes('?')) {
      const parts = endpoint.split('?');
      endpoint = parts[0];
      endpointParams = parts[1];
    }

    const finalParams = new URLSearchParams();
    Object.keys(query).forEach((k) => {
      if (k !== 'endpoint' && k !== 'match') finalParams.append(k, String(query[k]));
    });
    if (endpointParams) {
      new URLSearchParams(endpointParams).forEach((value, key) => finalParams.append(key, value));
    }

    const isSearch = endpoint.includes('/search');
    const isDetail = /\/(movie|tv)\/\d+/.test(endpoint);
    const isTrending =
      endpoint.includes('/trending') || endpoint.includes('/popular') || endpoint.includes('/top_rated');
    const isVideos = endpoint.includes('/videos');

    let ttlSeconds = 60 * 60;
    let cdnMaxAge = 3600;
    if (isTrending) {
      ttlSeconds = 2 * 60 * 60;
      cdnMaxAge = 7200;
    } else if (isDetail) {
      ttlSeconds = 7 * 24 * 60 * 60;
      cdnMaxAge = 604800;
    } else if (isVideos) {
      ttlSeconds = 24 * 60 * 60;
      cdnMaxAge = 86400;
    } else if (isSearch) {
      ttlSeconds = 20 * 60;
      cdnMaxAge = 1200;
    }

    const stableParams = new URLSearchParams(finalParams);
    stableParams.delete('api_key');
    const cacheKey = `tmdb:${endpoint}:${stableParams.toString()}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', `public, s-maxage=${cdnMaxAge}`);
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    const { ok, status, data } = await fetchTmdb(endpoint, finalParams);

    if (ok) await setCache(cacheKey, data, ttlSeconds);
    res.setHeader('Cache-Control', `public, s-maxage=${cdnMaxAge}`);
    res.setHeader('X-Cache', ok ? 'MISS' : 'ERROR');
    return res.status(status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'tmdb_failure', message: err && err.message });
  }
};
