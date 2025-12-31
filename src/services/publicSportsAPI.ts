// Public Sports API Integration
// Using multiple free/public APIs as fallbacks

import axios from "axios";
import { SportsFixtureConfig } from "../shared/constants";



// Sofascore API (public)
const SOFASCORE_BASE = "https://api.sofascore.com/api/v1";

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

// Helper to map league names to our league IDs
const getLeagueIdFromName = (leagueName: string): string => {
  const name = leagueName.toLowerCase();

  // Soccer
  if (name.includes("premier league") || name.includes("eng.1")) return "epl";
  if (name.includes("champions league") || name.includes("ucl")) return "ucl";
  if (name.includes("la liga") || name.includes("esp.1")) return "laliga";
  if (name.includes("ligue 1") || name.includes("fra.1")) return "ligue1";
  if (name.includes("serie a") || name.includes("ita.1")) return "seriea";
  if (name.includes("bundesliga") || name.includes("ger.1")) return "bundesliga";
  if (name.includes("afcon") || name.includes("africa cup")) return "afcon";

  // Basketball
  if (name.includes("nba")) return "nba";

  // American Football
  if (name.includes("nfl")) return "nfl";

  // Baseball
  if (name.includes("mlb")) return "mlb";

  // Hockey
  if (name.includes("nhl")) return "nhl";

  // Motorsport
  if (name.includes("f1") || name.includes("formula 1")) return "f1";

  // Combat Sports
  if (name.includes("ufc") || name.includes("mma")) return "ufc";
  if (name.includes("wwe") || name.includes("wrestling")) return "wwe";

  // Tennis
  if (name.includes("atp")) return "atp";
  if (name.includes("wta")) return "wta";

  // Others
  if (name.includes("rugby")) return "rugby-world-cup";

  return "other"; // Default
};

// ESPN API Endpoints (Public & Reliable)
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";
const ESPN_LEAGUES = [
  // Soccer
  { id: "eng.1", path: "soccer/eng.1", name: "Premier League" },
  { id: "esp.1", path: "soccer/esp.1", name: "La Liga" },
  { id: "ita.1", path: "soccer/ita.1", name: "Serie A" },
  { id: "fra.1", path: "soccer/fra.1", name: "Ligue 1" },
  { id: "ger.1", path: "soccer/ger.1", name: "Bundesliga" },
  { id: "uefa.champions", path: "soccer/uefa.champions", name: "Champions League" },

  // Major US Sports
  { id: "nba", path: "basketball/nba", name: "NBA" },
  { id: "nfl", path: "football/nfl", name: "NFL" },
  { id: "mlb", path: "baseball/mlb", name: "MLB" },
  { id: "nhl", path: "hockey/nhl", name: "NHL" },

  // Motorsport & Combat
  { id: "f1", path: "racing/f1", name: "Formula 1" },
  { id: "ufc", path: "mma/ufc", name: "UFC" },

  // Tennis
  { id: "atp", path: "tennis/atp", name: "ATP Tennis" },
  { id: "wta", path: "tennis/wta", name: "WTA Tennis" }
];

// Helper to normalized ESPN status to our status
const getStatusFromESPN = (status: any): "live" | "upcoming" | "replay" => {
  const type = status?.type?.name; // STATUS_SCHEDULED, STATUS_IN_PROGRESS, STATUS_FINAL
  if (type === "STATUS_IN_PROGRESS" || type === "STATUS_HALFTIME") return "live";
  if (type === "STATUS_SCHEDULED") return "upcoming";
  if (type === "STATUS_FINAL") return "replay";
  return "upcoming";
};

// Get live fixtures from ESPN
export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  const fixtures: SportsFixtureConfig[] = [];

  try {
    const promises = ESPN_LEAGUES.map(league =>
      axios.get(`${ESPN_BASE}/${league.path}/scoreboard`, { timeout: 5000 }).catch(e => null)
    );

    const results = await Promise.all(promises);

    for (const res of results) {
      if (res?.data?.events) {
        const events = res.data.events;
        for (const event of events) {
          const status = getStatusFromESPN(event.status);
          if (status === "live") {
            const competition = event.competitions?.[0];
            const competitors = competition?.competitors || [];
            const home = competitors.find((c: any) => c.homeAway === "home");
            const away = competitors.find((c: any) => c.homeAway === "away");

            if (home && away) {
              fixtures.push({
                id: `espn-${event.id}`,
                leagueId: getLeagueIdFromName(res.data.leagues?.[0]?.name || event.season?.slug || "unknown"),
                homeTeam: home.team.displayName,
                awayTeam: away.team.displayName,
                homeTeamLogo: home.team.logo,
                awayTeamLogo: away.team.logo,
                status: "live",
                kickoffTimeFormatted: "Live Now",
                venue: competition.venue?.fullName || "TBD",
                homeScore: parseInt(home.score || "0"),
                awayScore: parseInt(away.score || "0"),
                minute: event.status.displayClock || event.status.type.detail,
                isLive: true,
                matchId: event.id
              });
            }
          }
        }
      }
    }

    if (fixtures.length > 0) {
      console.log(`ESPN returned ${fixtures.length} live games.`);
      return fixtures;
    }
  } catch (error) {
    console.error("ESPN API Error:", error);
  }

  // Fallback to TheSportsDB (existing logic reduced)
  // ... (keeping minimal fallback if needed, but ESPN is usually enough. I'll omit simpler logic to keep it clean for now or leave it if simple)

  return fixtures;
};


// Get upcoming fixtures from multiple public sources
export const getUpcomingFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  const allFixtures: SportsFixtureConfig[] = [];

  // Try ESPN first (Reliable)
  try {
    const promises = ESPN_LEAGUES.map(league =>
      axios.get(`${ESPN_BASE}/${league.path}/scoreboard`, { timeout: 5000 }).catch(e => null)
    );

    const results = await Promise.all(promises);

    for (const res of results) {
      if (res?.data?.events) {
        const events = res.data.events;
        for (const event of events) {
          const status = getStatusFromESPN(event.status);
          if (status === "upcoming") {
            const competition = event.competitions?.[0];
            const competitors = competition?.competitors || [];
            const home = competitors.find((c: any) => c.homeAway === "home");
            const away = competitors.find((c: any) => c.homeAway === "away");

            if (home && away) {
              allFixtures.push({
                id: `espn-up-${event.id}`,
                leagueId: getLeagueIdFromName(res.data.leagues?.[0]?.name || event.season?.slug || "unknown"),
                homeTeam: home.team.displayName,
                awayTeam: away.team.displayName,
                homeTeamLogo: home.team.logo,
                awayTeamLogo: away.team.logo,
                status: "upcoming",
                kickoffTimeFormatted: event.date, // ISO string
                venue: competition.venue?.fullName || "TBD",
                matchId: event.id
              });
            }
          }
        }
      }
    }

    if (allFixtures.length > 0) {
      console.log(`ESPN returned ${allFixtures.length} upcoming games.`);
      return allFixtures.slice(0, 50);
    }
  } catch (error) {
    console.error("ESPN Upcoming Error:", error);
  }

  // Try TheSportsDB next
  try {
    const leagueIds = ["4328", "4480", "4335", "4332", "4334", "4422"]; // EPL, UCL, LaLiga, Serie A, Ligue 1, AFCON

    // Fetch next events for each major league in parallel
    const leaguePromises = leagueIds.map(id =>
      axios.get(`${SPORTSDB_BASE}/eventsnextleague.php`, { params: { id }, timeout: 8000 }).catch(() => null)
    );

    // Also fetch by days as before
    const datePromises = [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replaceAll('-', '/');
      return axios.get(`${SPORTSDB_BASE}/eventsday.php`, { params: { d: dateStr }, timeout: 8000 }).catch(() => null);
    });

    const results = await Promise.all([...leaguePromises, ...datePromises]);

    for (const res of results) {
      if (res?.data?.events && Array.isArray(res.data.events)) {
        const events = res.data.events.filter((e: any) =>
          e.strStatus !== "Live" &&
          !["HT", "1H", "2H", "FT", "Finished"].includes(e.strStatus)
        );

        for (const event of events) {
          try {
            const eventDate = new Date((event.dateEvent || "") + " " + (event.strTime || "12:00"));
            const isoString = isNaN(eventDate.getTime()) ? new Date().toISOString() : eventDate.toISOString();

            allFixtures.push({
              id: `upcoming-${event.idEvent || Math.random()}`,
              leagueId: getLeagueIdFromName(event.strLeague || ""),
              homeTeam: event.strHomeTeam || "TBD",
              awayTeam: event.strAwayTeam || "TBD",
              homeTeamLogo: event.strHomeTeamBadge || undefined, // Some responses have badges directly
              awayTeamLogo: event.strAwayTeamBadge || undefined,
              status: "upcoming",
              kickoffTimeFormatted: isoString,
              venue: event.strVenue || "TBD",
              round: event.strRound || undefined,
              matchId: event.idEvent?.toString(),
              thumb: event.strThumb,
              banner: event.strBanner,
              fanart: event.strFanart,
            });
          } catch (e) {
            continue;
          }
        }
      }
    }

    // Attempt to fill missing logos for top items
    const unique = allFixtures.filter((fixture, index, self) =>
      index === self.findIndex((f) => f.id === fixture.id)
    ).sort((a, b) => new Date(a.kickoffTimeFormatted).getTime() - new Date(b.kickoffTimeFormatted).getTime());

    if (unique.length > 0) {
      // Lazy logo fetching for top 10 if missing
      for (const f of unique.slice(0, 10)) {
        if (!f.homeTeamLogo) f.homeTeamLogo = await getTeamLogo(f.homeTeam) || undefined;
        if (!f.awayTeamLogo) f.awayTeamLogo = await getTeamLogo(f.awayTeam) || undefined;
      }
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

