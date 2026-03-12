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
    homeTeam: "Arsenal",
    awayTeam: "Man City",
    homeTeamLogo: "https://media.api-sports.io/football/teams/42.png",
    awayTeamLogo: "https://media.api-sports.io/football/teams/50.png",
    status: "upcoming",
    kickoffTimeFormatted: new Date(Date.now() + 86400000).toISOString(),
    venue: "Emirates Stadium",
  },
  {
    id: "h-2",
    leagueId: "ucl",
    leagueName: "Champions League",
    homeTeam: "Real Madrid",
    awayTeam: "Bayern Munich",
    homeTeamLogo: "https://media.api-sports.io/football/teams/541.png",
    awayTeamLogo: "https://media.api-sports.io/football/teams/157.png",
    status: "upcoming",
    kickoffTimeFormatted: new Date(Date.now() + 172800000).toISOString(),
    venue: "Santiago Bernabéu",
  },
  {
    id: "h-3",
    leagueId: "laliga",
    leagueName: "La Liga",
    homeTeam: "Barcelona",
    awayTeam: "Atletico Madrid",
    homeTeamLogo: "https://media.api-sports.io/football/teams/529.png",
    awayTeamLogo: "https://media.api-sports.io/football/teams/530.png",
    status: "upcoming",
    kickoffTimeFormatted: new Date(Date.now() + 259200000).toISOString(),
    venue: "Camp Nou",
  },
  {
    id: "h-4",
    leagueId: "seriea",
    leagueName: "Serie A",
    homeTeam: "Inter Milan",
    awayTeam: "AC Milan",
    homeTeamLogo: "https://media.api-sports.io/football/teams/505.png",
    awayTeamLogo: "https://media.api-sports.io/football/teams/489.png",
    status: "upcoming",
    kickoffTimeFormatted: new Date(Date.now() + 345600000).toISOString(),
    venue: "San Siro",
  },
  {
    id: "h-5",
    leagueId: "bundesliga",
    leagueName: "Bundesliga",
    homeTeam: "Bayer Leverkusen",
    awayTeam: "Dortmund",
    homeTeamLogo: "https://media.api-sports.io/football/teams/168.png",
    awayTeamLogo: "https://media.api-sports.io/football/teams/165.png",
    status: "upcoming",
    kickoffTimeFormatted: new Date(Date.now() + 432000000).toISOString(),
    venue: "BayArena",
  },
];

export const getMatchEvents = async (fixtureId: string): Promise<any[]> => {
  try {
    const rawId = fixtureId.replace("live-", "").replace("up-", "");
    const response = await axios.post(`${getApiBase()}/external`, {
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
    const response = await axios.post(`${getApiBase()}/external`, {
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
    const response = await axios.post(`${getApiBase()}/external`, {
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
    const response = await axios.post(`${getApiBase()}/external`, {
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
    const response = await axios.post(`${getApiBase()}/external`, {
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
    { id: "ef-1", ytId: "OP5tMURXRbI", title: "Champions League Best Goals", thumb: "https://img.youtube.com/vi/OP5tMURXRbI/mqdefault.jpg" },
    { id: "ef-2", ytId: "0XC9mJhJFw8", title: "Premier League Top 10 Goals", thumb: "https://img.youtube.com/vi/0XC9mJhJFw8/mqdefault.jpg" },
    { id: "ef-3", ytId: "NlQ3-BqTJuA", title: "La Liga Weekly Highlights", thumb: "https://img.youtube.com/vi/NlQ3-BqTJuA/mqdefault.jpg" },
    { id: "ef-4", ytId: "pJoNZnpuB8A", title: "Bundesliga Goals of the Season", thumb: "https://img.youtube.com/vi/pJoNZnpuB8A/mqdefault.jpg" },
  ],
  "Pro Wrestling": [
    { id: "pw-1", ytId: "S4vS-T68YPk", title: "WWE Greatest Moments 2024", thumb: "https://img.youtube.com/vi/S4vS-T68YPk/mqdefault.jpg" },
    { id: "pw-2", ytId: "VwI7sYD_38g", title: "AEW Best Matches", thumb: "https://img.youtube.com/vi/VwI7sYD_38g/mqdefault.jpg" },
    { id: "pw-3", ytId: "lmD3FQwQJoE", title: "WWE Royal Rumble Highlights", thumb: "https://img.youtube.com/vi/lmD3FQwQJoE/mqdefault.jpg" },
  ],
  "Combat Sports": [
    { id: "cs-1", ytId: "8cJhHiBJGZI", title: "UFC Best Knockouts 2024", thumb: "https://img.youtube.com/vi/8cJhHiBJGZI/mqdefault.jpg" },
    { id: "cs-2", ytId: "T3nzAxvqjTA", title: "Boxing Greatest Knockouts", thumb: "https://img.youtube.com/vi/T3nzAxvqjTA/mqdefault.jpg" },
    { id: "cs-3", ytId: "5NV4COXJ2TU", title: "MMA Highlights Compilation", thumb: "https://img.youtube.com/vi/5NV4COXJ2TU/mqdefault.jpg" },
    { id: "cs-pluto", ytId: "", title: "Pluto TV: MMA Live", thumb: "https://images.unsplash.com/photo-1552072805-2a9039d00e57", isLive: true, channelId: "5e70f69a53609a001b9736c5" },
  ],
  "Red Bull TV": [
    { id: "rb-1", ytId: "", title: "Red Bull TV: Adventure Sports", thumb: "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4", isLive: true, url: "https://www.redbull.com/int-en/live-events" },
  ],
  "NCAA Collegiate": [
    { id: "nc-1", ytId: "_gRFmBzZzOQ", title: "March Madness Best Plays", thumb: "https://img.youtube.com/vi/_gRFmBzZzOQ/mqdefault.jpg" },
    { id: "nc-2", ytId: "XH-vUYUEDEI", title: "NCAA Basketball Top Moments", thumb: "https://img.youtube.com/vi/XH-vUYUEDEI/mqdefault.jpg" },
  ],
  "Classic": [
    { id: "cl-1", ytId: "nJ7KFEMREeI", title: "Champions League Legendary Finals", thumb: "https://img.youtube.com/vi/nJ7KFEMREeI/mqdefault.jpg" },
    { id: "cl-2", ytId: "T4_W5pddF7A", title: "World Cup Greatest Goals", thumb: "https://img.youtube.com/vi/T4_W5pddF7A/mqdefault.jpg" },
  ],
  "Documentary": [
    { id: "doc-1", ytId: "x0rS-x_48pM", title: "The History of Football", thumb: "https://img.youtube.com/vi/x0rS-x_48pM/mqdefault.jpg" },
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
        const { videos } = await fetchYouTubeVideos(query.q).catch(() => ({ videos: [] }));
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
    const docResponse = await axios.get(`${getApiBase()}/tmdb`, {
      params: {
        endpoint: "/discover/movie",
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
    const response = await axios.post(`${getApiBase()}/external`, {
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
    const response = await axios.post(`${getApiBase()}/external`, {
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

export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // Try Sportmonks First (Pro Data)
    const { getLiveScores } = await import("./sportmonksAPI");
    const smLive = await getLiveScores().catch(() => []);
    if (smLive.length > 0) {
      clearTimeout(timeoutId);
      return smLive.map((sm: any) => ({
        id: `sm-live-${sm.id}`,
        homeTeam: sm.participants?.find((p: any) => p.meta?.location === "home")?.name || "Home",
        awayTeam: sm.participants?.find((p: any) => p.meta?.location === "away")?.name || "Away",
        homeTeamLogo: sm.participants?.find((p: any) => p.meta?.location === "home")?.image_path,
        awayTeamLogo: sm.participants?.find((p: any) => p.meta?.location === "away")?.image_path,
        homeScore: sm.scores?.find((s: any) => s.description === "CURRENT" && s.score?.participant === "home")?.score?.goals,
        awayScore: sm.scores?.find((s: any) => s.description === "CURRENT" && s.score?.participant === "away")?.score?.goals,
        leagueName: sm.league?.name,
        minute: sm.periods?.[sm.periods.length - 1]?.minutes + "'",
        status: "live",
        isLive: true,
        sportsCategory: "Elite Football",
      }));
    }

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
  if (String(fixture.id)?.startsWith("sm-")) return "#"; // Parent handles modal click
  if (fixture.matchId) return `https://sportslive.run/matches/${fixture.matchId}?utm_source=MB_Website`;
  return `https://sportslive.run/live?utm_source=MB_Website`;
};

export const getLiveScores = async (): Promise<SportsFixtureConfig[]> => {
  return await getLiveScoresPublic().catch(() => getLiveFixturesAPI());
};

export const subscribeToLiveScores = (cb: (f: any[]) => void, i: number = 30000) => {
  try { return subscribeToLiveScoresPublic(cb, i); } catch (e) { return () => { }; }
};
