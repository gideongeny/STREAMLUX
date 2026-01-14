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

// Get live fixtures - DISABLED TEMPORARILY to prevent website crashes
export const getLiveFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  // Temporarily disabled - returns empty array to prevent website crashes
  // TODO: Re-enable once API stability issues are resolved
  console.warn("Sports API temporarily disabled to prevent website crashes");
  return [];
  
  /* DISABLED CODE - Re-enable when API is stable
  // Try public APIs first (TheSportsDB, Sofascore)
  const publicFixtures = await getLiveFixturesPublic();
  if (publicFixtures.length > 0) {
    return publicFixtures;
  }

  // Fallback to API Sports if public APIs fail
  return await getLiveFixturesAPISports();
  */
};

// Get live fixtures from API Sports (fallback)
const getLiveFixturesAPISports = async (): Promise<SportsFixtureConfig[]> => {
  try {
    // Try API Sports first - using correct endpoint and header format
    // Use feature detection for AbortController (older browsers)
    const hasAbortController = typeof AbortController !== 'undefined';
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (hasAbortController) {
      controller = new AbortController();
      timeoutId = setTimeout(() => controller!.abort(), 8000); // 8 second timeout
    }
    
    const response = await axios.get(`${API_SPORTS_BASE}/fixtures`, {
      params: { live: "all" },
      headers: {
        "x-apisports-key": API_SPORTS_KEY,
      },
      timeout: 8000,
      ...(controller && { signal: controller.signal }),
    });
    
    if (timeoutId) clearTimeout(timeoutId);

    console.log("API Sports live fixtures response:", response.data);

    if (response.data?.response && Array.isArray(response.data.response) && response.data.response.length > 0) {
      const fixtures = response.data.response.map((fixture: any) => ({
        id: `live-${fixture.fixture.id}`,
        leagueId: getLeagueIdFromName(fixture.league.name),
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeTeamLogo: fixture.teams.home.logo,
        awayTeamLogo: fixture.teams.away.logo,
        status: "live" as const,
        kickoffTimeFormatted: "Live Now",
        venue: fixture.fixture.venue?.name || "TBD",
        homeScore: fixture.goals?.home ?? undefined,
        awayScore: fixture.goals?.away ?? undefined,
        minute: fixture.fixture.status?.elapsed ? `${fixture.fixture.status.elapsed}'` : undefined,
        isLive: true,
      }));
      
      console.log(`API Sports returned ${fixtures.length} live fixtures`);
      return fixtures;
    } else {
      console.warn("API Sports returned empty or invalid response");
    }
  } catch (error: any) {
    // Silent fail - don't log errors that might break iPhone rendering
    if (error?.name === 'AbortError' || error?.code === 'ECONNABORTED') {
      console.log("API Sports request timeout");
    } else {
      console.log("API Sports error:", error?.message || "Unknown error");
    }
    // Return empty array instead of throwing
    return [];
  }

  // Fallback to TheSportsDB
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replaceAll('-', '/');
    
    const response = await axios.get(`${SPORTSDB_BASE}/eventsday.php`, {
      params: { d: dateStr },
      timeout: 10000,
    });

    if (response.data?.events && Array.isArray(response.data.events)) {
      const liveEvents = response.data.events.filter((e: any) => 
        e.strStatus === "Live" || e.strStatus === "HT" || e.strStatus === "1H" || e.strStatus === "2H" ||
        e.strStatus === "Half Time" || e.strStatus === "Second Half"
      );

      const fixtures: SportsFixtureConfig[] = [];
      // Process up to 20 live events
      const eventsToProcess = liveEvents.slice(0, 20);
      
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
          });
        } catch (e) {
          // Skip this event if there's an error
          continue;
        }
      }
      
      if (fixtures.length > 0) {
        return fixtures;
      }
    }
  } catch (error) {
    console.warn("TheSportsDB error:", error);
  }

  // If no live events found, return empty array (will use static data)
  return [];
};

// Get upcoming fixtures - DISABLED TEMPORARILY to prevent website crashes
export const getUpcomingFixturesAPI = async (): Promise<SportsFixtureConfig[]> => {
  // Temporarily disabled - returns empty array to prevent website crashes
  // TODO: Re-enable once API stability issues are resolved
  console.warn("Sports API temporarily disabled to prevent website crashes");
  return [];
  
  /* DISABLED CODE - Re-enable when API is stable
  // Try public APIs first (TheSportsDB, Sofascore)
  const publicFixtures = await getUpcomingFixturesPublic();
  if (publicFixtures.length > 0) {
    return publicFixtures;
  }

  // Fallback to API Sports if public APIs fail
  return await getUpcomingFixturesAPISports();
  */
};

// Get upcoming fixtures from API Sports (fallback)
const getUpcomingFixturesAPISports = async (): Promise<SportsFixtureConfig[]> => {
  try {
    // Get today and next 7 days
    const dates: string[] = [];
    for (let i = 0; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const allFixtures: SportsFixtureConfig[] = [];
    
    // Fetch from API Sports for each date (limit to first 2 dates for older devices)
    // Use feature detection for AbortController
    const hasAbortController = typeof AbortController !== 'undefined';
    
    for (const dateStr of dates.slice(0, 2)) {
      try {
        let controller: AbortController | null = null;
        let timeoutId: NodeJS.Timeout | null = null;
        
        if (hasAbortController) {
          controller = new AbortController();
          timeoutId = setTimeout(() => controller!.abort(), 8000);
        }
        
        const response = await axios.get(`${API_SPORTS_BASE}/fixtures`, {
          params: { date: dateStr },
          headers: {
            "x-apisports-key": API_SPORTS_KEY,
          },
          timeout: 8000,
          ...(controller && { signal: controller.signal }),
        });
        
        if (timeoutId) clearTimeout(timeoutId);

        if (response.data?.response && Array.isArray(response.data.response)) {
          // Filter for upcoming events (not live, not finished)
          const upcomingEvents = response.data.response.filter((fixture: any) => {
            const status = fixture.fixture.status?.short;
            return status !== "LIVE" && status !== "FT" && status !== "AET" && status !== "PEN" && status !== "CANC";
          });

          for (const fixture of upcomingEvents.slice(0, 15)) {
            try {
              const eventDate = new Date(fixture.fixture.date);
              // Store ISO string for countdown calculation
              const isoString = eventDate.toISOString();

              allFixtures.push({
                id: `upcoming-${fixture.fixture.id}`,
                leagueId: getLeagueIdFromName(fixture.league.name),
                homeTeam: fixture.teams.home.name,
                awayTeam: fixture.teams.away.name,
                homeTeamLogo: fixture.teams.home.logo,
                awayTeamLogo: fixture.teams.away.logo,
                status: "upcoming" as const,
                kickoffTimeFormatted: isoString, // Store ISO string for countdown
                venue: fixture.fixture.venue?.name || "TBD",
                round: fixture.league.round || undefined,
              });
            } catch (e) {
              continue;
            }
          }
        }
      } catch (e: any) {
        // Silent fail - don't log errors that might break iPhone
        if (e?.name !== 'AbortError' && e?.code !== 'ECONNABORTED') {
          console.log(`Error fetching fixtures for ${dateStr}`);
        }
        continue;
      }
    }
    
    // Remove duplicates
    const unique = allFixtures.filter((fixture, index, self) =>
      index === self.findIndex((f) => f.id === fixture.id)
    );
    
    return unique.slice(0, 50); // Limit to 50
  } catch (error: any) {
    // Return empty array instead of throwing
    console.log("Error fetching upcoming fixtures from API Sports");
    return [];
  }

  // Fallback to TheSportsDB
  try {
    const dates: string[] = [];
    for (let i = 0; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0].replaceAll('-', '/'));
    }

    const allFixtures: SportsFixtureConfig[] = [];
    
    for (const dateStr of dates) {
      try {
        const response = await axios.get(`${SPORTSDB_BASE}/eventsday.php`, {
          params: { d: dateStr },
          timeout: 10000,
        });

        if (response.data?.events && Array.isArray(response.data.events)) {
          const upcomingEvents = response.data.events.filter((e: any) => 
            e.strStatus !== "Live" && 
            e.strStatus !== "HT" && 
            e.strStatus !== "1H" && 
            e.strStatus !== "2H" &&
            e.strStatus !== "FT" &&
            e.strStatus !== "Finished"
          );

          for (const event of upcomingEvents.slice(0, 10)) {
            try {
              const [homeLogo, awayLogo] = await Promise.all([
                getTeamLogo(event.strHomeTeam || ""),
                getTeamLogo(event.strAwayTeam || ""),
              ]);

              const eventDate = new Date((event.dateEvent || dateStr.replaceAll('/', '-')) + " " + (event.strTime || "12:00"));
              const formattedTime = eventDate.toLocaleString('en-US', {
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              allFixtures.push({
                id: `upcoming-${event.idEvent || Math.random()}`,
                leagueId: getLeagueIdFromName(event.strLeague || ""),
                homeTeam: event.strHomeTeam || "TBD",
                awayTeam: event.strAwayTeam || "TBD",
                homeTeamLogo: homeLogo || undefined,
                awayTeamLogo: awayLogo || undefined,
                status: "upcoming",
                kickoffTimeFormatted: formattedTime,
                venue: event.strVenue || "TBD",
                round: event.strRound || undefined,
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
    
    return unique.slice(0, 30);
  } catch (error) {
    console.warn("Error fetching upcoming fixtures from TheSportsDB:", error);
  }

  return [];
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

// Get live scores for scoreboard - use public APIs
export const getLiveScores = async (): Promise<SportsFixtureConfig[]> => {
  // Temporarily disabled - returns empty array to prevent website crashes
  // TODO: Re-enable once API stability issues are resolved
  console.warn("Sports API temporarily disabled to prevent website crashes");
  return [];
  
  /* DISABLED CODE - Re-enable when API is stable
  return await getLiveScoresPublic();
  */
};

// Auto-refresh live scores every 30 seconds (faster updates) - DISABLED TEMPORARILY
export const subscribeToLiveScores = (
  callback: (fixtures: SportsFixtureConfig[]) => void,
  interval: number = 30000 // 30 seconds for faster updates
): (() => void) => {
  // Temporarily disabled - returns no-op unsubscribe function
  // TODO: Re-enable once API stability issues are resolved
  console.warn("Sports API temporarily disabled to prevent website crashes");
  callback([]); // Call with empty array immediately
  return () => {}; // Return no-op unsubscribe function
  
  /* DISABLED CODE - Re-enable when API is stable
  return subscribeToLiveScoresPublic(callback, interval);
  */
};

