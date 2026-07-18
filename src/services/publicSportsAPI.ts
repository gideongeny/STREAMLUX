// Public Sports API Integration
// Using multiple free/public APIs as fallbacks

import axios from "../shared/axios";
import { SportsFixtureConfig } from "../shared/constants";
import { unwrapGatewayList } from "../shared/gatewayResponse";
import {
  enrichFixturesCovers,
  fetchStreamedPkLive,
  fetchStreamedPkUpcoming,
  fetchTickerStyleEspnFixtures,
} from "./sportsLiveFeeds";

// Gateway base is already /api on axios instance — do NOT prefix /api again
const sportsPath = (kind: "live" | "upcoming") => `/sports/${kind}`;

// Livescore.com API (public, no key required)
const LIVESCORE_BASE = "https://livescore-api.com/api-client";

// Sofascore API (public)
const SOFASCORE_BASE = "https://api.sofascore.com/api/v1";

// TheSportsDB - Fallback, no key required
const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

// Get team logo from TheSportsDB
export const getTeamLogo = async (teamName: string): Promise<string | null> => {
  try {
    const response = await axios.post(`/external`, {
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
  // Major Soccer Leagues (Prioritized)
  "/soccer/eng.1/scoreboard",     // Premier League
  "/soccer/esp.1/scoreboard",     // La Liga
  "/soccer/uefa.champions/scoreboard", // UCL
  "/soccer/all/scoreboard",        // Fallback for others
  // Basketball (Top only)
  "/basketball/nba/scoreboard",
  // Other major sports
  "/football/nfl/scoreboard",
  "/racing/f1/scoreboard",
  "/mma/ufc/scoreboard",
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
        axios.post(`/external`, {
          provider: "espn",
          url: `https://site.api.espn.com/apis/site/v2/sports${endpoint}${dateParam}`,
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
          const isTooOld = (status === 'STATUS_FINAL' && hoursDiff > 2) || (status !== 'STATUS_FINAL' && hoursDiff > 6);
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

    if (allFixtures.length > 0) return allFixtures;
  } catch (error) {
    console.error("ESPN scores fetch error:", error);
  }

  // Gateway often 503 on Firebase — fall back to direct ESPN public API from the browser
  const [live, upcoming] = await Promise.all([
    fetchTickerStyleEspnFixtures(true),
    fetchTickerStyleEspnFixtures(false),
  ]);
  return deduplicateMatches([...live, ...upcoming]);
};

// Helper to deduplicate matches by fuzzy team name matching
const deduplicateMatches = (matches: SportsFixtureConfig[]): SportsFixtureConfig[] => {
  const seen = new Set<string>();
  const unique: SportsFixtureConfig[] = [];

  matches.forEach(m => {
    // Generate a normalized key: "team1-team2" sorted alphabetically
    const t1 = (m.homeTeam || "").toLowerCase().trim();
    const t2 = (m.awayTeam || "").toLowerCase().trim();
    
    // Use first 5 letters of each team to handle variations like "Man Utd" vs "Manchester United"
    const k1 = t1.substring(0, 5);
    const k2 = t2.substring(0, 5);
    const key = [k1, k2].sort().join('|');

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(m);
    } else {
      // If we find a duplicate, prefer the one with a streamUrl or score
      const existingIdx = unique.findIndex(ex => {
          const ext1 = (ex.homeTeam || "").toLowerCase().trim().substring(0, 5);
          const ext2 = (ex.awayTeam || "").toLowerCase().trim().substring(0, 5);
          return [ext1, ext2].sort().join('|') === key;
      });
      if (existingIdx !== -1) {
          const existing = unique[existingIdx];
          // If the new match has a stream and the old one doesn't, swap them
          if (m.streamUrl && !existing.streamUrl) {
              unique[existingIdx] = m;
          } else if (m.isLive && !existing.isLive) {
              unique[existingIdx] = m;
          }
      }
    }
  });

  return unique;
};

// Get live fixtures directly mapped exclusively from the unified backend
export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const { getSofaScoreLive } = await import("./sofascoreAPI");
    const { getWatchFootyLive } = await import("./watchfootyAPI");
    
    const [backendRes, sofaScores, wfScores, espnLive, streamedLive, tickerLive] = await Promise.allSettled([
      axios.get(sportsPath("live"), { timeout: 15000 }),
      getSofaScoreLive(),
      getWatchFootyLive(),
      getESPNScores(),
      fetchStreamedPkLive(),
      fetchTickerStyleEspnFixtures(true),
    ]);

    let fixtures: SportsFixtureConfig[] = [];

    // Direct sources first — work when Firebase /api is 503
    if (streamedLive.status === "fulfilled") fixtures.push(...streamedLive.value);
    if (tickerLive.status === "fulfilled") fixtures.push(...tickerLive.value);
    
    // 1. Collect from all sources (axios may unwrap { success, data } → array)
    if (backendRes.status === 'fulfilled') {
      fixtures.push(...unwrapGatewayList<SportsFixtureConfig>(backendRes.value.data));
    }
    if (sofaScores.status === 'fulfilled') {
      fixtures.push(...sofaScores.value);
    }
    if (wfScores.status === 'fulfilled') {
      fixtures.push(...wfScores.value);
    }

    // 2. Filter out finished matches aggressively
    const now = Date.now();
    const activeFixtures = fixtures.filter(f => {
        const status = (f.status || "").toLowerCase();
        const minute = (f.minute || "").toLowerCase();
        
        // Exclude clear "finished" statuses
        if (status.includes('final') || status.includes('finish') || minute === 'ft' || minute === '90' || status === 'ft') {
            return false;
        }

        if (f.isLive) return true;

        // If not live and has scores > 0, and kickoff was long ago, it's finished
        if (f.homeScore !== undefined && f.awayScore !== undefined && (f.homeScore > 0 || f.awayScore > 0)) {
            if (f.kickoffTimeFormatted) {
                const kickoff = new Date(f.kickoffTimeFormatted).getTime();
                // If it started more than 130 mins ago and it's not live, it's done
                if (kickoff < now - (130 * 60000)) return false;
            }
        }
        return true;
    });

    // 3. Deduplicate
    const unique = deduplicateMatches(activeFixtures);
    
    // Final check for "played" matches using current time
    let finalFixtures = unique.filter(f => {
        if (!f.isLive && f.kickoffTimeFormatted) {
            const kickoff = new Date(f.kickoffTimeFormatted).getTime();
            // If the match should have started but isn't marked as live by any provider, and it's old, hide it
            if (kickoff < now - (180 * 60000)) return false;
        }
        return true;
    });

    if (espnLive.status === 'fulfilled' && espnLive.value.length > 0) {
      finalFixtures.push(...espnLive.value.filter(f => f.isLive));
      finalFixtures = deduplicateMatches(finalFixtures);
    }
    if (finalFixtures.length === 0) {
      finalFixtures = (await getESPNScores()).filter(f => f.isLive);
    }

    finalFixtures = enrichFixturesCovers(deduplicateMatches(finalFixtures));

    return finalFixtures;
  } catch (error) {
    console.error("Failed to fetch backend live sports aggregator:", error);
  }
  return [];
};

// Get upcoming fixtures directly mapped from the unified backend
export const getUpcomingFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const { getSofaScoreScheduled } = await import("./sofascoreAPI");
    const { getWatchFootyScheduled } = await import("./watchfootyAPI");

    const [backendRes, sofaUpcoming, wfUpcoming, espnAll, streamedUpcoming, tickerUpcoming] = await Promise.allSettled([
      axios.get(sportsPath("upcoming"), { timeout: 20000 }),
      getSofaScoreScheduled(),
      getWatchFootyScheduled(),
      getESPNScores(),
      fetchStreamedPkUpcoming(),
      fetchTickerStyleEspnFixtures(false),
    ]);

    let fixtures: SportsFixtureConfig[] = [];
    if (streamedUpcoming.status === "fulfilled") fixtures.push(...streamedUpcoming.value);
    if (tickerUpcoming.status === "fulfilled") fixtures.push(...tickerUpcoming.value);
    if (backendRes.status === 'fulfilled') {
      fixtures.push(...unwrapGatewayList<SportsFixtureConfig>(backendRes.value.data));
    }
    if (sofaUpcoming.status === 'fulfilled') {
      fixtures.push(...sofaUpcoming.value);
    }
    if (wfUpcoming.status === 'fulfilled') {
      fixtures.push(...wfUpcoming.value);
    }

    // Filter out matches that are actually in the past
    const now = Date.now();
    const upcoming = fixtures.filter(f => {
        if (f.kickoffTimeFormatted) {
            const kickoff = new Date(f.kickoffTimeFormatted).getTime();
            return kickoff > now - (10 * 60000); // Allow 10 mins after kickoff
        }
        return true;
    });

    let finalUpcoming = deduplicateMatches(upcoming);
    if (espnAll.status === 'fulfilled' && espnAll.value.length > 0) {
      finalUpcoming.push(...espnAll.value.filter(f => !f.isLive));
      finalUpcoming = deduplicateMatches(finalUpcoming);
    }
    if (finalUpcoming.length === 0) {
        finalUpcoming = (await getESPNScores()).filter(f => !f.isLive);
    }

    return enrichFixturesCovers(deduplicateMatches(finalUpcoming));
  } catch (error) {
    console.error("Failed to fetch backend upcoming sports aggregator:", error);
  }
  return [];
};

// Get live scores for scoreboard
export const getLiveScores = async (): Promise<SportsFixtureConfig[]> => {
  try {
    const { getWatchFootyFixtures } = await import('./watchfootyAPI');
    return await getWatchFootyFixtures();
  } catch {
    return [];
  }
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

