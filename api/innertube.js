const INNERTUBE_KEYS = [
  'AIzaSyBXl3lLvGxMOtqtYn75f_X68mc8P-O81qQ',
  'AIzaSyC4Mz02lYxZSdaA5N-l363GlIJiblhC3sM',
  'AIzaSyB8lDctBCl-3JPNgJSau3TvulbevDyvNyQ',
  'AIzaSyAlENC10uKVhrDGqgzUeOiNysiUFoDof9o',
];

function parseBody(req) {
  const raw = req.body;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const reqData = req.method === 'POST' ? parseBody(req) : req.query || {};
    const endpoint = String(reqData.endpoint || '/search');
    const itQuery = reqData.query;
    const videoId = reqData.videoId;
    const browseId = reqData.browseId;
    const clientName = String(reqData.client || 'WEB_REMIX');

    const key = INNERTUBE_KEYS[Math.floor(Math.random() * INNERTUBE_KEYS.length)];
    const host = clientName === 'WEB' ? 'www.youtube.com' : 'music.youtube.com';
    const itUrl = `https://${host}/youtubei/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}?key=${key}`;
    const clientVersion =
      clientName === 'WEB' ? '2.20250218.01.00' : clientName === 'WEB_REMIX' ? '1.20250218.01.00' : '1.20240101.01.00';

    const itRes = await fetch(itUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Origin: `https://${host}`,
        Referer: `https://${host}/`,
      },
      body: JSON.stringify({
        context: { client: { clientName, clientVersion, hl: 'en', gl: 'US' } },
        ...(itQuery && { query: itQuery }),
        ...(videoId && { videoId }),
        ...(browseId && { browseId }),
      }),
    });

    const itData = await itRes.json().catch(() => ({}));
    res.setHeader('Cache-Control', videoId ? 'no-store' : 'public, s-maxage=900');
    return res.status(200).json(itData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'innertube_error';
    return res.status(200).json({ contents: {}, error: msg });
  }
};
