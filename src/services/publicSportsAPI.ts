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

          // Include: live, upcoming, or recently finished (within 72 hours)
          const isTooOld = status === 'STATUS_FINAL' && hoursDiff > 72;
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

// Get live fixtures from multiple public sources
export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  const fixtures: SportsFixtureConfig[] = [];

  // Parallel fetch from all news sources
  const newsResults = await Promise.allSettled([
    getESPNScores(),
    getBBCNewsScores(),
    getSkySportsScores(),
  ]);

  newsResults.forEach(res => {
    if (res.status === 'fulfilled') fixtures.push(...res.value);
  });

  if (fixtures.length > 5) return fixtures;

  // Try TheSportsDB first (most reliable, no key needed)
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replaceAll('-', '/');

    const response = await axios.post(`${getApiBase()}/external`, {
      provider: "thesportsdb",
      endpoint: "/eventsday.php",
      params: { d: dateStr }
    });

    // Handle both raw format { events } and wrapped format { success, data: { events } }
    const eventsData = response.data?.events || response.data?.data?.events;
    if (eventsData && Array.isArray(eventsData)) {
      const liveEvents = eventsData.filter((e: any) =>
        e.strStatus === "Live" || e.strStatus === "HT" || e.strStatus === "1H" || e.strStatus === "2H" ||
        e.strStatus === "Half Time" || e.strStatus === "Second Half"
      );

      // Process up to 30 live events
      const eventsToProcess = liveEvents.slice(0, 30);

      for (const event of eventsToProcess) {
        try {
          const [homeLogo, awayLogo] = await Promise.all([
            getTeamLogo(event.strHomeTeam || ""),
            getTeamLogo(event.strAwayTeam || ""),
          ]);

          fixtures.push({
            id: `live-${event.idEvent || Math.random()}`,
            leagueId: getLeagueIdFromName(event.strLeague || ""),
            homeTeam: event.strHomeTeam || "TBD",
            awayTeam: event.strAwayTeam || "TBD",
            homeTeamLogo: homeLogo || undefined,
            awayTeamLogo: awayLogo || undefined,
            status: "live",
            kickoffTimeFormatted: "Live Now",
            venue: event.strVenue || "TBD",
            homeScore: event.intHomeScore ? Number.parseInt(String(event.intHomeScore)) : undefined,
            awayScore: event.intAwayScore ? Number.parseInt(String(event.intAwayScore)) : undefined,
            minute: event.strTime || event.strStatus || "Live",
            isLive: true,
            matchId: event.idEvent?.toString(), // Store match ID for sportslive.run link
          });
        } catch (e) {
          continue;
        }
      }

      if (fixtures.length > 0) {
        console.log(`TheSportsDB returned ${fixtures.length} live fixtures`);
        return fixtures;
      }
    }
  } catch (error) {
    console.log("TheSportsDB error:", error);
  }

  // Try Sofascore as fallback
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`${SOFASCORE_BASE}/sport/football/scheduled-events/${today}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 8000,
    });

    if (response.data?.events && Array.isArray(response.data.events)) {
      const liveEvents = response.data.events.filter((e: any) =>
        e.status?.type === "inprogress" || e.status?.type === "live"
      );

      for (const event of liveEvents.slice(0, 20)) {
        try {
          fixtures.push({
            id: `live-${event.id || Math.random()}`,
            leagueId: getLeagueIdFromName(event.tournament?.name || ""),
            homeTeam: event.homeTeam?.name || "TBD",
            awayTeam: event.awayTeam?.name || "TBD",
            homeTeamLogo: event.homeTeam?.logoUrl || undefined,
            awayTeamLogo: event.awayTeam?.logoUrl || undefined,
            status: "live",
            kickoffTimeFormatted: "Live Now",
            venue: event.venue?.name || "TBD",
            homeScore: event.homeScore?.current || undefined,
            awayScore: event.awayScore?.current || undefined,
            minute: event.status?.description || "Live",
            isLive: true,
            matchId: event.id?.toString(),
          });
        } catch (e) {
          continue;
        }
      }

      if (fixtures.length > 0) {
        console.log(`Sofascore returned ${fixtures.length} live fixtures`);
        return fixtures;
      }
    }
  } catch (error) {
    console.log("Sofascore error:", error);
  }

  return fixtures;
};

// Get upcoming fixtures from multiple public sources
export const getUpcomingFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  const allFixtures: SportsFixtureConfig[] = [];

  // Try ESPN first for upcoming matches (it provides better metadata)
  try {
    const dates: string[] = [];
    for (let i = 0; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const espnResults = await Promise.allSettled(
      dates.map(date => getESPNScores(date))
    );

    espnResults.forEach(res => {
      if (res.status === 'fulfilled') {
        allFixtures.push(...res.value);
      }
    });
  } catch (error) {
    console.warn("ESPN upcoming error:", error);
  }

  // Try TheSportsDB as fallback
  try {
    const dates: string[] = [];
    for (let i = 0; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0].replaceAll('-', '/'));
    }

    for (const dateStr of dates.slice(0, 3)) {
      try {
        const response = await axios.get(`${SPORTSDB_BASE}/eventsday.php`, {
          params: { d: dateStr },
          timeout: 8000,
        });

        // Handle both raw format { events } and wrapped format { success, data: { events } }
        const eventsData = response.data?.events || response.data?.data?.events;
        if (eventsData && Array.isArray(eventsData)) {
          const upcomingEvents = eventsData.filter((e: any) =>
            e.strStatus !== "Live" &&
            e.strStatus !== "HT" &&
            e.strStatus !== "1H" &&
            e.strStatus !== "2H" &&
            e.strStatus !== "FT" &&
            e.strStatus !== "Finished"
          );

          for (const event of upcomingEvents.slice(0, 15)) {
            try {
              const [homeLogo, awayLogo] = await Promise.all([
                getTeamLogo(event.strHomeTeam || ""),
                getTeamLogo(event.strAwayTeam || ""),
              ]);

              const eventDate = new Date((event.dateEvent || dateStr.replaceAll('/', '-')) + " " + (event.strTime || "12:00"));
              const isoString = eventDate.toISOString();

              allFixtures.push({
                id: `upcoming-${event.idEvent || Math.random()}`,
                leagueId: getLeagueIdFromName(event.strLeague || ""),
                homeTeam: event.strHomeTeam || "TBD",
                awayTeam: event.strAwayTeam || "TBD",
                homeTeamLogo: homeLogo || undefined,
                awayTeamLogo: awayLogo || undefined,
                status: "upcoming",
                kickoffTimeFormatted: isoString, // Store ISO string for countdown
                venue: event.strVenue || "TBD",
                round: event.strRound || undefined,
                matchId: event.idEvent?.toString(),
              });
            } catch (e) {
              continue;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Remove duplicates
    const unique = allFixtures.filter((fixture, index, self) =>
      index === self.findIndex((f) => f.id === fixture.id)
    );

    if (unique.length > 0) {
      console.log(`TheSportsDB returned ${unique.length} upcoming fixtures`);
      return unique.slice(0, 50);
    }
  } catch (error) {
    console.log("TheSportsDB upcoming fixtures error:", error);
  }

  // Try Sofascore as fallback
  try {
    const dates: string[] = [];
    for (let i = 0; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    for (const dateStr of dates) {
      try {
        const response = await axios.get(`${SOFASCORE_BASE}/sport/football/scheduled-events/${dateStr}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 8000,
        });

        if (response.data?.events && Array.isArray(response.data.events)) {
          const upcomingEvents = response.data.events.filter((e: any) =>
            e.status?.type !== "finished" && e.status?.type !== "inprogress"
          );

          for (const event of upcomingEvents.slice(0, 10)) {
            try {
              const eventDate = new Date(event.startTimestamp * 1000);
              const isoString = eventDate.toISOString();

              allFixtures.push({
                id: `upcoming-${event.id || Math.random()}`,
                leagueId: getLeagueIdFromName(event.tournament?.name || ""),
                homeTeam: event.homeTeam?.name || "TBD",
                awayTeam: event.awayTeam?.name || "TBD",
                homeTeamLogo: event.homeTeam?.logoUrl || undefined,
                awayTeamLogo: event.awayTeam?.logoUrl || undefined,
                status: "upcoming",
                kickoffTimeFormatted: isoString,
                venue: event.venue?.name || "TBD",
                matchId: event.id?.toString(),
              });
            } catch (e) {
              continue;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }

    const unique = allFixtures.filter((fixture, index, self) =>
      index === self.findIndex((f) => f.id === fixture.id)
    );

    if (unique.length > 0) {
      console.log(`Sofascore returned ${unique.length} upcoming fixtures`);
      return unique.slice(0, 50);
    }
  } catch (error) {
    console.log("Sofascore upcoming fixtures error:", error);
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

