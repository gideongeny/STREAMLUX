
import { FC, useMemo, useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { MdSportsSoccer } from "react-icons/md";
import SearchBox from "../Common/SearchBox";
import LiveScoreboard from "./LiveScoreboard";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { SPORTS_LEAGUES, SPORTS_CHANNELS, SportsFixtureConfig } from "../../shared/constants";
import { getLiveFixturesAPI, getUpcomingFixturesAPI, subscribeToLiveScores } from "../../services/sportsAPI";
import BannerSlider from "../Slider/BannerSlider";
import { Item } from "../../shared/types";

// Unified calendar row
const UpcomingCalendar = lazy(() => import("../Home/UpcomingCalendar"));

const SportsMainContent: FC = () => {
    const { isMobile } = useCurrentViewportView();
    const [activeLeague, setActiveLeague] = useState<string>("all");
    const [activeStatus, setActiveStatus] = useState<"live" | "upcoming" | "replay">("live");
    const [liveFixtures, setLiveFixtures] = useState<SportsFixtureConfig[]>([]);
    const [upcomingFixtures, setUpcomingFixtures] = useState<SportsFixtureConfig[]>([]);

    // NO "Welcome" Log or anything side-effecty that might duplicate excessively

    // Fetch real live data with Caching
    useEffect(() => {
        const fetchRealData = async () => {
            // 1. Check Cache
            const cachedLive = localStorage.getItem("sports_live_fixtures");
            const cachedUpcoming = localStorage.getItem("sports_upcoming_fixtures");
            const cachedTime = localStorage.getItem("sports_cache_time");
            const now = Date.now();
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            if (cachedLive && cachedUpcoming && cachedTime && (now - Number(cachedTime) < CACHE_DURATION)) {
                try {
                    setLiveFixtures(JSON.parse(cachedLive));
                    setUpcomingFixtures(JSON.parse(cachedUpcoming));
                    return; // Exit if cache is valid
                } catch (e) {
                    console.error("Error parsing sports cache", e);
                }
            }

            // 2. Fetch Fresh Data
            try {
                const [live, upcoming] = await Promise.all([
                    getLiveFixturesAPI(), // Use robust API with fallbacks
                    getUpcomingFixturesAPI(),
                ]);
                setLiveFixtures(live);
                setUpcomingFixtures(upcoming);

                // 3. Update Cache
                localStorage.setItem("sports_live_fixtures", JSON.stringify(live));
                localStorage.setItem("sports_upcoming_fixtures", JSON.stringify(upcoming));
                localStorage.setItem("sports_cache_time", String(now));

            } catch (error) {
                console.error("Error fetching real sports data:", error);
            }
        };

        fetchRealData();

        // Subscribe to live updates
        const unsubscribe = subscribeToLiveScores((fixtures) => {
            setLiveFixtures(fixtures);
        }, 60000);

        return () => {
            unsubscribe();
        };
    }, []);

    // Combine real API data (No static data as per user request)
    const allFixtures = useMemo(() => {
        const combined = [...liveFixtures, ...upcomingFixtures];

        // Remove duplicates
        const seen = new Set<string>();
        const unique: SportsFixtureConfig[] = [];
        combined.forEach((fixture) => {
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

    const liveCount = allFixtures.filter((fixture) => fixture.status === "live").length;
    const upcomingCount = allFixtures.filter((fixture) => fixture.status === "upcoming").length;
    const replayCount = allFixtures.filter((fixture) => fixture.status === "replay").length;

    // Map sports fixtures to Banner-compatible format
    const bannerFilms = useMemo(() => {
        // High-quality generic sports backdrops for more premium look
        const sportsBackdrops: Record<string, string> = {
            soccer: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1280&q=80",
            basketball: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1280&q=80",
            tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1280&q=80",
            f1: "https://images.unsplash.com/photo-1504450334710-90c056d6d84a?auto=format&fit=crop&w=1280&q=80",
            ufc: "https://images.unsplash.com/photo-1552667466-07f704e139bd?auto=format&fit=crop&w=1280&q=80",
            cricket: "https://images.unsplash.com/photo-1531415074941-03f6ad8899ac?auto=format&fit=crop&w=1280&q=80",
            rugby: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1280&q=80",
            baseball: "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=1280&q=80",
            hockey: "https://images.unsplash.com/photo-151271901372c-5d1c5d718c9c?auto=format&fit=crop&w=1280&q=80",
            generic: "https://images.unsplash.com/photo-1431324155629-1a6eda1eed2d?auto=format&fit=crop&w=1280&q=80"
        };

        return upcomingFixtures.slice(0, 5).map((f, idx) => {
            // Determine backdrop based on availability, then fall back to generic sports images
            let backdrop = f.banner || f.thumb || f.fanart || sportsBackdrops.generic;

            // If we don't have a match-specific image, use our categorical backdrops
            if (!f.banner && !f.thumb && !f.fanart) {
                const leagueLower = f.leagueId.toLowerCase();
                const homeLower = f.homeTeam.toLowerCase();
                const awayLower = f.awayTeam.toLowerCase();
                const combined = `${leagueLower} ${homeLower} ${awayLower}`;

                // 1. Explicit League Mapping
                if (["epl", "ucl", "laliga", "ligue1", "seriea", "afcon", "bundesliga", "football"].includes(leagueLower)) {
                    backdrop = sportsBackdrops.soccer;
                } else if (leagueLower === "nba" || combined.includes("basketball")) {
                    backdrop = sportsBackdrops.basketball;
                } else if (leagueLower === "atp" || leagueLower === "wta" || combined.includes("tennis")) {
                    backdrop = sportsBackdrops.tennis;
                } else if (leagueLower === "f1" || combined.includes("racing") || combined.includes("formula 1")) {
                    backdrop = sportsBackdrops.f1;
                } else if (leagueLower === "ufc" || combined.includes("mma") || combined.includes("combat") || combined.includes("fight")) {
                    backdrop = sportsBackdrops.ufc;
                } else if (combined.includes("cricket")) {
                    backdrop = sportsBackdrops.cricket;
                } else if (leagueLower === "rugby-world-cup" || leagueLower === "six-nations" || combined.includes("rugby")) {
                    backdrop = sportsBackdrops.rugby;
                } else if (leagueLower === "mlb" || combined.includes("baseball")) {
                    backdrop = sportsBackdrops.baseball;
                } else if (leagueLower === "nhl" || combined.includes("hockey")) {
                    backdrop = sportsBackdrops.hockey;
                } else if (combined.includes("nfl") || combined.includes("american football")) {
                    backdrop = sportsBackdrops.soccer;
                }

                // 2. Keyword check if still generic
                if (backdrop === sportsBackdrops.generic) {
                    if (combined.includes("cup") || combined.includes("league") || combined.includes("fifa")) backdrop = sportsBackdrops.soccer;
                }

                // Cycle through backdrops if multiple games and still generic
                if (backdrop === sportsBackdrops.generic) {
                    const genericPool = Object.values(sportsBackdrops);
                    backdrop = genericPool[idx % genericPool.length];
                }
            }

            return {
                id: `${f.leagueId}/${f.id}`,
                title: `${f.homeTeam} vs ${f.awayTeam}`,
                backdrop_path: backdrop,
                poster_path: f.homeTeamLogo || f.awayTeamLogo || "",
                overview: `Stream Live: ${f.homeTeam} takes on ${f.awayTeam} in the ${f.leagueId.toUpperCase()} Tournament. Witness every goal, basket, and play in premium 4K quality.`,
                vote_average: 9.8,
                release_date: f.kickoffTimeFormatted,
                media_type: "sports",
                genre_ids: [],
                original_language: "en",
                popularity: 100,
                vote_count: 1000
            };
        }) as unknown as Item[];
    }, [upcomingFixtures]);

    return (
        <div className="w-full">
            {/* Premium Banner */}
            <div className="mb-10">
                <BannerSlider
                    films={bannerFilms.length > 0 ? bannerFilms : undefined}
                    dataDetail={undefined}
                    isLoadingBanner={liveFixtures.length === 0 && upcomingFixtures.length === 0}
                />
            </div>

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
                    local timezone.
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

            {/* Live Channels Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-primary rounded-full"></span>
                        Live Sports Channels
                    </h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {SPORTS_CHANNELS.map((channel) => (
                        <Link
                            key={channel.id}
                            to={`/sports/channel/${channel.id}/watch`}
                            className="flex-shrink-0 w-36 md:w-44 group"
                        >
                            <div className="aspect-video relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900 group-hover:border-primary/50 transition duration-300 shadow-lg">
                                <div className="absolute inset-0 flex items-center justify-center p-2">
                                    <img
                                        src={channel.logo}
                                        alt={channel.name}
                                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition duration-300 drop-shadow-lg"
                                        onError={(e) => {
                                            // Fallback to Icon if image fails
                                            e.currentTarget.style.display = 'none';
                                            const fallbackDiv = document.createElement('div');
                                            fallbackDiv.className = "w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20";
                                            fallbackDiv.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M16.75 2.222a.75.75 0 0 1 .168.805l-1.396 3.14a4.99 4.99 0 0 0-2.81 1.708l-3.264-1.451a.75.75 0 0 1-.29-.117L4.972 3.655a.75.75 0 0 1 .458-1.353h11.32zM21.5 12a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0zM12 4.25a7.75 7.75 0 1 0 0 15.5 7.75 7.75 0 0 0 0-15.5zm0 2a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5zm0 2.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5z"></path></svg>`;
                                            e.currentTarget.parentElement!.appendChild(fallbackDiv);
                                        }}
                                    />
                                </div>
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-red-600 animate-pulse text-[8px] font-bold text-white uppercase">
                                    Live
                                </div>
                            </div>
                            <h3 className="mt-2 text-sm text-gray-200 font-medium group-hover:text-primary transition truncate">
                                {channel.name}
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{channel.country}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Upcoming Calendar Row (Unified Swiper Row) */}
            <div className="mb-12">
                <Suspense fallback={<div className="h-40 bg-gray-800/20 rounded-xl animate-pulse" />}>
                    <UpcomingCalendar
                        title="Upcoming Football & Tournaments"
                        contentType="sports"
                    />
                </Suspense>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    onClick={() => setActiveStatus("live")}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${activeStatus === "live"
                        ? "bg-red-600 text-white border-red-500"
                        : "border-red-600/40 text-red-400 hover:border-red-400"
                        }`}
                >
                    Live Now
                </button>
                <button
                    onClick={() => setActiveStatus("upcoming")}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${activeStatus === "upcoming"
                        ? "bg-amber-500 text-black border-amber-400"
                        : "border-amber-400/40 text-amber-300 hover:border-amber-300"
                        }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveStatus("replay")}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${activeStatus === "replay"
                        ? "bg-emerald-500 text-black border-emerald-500"
                        : "border-emerald-500/40 text-emerald-300 hover:border-emerald-300"
                        }`}
                >
                    Replays
                </button>
            </div>

            {/* Dashboard Stats */}
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
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition ${activeLeague === "all"
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
                        className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition flex items-center gap-2 ${activeLeague === league.id
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
                        <Link
                            key={fixture.id}
                            to={fixture.matchId
                                ? `/sports/${fixture.leagueId}/${fixture.id}/watch`
                                : `/sports/${fixture.leagueId}/${fixture.id}/watch`
                            }
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
                                                <span>{league?.name || "Other"}</span>
                                            </span>
                                            {fixture.round && (
                                                <>
                                                    <span>•</span>
                                                    <span>{fixture.round}</span>
                                                </>
                                            )}
                                        </p>
                                        <span
                                            className={`text-[10px] px-2 py-1 rounded-full font-semibold tracking-wide ${fixture.status === "live"
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
                                                {fixture.broadcast?.join(" · ")}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="px-4 pb-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-800">
                                <span className="py-2">
                                    <span className="text-primary font-medium">
                                        View Details & Streams
                                    </span>
                                </span>
                                <span className="py-2 text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                                    Watch now →
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default SportsMainContent;
