import { FC, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdSportsSoccer } from "react-icons/md";

import Sidebar from "../../components/Common/Sidebar";
import SidebarMini from "../../components/Common/SidebarMini";
import SearchBox from "../../components/Common/SearchBox";
import Title from "../../components/Common/Title";
import Footer from "../../components/Footer/Footer";
import LiveScoreboard from "../../components/Sports/LiveScoreboard";
import UpcomingCalendar from "../../components/Sports/UpcomingCalendar";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { SPORTS_FIXTURES, SPORTS_LEAGUES, SportsFixtureConfig } from "../../shared/constants";
import { getLiveScores, getUpcomingFixturesAPI, subscribeToLiveScores } from "../../services/sportsAPI";

const SportsHome: FC = () => {
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [activeLeague, setActiveLeague] = useState<string>("all");
  const [activeStatus, setActiveStatus] = useState<"live" | "upcoming" | "replay">("live");
  const [liveFixtures, setLiveFixtures] = useState<SportsFixtureConfig[]>([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState<SportsFixtureConfig[]>([]);

  // Redirect to sportslive.run when component mounts (like MovieBox)
  useEffect(() => {
    window.location.href = "https://sportslive.run/live?utm_source=MB_Website&sportType=football";
  }, []);


  // Fetch real live data
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [live, upcoming] = await Promise.all([
          getLiveScores(),
          getUpcomingFixturesAPI(),
        ]);
        setLiveFixtures(live);
        setUpcomingFixtures(upcoming);
      } catch (error) {
        console.error("Error fetching real sports data:", error);
      }
    };

    fetchRealData();

    // Subscribe to live updates
    const unsubscribe = subscribeToLiveScores((fixtures) => {
      setLiveFixtures(fixtures);
    }, 30000);

    return () => {
      unsubscribe();
    };
  }, []);

  // Combine real API data with static data (always show something)
  const allFixtures = useMemo(() => {
    // Always include static data as base
    const combined = [...SPORTS_FIXTURES];
    
    // Add real API data if available
    if (liveFixtures.length > 0 || upcomingFixtures.length > 0) {
      combined.push(...liveFixtures, ...upcomingFixtures);
    }
    
    // Remove duplicates by id (prioritize API data over static)
    const seen = new Set<string>();
    const unique: SportsFixtureConfig[] = [];
    
    // First add API data
    [...liveFixtures, ...upcomingFixtures].forEach((fixture) => {
      if (!seen.has(fixture.id)) {
        seen.add(fixture.id);
        unique.push(fixture);
      }
    });
    
    // Then add static data that's not already included
    SPORTS_FIXTURES.forEach((fixture) => {
      if (!seen.has(fixture.id)) {
        seen.add(fixture.id);
        unique.push(fixture);
      }
    });
    
    return unique;
  }, [liveFixtures, upcomingFixtures]);

  const filteredFixtures = useMemo(
    () =>
      allFixtures.filter((fixture) => {
        const matchLeague =
          activeLeague === "all" || fixture.leagueId === activeLeague;
        const matchStatus = fixture.status === activeStatus;
        return matchLeague && matchStatus;
      }),
    [activeLeague, activeStatus, allFixtures]
  );

  const liveCount = allFixtures.filter(
    (fixture) => fixture.status === "live"
  ).length;
  const upcomingCount = allFixtures.filter(
    (fixture) => fixture.status === "upcoming"
  ).length;
  const replayCount = allFixtures.filter(
    (fixture) => fixture.status === "replay"
  ).length;

  return (
    <>
      <Title value="StreamLux | Live Sports Streaming" />

      <div className="flex md:hidden justify-between items-center px-5 my-5">
        <Link to="/" className="flex gap-2 items-center">
          <img
            src="/logo.svg"
            alt="StreamLux Logo"
            className="h-10 w-10"
          />
          <p className="text-xl text-white font-medium tracking-wider uppercase">
            Stream<span className="text-primary">Lux</span>
          </p>
        </Link>
        <button onClick={() => setIsSidebarActive((prev) => !prev)}>
          <GiHamburgerMenu size={25} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {!isMobile && <SidebarMini />}
        {isMobile && (
          <Sidebar
            onCloseSidebar={() => setIsSidebarActive(false)}
            isSidebarActive={isSidebarActive}
          />
        )}

        <div className="flex-grow px-[2vw] md:pt-11 pt-0 pb-10">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/20 text-primary">
                <MdSportsSoccer size={20} />
              </span>
              Live Sports & Tournaments
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl">
              Stream EPL, UEFA Champions League, La Liga, Ligue&nbsp;1,
              Serie&nbsp;A, AFCON, Rugby, UFC, WWE and more. Times are shown in your
              local timezone. Streams are provided by secure third‑party
              partners you configure.
            </p>
          </div>
          
          {!isMobile && (
            <div className="mb-6 max-w-md">
              <SearchBox relative={true} />
            </div>
          )}

          {/* Live Scoreboard */}
          <div className="mb-8">
            <LiveScoreboard />
          </div>

          {/* Upcoming Calendar */}
          <div className="mb-8">
            <UpcomingCalendar />
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setActiveStatus("live")}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                activeStatus === "live"
                  ? "bg-red-600 text-white border-red-500"
                  : "border-red-600/40 text-red-400 hover:border-red-400"
              }`}
            >
              Live Now
            </button>
            <button
              onClick={() => setActiveStatus("upcoming")}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                activeStatus === "upcoming"
                  ? "bg-amber-500 text-black border-amber-400"
                  : "border-amber-400/40 text-amber-300 hover:border-amber-300"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveStatus("replay")}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                activeStatus === "replay"
                  ? "bg-emerald-500 text-black border-emerald-500"
                  : "border-emerald-500/40 text-emerald-300 hover:border-emerald-300"
              }`}
            >
              Replays
            </button>
          </div>

          {/* MovieBox-style match tracker summary */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-xs md:text-sm">
            <div className="rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-3">
              <p className="text-red-300 font-semibold mb-1">Live</p>
              <p className="text-white text-2xl md:text-3xl font-bold">
                {liveCount}
              </p>
              <p className="text-red-400/70 text-[10px] mt-1">matches now</p>
            </div>
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
              <p className="text-amber-200 font-semibold mb-1">Upcoming</p>
              <p className="text-white text-2xl md:text-3xl font-bold">
                {upcomingCount}
              </p>
              <p className="text-amber-300/70 text-[10px] mt-1">scheduled</p>
            </div>
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
              <p className="text-emerald-200 font-semibold mb-1">Replays</p>
              <p className="text-white text-2xl md:text-3xl font-bold">
                {replayCount}
              </p>
              <p className="text-emerald-300/70 text-[10px] mt-1">available</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveLeague("all")}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition ${
                activeLeague === "all"
                  ? "bg-white text-black border-white"
                  : "border-gray-600 text-gray-300 hover:border-gray-300"
              }`}
            >
              All Competitions
            </button>
            {SPORTS_LEAGUES.map((league) => (
              <button
                key={league.id}
                onClick={() => setActiveLeague(league.id)}
                className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition flex items-center gap-2 ${
                  activeLeague === league.id
                    ? "bg-primary text-white border-primary"
                    : "border-gray-700 text-gray-300 hover:border-gray-300"
                }`}
              >
                {league.flag && <span>{league.flag}</span>}
                <span>{league.shortName}</span>
              </button>
            ))}
          </div>

          {filteredFixtures.length === 0 && (
            <div className="py-12 text-center text-gray-400 border border-dashed border-gray-700 rounded-xl">
              <p className="text-lg font-medium mb-2">No matches in this filter</p>
              <p className="text-sm">
                Try switching to another status (Live / Upcoming / Replay) or select a
                different competition.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredFixtures.map((fixture) => {
              const league = SPORTS_LEAGUES.find(
                (item) => item.id === fixture.leagueId
              );

              return (
                <a
                  key={fixture.id}
                  href="https://sportslive.run/live?utm_source=MB_Website&sportType=football"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl bg-dark-lighten border border-gray-800 hover:border-primary/70 hover:shadow-xl hover:shadow-primary/20 transition overflow-hidden"
                >
                  <div className="p-4 flex items-start gap-3">
                    <div className="mt-1">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
                        <MdSportsSoccer size={18} />
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            {league?.flag && (
                              <span className="text-base">{league.flag}</span>
                            )}
                            <span>{league?.name}</span>
                          </span>
                          {fixture.round && (
                            <>
                              <span>•</span>
                              <span>{fixture.round}</span>
                            </>
                          )}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-semibold tracking-wide ${
                            fixture.status === "live"
                              ? "bg-red-600/20 text-red-400 border border-red-500/60 animate-pulse"
                              : fixture.status === "upcoming"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-400/60"
                              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/60"
                          }`}
                        >
                          {fixture.status === "live"
                            ? "🔴 LIVE"
                            : fixture.status === "upcoming"
                            ? "UPCOMING"
                            : "REPLAY"}
                        </span>
                      </div>

                      {/* Club logos and scores display */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          {fixture.homeTeamLogo ? (
                            <img
                              src={fixture.homeTeamLogo}
                              alt={fixture.homeTeam}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                              {fixture.homeTeam.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm md:text-base">
                              {fixture.homeTeam}
                            </p>
                            {fixture.status === "live" && fixture.homeScore !== undefined && (
                              <p className="text-2xl font-bold text-white mt-1">
                                {fixture.homeScore}
                              </p>
                            )}
                          </div>
                        </div>

                        {fixture.status === "live" && (
                          <div className="px-3">
                            <span className="text-red-500 font-bold text-lg">VS</span>
                            {fixture.minute && (
                              <p className="text-xs text-red-400 font-semibold mt-1 text-center">
                                {fixture.minute}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <div className="flex-1 text-right">
                            <p className="text-white font-semibold text-sm md:text-base">
                              {fixture.awayTeam}
                            </p>
                            {fixture.status === "live" && fixture.awayScore !== undefined && (
                              <p className="text-2xl font-bold text-white mt-1">
                                {fixture.awayScore}
                              </p>
                            )}
                          </div>
                          {fixture.awayTeamLogo ? (
                            <img
                              src={fixture.awayTeamLogo}
                              alt={fixture.awayTeam}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                              {fixture.awayTeam.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 mb-2">
                        {fixture.kickoffTimeFormatted} • {fixture.venue}
                      </p>

                      {fixture.broadcast && (
                        <p className="text-[10px] text-gray-400">
                          Broadcast:{" "}
                          <span className="text-gray-200">
                            {fixture.broadcast.join(" · ")}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-800">
                    <span className="py-2">
                      Click to{" "}
                      <span className="text-primary font-medium">
                        open secure stream
                      </span>
                    </span>
                    <span className="py-2 text-primary opacity-0 group-hover:opacity-100 transition">
                      Watch now →
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SportsHome;


