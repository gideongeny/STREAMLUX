// Public Sports API Integration
// Using multiple free/public APIs as fallbacks

import axios from "axios";
import { SportsFixtureConfig } from "../shared/constants";
import { getBackendBase } from "./download";

// Use the project's unified backend entry point
const getApiBase = () => getBackendBase() + "/api";

// Livescore.com API (public, no key required)
const LIVESCORE_BASE = "https://livescore-api.com/api-client";

// Sofascore API (public)
const SOFASCORE_BASE = "https://api.sofascore.com/api/v1";

// TheSportsDB - Fallback, no key required
const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

// Get team logo from TheSportsDB
export const getTeamLogo = async (teamName: string): Promise<string | null> => {
  try {
    const response = await axios.post(`${getApiBase()}/external`, {
      provider: "thesportsdb",
      endpoint: "/searchteams.php",
      params: { t: teamName }
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

// ESPN Hidden Public APIs
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";
const ESPN_ENDPOINTS = [
  // Football/Soccer
  "/soccer/all/scoreboard",
  "/soccer/usa.1/scoreboard",      // MLS
  "/soccer/eng.1/scoreboard",     // Premier League
  "/soccer/esp.1/scoreboard",     // La Liga
  "/soccer/ger.1/scoreboard",     // Bundesliga
  "/soccer/ita.1/scoreboard",     // Serie A
  "/soccer/fra.1/scoreboard",     // Ligue 1
  "/soccer/uefa.champions/scoreboard", // UCL
  // Basketball
  "/basketball/nba/scoreboard",
  "/basketball/wnba/scoreboard",
  // American sports
  "/football/nfl/scoreboard",
  "/baseball/mlb/scoreboard",
  "/hockey/nhl/scoreboard",
  // Combat
  "/mma/ufc/scoreboard",
  // Motor racing
  "/racing/f1/scoreboard",
  // Tennis
  "/tennis/atp/scoreboard",
  "/tennis/wta/scoreboard",
  // Other
  "/golf/pga/scoreboard",
  "/rugby/union/scoreboard",
];

// Helper to map league names to our league IDs
const getLeagueIdFromName = (leagueName: string): string => {
  if (!leagueName) return "epl";
  const name = leagueName.toLowerCase();
  if (name.includes("premier league") || name.includes("epl")) return "epl";
  if (name.includes("champions league") || name.includes("ucl")) return "ucl";
  if (name.includes("europa league") || name.includes("uel")) return "uel";
  if (name.includes("la liga") || name.includes("laliga")) return "laliga";
  if (name.includes("bundesliga")) return "bundesliga";
  if (name.includes("ligue 1") || name.includes("ligue1")) return "ligue1";
  if (name.includes("serie a") || name.includes("seriea")) return "seriea";
  if (name.includes("eredivisie")) return "eredivisie";
  if (name.includes("mls") || name.includes("major league soccer")) return "mls";
  if (name.includes("afcon") || name.includes("africa cup")) return "afcon";
  if (name.includes("caf champions")) return "caf-cl";
  if (name.includes("libertadores")) return "copa-libertadores";
  if (name.includes("world cup") && name.includes("soccer")) return "world-cup";
  if (name.includes("scottish")) return "scottish-prem";
  if (name.includes("nba") || name.includes("basketball")) return "nba";
  if (name.includes("euroleague")) return "euroleague";
  if (name.includes("wnba")) return "wnba";
  if (name.includes("nfl") || name.includes("american football")) return "nfl";
  if (name.includes("mlb") || name.includes("baseball")) return "mlb";
  if (name.includes("nhl") || name.includes("hockey")) return "nhl";
  if (name.includes("ufc") || name.includes("mma")) return "ufc";
  if (name.includes("bellator")) return "bellator";
  if (name.includes("one championship") || name.includes("one fc")) return "one-championship";
  if (name.includes("boxing") || name.includes("wbc") || name.includes("wbo")) return "boxing";
  if (name.includes("wwe")) return "wwe";
  if (name.includes("formula 1") || name.includes("f1")) return "f1";
  if (name.includes("motogp")) return "motogp";
  if (name.includes("nascar")) return "nascar";
  if (name.includes("ipl") || name.includes("indian premier")) return "ipl";
  if (name.includes("cricket") || name.includes("ashes")) return "the-ashes";
  if (name.includes("wimbledon")) return "wimbledon";
  if (name.includes("australian open")) return "australian-open";
  if (name.includes("roland garros") || name.includes("french open")) return "roland-garros";
  if (name.includes("us open") && name.includes("tennis")) return "us-open-tennis";
  if (name.includes("tennis")) return "wimbledon";
  if (name.includes("pga") || name.includes("golf")) return "pga-tour";
  if (name.includes("masters") && name.includes("golf")) return "the-masters";
  if (name.includes("rugby")) return "rugby-world-cup";
  if (name.includes("six nations")) return "six-nations";
  if (name.includes("cycling") || name.includes("tour de france")) return "tour-de-france";
  if (name.includes("volleyball") || name.includes("fivb")) return "fivb";
  if (name.includes("esport") || name.includes("gaming")) return "esports";
  return "epl"; // Default
};

/**
 * Fetch live data from ESPN's hidden public APIs.
 * No API key required.
 */
export const getESPNScores = async (date?: string): Promise<SportsFixtureConfig[]> => {
  const allFixtures: SportsFixtureConfig[] = [];
  const dateParam = date ? `?dates=${date.replace(/-/g, '')}` : "";

  try {
    const responses = await Promise.allSettled(
      ESPN_ENDPOINTS.map(endpoint =>
        axios.post(`${getApiBase()}/external`, {
          provider: "espn",
          endpoint: `${endpoint}${dateParam}`,
          params: {}
        })
      )
    );

    responses.forEach((res) => {
      // Handle both raw format and wrapped { success, data } envelope
      const events = res.status === 'fulfilled' 
        ? (res.value.data?.events || res.value.data?.data?.events)
        : null;
      if (!events) return;

      events.forEach((event: any) => {
          if (!event.competitions || !event.competitions[0] || !event.competitions[0].competitors) return;
          
          const competitorHome = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
          const competitorAway = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
          if (!competitorHome || !competitorAway) return;
          
          const status = event.status?.type?.name || 'STATUS_SCHEDULED';
          const eventDate = event.date ? new Date(event.date) : null;
          const now = new Date();
          const hoursDiff = eventDate ? (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60) : 0;

          // Include ONLY live and upcoming. Filter out finished or old games.
          const isTooOld = status === 'STATUS_FINAL' || hoursDiff > 4;
          const isCanceled = status === 'STATUS_CANCELED';
          if (isTooOld || isCanceled) return;

          allFixtures.push({
            id: `espn-${event.id}`,
            leagueId: getLeagueIdFromName(event.season?.name || event.competitions[0].notes?.[0]?.headline || "General"),
            leagueName: event.season?.name || "Global Sports",
            homeTeam: competitorHome.team.displayName,
            awayTeam: competitorAway.team.displayName,
            homeTeamLogo: competitorHome.team.logo,
            awayTeamLogo: competitorAway.team.logo,
            status: status.includes('LIVE') || status.includes('IN_PROGRESS') ? "live" : "upcoming",
            isLive: status.includes('LIVE') || status.includes('IN_PROGRESS'),
            homeScore: competitorHome.score ? Number(competitorHome.score) : 0,
            awayScore: competitorAway.score ? Number(competitorAway.score) : 0,
            minute: event.status.displayClock || event.status.type.shortDetail,
            venue: event.competitions[0].venue?.fullName || "Stadium",
            kickoffTimeFormatted: new Date(event.date).toISOString(),
          });
        });
    });

    return allFixtures;
  } catch (error) {
    console.error("ESPN scores fetch error:", error);
    return [];
  }
};

/**
 * BBC Sports & Sky Sports Scraper Logic (Predictive feeds)
 */
export const getBBCNewsScores = async (): Promise<SportsFixtureConfig[]> => {
  // Simulator for BBC news feed
  return []; // Placeholder for real scraping logic if needed since they are heavily protected
};

export const getSkySportsScores = async (): Promise<SportsFixtureConfig[]> => {
  // Simulator for Sky news feed 
  return [];
};

// Get live fixtures directly mapped exclusively from the unified backend
export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    console.log("Fetching live sports from backend aggregator...");
    const response = await axios.get(`${getApiBase()}/sports/live`, { timeout: 15000 });
    if (response.data?.success && Array.isArray(response.data.data)) {
      console.log(`Backend returned ${response.data.data.length} live sports securely.`);
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch backend live sports aggregator:", error);
  }
  return [];
};

// Get upcoming fixtures directly mapped from the unified backend
export const getUpcomingFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    console.log("Fetching upcoming sports from backend aggregator...");
    const response = await axios.get(`${getApiBase()}/sports/upcoming`, { timeout: 20000 });
    if (response.data?.success && Array.isArray(response.data.data)) {
      console.log(`Backend returned ${response.data.data.length} upcoming sports securely.`);
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch backend upcoming sports aggregator:", error);
  }
  return [];
};

// Get live scores for scoreboard
export const getLiveScores = async (): Promise<SportsFixtureConfig[]> => {
  return await getLiveFixturesAPI();
};

// Auto-refresh live scores every 30 seconds (faster updates)
export const subscribeToLiveScores = (
  callback: (fixtures: SportsFixtureConfig[]) => void,
  interval: number = 30000 // 30 seconds
): (() => void) => {
  let isActive = true;

  const fetchAndUpdate = async () => {
    if (!isActive) return;
    const fixtures = await getLiveScores();
    callback(fixtures);
  };

  fetchAndUpdate(); // Initial fetch
  const intervalId = setInterval(fetchAndUpdate, interval);

  return () => {
    isActive = false;
    clearInterval(intervalId);
  };
};

