const OMDB_API_KEY = "eb87a867";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const query = req.query || {};
  const body = req.body || {};
  const merged = { ...query, ...body };
  const { provider, endpoint, params } = merged;

  if (!provider) return res.status(400).json({ success: false, error: "Missing 'provider' parameter." });

  let url, finalParams = { ...(params || {}) }, headers = {};
  switch (provider) {
    case "omdb":
      url = endpoint || "http://www.omdbapi.com/";
      finalParams.apikey = OMDB_API_KEY;
      break;
    case "apisports":
      url = `https://v3.football.api-sports.io${endpoint}`;
      headers["x-apisports-key"] = "418210481bfff05ff4c1a61d285a0942";
      break;
    case "scorebat":
      url = "https://www.scorebat.com/video-api/v3/feed/";
      finalParams.token = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";
      break;
    case "espn":
      url = `https://site.api.espn.com/apis/site/v2/sports${endpoint}`;
      break;
    case "thesportsdb":
      url = `https://www.thesportsdb.com/api/v1/json/3${endpoint}`;
      break;
    case "sportmonks":
      url = `https://api.sportmonks.com/v3/football${endpoint}`;
      finalParams.api_token = "pWJ9QW6z7Y6U0uI4R8K9O2Q7L5V3M1N0";
      break;
    default:
      return res.status(400).json({ success: false, error: `Unsupported provider: ${provider}` });
  }

  try {
    const qs = new URLSearchParams(finalParams).toString();
    const separator = url.includes('?') ? '&' : '?';
    const fullUrl = `${url}${separator}${qs}`;
    
    const response = await fetch(fullUrl, { headers });
    const data = await response.json();
    
    return res.status(response.status).json({
        success: response.ok,
        data: data
    });
  } catch (error) {
    return res.status(500).json({ 
        success: false, 
        error: `Failed to fetch from ${provider}`, 
        details: error.message 
    });
  }
};
