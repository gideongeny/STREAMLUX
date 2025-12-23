// Live Scoreboard Component - Moviebox.ph style
// Displays live scores in a scoreboard format

import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SportsFixtureConfig } from "../../shared/constants";
import { getLiveScores, subscribeToLiveScores } from "../../services/sportsAPI";

const LiveScoreboard: FC = () => {
  const [fixtures, setFixtures] = useState<SportsFixtureConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const live = await getLiveScores();
        setFixtures(live.slice(0, 8)); // Show top 8 live matches
      } catch (error) {
        console.error("Error fetching live scores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();

    // Subscribe to live updates
    const unsubscribe = subscribeToLiveScores((liveFixtures) => {
      setFixtures(liveFixtures.slice(0, 8));
    }, 30000); // Update every 30 seconds

    return () => {
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-dark-lighten rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading live scores...</span>
        </div>
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="bg-dark-lighten rounded-lg border border-gray-800 p-6 text-center">
        <p className="text-gray-400">No live matches at the moment</p>
        <a
          href="https://sportslive.run/live?utm_source=MB_Website&sportType=football"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline mt-2 inline-block"
        >
          View all sports →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-dark-lighten rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
            <h2 className="text-xl font-bold text-white">Live Scoreboard</h2>
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

      {/* Scoreboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        {fixtures.map((fixture) => (
          <a
            key={fixture.id}
            href={fixture.matchId 
            ? `https://sportslive.run/matches/${fixture.matchId}?utm_source=MB_Website&sportType=football`
            : `https://sportslive.run/live?utm_source=MB_Website&sportType=football&home=${encodeURIComponent(fixture.homeTeam)}&away=${encodeURIComponent(fixture.awayTeam)}`
          }
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900/50 rounded-lg border border-gray-700 hover:border-primary/50 hover:bg-gray-900 transition p-4 group"
          >
            {/* League and Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {fixture.leagueId}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-600/20 text-red-400 text-[10px] font-semibold border border-red-500/60">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400"></span>
                </span>
                LIVE
              </span>
            </div>

            {/* Teams and Score */}
            <div className="space-y-3">
              {/* Home Team */}
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
                {fixture.homeScore !== undefined && (
                  <span className="text-2xl font-bold text-white">
                    {fixture.homeScore}
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
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
                  <span className="text-white font-semibold text-sm">
                    {fixture.awayTeam}
                  </span>
                </div>
                {fixture.awayScore !== undefined && (
                  <span className="text-2xl font-bold text-white">
                    {fixture.awayScore}
                  </span>
                )}
              </div>
            </div>

            {/* Match Info */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
              {fixture.minute && (
                <span className="text-red-400 text-xs font-semibold">
                  {fixture.minute}'
                </span>
              )}
              {fixture.venue && (
                <span className="text-gray-500 text-xs">
                  {fixture.venue}
                </span>
              )}
              <span className="text-primary text-xs opacity-0 group-hover:opacity-100 transition">
                Watch →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default LiveScoreboard;

