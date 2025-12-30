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

// Get live fixtures from multiple public sources
export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  const fixtures: SportsFixtureConfig[] = [];

  // Try TheSportsDB first (most reliable, no key needed)
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replaceAll('-', '/');

    const response = await axios.get(`${SPORTSDB_BASE}/eventsday.php`, {
      params: { d: dateStr },
      timeout: 8000,
    });

    if (response.data?.events && Array.isArray(response.data.events)) {
      const liveEvents = response.data.events.filter((e: any) =>
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

  // Try TheSportsDB first
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

