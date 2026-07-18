const TMDB_BASE = 'https://api.themoviedb.org/3';

const TMDB_CREDENTIALS = [
  {
    apiKey: 'd87dbd2496ba67b311d9012ed55bc3bb',
    bearer:
      'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkODdkYmQyNDk2YmE2N2IzMTFkOTAxMmVkNTViYzNiYiIsIm5iZiI6MTc3OTUwMzM2Ni44MjYsInN1YiI6IjZhMTExMTA2NThjZGZhMjFmNGI1YTVjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.tkiRuY9vJkjBVvrJZ-3dLdbj-XPr_m2XsJoJ7C1QWwQ',
  },
  {
    apiKey: 'be86af046da20f5bc823fe58fc7ff33e',
    bearer:
      'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZTg2YWYwNDZkYTIwZjViYzgyM2ZlNThmYzdmZjMzZSIsIm5iZiI6MTc3OTUwMzcxNC42MTc5OTk4LCJzdWIiOiI2YTExMTI2MjE3YzM2ZjNjMTBhZWI5ZDkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.FMZGLJpLNhN942QAV4abXjpNPNtMru7uBovIasui9nc',
  },
  {
    apiKey: '7ea638a69773174284507081474e892d',
    bearer:
      'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZWE2MzhhNjk3NzMxNzQyODQ1MDcwODE0NzRlODkyZCIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dIHNX2XlReX3c8917Ug5Sw9QLf_SEkIIcakh4jCsOos',
  },
];

const GATEWAY_BASES = [
  typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/api`
    : '',
  'https://streamlux.vercel.app/api',
  'https://streamlux-67a84.web.app/api',
].filter(Boolean);

function buildQuery(endpoint: string, params: Record<string, unknown> = {}): string {
  const [path, query = ''] = endpoint.split('?');
  const qs = new URLSearchParams();
  qs.set('endpoint', path.startsWith('/') ? path : `/${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (k !== 'endpoint' && v != null && v !== '') qs.set(k, String(v));
  });
  if (query) {
    new URLSearchParams(query).forEach((v, k) => qs.set(k, v));
  }
  return qs.toString();
}

async function fetchDirectTmdb(endpoint: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const [path, query = ''] = endpoint.split('?');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (k !== 'endpoint' && v != null && v !== '') qs.set(k, String(v));
  });
  if (query) new URLSearchParams(query).forEach((v, k) => qs.set(k, v));

  let lastErr: unknown;
  for (const cred of TMDB_CREDENTIALS) {
    try {
      const finalQs = new URLSearchParams(qs);
      finalQs.set('api_key', cred.apiKey);
      const res = await fetch(`${TMDB_BASE}${cleanPath}?${finalQs}`, {
        headers: { Authorization: `Bearer ${cred.bearer}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (res.ok) return data;
      if (res.status !== 401 && res.status !== 403 && res.status !== 429) return data;
      lastErr = data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('TMDB unavailable');
}

/** Try server gateways, then direct TMDB (browser CORS permitting). */
export async function fetchTmdbWithFallback(
  endpoint: string,
  params: Record<string, unknown> = {}
): Promise<unknown> {
  const query = buildQuery(endpoint, params);

  for (const base of GATEWAY_BASES) {
    try {
      const res = await fetch(`${base}/tmdb?${query}`, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && !('error' in data && (data as { error?: string }).error === 'tmdb_failure')) {
          return data;
        }
      }
    } catch {
      // try next base
    }
  }

  return fetchDirectTmdb(endpoint, params);
}
