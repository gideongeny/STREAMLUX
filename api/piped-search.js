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

  const q = String(req.query.q || req.query.query || '');
  const filter = String(req.query.filter || 'all');
  if (!q) return res.status(200).json({ items: [] });

  const cacheKey = `piped:search:${q}:${filter}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'public, s-maxage=600');
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached);
  }

  for (const base of PIPED_INSTANCES) {
    try {
      const target = `${base}/search?q=${encodeURIComponent(q)}&filter=${encodeURIComponent(filter)}`;
      const pRes = await fetch(target, {
        headers: { 'User-Agent': 'StreamLux/1.0', Accept: 'application/json' },
      });
      const pData = await pRes.json();
      if (pRes.ok && pData && Array.isArray(pData.items) && pData.items.length > 0) {
        await setCache(cacheKey, pData, 600); // cache for 10 minutes
        res.setHeader('Cache-Control', 'public, s-maxage=600');
        res.setHeader('X-Cache', 'MISS');
        return res.status(200).json(pData);
      }
    } catch {
      /* try next */
    }
  }
  return res.status(200).json({ items: [] });
};
