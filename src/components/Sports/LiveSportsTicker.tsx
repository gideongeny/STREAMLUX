// Live Sports Ticker Component - Like moviebox.ph
// Displays scrolling live scores and upcoming games

import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SportsFixtureConfig } from "../../shared/constants";
import { getLiveScores, subscribeToLiveScores, getUpcomingFixturesAPI } from "../../services/sportsAPI";

const LiveSportsTicker: FC = () => {
  const [liveFixtures, setLiveFixtures] = useState<SportsFixtureConfig[]>([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState<SportsFixtureConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchInitial = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Add timeout to prevent hanging on iPhone
        const fetchPromise = Promise.all([
          getLiveScores().catch(() => []),
          getUpcomingFixturesAPI().catch(() => []),
        ]);
        
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setIsLoading(false);
            setHasError(true);
          }
        }, 10000); // 10 second timeout
        
        const [live, upcoming] = await fetchPromise;
        
        if (timeoutId) clearTimeout(timeoutId);
        
        if (isMounted) {
          setLiveFixtures(Array.isArray(live) ? live.slice(0, 10) : []);
          setUpcomingFixtures(Array.isArray(upcoming) ? upcoming.slice(0, 10) : []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching fixtures:", error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    fetchInitial();

    // Subscribe to live score updates with error handling
    // Reduced frequency for older devices
    try {
      unsubscribe = subscribeToLiveScores((fixtures) => {
        if (isMounted && Array.isArray(fixtures)) {
          setLiveFixtures(fixtures.slice(0, 10));
        }
      }, 60000); // Changed from 30000ms to 60000ms for better performance
    } catch (error) {
      console.error("Error subscribing to live scores:", error);
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Silent fail if error - don't break the page
  if (hasError) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-dark-lighten border-b border-gray-800 py-2">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading live scores...</span>
        </div>
      </div>
    );
  }

  const allFixtures = [...(Array.isArray(liveFixtures) ? liveFixtures : []), ...(Array.isArray(upcomingFixtures) ? upcomingFixtures : [])];

  if (allFixtures.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-900/20 via-dark-lighten to-amber-900/20 border-b border-gray-800 py-2 overflow-hidden">
      <div className="flex items-center gap-6 animate-scroll">
        {/* Live indicator */}
        <div className="flex items-center gap-2 shrink-0 px-4">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-400 font-bold text-xs uppercase tracking-wider">LIVE</span>
          </span>
        </div>

        {/* Scrolling fixtures */}
        <div className="flex items-center gap-8 overflow-hidden">
          {allFixtures.map((fixture, index) => (
            <a
              key={`${fixture.id}-${index}`}
              href={fixture.matchId 
                ? `https://sportslive.run/matches/${fixture.matchId}?utm_source=MB_Website&sportType=football`
                : `https://sportslive.run/live?utm_source=MB_Website&sportType=football&home=${encodeURIComponent(fixture.homeTeam)}&away=${encodeURIComponent(fixture.awayTeam)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 shrink-0 hover:bg-gray-800/50 px-4 py-1 rounded transition group"
            >
              {/* League/Competition */}
              <span className="text-gray-400 text-xs uppercase tracking-wide whitespace-nowrap">
                {fixture.leagueId.toUpperCase()}
              </span>

              {/* Home Team with Logo */}
              <div className="flex items-center gap-2">
                {fixture.homeTeamLogo ? (
                  <img
                    src={fixture.homeTeamLogo}
                    alt={fixture.homeTeam}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                    {fixture.homeTeam.charAt(0)}
                  </div>
                )}
                <span className="text-white text-sm font-semibold whitespace-nowrap">
                  {fixture.homeTeam}
                </span>
              </div>

              {/* Score or VS */}
              <div className="flex items-center gap-2">
                {fixture.status === "live" && fixture.homeScore !== undefined && fixture.awayScore !== undefined ? (
                  <>
                    <span className="text-white font-bold text-lg">
                      {fixture.homeScore}
                    </span>
                    <span className="text-gray-500">-</span>
                    <span className="text-white font-bold text-lg">
                      {fixture.awayScore}
                    </span>
                    {fixture.minute && (
                      <span className="text-red-400 text-xs font-semibold ml-2">
                        {fixture.minute}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">VS</span>
                )}
              </div>

              {/* Away Team with Logo */}
              <div className="flex items-center gap-2">
                {fixture.awayTeamLogo ? (
                  <img
                    src={fixture.awayTeamLogo}
                    alt={fixture.awayTeam}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                    {fixture.awayTeam.charAt(0)}
                  </div>
                )}
                <span className="text-white text-sm font-semibold whitespace-nowrap">
                  {fixture.awayTeam}
                </span>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${
                  fixture.status === "live"
                    ? "bg-red-600/20 text-red-400 border border-red-500/60"
                    : "bg-amber-500/15 text-amber-300 border border-amber-400/60"
                }`}
              >
                {fixture.status === "live" ? "🔴 LIVE" : "UPCOMING"}
              </span>

              {/* Separator */}
              {index < allFixtures.length - 1 && (
                <span className="text-gray-600">•</span>
              )}
            </a>
          ))}
        </div>

        {/* View All Link */}
        <a
          href="https://sportslive.run/live?utm_source=MB_Website&sportType=football"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 text-primary text-xs font-semibold hover:text-primary/80 transition whitespace-nowrap"
        >
          View All →
        </a>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LiveSportsTicker;

