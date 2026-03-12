const axios = require('axios');

const OMDB_API_KEY = "eb87a867";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const query = req.query || {};
  const body = req.body || {};
  const merged = { ...query, ...body };
  const { provider, endpoint, params } = merged;

  if (!provider) {
    return res.status(400).json({ error: "Missing 'provider' parameter." });
  }

  try {
    let response;
    switch (provider) {
      case "omdb": {
        const url = (endpoint) || "http://www.omdbapi.com/";
        response = await axios.get(url, { params: { ...(params || {}), apikey: OMDB_API_KEY } });
        break;
      }
      case "apisports": {
        response = await axios.get(`https://v3.football.api-sports.io${endpoint}`, {
          params: params || {},
          headers: { "x-apisports-key": "418210481bfff05ff4c1a61d285a0942" }
        });
        break;
      }
      case "scorebat": {
        response = await axios.get("https://www.scorebat.com/video-api/v3/feed/", {
          params: { ...(params || {}), token: "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==" }
        });
        break;
      }
      case "espn": {
        response = await axios.get(`https://site.api.espn.com/apis/site/v2/sports${endpoint}`, { params: params || {} });
        break;
      }
      case "thesportsdb": {
        response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3${endpoint}`, { params: params || {} });
        break;
      }
      case "sportmonks": {
        response = await axios.get(`https://api.sportmonks.com/v3/football${endpoint}`, {
          params: { ...(params || {}), api_token: "pWJ9QW6z7Y6U0uI4R8K9O2Q7L5V3M1N0" }
        });
        break;
      }
      default:
        return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    return res.status(status).json({ error: `Failed to fetch from ${provider}`, details: error.message });
  }
};
