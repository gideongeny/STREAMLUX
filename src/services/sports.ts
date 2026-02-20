import axios from "../shared/axios";

export interface LiveFixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  status: "live" | "upcoming" | "finished";
  league: string;
  leagueFlag?: string;
  kickoffTime?: string;
  venue?: string;
}

// Using a free sports API - API-Football alternative or similar
// For now, we'll use a combination approach with fallback to static data
export const getLiveFixtures = async (): Promise<LiveFixture[]> => {
  try {
    // Try multiple leagues to get more live games
    const leagueIds = [4328, 4335, 4334, 4332, 4331]; // EPL, La Liga, Bundesliga, Serie A, Ligue 1
    
    const responses = await Promise.all(
      leagueIds.map(id =>
        fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${id}`, {
          method: "GET",
          headers: { "Accept": "application/json" },
        }).catch(() => null)
      )
    );

    const allEvents: any[] = [];
    
    for (const response of responses) {
      if (!response || !response.ok) continue;
      try {
        const data = await response.json();
        if (data.events && Array.isArray(data.events)) {
          allEvents.push(...data.events);
        }
      } catch (e) {
        // Continue to next league
      }
    }
    
    if (allEvents.length > 0) {
      const fixtures: LiveFixture[] = allEvents.map((event: any) => {
        let status: "live" | "upcoming" | "finished" = "upcoming";
        if (event.strStatus === "Live") {
          status = "live";
        } else if (event.strStatus === "Finished") {
          status = "finished";
        }
        
        return {
          id: `live-${event.idEvent}`,
          homeTeam: event.strHomeTeam || "Team A",
          awayTeam: event.strAwayTeam || "Team B",
          homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : undefined,
          awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : undefined,
          minute: event.strTime ? event.strTime : undefined,
          status: status,
          league: event.strLeague || "Premier League",
          kickoffTime: event.strTimestamp || event.dateEvent,
          venue: event.strVenue || "",
        };
      });
      
      // Return live games first, then upcoming
      const live = fixtures.filter(f => f.status === "live");
      const upcoming = fixtures.filter(f => f.status === "upcoming");
      return [...live, ...upcoming].slice(0, 15);
    }

    // Fallback to static data with more live games
    return getStaticFixtures();
  } catch (error) {
    console.error("Error fetching live fixtures:", error);
    // Fallback to static data
    return getStaticFixtures();
  }
};

// Fallback static fixtures with more live games
const getStaticFixtures = (): LiveFixture[] => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return [
    {
      id: "live-1",
      homeTeam: "Manchester City",
      awayTeam: "Arsenal",
      homeScore: 2,
      awayScore: 1,
      minute: "67'",
      status: "live",
      league: "Premier League",
      kickoffTime: today,
      venue: "Etihad Stadium",
    },
    {
      id: "live-2",
      homeTeam: "Barcelona",
      awayTeam: "Real Madrid",
      homeScore: 1,
      awayScore: 0,
      minute: "45'",
      status: "live",
      league: "La Liga",
      kickoffTime: today,
      venue: "Camp Nou",
    },
    {
      id: "live-3",
      homeTeam: "PSG",
      awayTeam: "Marseille",
      homeScore: 3,
      awayScore: 2,
      minute: "78'",
      status: "live",
      league: "Ligue 1",
      kickoffTime: today,
      venue: "Parc des Princes",
    },
    {
      id: "live-4",
      homeTeam: "Bayern Munich",
      awayTeam: "Borussia Dortmund",
      homeScore: 2,
      awayScore: 2,
      minute: "82'",
      status: "live",
      league: "Bundesliga",
      kickoffTime: today,
      venue: "Allianz Arena",
    },
    {
      id: "live-5",
      homeTeam: "AC Milan",
      awayTeam: "Inter Milan",
      homeScore: 1,
      awayScore: 1,
      minute: "56'",
      status: "live",
      league: "Serie A",
      kickoffTime: today,
      venue: "San Siro",
    },
    {
      id: "live-6",
      homeTeam: "Liverpool",
      awayTeam: "Chelsea",
      status: "upcoming",
      league: "Premier League",
      kickoffTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      venue: "Anfield",
    },
  ];
};

// Get upcoming fixtures
export const getUpcomingFixtures = async (): Promise<LiveFixture[]> => {
  try {
    const response = await fetch(
      "https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328",
      { 
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch upcoming fixtures");
    }

    const data = await response.json();
    
    if (data.events && Array.isArray(data.events)) {
      return data.events
        .filter((event: any) => event.strStatus !== "Live" && event.strStatus !== "Finished")
        .slice(0, 10)
        .map((event: any) => ({
          id: `upcoming-${event.idEvent}`,
          homeTeam: event.strHomeTeam || "Team A",
          awayTeam: event.strAwayTeam || "Team B",
          status: "upcoming" as const,
          league: event.strLeague || "Premier League",
          kickoffTime: event.strTimestamp || event.dateEvent,
          venue: event.strVenue || "",
        }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching upcoming fixtures:", error);
    return [];
  }
};

