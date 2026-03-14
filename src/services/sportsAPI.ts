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

import { getBackendBase } from "./download";

// Use the project's unified backend entry point
const getApiBase = () => getBackendBase() + "/api";

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
  if (name.includes("ufc") || name.includes("mma") || name.includes("combat")) return "ufc";
  if (name.includes("wwe") || name.includes("wrestling")) return "wwe";
  return "epl";
};

/**
 * Generate predictive external links for Footstreams and Score808
 */
export const getExternalStreamLinks = (home: string, away: string) => {
  const slug = `${home.toLowerCase().replace(/\s+/g, '-')}-vs-${away.toLowerCase().replace(/\s+/g, '-')}`;
  return [
    { name: "Footstreams (HD)", url: `https://footstreams.co/${slug}/`, color: "bg-blue-600" },
    { name: "Score808 Live", url: `https://www.soccertvhd.com/score808-live-${slug}/`, color: "bg-green-600" },
    { name: "Sky Sports News", url: "https://www.skysports.com/football/results", color: "bg-red-600" }
  ];
};

// ============================================================
// HARDCODED FALLBACK FIXTURES - Guaranteed content layer
// ============================================================
const HARDCODED_UPCOMING_FIXTURES: SportsFixtureConfig[] = [
  {
    id: "h-1",
    leagueId: "epl",
    leagueName: "Premier League",
    homeTeam: "Liverpool",
    awayTeam: "Chelsea",
    homeTeamLogo: "https://media.api-sports.io/football/teams/40.png",
    awayTeamLogo: "https://media.api-sports.io/football/teams/49.png",
    status: "upcoming",
    kickoffTimeFormatted: new Date(Date.now() + 86400000).toISOString(),
    venue: "Anfield",
  },
  {
    id: "h-2",
    leagueId: "ucl",
    leagueName: "Champions League",
    homeTeam: "PSG",
    awayTeam: "Inter Milan",
    homeTeamLogo: "https://media.api-sports.io/football/teams/85.png",
    awayTeamLogo: "https://media.api-sports.io/football/teams/505.png",
    status: "upcoming",
    kickoffTimeFormatted: new Date(Date.now() + 172800000).toISOString(),
    venue: "Parc des Princes",
  },
];

export const getMatchEvents = async (fixtureId: string): Promise<any[]> => {
  try {
    const rawId = fixtureId.replace("live-", "").replace("up-", "");
    const response = await axios.post(`${getBackendBase()}/api/proxy/external`, {
      provider: "apisports",
      endpoint: "/fixtures/events",
      params: { fixture: rawId }
    });
    return response.data?.response || [];
  } catch (error) {
    return [];
  }
};

export const getMatchStatistics = async (fixtureId: string): Promise<any[]> => {
  try {
    const rawId = fixtureId.replace("live-", "").replace("up-", "");
    const response = await axios.post(`${getBackendBase()}/api/proxy/external`, {
      provider: "apisports",
      endpoint: "/fixtures/statistics",
      params: { fixture: rawId }
    });
    return response.data?.response || [];
  } catch (error) {
    return [];
  }
};

export const getMatchLineups = async (fixtureId: string): Promise<any[]> => {
  try {
    const rawId = fixtureId.replace("live-", "").replace("up-use-", "");
    const response = await axios.post(`${getBackendBase()}/api/proxy/external`, {
      provider: "apisports",
      endpoint: "/fixtures/lineups",
      params: { fixture: rawId }
    });
    return response.data?.response || [];
  } catch (error) {
    return [];
  }
};

export const getScorebatHighlights = async (): Promise<any[]> => {
  try {
    const response = await axios.post(`${getApiBase()}/proxy/external`, {
      provider: "scorebat",
      params: {}
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

export const getNCAAFixtures = async (): Promise<any[]> => {
  try {
    const response = await axios.post(`${getBackendBase()}/api/proxy/external`, {
      provider: "espn",
      endpoint: "/basketball/mens-college-basketball/scoreboard",
      params: {}
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

// ============================================================
// CURATED YOUTUBE VIDEO IDs - Guaranteed fallback (no API key needed for embed)
// ============================================================
const CURATED_SPORTS_VIDEOS: Record<string, Array<{ id: string; ytId: string; title: string; thumb: string; isLive?: boolean; channelId?: string; url?: string }>> = {
  "Elite Football": [
    { id: "ef-1", ytId: "OP5tMURXRbI", title: "Champions League Best Goals", thumb: "https://i.ytimg.com/vi/OP5tMURXRbI/hqdefault.jpg" },
    { id: "ef-2", ytId: "0XC9mJhJFw8", title: "Premier League Top 10 Goals", thumb: "https://i.ytimg.com/vi/0XC9mJhJFw8/hqdefault.jpg" },
    { id: "ef-3", ytId: "NlQ3-BqTJuA", title: "La Liga Weekly Highlights", thumb: "https://i.ytimg.com/vi/NlQ3-BqTJuA/hqdefault.jpg" },
    { id: "ef-4", ytId: "pJoNZnpuB8A", title: "Bundesliga Goals of the Season", thumb: "https://i.ytimg.com/vi/pJoNZnpuB8A/hqdefault.jpg" },
  ],
  "Pro Wrestling": [
    { id: "pw-1", ytId: "S4vS-T68YPk", title: "WWE Greatest Moments 2024", thumb: "https://i.ytimg.com/vi/S4vS-T68YPk/hqdefault.jpg" },
    { id: "pw-2", ytId: "VwI7sYD_38g", title: "AEW Best Matches", thumb: "https://i.ytimg.com/vi/VwI7sYD_38g/hqdefault.jpg" },
    { id: "pw-3", ytId: "lmD3FQwQJoE", title: "WWE Royal Rumble Highlights", thumb: "https://i.ytimg.com/vi/lmD3FQwQJoE/hqdefault.jpg" },
  ],
  "Combat Sports": [
    { id: "cs-1", ytId: "8cJhHiBJGZI", title: "UFC Best Knockouts 2024", thumb: "https://i.ytimg.com/vi/8cJhHiBJGZI/hqdefault.jpg" },
    { id: "cs-2", ytId: "T3nzAxvqjTA", title: "Boxing Greatest Knockouts", thumb: "https://i.ytimg.com/vi/T3nzAxvqjTA/hqdefault.jpg" },
    { id: "cs-3", ytId: "5NV4COXJ2TU", title: "MMA Highlights Compilation", thumb: "https://i.ytimg.com/vi/5NV4COXJ2TU/hqdefault.jpg" },
    { id: "cs-pluto", ytId: "", title: "Pluto TV: MMA Live", thumb: "https://images.unsplash.com/photo-1552072805-2a9039d00e57", isLive: true, channelId: "5e70f69a53609a001b9736c5" },
  ],
  "Red Bull TV": [
    { id: "rb-1", ytId: "", title: "Red Bull TV Live", thumb: "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4", isLive: true, url: "https://www.redbull.com/int-en/live-events" },
  ],
  "NCAA Collegiate": [
    { id: "nc-1", ytId: "_gRFmBzZzOQ", title: "March Madness Best Plays", thumb: "https://i.ytimg.com/vi/_gRFmBzZzOQ/hqdefault.jpg" },
    { id: "nc-2", ytId: "XH-vUYUEDEI", title: "NCAA Basketball Top Moments", thumb: "https://i.ytimg.com/vi/XH-vUYUEDEI/hqdefault.jpg" },
  ],
  "Classic": [
    { id: "cl-1", ytId: "nJ7KFEMREeI", title: "Champions League Legendary Finals", thumb: "https://i.ytimg.com/vi/nJ7KFEMREeI/hqdefault.jpg" },
    { id: "cl-2", ytId: "T4_W5pddF7A", title: "World Cup Greatest Goals", thumb: "https://i.ytimg.com/vi/T4_W5pddF7A/hqdefault.jpg" },
  ],
  "Documentary": [
    { id: "doc-1", ytId: "x0rS-x_48pM", title: "The History of Football", thumb: "https://i.ytimg.com/vi/x0rS-x_48pM/hqdefault.jpg" },
  ],
};

// Convert curated video to a SectionSlider-compatible item
const curatedToItem = (v: { id: string; ytId: string; title: string; thumb: string; isLive?: boolean; channelId?: string; url?: string }, category: string) => ({
  id: v.id,
  title: v.title,
  name: v.title,
  poster_path: v.thumb,
  backdrop_path: v.thumb,
  thumb: v.thumb,
  media_type: "sports_video" as const,
  isLive: v.isLive,
  url: v.url,
  isExternal: !!v.url,
  youtubeId: v.ytId,
  isYouTube: !!v.ytId,
  sportsCategory: category,
});

// Variety content from YouTube Cluster (with guaranteed curated fallbacks)
export const getVarietyYT = async (): Promise<any[]> => {
  const ytQueries = [
    { q: "Premier League best goals highlights 2025", type: "Elite Football" },
    { q: "WWE AEW pro wrestling best moments 2025", type: "Pro Wrestling" },
    { q: "UFC MMA boxing combat sports knockouts 2025", type: "Combat Sports" },
    { q: "NCAA Basketball March Madness highlights 2025", type: "NCAA Collegiate" },
    { q: "Elite Sports Documentaries official trailers", type: "Documentary" },
  ];

  const results = await Promise.all(
    ytQueries.map(async (query) => {
      try {
        const { videos } = await fetchYouTubeVideos(query.q, undefined, undefined, 'sports').catch(() => ({ videos: [] }));
        const liveItems = (videos || []).map((video: any, idx: number) => ({
          ...convertYouTubeToItem(video, idx),
          sportsCategory: query.type,
          media_type: "sports_video",
        }));

        // If YouTube API returned content, use it; otherwise use curated
        if (liveItems.length >= 2) return liveItems;
        return (CURATED_SPORTS_VIDEOS[query.type] || []).map((v) => curatedToItem(v, query.type));
      } catch (e) {
        return (CURATED_SPORTS_VIDEOS[query.type] || []).map((v) => curatedToItem(v, query.type));
      }
    })
  );
  return results.flat();
};

// Sports Movies & Docs from TMDB
export const getSportsMovies = async (): Promise<any[]> => {
  try {
    const [p1, p2] = await Promise.all([
      axios.get("/discover/movie", {
        params: { with_genres: 99, with_keywords: "6075", sort_by: "popularity.desc", page: 1 }
      }),
      axios.get("/discover/movie", {
        params: { with_genres: 99, with_keywords: "6075", sort_by: "popularity.desc", page: 2 }
      })
    ]).catch(() => [{ data: { results: [] } }, { data: { results: [] } }]);

    const results = [...(p1.data?.results || []), ...(p2.data?.results || [])];
    return results.map((item: any) => ({
      ...item,
      media_type: "movie",
      sportsCategory: "Documentary",
      poster_path: item.poster_path, // Keep original for resizeImage
      backdrop_path: item.backdrop_path,
      thumb: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "https://images.unsplash.com/photo-1540747913346-ad966a9a9ed0"
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

    // 1. Scraping Extra Sources (Predictive)
    const extraLiveChannels = [
      {
        id: "pluto-mma",
        title: "Pluto MMA: 24/7 Combat",
        name: "Pluto MMA: 24/7 Combat",
        poster_path: "https://images.unsplash.com/photo-1590556409491-0559981be50b",
        backdrop_path: "https://images.unsplash.com/photo-1590556409491-0559981be50b",
        sportsCategory: "Combat Sports",
        media_type: "sports_video",
        url: "https://pluto.tv/en/live-tv/pluto-tv-mma",
        isLive: true,
        isExternal: true
      },
      {
        id: "redbull-tv",
        title: "Red Bull TV Live",
        name: "Red Bull TV Live",
        poster_path: "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4",
        backdrop_path: "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4",
        sportsCategory: "Combat Sports",
        media_type: "sports_video",
        url: "https://www.redbull.com/int-en/live-events",
        isLive: true,
        isExternal: true
      }
    ];

    // Merge and shuffle
    const combined = [...ytResults, ...scorebat, ...ncaa, ...tmdbItems, ...extraLiveChannels];

    // Safety check: if everything is empty or missing specific categories, inject high-quality Evergreens
    const categories = ["Elite Football", "Pro Wrestling", "Combat Sports", "NCAA Collegiate", "Documentary"];
    const evergreens = [
      { id: "ev-1", title: "WWE: Greatest Rivalries", name: "WWE: Greatest Rivalries", sportsCategory: "Pro Wrestling", media_type: "sports_video", backdrop_path: "https://images.unsplash.com/photo-1599058917233-35f9dd66c433", poster_path: "https://images.unsplash.com/photo-1599058917233-35f9dd66c433", isYouTube: true, youtubeId: "S4vS-T68YPk" },
      { id: "ev-2", title: "UFC: The Ultimate Knockouts", name: "UFC: The Ultimate Knockouts", sportsCategory: "Combat Sports", media_type: "sports_video", backdrop_path: "https://images.unsplash.com/photo-1552072805-2a9039d00e57", poster_path: "https://images.unsplash.com/photo-1552072805-2a9039d00e57", isYouTube: true, youtubeId: "8cJhHiBJGZI" },
      { id: "ev-3", title: "Champions League: Legendary Finals", name: "Champions League: Legendary Finals", sportsCategory: "Elite Football", media_type: "sports_video", backdrop_path: "https://images.unsplash.com/photo-1574629810360-7efbbe195018", poster_path: "https://images.unsplash.com/photo-1574629810360-7efbbe195018", isYouTube: true, youtubeId: "OP5tMURXRbI" },
      { id: "ev-4", title: "NCAA: Greatest Buzzer Beaters", name: "NCAA: Greatest Buzzer Beaters", sportsCategory: "NCAA Collegiate", media_type: "sports_video", backdrop_path: "https://images.unsplash.com/photo-1546519638-68e109498ffc", poster_path: "https://images.unsplash.com/photo-1546519638-68e109498ffc", isYouTube: true, youtubeId: "_gRFmBzZzOQ" },
      { id: "ev-5", title: "History of Football Documentary", name: "History of Football Documentary", sportsCategory: "Documentary", media_type: "sports_video", backdrop_path: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2", poster_path: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2", isYouTube: true, youtubeId: "x0rS-x_48pM" }
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
    const response = await axios.post(`${getBackendBase()}/api/proxy/external`, {
      provider: "apisports",
      endpoint: "/fixtures",
      params: { live: "all" }
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
    const response = await axios.post(`${getBackendBase()}/api/proxy/external`, {
      provider: "apisports",
      endpoint: "/fixtures",
      params: { date: dateStr }
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

export const getScrapedMatches = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const response = await axios.post(`${getBackendBase()}/api/proxy/external`, {
      provider: "all-sports",
      params: {}
    });
    
    if (response.data?.success && Array.isArray(response.data.response)) {
      return response.data.response.map((m: any) => ({
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeTeamLogo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018", // Generic logo
        awayTeamLogo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
        status: "live",
        isLive: true,
        kickoffTimeFormatted: m.time || "Live Now",
        leagueName: m.league || "Global Live",
        streamSources: [{ name: "Watch Live", url: m.link, color: "bg-red-600" }],
        sportsCategory: "Elite Football"
      }));
    }
    return [];
  } catch (e) {
    return [];
  }
};

// Persistence Guard: Cache for the last successful fetch to prevent UI clearing
let LAST_KNOWN_GOOD_LIVE: SportsFixtureConfig[] = [];
let LAST_SUCCESS_TIME = 0;

export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s budget

    // 1. Fetch from ALL sources in parallel (no waterfall shadowing)
    const results = await Promise.allSettled([
      // Sportmonks (Elite Data)
      (async () => {
        const { getLiveScores } = await import("./sportmonksAPI");
        const smLive = await getLiveScores();
        return (smLive || []).map((sm: any) => ({
          id: `sm-live-${sm.id}`,
          homeTeam: sm.participants?.find((p: any) => p.meta?.location === "home")?.name || "Home",
          awayTeam: sm.participants?.find((p: any) => p.meta?.location === "away")?.name || "Away",
          homeTeamLogo: sm.participants?.find((p: any) => p.meta?.location === "home")?.image_path,
          awayTeamLogo: sm.participants?.find((p: any) => p.meta?.location === "away")?.image_path,
          homeScore: sm.scores?.find((s: any) => s.description === "CURRENT" && s.score?.participant === "home")?.score?.goals,
          awayScore: sm.scores?.find((s: any) => s.description === "CURRENT" && s.score?.participant === "away")?.score?.goals,
          leagueName: sm.league?.name,
          minute: sm.periods?.[sm.periods.length - 1]?.minutes ? `${sm.periods[sm.periods.length - 1].minutes}'` : "Live",
          status: "live",
          isLive: true,
          sportsCategory: "Elite Football",
          priority: 1
        }));
      })(),
      
      // ESPN (Fallback Pro)
      (async () => {
        const { getESPNScores } = await import("./publicSportsAPI");
        return await getESPNScores().catch(() => []);
      })(),

      // Scraped Content (The Multi-Source Engine)
      getScrapedMatches().catch(() => []),

      // General Public (TheSportsDB/Sofascore)
      getLiveFixturesPublic().catch(() => []),
      
      // API Sports (Reliable Fallback)
      getLiveFixturesAPISports(controller.signal).catch(() => [])
    ]);

    clearTimeout(timeoutId);

    // 2. Aggregate and Normalize
    const allFixtures: any[] = [];
    results.forEach(res => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allFixtures.push(...res.value);
      }
    });

    // 3. Robust Deduplication by Team Name
    const uniqueMap = new Map<string, SportsFixtureConfig>();
    
    allFixtures.forEach(f => {
      // Create a unique key based on normalized team names
      const home = f.homeTeam?.toLowerCase().trim() || "";
      const away = f.awayTeam?.toLowerCase().trim() || "";
      const key = `${home} vs ${away}`;
      
      const existing = uniqueMap.get(key);
      if (!existing || (f.priority && f.priority > (existing as any).priority)) {
        // Only override if new one has better priority or we haven't seen this match
        uniqueMap.set(key, {
            ...f,
            status: "live", // Force live status for everything in this bucket
            isLive: true
        });
      }
    });

    const finalResults = Array.from(uniqueMap.values());

    // 4. Persistence Guard Logic
    if (finalResults.length > 0) {
      LAST_KNOWN_GOOD_LIVE = finalResults;
      LAST_SUCCESS_TIME = Date.now();
      return finalResults;
    } else {
      // If we got 0 results, check if we have a relatively fresh backup
      const now = Date.now();
      const BACKUP_WINDOW = 5 * 60 * 1000; // 5 minutes
      if (LAST_KNOWN_GOOD_LIVE.length > 0 && (now - LAST_SUCCESS_TIME < BACKUP_WINDOW)) {
        console.warn("Live fetch returned 0. Using Persistence Guard fallback.");
        return LAST_KNOWN_GOOD_LIVE;
      }
      return [];
    }
  } catch (e) { 
    console.error("Aggregation Error:", e);
    return LAST_KNOWN_GOOD_LIVE.length > 0 ? LAST_KNOWN_GOOD_LIVE : []; 
  }
};

export const getUpcomingFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const pub = await getUpcomingFixturesPublic().catch(() => []);
    const apiS = await getUpcomingFixturesAPISports().catch(() => []);

    // Merge all and add hardcoded as base layer
    const combined = [...pub, ...apiS, ...HARDCODED_UPCOMING_FIXTURES];

    // Deduplicate by teams (avoid showing same match twice)
    const seen = new Set();
    return combined.filter(f => {
      const key = `${f.homeTeam}-${f.awayTeam}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (e) {
    return HARDCODED_UPCOMING_FIXTURES;
  }
};

export const getMatchLink = (fixture: SportsFixtureConfig): string => {
  return `/matches/details/${fixture.id}`;
};

export const getLiveScores = async (): Promise<SportsFixtureConfig[]> => {
  return await getLiveFixturesAPI();
};

export const subscribeToLiveScores = (
  callback: (fixtures: SportsFixtureConfig[]) => void,
  interval: number = 30000
): (() => void) => {
  let isActive = true;

  const fetchAndUpdate = async () => {
    if (!isActive) return;
    try {
      const fixtures = await getLiveFixturesAPI();
      callback(fixtures);
    } catch (e) {
      console.error("Subscription update error:", e);
    }
  };

  fetchAndUpdate(); // Initial fetch
  const intervalId = setInterval(fetchAndUpdate, interval);

  return () => {
    isActive = false;
    clearInterval(intervalId);
  };
};
