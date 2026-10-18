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

  // Extract and decode target URL carefully
  let targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing target url parameter' });
  }

  // Handle cases where the URL itself has unescaped ampersands in query parameters
  if (req.url && req.url.includes('url=')) {
    const urlIdx = req.url.indexOf('url=');
    let raw = req.url.slice(urlIdx + 4);
    const refererIdx = raw.indexOf('&referer=');
    if (refererIdx !== -1) {
      raw = raw.slice(0, refererIdx);
    }
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        targetUrl = decoded;
      }
    } catch {
      // Use original targetUrl if decode fails
    }
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

    const method = req.method === 'HEAD' ? 'HEAD' : (req.method === 'POST' ? 'POST' : 'GET');

    const response = await axios({
      method,
      url: targetUrl,
      data: req.method === 'POST' ? req.body : undefined,
      headers: forwardHeaders,
      responseType: 'stream',
      validateStatus: () => true, // Forward all status codes
      timeout: 30000,
      maxRedirects: 5,
    });

    const contentType = response.headers['content-type'] || 'application/octet-stream';
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

    res.status(response.status);

    if (method === 'HEAD') {
      return res.end();
    }

    // Clean up upstream stream if client disconnects early
    res.on('close', () => {
      if (response.data && typeof response.data.destroy === 'function') {
        response.data.destroy();
      }
    });

    response.data.pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Proxy request failed',
        message: err.message,
      });
    }
  }
};
