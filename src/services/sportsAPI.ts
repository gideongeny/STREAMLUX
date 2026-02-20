// Live Sports API Integration
// Using public APIs for real-time data

import axios from "axios";
import { SportsFixtureConfig } from "../shared/constants";

// Import public sports API functions
import {
  getLiveFixturesAPI as getLiveFixturesPublic,
  getUpcomingFixturesAPI as getUpcomingFixturesPublic,
  getLiveScores as getLiveScoresPublic,
  subscribeToLiveScores as subscribeToLiveScoresPublic,
} from "./publicSportsAPI";

// Sportslive.run link helper
export const getMatchLink = (fixture: SportsFixtureConfig): string => {
  if (fixture.matchId) {
    return `https://sportslive.run/matches/${fixture.matchId}?utm_source=MB_Website&sportType=football`;
  }
  return `https://sportslive.run/live?utm_source=MB_Website&sportType=football`;
};

// API Sports - Fallback (if key is valid)
const API_SPORTS_BASE = "https://v3.football.api-sports.io";
const API_SPORTS_KEY = "418210481bfff05ff4c1a61d285a0942";

// TheSportsDB - Fallback, no key required
const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

// Get team logo from TheSportsDB
export const getTeamLogo = async (teamName: string): Promise<string | null> => {
  try {
    const response = await axios.get(`${SPORTSDB_BASE}/searchteams.php`, {
      params: { t: teamName },
      timeout: 5000,
    });

    if (response.data?.teams && response.data.teams.length > 0) {
      return response.data.teams[0].strTeamBadge || response.data.teams[0].strTeamLogo || null;
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching team logo for ${teamName}:`, error);
    return null;
  }
};

// Get live fixtures - ENABLED with safety checks
export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    // Add strict 5s timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Try ESPN first (Elite Source)
    const { getESPNScores } = await import("./publicSportsAPI");
    const espnFixtures = await getESPNScores().catch(() => []);

    if (espnFixtures.length > 0) {
      clearTimeout(timeoutId);
      return espnFixtures;
    }

    // Try other public APIs (TheSportsDB, Sofascore)
    const publicFixtures = await getLiveFixturesPublic().catch(() => []);

    if (publicFixtures.length > 0) {
      clearTimeout(timeoutId);
      return publicFixtures;
    }

    // Fallback to API Sports if public APIs fail
    const apiSportsFixtures = await getLiveFixturesAPISports(controller.signal).catch(() => []);
    clearTimeout(timeoutId);
    return apiSportsFixtures;
  } catch (error) {
    console.warn("Error in getLiveFixturesAPI:", error);
    return []; // Always return array, never throw
  }
};

// Get live fixtures from API Sports (fallback)
const getLiveFixturesAPISports = async (signal?: AbortSignal): Promise<SportsFixtureConfig[]> => {
  try {
    const response = await axios.get(`${API_SPORTS_BASE}/fixtures`, {
      params: { live: "all" },
      headers: {
        "x-apisports-key": API_SPORTS_KEY,
      },
      signal, // Use signal from parent
    });

    // Validate response structure strictly
    if (!response.data?.response || !Array.isArray(response.data.response)) {
      return [];
    }

    return response.data.response.map((fixture: any) => ({
      id: `live-${fixture.fixture.id}`,
      leagueId: getLeagueIdFromName(fixture.league.name),
      homeTeam: fixture.teams.home.name || "Unknown Team",
      awayTeam: fixture.teams.away.name || "Unknown Team",
      homeTeamLogo: fixture.teams.home.logo,
      awayTeamLogo: fixture.teams.away.logo,
      status: "live" as const,
      kickoffTimeFormatted: "Live Now",
      venue: fixture.fixture.venue?.name || "TBD",
      homeScore: typeof fixture.goals?.home === 'number' ? fixture.goals.home : undefined,
      awayScore: typeof fixture.goals?.away === 'number' ? fixture.goals.away : undefined,
      minute: fixture.fixture.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : undefined,
      isLive: true,
    }));
  } catch (error: any) {
    if (error.name !== 'CanceledError') {
      console.warn("API Sports error:", error.message);
    }
    return [];
  }
};

// ... (similar safety updates for simple fallbacks ignored for brevity, keeping main structure)

// Get upcoming fixtures - ENABLED with safety checks
export const getUpcomingFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const publicFixtures = await getUpcomingFixturesPublic().catch(() => []);

    if (publicFixtures.length > 0) {
      clearTimeout(timeoutId);
      return publicFixtures;
    }

    const apiSportsFixtures = await getUpcomingFixturesAPISports(controller.signal).catch(() => []);
    clearTimeout(timeoutId);
    return apiSportsFixtures;
  } catch (error) {
    console.warn("Error in getUpcomingFixturesAPI:", error);
    return [];
  }
};

// Get upcoming fixtures from API Sports (fallback)
const getUpcomingFixturesAPISports = async (signal?: AbortSignal): Promise<SportsFixtureConfig[]> => {
  try {
    // Determine dates (Today + Tomorrow only for speed)
    const dates: string[] = [];
    for (let i = 0; i < 2; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const allFixtures: SportsFixtureConfig[] = [];

    // Fetch implicitly parallel but limited
    for (const dateStr of dates) {
      try {
        const response = await axios.get(`${API_SPORTS_BASE}/fixtures`, {
          params: { date: dateStr },
          headers: { "x-apisports-key": API_SPORTS_KEY },
          signal
        });

        if (response.data?.response && Array.isArray(response.data.response)) {
          const newFixtures = response.data.response
            .filter((f: any) => {
              const s = f.fixture.status?.short;
              return !["LIVE", "FT", "AET", "PEN", "CANC"].includes(s);
            })
            .slice(0, 5) // Limit to 5 per day for speed
            .map((f: any) => ({
              id: `upcoming-${f.fixture.id}`,
              leagueId: getLeagueIdFromName(f.league.name),
              homeTeam: f.teams.home.name || "TBD",
              awayTeam: f.teams.away.name || "TBD",
              homeTeamLogo: f.teams.home.logo,
              awayTeamLogo: f.teams.away.logo,
              status: "upcoming" as const,
              kickoffTimeFormatted: new Date(f.fixture.date).toISOString(),
              venue: f.fixture.venue?.name || "TBD",
              round: f.league.round
            }));
          allFixtures.push(...newFixtures);
        }
      } catch (e) { continue; }
    }

    return allFixtures;
  } catch (error) {
    return [];
  }
};

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
  return "epl"; // Default
};

// Get live scores for scoreboard - use public APIs
export const getLiveScores = async (): Promise<SportsFixtureConfig[]> => {
  return await getLiveScoresPublic().catch(err => {
    console.warn("getLiveScoresPublic failed, trying fallback:", err);
    // Fallback to getLiveFixturesAPI -> API Sports
    return getLiveFixturesAPI();
  });
};

// Auto-refresh live scores
export const subscribeToLiveScores = (
  callback: (fixtures: SportsFixtureConfig[]) => void,
  interval: number = 30000
): (() => void) => {
  try {
    return subscribeToLiveScoresPublic(callback, interval);
  } catch (e) {
    console.warn("Subscribe failed:", e);
    return () => { };
  }
};

