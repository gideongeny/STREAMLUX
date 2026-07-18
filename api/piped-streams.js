const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.ot.ax',
  'https://pipedapi.drgns.space',
  'https://piped-api.lunar.icu',
  'https://pipedapi.in.projectsegfau.lt',
];
const { getCache, setCache } = require('./_redis.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const videoId = String(req.query.videoId || '');
  if (!videoId) return res.status(400).json({ error: 'videoId required' });

  const cacheKey = `piped:streams:${videoId}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached);
  }

  for (const base of PIPED_INSTANCES) {
    try {
      const target = `${base}/streams/${videoId}`;
      const pRes = await fetch(target, {
        headers: { 'User-Agent': 'StreamLux/1.0', Accept: 'application/json' },
      });
      const pData = await pRes.json();
      if (pRes.ok && pData) {
        await setCache(cacheKey, pData, 300); // cache for 5 minutes
        res.setHeader('Cache-Control', 'public, s-maxage=300');
        res.setHeader('X-Cache', 'MISS');
        return res.status(200).json(pData);
      }
    } catch {
      /* try next */
    }
  }
  return res.status(200).json({ audioStreams: [], videoStreams: [] });
};
