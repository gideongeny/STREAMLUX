const axios = require("axios");

const OMDB_API_KEY = "eb87a867";
const SB_TOKEN = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";
const SM_KEY = "pWJ9QW6z7Y6U0uI4R8K9O2Q7L5V3M1N0";
const AS_KEY = "418210481bfff05ff4c1a61d285a0942";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-apisports-key");
  
  if (req.method === "OPTIONS") return res.status(204).end();

  const query = req.query || {};
  const body = req.body || {};
  const merged = { ...query, ...body };
  const { provider, endpoint, params = {} } = merged;

  if (!provider) {
    return res.status(400).json({ success: false, error: "Missing 'provider' parameter." });
  }

  try {
    let targetUrl;
    let headers = { "User-Agent": "StreamLux/1.0" };
    let finalParams = { ...params };

    switch (provider) {
      case "sportmonks":
        targetUrl = `https://api.sportmonks.com/v3/football${endpoint}`;
        finalParams.api_token = SM_KEY;
        break;

      case "apisports":
        targetUrl = `https://v3.football.api-sports.io${endpoint}`;
        headers["x-apisports-key"] = AS_KEY;
        break;

      case "scorebat":
        targetUrl = "https://www.scorebat.com/video-api/v3/feed/";
        finalParams.token = SB_TOKEN;
        break;

      case "espn":
        targetUrl = `https://site.api.espn.com/apis/site/v2/sports${endpoint}`;
        break;

      case "thesportsdb":
        targetUrl = `https://www.thesportsdb.com/api/v1/json/3${endpoint}`;
        break;

      case "omdb":
        targetUrl = "http://www.omdbapi.com/";
        finalParams.apikey = OMDB_API_KEY;
        break;

      default:
        return res.status(400).json({ success: false, error: `Unsupported provider: ${provider}` });
    }

    const response = await axios.get(targetUrl, {
      params: finalParams,
      headers: headers,
      timeout: 10000
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(`Proxy error [${provider}]:`, error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      provider
    });
  }
};
```
