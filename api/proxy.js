const axios = require('axios');

module.exports = async function handler(req, res) {
  // Set open CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing target url parameter' });
  }

  try {
    const parsed = new URL(targetUrl);
    const referer = req.query.referer || `${parsed.protocol}//${parsed.host}/`;

    const forwardHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Referer': referer,
      'Origin': `${parsed.protocol}//${parsed.host}`,
    };

    if (req.headers.range) {
      forwardHeaders['Range'] = req.headers.range;
    }

    const response = await axios({
      method: req.method === 'POST' ? 'POST' : 'GET',
      url: targetUrl,
      data: req.method === 'POST' ? req.body : undefined,
      headers: forwardHeaders,
      responseType: 'arraybuffer',
      validateStatus: () => true, // Forward all status codes
      timeout: 15000,
      maxRedirects: 5,
    });

    const contentType = response.headers['content-type'] || 'text/html';
    res.setHeader('Content-Type', contentType);

    if (response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
    }
    if (response.headers['accept-ranges']) {
      res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
    }
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    res.status(response.status).send(Buffer.from(response.data));
  } catch (err) {
    res.status(500).json({
      error: 'Proxy request failed',
      message: err.message,
    });
  }
};
