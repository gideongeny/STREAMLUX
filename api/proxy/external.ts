import type { IncomingMessage, ServerResponse } from 'http';
import axios from 'axios';

const OMDB_API_KEY = "eb87a867";

export default async function handler(req: IncomingMessage & { query?: any; body?: any }, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const query: Record<string, any> = (req as any).query || {};
  const body: Record<string, any> = (req as any).body || {};
  const merged = { ...query, ...body };
  const { provider, endpoint, params } = merged;

  if (!provider) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Missing 'provider' parameter." }));
    return;
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
        const sportmonksKey = "your-sportmonks-key";
        const sportmonksBase = "https://api.sportmonks.com/v3/football";
        response = await axios.get(`${sportmonksBase}${endpoint}`, {
          params: { ...(params || {}), api_token: sportmonksKey }
        });
        break;
      }
      default:
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Unsupported provider: ${provider}` }));
        return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response.data));
  } catch (error: any) {
    console.error(`Error proxying to ${provider}:`, error.message);
    const status = error.response?.status || 500;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Failed to fetch from ${provider}`, details: error.message }));
  }
}
