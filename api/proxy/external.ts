import axios from 'axios';

const OMDB_API_KEY = "eb87a867";

export default async function handler(req: any, res: any) {
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
    return res.status(400).json({ error: "Missing 'provider' parameter.", query, body });
  }

  try {
    let response;

    switch (provider) {
      case "omdb": {
        const omdbUrl = (endpoint as string) || "http://www.omdbapi.com/";
        response = await axios.get(omdbUrl, { params: { ...(params || {}), apikey: OMDB_API_KEY } });
        break;
      }
      case "apisports": {
        const apiSportsKey = "418210481bfff05ff4c1a61d285a0942";
        const apiSportsBase = "https://v3.football.api-sports.io";
        response = await axios.get(`${apiSportsBase}${endpoint}`, {
          params: params || {},
          headers: { "x-apisports-key": apiSportsKey }
        });
        break;
      }
      case "scorebat": {
        const scorebatToken = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";
        response = await axios.get("https://www.scorebat.com/video-api/v3/feed/", {
          params: { ...(params || {}), token: scorebatToken }
        });
        break;
      }
      case "espn": {
        const espnBase = "https://site.api.espn.com/apis/site/v2/sports";
        response = await axios.get(`${espnBase}${endpoint}`, { params: params || {} });
        break;
      }
      case "thesportsdb": {
        const sportsDBBase = "https://www.thesportsdb.com/api/v1/json/3";
        response = await axios.get(`${sportsDBBase}${endpoint}`, { params: params || {} });
        break;
      }
      case "sportmonks": {
        const sportmonksKey = "pWJ9QW6z7Y6U0uI4R8K9O2Q7L5V3M1N0";
        const sportmonksBase = "https://api.sportmonks.com/v3/football";
        response = await axios.get(`${sportmonksBase}${endpoint}`, {
          params: { ...(params || {}), api_token: sportmonksKey }
        });
        break;
      }
      default:
        return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error(`Error proxying to ${provider}:`, error.message);
    const status = error.response?.status || 500;
    return res.status(status).json({ error: `Failed to fetch from ${provider}`, details: error.message });
  }
}
