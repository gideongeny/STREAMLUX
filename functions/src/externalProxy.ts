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

  const { provider, endpoint, params } = req.body;

  if (!provider) {
    res.status(400).json({ error: "Missing 'provider' parameter." });
    return;
  }

  try {
    let response;

    switch (provider) {
      case "omdb":
        // Base URL for OMDB
        const baseUrl = endpoint || "http://www.omdbapi.com/";
        const omdbParams = { ...params, apikey: OMDB_API_KEY };
        
        response = await axios.get(baseUrl, { params: omdbParams });
        res.status(200).json(response.data);
        break;

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
