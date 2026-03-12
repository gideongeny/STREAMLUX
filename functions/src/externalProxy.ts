import * as functions from "firebase-functions";
import axios from "axios";

// Environment variables configured in Firebase
const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY || "eb87a867"; 

/**
 * Universal Proxy for handling external API calls that require sensitive keys.
 * This hides the OMDB_API_KEY and other secondary metadata keys from the client.
 */
export const proxyExternalAPI = functions.https.onRequest(async (req, res) => {
  // CORS setup
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const { provider, endpoint, params } = req.body || req.query || {};

  if (!provider) {
    res.status(400).json({ error: "Missing 'provider' parameter." });
    return;
  }

  try {
    let response;

    switch (provider) {
      case "omdb":
        const omdbUrl = endpoint || "http://www.omdbapi.com/";
        response = await axios.get(omdbUrl, { params: { ...params, apikey: OMDB_API_KEY } });
        res.status(200).json(response.data);
        break;

      case "apisports":
        const apiSportsKey = "418210481bfff05ff4c1a61d285a0942";
        const apiSportsBase = "https://v3.football.api-sports.io";
        response = await axios.get(`${apiSportsBase}${endpoint}`, {
          params,
          headers: { "x-apisports-key": apiSportsKey }
        });
        res.status(200).json(response.data);
        break;

      case "scorebat":
        const scorebatToken = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";
        response = await axios.get("https://www.scorebat.com/video-api/v3/feed/", {
          params: { ...params, token: scorebatToken }
        });
        res.status(200).json(response.data);
        break;

      case "espn":
        const espnBase = "https://site.api.espn.com/apis/site/v2/sports";
        response = await axios.get(`${espnBase}${endpoint}`, { params });
        res.status(200).json(response.data);
        break;

      case "thesportsdb":
        const sportsDBBase = "https://www.thesportsdb.com/api/v1/json/3";
        response = await axios.get(`${sportsDBBase}${endpoint}`, { params });
        res.status(200).json(response.data);
        break;

      case "tmdb-proxy":
        // Fallback or internal routing for TMDB if called via external point
        const tmdbProxy = require('./tmdbProxy');
        return tmdbProxy.proxyTMDB(req, res);

      default:
        res.status(400).json({ error: `Unsupported provider: ${provider}` });
        break;
    }
  } catch (error: any) {
    console.error(`Error proxying to ${provider}:`, error.message);
    res.status(500).json({ 
      error: `Failed to fetch from ${provider}`,
      details: error.message 
    });
  }
});
