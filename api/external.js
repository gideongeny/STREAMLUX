const OMDB_API_KEY = "eb87a867";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const query = req.query || {};
  const body = req.body || {};
  const merged = { ...query, ...body };
  const { provider, endpoint, params } = merged;

  if (!provider) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "Missing 'provider' parameter." }));
    return;
  }

  try {
    let response;
    let url;
    let finalParams = { ...(params || {}) };
    let headers = {};

    switch (provider) {
      case "omdb": {
        url = (endpoint) || "http://www.omdbapi.com/";
        finalParams.apikey = OMDB_API_KEY;
        break;
      }
      case "apisports": {
        url = `https://v3.football.api-sports.io${endpoint}`;
        headers["x-apisports-key"] = "418210481bfff05ff4c1a61d285a0942";
        break;
      }
      case "scorebat": {
        url = "https://www.scorebat.com/video-api/v3/feed/";
        finalParams.token = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";
        break;
      }
      case "espn": {
        url = `https://site.api.espn.com/apis/site/v2/sports${endpoint}`;
        break;
      }
      case "thesportsdb": {
        url = `https://www.thesportsdb.com/api/v1/json/3${endpoint}`;
        break;
      }
      case "sportmonks": {
        url = `https://api.sportmonks.com/v3/football${endpoint}`;
        finalParams.api_token = "pWJ9QW6z7Y6U0uI4R8K9O2Q7L5V3M1N0";
        break;
      }
      default:
        res.statusCode = 400;
        res.end(JSON.stringify({ error: `Unsupported provider: ${provider}` }));
        return;
    }

    const qs = new URLSearchParams(finalParams).toString();
    const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${qs}`;
    
    response = await fetch(fullUrl, { headers });
    const data = await response.json();

    res.statusCode = response.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: `Failed to fetch from ${provider}`, details: error.message }));
  }
}
