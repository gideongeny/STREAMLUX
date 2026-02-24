import axios from "../shared/axios";
import { SportsFixtureConfig } from "../shared/constants";
import {
  getLiveFixturesAPI as getLiveFixturesPublic,
  getUpcomingFixturesAPI as getUpcomingFixturesPublic,
  getLiveScores as getLiveScoresPublic,
  subscribeToLiveScores as subscribeToLiveScoresPublic,
} from "./publicSportsAPI";
import { fetchYouTubeVideos } from "./youtube";
import { convertYouTubeToItem } from "./youtubeContent";

// Hardened constants
const API_SPORTS_BASE = "https://v3.football.api-sports.io";
const API_SPORTS_KEY = "418210481bfff05ff4c1a61d285a0942";

// Helper to map league names to our league IDs
const getLeagueIdFromName = (leagueName: string): string => {
  if (!leagueName) return "epl";
  const name = leagueName.toLowerCase();
  if (name.includes("premier league") || name.includes("epl")) return "epl";
  if (name.includes("champions league") || name.includes("ucl")) return "ucl";
  if (name.includes("la liga")) return "laliga";
  if (name.includes("ligue 1") || name.includes("ligue1")) return "ligue1";
  if (name.includes("serie a") || name.includes("seriea")) return "seriea";
  if (name.includes("afcon") || name.includes("africa cup")) return "afcon";
  if (name.includes("bundesliga")) return "bundesliga";
  if (name.includes("rugby")) return "rugby-world-cup";
  if (name.includes("ufc")) return "ufc";
  if (name.includes("wwe")) return "wwe";
  return "epl";
};

// Scorebat Tokens
const SCOREBAT_TOKEN = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";

/**
 * Scorebat Highlights
 */
export const getScorebatHighlights = async (): Promise<any[]> => {
  try {
    const response = await axios.get("https://www.scorebat.com/video-api/v3/feed/", {
      params: { token: SCOREBAT_TOKEN }
    });
    if (!response.data?.response) return [];

    return response.data.response.map((match: any) => ({
      id: `sb-${match.title.replace(/\s+/g, '-')}-${match.date}`,
      title: match.title,
      name: match.title,
      thumb: match.thumbnail,
      poster_path: match.thumbnail,
      backdrop_path: match.thumbnail,
      url: match.matchviewUrl,
      embed: match.videos?.[0]?.embed,
      league: match.competition,
      date: match.date,
      sportsCategory: "Replay",
      media_type: "sports_video"
    }));
  } catch (error) {
    console.warn("Scorebat API error:", error);
    return [];
  }
};

// NCAA / Collegiate Sports Fetcher (using ESPN hidden API)
export const getNCAAFixtures = async (): Promise<any[]> => {
  try {
    const response = await axios.get("https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard", {
      timeout: 5000
    });
    if (!response.data?.events) return [];

    return response.data.events.map((event: any) => ({
      id: `ncaa-${event.id}`,
      title: event.name,
      name: event.name,
      thumb: event.competitions?.[0]?.competitors?.[0]?.team?.logo || "https://images.unsplash.com/photo-1546519638-68e109498ffc",
      poster_path: event.competitions?.[0]?.competitors?.[0]?.team?.logo || "https://images.unsplash.com/photo-1546519638-68e109498ffc",
      backdrop_path: event.competitions?.[0]?.competitors?.[0]?.team?.logo || "https://images.unsplash.com/photo-1546519638-68e109498ffc",
      league: "NCAA Basketball",
      status: "upcoming",
      sportsCategory: "NCAA",
      media_type: "sports_video"
    }));
  } catch (error) {
    console.warn("NCAA API error:", error);
    return [];
  }
};

// Variety content from YouTube Cluster
export const getVarietyYT = async (): Promise<any[]> => {
  try {
    const ytQueries = [
      { q: "WWE Raw Smackdown Full Match 2024", type: "Wrestling" },
      { q: "AEW Dynamite highlights 2024", type: "Wrestling" },
      { q: "UFC Fights Full Free 2024", type: "MMA" },
      { q: "MMA Highlights Best KOs 2024", type: "MMA" },
      { q: "NBA Full Classic Games", type: "Classic" },
      { q: "Premier League Full Match Replay 2024", type: "Replay" }
    ];

    const results = await Promise.all(
      ytQueries.map(async (query) => {
        try {
          const { videos } = await fetchYouTubeVideos(query.q).catch(() => ({ videos: [] }));
          return (videos || []).map((video: any, idx: number) => ({
            ...convertYouTubeToItem(video, idx),
            sportsCategory: query.type,
            media_type: "sports_video"
          }));
        } catch (e) { return []; }
      })
    );
    return results.flat();
  } catch (error) {
    return [];
  }
};

// Sports Movies & Docs from TMDB
export const getSportsMovies = async (): Promise<any[]> => {
  try {
    const docResponse = await axios.get("/discover/movie", {
      params: {
        with_genres: 99,
        with_keywords: "6075", // Sports
        sort_by: "popularity.desc"
      }
    }).catch(() => ({ data: { results: [] } }));

    return (docResponse.data.results || []).map((item: any) => ({
      ...item,
      media_type: "movie",
      sportsCategory: "Documentary"
    }));
  } catch (error) {
    return [];
  }
};

/**
 * Variety Sports Content (Wrestling, Docs, MMA, Replays)
 * Using YouTube, Scorebat, and TMDB with Waterfall Logic
 */
export const getVarietySports = async (): Promise<any[]> => {
  try {
    const [ytResults, scorebat, ncaa, tmdbItems] = await Promise.all([
      getVarietyYT(),
      getScorebatHighlights(),
      getNCAAFixtures(),
      getSportsMovies()
    ]);

    // Merge and shuffle (Waterfall: If YT fails, Scorebat, NCAA and TMDB carry the load)
    const combined = [...ytResults, ...scorebat, ...ncaa, ...tmdbItems];

    // Safety check: if everything is empty or missing specific categories, inject high-quality Evergreens
    const categories = ["Wrestling", "MMA", "Replay", "NCAA", "Documentary"];
    const evergreens = [
      { id: "ev-1", title: "WWE: Greatest Rivalries", name: "WWE: Greatest Rivalries", sportsCategory: "Wrestling", media_type: "sports_video", backdrop_path: "https://images.unsplash.com/photo-1599058917233-35f9dd66c433", poster_path: "https://images.unsplash.com/photo-1599058917233-35f9dd66c433", isYouTube: true, youtubeId: "S4vS-T68YPk" },
      { id: "ev-2", title: "UFC: The Ultimate Knockouts", name: "UFC: The Ultimate Knockouts", sportsCategory: "MMA", media_type: "sports_video", backdrop_path: "https://images.unsplash.com/photo-1552072805-2a9039d00e57", poster_path: "https://images.unsplash.com/photo-1552072805-2a9039d00e57", isYouTube: true, youtubeId: "S4vS-T68YPk" },
      { id: "ev-3", title: "Champions League: Legendary Finals", name: "Champions League: Legendary Finals", sportsCategory: "Replay", media_type: "sports_video", backdrop_path: "https://images.unsplash.com/photo-1574629810360-7efbbe195018", poster_path: "https://images.unsplash.com/photo-1574629810360-7efbbe195018", isYouTube: true, youtubeId: "S4vS-T68YPk" }
    ];

    // Ensure we have at least 2 items for major categories
    const finalContent = [...combined];
    categories.forEach(cat => {
      if (finalContent.filter(item => item.sportsCategory === cat).length < 2) {
        finalContent.push(...evergreens.filter(e => e.sportsCategory === cat));
      }
    });

    return finalContent.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Variety sports error:", error);
    return [];
  }
};

// API Sports Fallback Helpers (Internal)
const getLiveFixturesAPISports = async (signal?: AbortSignal): Promise<SportsFixtureConfig[]> => {
  try {
    // Note: API Sports needs its own raw axios if baseURL is different
    const response = await axios.get(`${API_SPORTS_BASE}/fixtures`, {
      params: { live: "all" },
      headers: { "x-apisports-key": API_SPORTS_KEY },
      signal,
    });
    if (!response.data?.response) return [];
    return response.data.response.map((fixture: any) => ({
      id: `live-${fixture.fixture.id}`,
      leagueId: getLeagueIdFromName(fixture.league.name),
      homeTeam: fixture.teams.home.name || "Unknown",
      awayTeam: fixture.teams.away.name || "Unknown",
      homeTeamLogo: fixture.teams.home.logo,
      awayTeamLogo: fixture.teams.away.logo,
      status: "live" as const,
      kickoffTimeFormatted: "Live Now",
      homeScore: fixture.goals?.home,
      awayScore: fixture.goals?.away,
      minute: fixture.fixture.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : "Live",
      isLive: true,
      venue: fixture.fixture.venue?.name || "Official Arena",
      homeProb: Math.floor(Math.random() * (70 - 30 + 1) + 30),
    }));
  } catch (e) { return []; }
};

const getUpcomingFixturesAPISports = async (signal?: AbortSignal): Promise<SportsFixtureConfig[]> => {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const response = await axios.get(`${API_SPORTS_BASE}/fixtures`, {
      params: { date: dateStr },
      headers: { "x-apisports-key": API_SPORTS_KEY },
      signal
    });
    if (!response.data?.response) return [];
    return response.data.response.slice(0, 10).map((f: any) => ({
      id: `up-${f.fixture.id}`,
      leagueId: getLeagueIdFromName(f.league.name),
      leagueName: f.league.name,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeTeamLogo: f.teams.home.logo,
      awayTeamLogo: f.teams.away.logo,
      status: "upcoming" as const,
      kickoffTimeFormatted: f.fixture.date,
      venue: f.fixture.venue?.name || "Official Arena",
      homeProb: Math.floor(Math.random() * (70 - 30 + 1) + 30),
    }));
  } catch (e) { return []; }
};

export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const { getESPNScores } = await import("./publicSportsAPI");
    const espn = await getESPNScores().catch(() => []);
    if (espn.length > 0) { clearTimeout(timeoutId); return espn; }

    const pub = await getLiveFixturesPublic().catch(() => []);
    if (pub.length > 0) { clearTimeout(timeoutId); return pub; }

    const apiS = await getLiveFixturesAPISports(controller.signal).catch(() => []);
    clearTimeout(timeoutId);
    return apiS;
  } catch (e) { return []; }
};

export const getUpcomingFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const pub = await getUpcomingFixturesPublic().catch(() => []);
    if (pub.length > 0) return pub;
    return await getUpcomingFixturesAPISports().catch(() => []);
  } catch (e) { return []; }
};

export const getMatchLink = (fixture: SportsFixtureConfig): string => {
  if (fixture.matchId) return `https://sportslive.run/matches/${fixture.matchId}?utm_source=MB_Website`;
  return `https://sportslive.run/live?utm_source=MB_Website`;
};

export const getLiveScores = async (): Promise<SportsFixtureConfig[]> => {
  return await getLiveScoresPublic().catch(() => getLiveFixturesAPI());
};

export const subscribeToLiveScores = (cb: (f: any[]) => void, i: number = 30000) => {
  try { return subscribeToLiveScoresPublic(cb, i); } catch (e) { return () => { }; }
};
