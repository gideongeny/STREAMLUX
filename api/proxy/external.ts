import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const OMDB_API_KEY = "eb87a867"; 

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const query = { ...(req.query || {}), ...(req.body || {}) };
  const { provider, endpoint, params } = query;

  if (!provider) {
    return res.status(400).json({ error: "Missing 'provider' parameter." });
  }

  try {
    let response;

    switch (provider) {
      case "omdb":
        const omdbUrl = endpoint || "http://www.omdbapi.com/";
        response = await axios.get(omdbUrl, { params: { ...(params || {}), apikey: OMDB_API_KEY } });
        return res.status(200).json(response.data);

      case "apisports":
        const apiSportsKey = "418210481bfff05ff4c1a61d285a0942";
        const apiSportsBase = "https://v3.football.api-sports.io";
        response = await axios.get(`${apiSportsBase}${endpoint}`, {
          params: params || {},
          headers: { "x-apisports-key": apiSportsKey }
        });
        return res.status(200).json(response.data);

      case "scorebat":
        const scorebatToken = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";
        response = await axios.get("https://www.scorebat.com/video-api/v3/feed/", {
          params: { ...(params || {}), token: scorebatToken }
        });
        return res.status(200).json(response.data);

      case "espn":
        const espnBase = "https://site.api.espn.com/apis/site/v2/sports";
        response = await axios.get(`${espnBase}${endpoint}`, { params: params || {} });
        return res.status(200).json(response.data);

      case "thesportsdb":
        const sportsDBBase = "https://www.thesportsdb.com/api/v1/json/3";
        response = await axios.get(`${sportsDBBase}${endpoint}`, { params: params || {} });
        return res.status(200).json(response.data);

      default:
        return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }
  } catch (error: any) {
    console.error(`Error proxying to ${provider}:`, error.message);
    return res.status(error.response?.status || 500).json({ 
      error: `Failed to fetch from ${provider}`,
      details: error.message 
    });
  }
}
