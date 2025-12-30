// Live Games Slider Component - MovieBox style
// Horizontal scrollable cards with team logos, VS, and time/status

import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SportsFixtureConfig } from "../../shared/constants";
import { getLiveScores, getUpcomingFixturesAPI } from "../../services/sportsAPI";

interface LiveGamesSliderProps {
  type: "live" | "upcoming";
  title?: string;
}

const LiveGamesSlider: FC<LiveGamesSliderProps> = ({ type, title }) => {
  const [fixtures, setFixtures] = useState<SportsFixtureConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchFixtures = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      try {
        // Add timeout to prevent hanging on iPhone
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        }, 10000); // 10 second timeout

        let result: SportsFixtureConfig[] = [];
        if (type === "live") {
          result = await getLiveScores().catch(() => []);
        } else {
          result = await getUpcomingFixturesAPI().catch(() => []);
        }

        if (timeoutId) clearTimeout(timeoutId);

        if (isMounted && Array.isArray(result)) {
          setFixtures(result.slice(0, 20));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching fixtures:", error);
        if (isMounted) {
          setIsLoading(false);
          setFixtures([]); // Set empty array on error
        }
      }
    };

    fetchFixtures();

    // Refresh every 60 seconds for live games (reduced frequency for older devices)
    // Only refresh if component is still mounted and visible
    if (type === "live") {
      intervalId = setInterval(() => {
        if (isMounted && fixtures.length > 0) {
          fetchFixtures();
        }
      }, 60000); // Changed from 30000ms to 60000ms for better performance
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [type, fixtures.length]);

  useEffect(() => {
    // Update time every 5 seconds for countdown (reduced frequency for older devices)
    // Only update if component is visible and has fixtures
    const timer = setInterval(() => {
      if (fixtures.length > 0) {
        setCurrentTime(new Date());
      }
    }, 5000); // Changed from 1000ms to 5000ms for better performance
    return () => clearInterval(timer);
  }, [fixtures.length]);

  if (isLoading) {
    return (
      <div className="mb-8">
        {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
        <div className="flex items-center justify-center gap-2 text-gray-400 py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading {type} games...</span>
        </div>
      </div>
    );
  }

  if (fixtures.length === 0) {
    return null;
  }

  const formatTime = (timeStr: string) => {
    if (timeStr === "Live Now" || timeStr.includes("Live")) {
      return "LIVE";
    }
    // Parse and format time - MovieBox style countdown
    try {
      const date = new Date(timeStr);
      const diffMs = date.getTime() - currentTime.getTime();

      if (diffMs < 0) return "LIVE";

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

      // Use polyfill-safe padding for older browsers
      const pad = (num: number): string => {
        const str = String(num);
        return str.length < 2 ? '0' + str : str;
      };
      return `Upcoming - ${pad(diffHours)}:${pad(diffMins)}:${pad(diffSecs)}`;
    } catch {
      // If it's already formatted, return as is
      if (timeStr.includes("Upcoming")) return timeStr;
      return `Upcoming - ${timeStr}`;
    }
  };

  return (
    <div className="mb-8">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <Link
            to="/sports"
            className="text-primary hover:text-primary/80 text-sm font-medium transition"
          >
            More &gt;
          </Link>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {fixtures.map((fixture: SportsFixtureConfig) => (
          <Link
            key={fixture.id}
            to={`/sports/${fixture.leagueId}/${fixture.id}/watch`}
            className="flex-shrink-0 w-[280px] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/30 transition-all group cursor-pointer border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
            }}
          >
            {/* Status/Time Header - StreamLux Style */}
            <div className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-black text-[10px] font-bold tracking-widest uppercase">
                  {fixture.status === "live" ? (
                    <span className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      LIVE
                    </span>
                  ) : (
                    formatTime(fixture.kickoffTimeFormatted)
                  )}
                </span>
                <span className="text-black/70 text-[10px] font-black">{fixture.leagueId.toUpperCase()}</span>
              </div>
            </div>

            {/* Teams Section */}
            <div className="p-5 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:bg-white/10 transition">
                    {fixture.homeTeamLogo ? (
                      <img
                        src={fixture.homeTeamLogo}
                        alt={fixture.homeTeam}
                        className="w-full h-full object-contain filter drop-shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fixture.homeTeam)}&background=random&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{fixture.homeTeam.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-white text-xs font-bold text-center line-clamp-1 w-full">
                    {fixture.homeTeam}
                  </span>
                </div>

                {/* VS / Score */}
                <div className="flex flex-col items-center justify-center min-w-[50px]">
                  {fixture.status === "live" && fixture.homeScore !== undefined && fixture.awayScore !== undefined ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-white">{fixture.homeScore}</span>
                        <span className="text-primary font-bold">:</span>
                        <span className="text-3xl font-black text-white">{fixture.awayScore}</span>
                      </div>
                      {fixture.minute && (
                        <span className="mt-1 px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black rounded-full animate-pulse capitalize">
                          {fixture.minute}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                      <span className="text-primary font-black italic text-lg tracking-tighter">VS</span>
                      <div className="w-10 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:bg-white/10 transition">
                    {fixture.awayTeamLogo ? (
                      <img
                        src={fixture.awayTeamLogo}
                        alt={fixture.awayTeam}
                        className="w-full h-full object-contain filter drop-shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fixture.awayTeam)}&background=random&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{fixture.awayTeam.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-white text-xs font-bold text-center line-clamp-1 w-full">
                    {fixture.awayTeam}
                  </span>
                </div>
              </div>
            </div>

            {/* League Info Footer */}
            <div className="px-4 py-2 bg-white/5 flex items-center justify-center border-t border-white/10 group-hover:bg-primary/10 transition">
              <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">
                {fixture.venue || "Match Details"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default LiveGamesSlider;

