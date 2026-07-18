const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const YT_KEYS: Record<string, string> = {
  movie: 'AIzaSyDhbC7IZNOqpMki1Yni5JnSiXQQfnp5Sxw',
  tv: 'AIzaSyD6W4_T3YkWJKy9Mtj2u188g8HayHMuPq8',
  music: 'AIzaSyCU6TH5NPF-ZyX-hWjTQTaSGH0lTy9pops',
  general: 'AIzaSyAlENC10uKVhrDGqgzUeOiNysiUFoDof9o',
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  const endpoint = String(query.endpoint || '/search');
  const context = String(query.context || 'general');
  const keyPool = [YT_KEYS[context] || YT_KEYS.general, ...Object.values(YT_KEYS)];

  const ytParams = new URLSearchParams();
  Object.keys(query).forEach((k) => {
    if (!['endpoint', 'match', 'proxy', 'context'].includes(k)) ytParams.append(k, String(query[k]));
  });
  if (!ytParams.has('part')) ytParams.set('part', 'snippet');
  if (!ytParams.has('maxResults')) ytParams.set('maxResults', '25');

  for (const key of keyPool) {
    try {
      const ytUrl = `${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}?${ytParams.toString()}&key=${key}`;
      const ytRes = await fetch(ytUrl);
      const data = await ytRes.json();
      if (data.error) continue;
      res.setHeader('Cache-Control', 's-maxage=28800');
      return res.status(200).json(data);
    } catch {
      /* try next key */
    }
  }
  return res.status(200).json({ items: [] });
}
