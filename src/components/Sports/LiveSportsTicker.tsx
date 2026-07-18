// Live Sports Ticker Component - Like moviebox.ph
// Displays scrolling live scores and upcoming games

import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SportsFixtureConfig } from "../../shared/constants";
import { getLiveScores, subscribeToLiveScores, getUpcomingFixturesAPI } from "../../services/publicSportsAPI";

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
        // Fetch independently to show data faster as it arrives
        getLiveScores().then(live => {
          if (isMounted) {
            setLiveFixtures(Array.isArray(live) ? live.slice(0, 10) : []);
            setIsLoading(false);
          }
        }).catch(() => {
           if (isMounted && upcomingFixtures.length === 0) setHasError(true);
        });

        getUpcomingFixturesAPI().then(upcoming => {
          if (isMounted) {
            setUpcomingFixtures(Array.isArray(upcoming) ? upcoming.slice(0, 10) : []);
            setIsLoading(false);
          }
        }).catch(() => {});
        
        // Safety timeout to hide loading state if nothing comes back
        timeoutId = setTimeout(() => {
          if (isMounted && isLoading) {
            setIsLoading(false);
          }
        }, 5000); 
      } catch (error) {
        console.error("Error starting fixture fetch:", error);
        if (isMounted) {
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
            <Link
              key={`${fixture.id}-${index}`}
              to={`/sports/arena/${fixture.id}?home=${encodeURIComponent(fixture.homeTeam)}&away=${encodeURIComponent(fixture.awayTeam)}&sport=${encodeURIComponent(fixture.sportsCategory || 'soccer')}`}
              state={{ matchData: fixture }}
              className="flex items-center gap-4 shrink-0 hover:bg-white/5 px-6 py-2 rounded-2xl transition-all group border border-transparent hover:border-white/10"
            >
              {/* League/Competition */}
              <span className="text-primary text-[9px] font-black uppercase tracking-[0.2em] italic whitespace-nowrap">
                {fixture.leagueName || fixture.leagueId.toUpperCase()}
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
                {fixture.isCompetition ? (
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30 px-2 py-0.5 rounded bg-primary/10">
                    Competition
                  </span>
                ) : fixture.status === "live" && fixture.homeScore !== undefined && fixture.awayScore !== undefined ? (
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
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest whitespace-nowrap ${
                  fixture.status === "live"
                    ? "bg-red-600/10 text-red-500 border border-red-500/20"
                    : "bg-white/5 text-gray-500 border border-white/5"
                }`}
              >
                {fixture.status === "live" && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                {fixture.status === "live" ? "Live" : "Upcoming"}
              </div>

              {/* Separator */}
              {index < allFixtures.length - 1 && (
                <div className="w-1 h-1 rounded-full bg-white/10 mx-2" />
              )}
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <Link
          to="/?tab=sports"
          className="shrink-0 px-6 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary/20 transition-all border border-primary/20"
        >
          View Arena
        </Link>
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

