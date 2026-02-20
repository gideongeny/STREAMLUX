// Upcoming Calendar Component - MovieBox style
// Displays upcoming sports matches in a calendar format

import { FC, useEffect, useState } from "react";
import { SportsFixtureConfig } from "../../shared/constants";
import { getUpcomingFixturesAPI } from "../../services/sportsAPI";

const UpcomingCalendar: FC = () => {
  const [upcomingFixtures, setUpcomingFixtures] = useState<SportsFixtureConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    const fetchUpcoming = async () => {
      setIsLoading(true);
      try {
        const fixtures = await getUpcomingFixturesAPI();
        setUpcomingFixtures(fixtures);
        
        // Set default selected date to today
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
      } catch (error) {
        console.error("Error fetching upcoming fixtures:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcoming();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchUpcoming, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Group fixtures by date
  const fixturesByDate = upcomingFixtures.reduce((acc, fixture) => {
    const date = fixture.kickoffTimeFormatted 
      ? new Date(fixture.kickoffTimeFormatted).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(fixture);
    return acc;
  }, {} as Record<string, SportsFixtureConfig[]>);

  // Get available dates (next 7 days)
  const getAvailableDates = () => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const availableDates = getAvailableDates();
  const selectedFixtures = selectedDate ? (fixturesByDate[selectedDate] || []) : [];

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-dark-lighten rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading upcoming matches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-lighten rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <h2 className="text-xl font-bold text-white">Upcoming Calendar</h2>
          </div>
          <a
            href="https://sportslive.run/live?utm_source=MB_Website&sportType=football"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm font-semibold hover:underline"
          >
            View All →
          </a>
        </div>
      </div>

      {/* Date Selector */}
      <div className="px-6 py-4 border-b border-gray-800 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {availableDates.map((date) => {
            const fixtureCount = fixturesByDate[date]?.length || 0;
            const isSelected = selectedDate === date;
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg border transition whitespace-nowrap ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-400 font-semibold"
                    : "border-amber-400/40 text-amber-300 hover:border-amber-300 bg-amber-500/10"
                }`}
              >
                <div className="text-xs font-medium">{formatDateLabel(date)}</div>
                {fixtureCount > 0 && (
                  <div className={`text-[10px] mt-1 ${isSelected ? "text-black/70" : "text-amber-400/70"}`}>
                    {fixtureCount} match{fixtureCount !== 1 ? "es" : ""}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixtures List */}
      <div className="p-6">
        {selectedFixtures.length > 0 ? (
          <div className="space-y-3">
            {selectedFixtures.map((fixture) => (
              <a
                key={fixture.id}
                href={fixture.matchId 
              ? `https://sportslive.run/matches/${fixture.matchId}?utm_source=MB_Website&sportType=football`
              : `https://sportslive.run/live?utm_source=MB_Website&sportType=football&home=${encodeURIComponent(fixture.homeTeam)}&away=${encodeURIComponent(fixture.awayTeam)}`
            }
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-900/50 rounded-lg border border-gray-700 hover:border-amber-400/50 hover:bg-gray-900 transition p-4 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    {fixture.leagueId}
                  </span>
                  <span className="text-xs text-amber-300 font-semibold">
                    {fixture.kickoffTimeFormatted}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {fixture.homeTeamLogo ? (
                      <img
                        src={fixture.homeTeamLogo}
                        alt={fixture.homeTeam}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                        {fixture.homeTeam.charAt(0)}
                      </div>
                    )}
                    <span className="text-white font-semibold text-sm">
                      {fixture.homeTeam}
                    </span>
                  </div>
                  
                  <span className="text-gray-500 mx-3">VS</span>
                  
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="text-white font-semibold text-sm">
                      {fixture.awayTeam}
                    </span>
                    {fixture.awayTeamLogo ? (
                      <img
                        src={fixture.awayTeamLogo}
                        alt={fixture.awayTeam}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                        {fixture.awayTeam.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                
                {fixture.venue && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <span className="text-gray-500 text-xs">📍 {fixture.venue}</span>
                  </div>
                )}
                
                <div className="mt-2 text-primary text-xs opacity-0 group-hover:opacity-100 transition">
                  Watch on sportslive.run →
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">No matches scheduled for this date</p>
            <a
              href="https://sportslive.run/live?utm_source=MB_Website&sportType=football"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Check sportslive.run for more →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingCalendar;

