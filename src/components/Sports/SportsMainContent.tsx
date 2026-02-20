import { FC, useMemo, useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { MdSportsSoccer } from "react-icons/md";
import SearchBox from "../Common/SearchBox";
import LiveScoreboard from "./LiveScoreboard";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { SPORTS_LEAGUES, SPORTS_CHANNELS, SportsFixtureConfig } from "../../shared/constants";
import { getLiveFixturesAPI, getUpcomingFixturesAPI, subscribeToLiveScores, getMatchLink } from "../../services/sportsAPI";
import BannerSlider from "../Slider/BannerSlider";
import { Item, BannerInfo } from "../../shared/types";
import { safeStorage } from "../../utils/safeStorage";

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
            const cachedLive = safeStorage.get("sports_live_fixtures");
            const cachedUpcoming = safeStorage.get("sports_upcoming_fixtures");
            const cachedTime = safeStorage.get("sports_cache_time");
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
                safeStorage.set("sports_live_fixtures", JSON.stringify(live));
                safeStorage.set("sports_upcoming_fixtures", JSON.stringify(upcoming));
                safeStorage.set("sports_cache_time", String(now));

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
    const { bannerFilms, bannerDetail } = useMemo(() => {
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

        const topFixtures = [...liveFixtures, ...upcomingFixtures].slice(0, 10);

        const films = topFixtures.map((f, idx) => {
            let backdrop = f.banner || f.thumb || f.fanart || sportsBackdrops.generic;

            if (!f.banner && !f.thumb && !f.fanart) {
                const leagueLower = f.leagueId.toLowerCase();
                const combined = `${leagueLower} ${f.homeTeam.toLowerCase()} ${f.awayTeam.toLowerCase()}`;

                if (["epl", "ucl", "laliga", "ligue1", "seriea", "afcon", "bundesliga", "football"].includes(leagueLower)) {
                    backdrop = sportsBackdrops.soccer;
                } else if (leagueLower === "nba" || combined.includes("basketball")) {
                    backdrop = sportsBackdrops.basketball;
                } else if (leagueLower === "atp" || leagueLower === "wta" || combined.includes("tennis")) {
                    backdrop = sportsBackdrops.tennis;
                } else if (leagueLower === "f1" || combined.includes("racing")) {
                    backdrop = sportsBackdrops.f1;
                } else if (leagueLower === "ufc" || combined.includes("mma")) {
                    backdrop = sportsBackdrops.ufc;
                } else if (combined.includes("cricket")) {
                    backdrop = sportsBackdrops.cricket;
                } else if (combined.includes("rugby")) {
                    backdrop = sportsBackdrops.rugby;
                } else if (combined.includes("baseball")) {
                    backdrop = sportsBackdrops.baseball;
                } else if (combined.includes("hockey")) {
                    backdrop = sportsBackdrops.hockey;
                }

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
                overview: f.status === "live"
                    ? `LIVE NOW: ${f.homeTeam} vs ${f.awayTeam} in the ${f.leagueName || f.leagueId.toUpperCase()}. Current Score: ${f.homeScore}-${f.awayScore}. Stream in ultra HD quality.`
                    : `Upcoming: ${f.homeTeam} takes on ${f.awayTeam} in the ${f.leagueName || f.leagueId.toUpperCase()} Tournament. Witness every play in premium 4K quality.`,
                vote_average: f.status === "live" ? 9.9 : 9.8,
                release_date: f.status === "live" ? "🔴 LIVE NOW" : f.kickoffTimeFormatted,
                media_type: "sports",
                homeLogo: f.homeTeamLogo,
                awayLogo: f.awayTeamLogo,
                homeTeam: f.homeTeam,
                awayTeam: f.awayTeam,
                popularity: 200,
            };
        }) as unknown as Item[];

        const detail = topFixtures.map(f => ({
            genre: [
                { id: 100, name: (f.leagueName || f.leagueId.toUpperCase()).slice(0, 15) },
                { id: 101, name: f.status === "live" ? "Live Event" : "Upcoming" }
            ],
            translation: [
                f.status === "live" ? `LIVE SCORE: ${f.homeScore} - ${f.awayScore}` : `${f.homeTeam} vs ${f.awayTeam}`,
                `${f.homeTeam} vs ${f.awayTeam}`
            ]
        })) as BannerInfo[];

        return { bannerFilms: films, bannerDetail: detail };
    }, [liveFixtures, upcomingFixtures]);

    return (
        <div className="w-full">
            {/* Premium Banner */}
            <div className="mb-10">
                <BannerSlider
                    films={bannerFilms.length > 0 ? bannerFilms : undefined}
                    dataDetail={bannerDetail}
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
            {/* Live Channels Section - REMOVED per user request */}

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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFixtures.map((fixture) => {
                    const league = SPORTS_LEAGUES.find(
                        (item) => item.id === fixture.leagueId
                    );

                    const isSoccerFootball = ['epl', 'ucl', 'laliga', 'ligue1', 'seriea', 'bundesliga', 'afcon', 'world-cup'].includes(fixture.leagueId?.toLowerCase());

                    const targetUrl = (fixture.status === 'live' && isSoccerFootball && fixture.matchId)
                        ? `https://sportslive.run/matches/${fixture.matchId}?utm_source=StreamLux`
                        : fixture.matchId && isSoccerFootball
                            ? `https://sportslive.run/matches/${fixture.matchId}?utm_source=StreamLux`
                            : fixture.streamSources && fixture.streamSources.length > 0
                                ? fixture.streamSources[0]
                                : `/sports/${fixture.leagueId}/${fixture.id}/watch`;

                    const isExternal = !!(fixture.matchId || (fixture.streamSources && fixture.streamSources.length > 0));

                    return (
                        <a
                            key={fixture.id}
                            href={getMatchLink(fixture)}
                            target={isExternal ? "_blank" : "_self"}
                            rel={isExternal ? "noopener noreferrer" : ""}
                            className="group relative rounded-2xl bg-dark-lighten/40 backdrop-blur-md border border-white/5 hover:border-primary/40 hover:bg-dark-lighten/60 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-primary/10"
                        >
                            {/* Card Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative p-5">
                                {/* Header: League & Status */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary border border-white/5">
                                            {league?.flag ? (
                                                <span className="text-lg leading-none">{league.flag}</span>
                                            ) : (
                                                <MdSportsSoccer size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                {league?.name || "Competition"}
                                            </p>
                                            {fixture.round && (
                                                <p className="text-[9px] text-gray-500 font-medium leading-none">
                                                    {fixture.round}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-tighter uppercase border ${fixture.status === "live"
                                            ? "bg-red-500/10 text-red-500 border-red-500/30 animate-pulse"
                                            : fixture.status === "upcoming"
                                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                            }`}
                                    >
                                        {fixture.status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                        {fixture.status === "live" ? "Live" : fixture.status === "upcoming" ? "Upcoming" : "Replay"}
                                    </div>
                                </div>

                                {/* Teams & Score */}
                                <div className="flex items-center justify-between gap-4 my-6">
                                    {/* Home Team */}
                                    <div className="flex flex-col items-center flex-1 text-center group/team">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 p-2 mb-3 border border-white/5 group-hover/team:scale-110 transition-transform duration-300 flex items-center justify-center">
                                            {fixture.homeTeamLogo ? (
                                                <img
                                                    src={fixture.homeTeamLogo}
                                                    alt={fixture.homeTeam}
                                                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/default-team-logo-500.png&w=100&h=100`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-xl font-black text-primary">
                                                    {fixture.homeTeam.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs md:text-sm font-bold text-white line-clamp-1 group-hover/team:text-primary transition-colors">
                                            {fixture.homeTeam}
                                        </p>
                                    </div>

                                    {/* Score / VS */}
                                    <div className="flex flex-col items-center justify-center gap-1 px-2">
                                        {fixture.status === "live" ? (
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
                                                    {fixture.homeScore ?? 0}
                                                </span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                                                <span className="text-2xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
                                                    {fixture.awayScore ?? 0}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-black text-gray-600 tracking-widest uppercase">VS</span>
                                        )}
                                        {fixture.minute && (
                                            <p className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md mt-1 italic tracking-tight">
                                                {fixture.minute}
                                            </p>
                                        )}
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex flex-col items-center flex-1 text-center group/team">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 p-2 mb-3 border border-white/5 group-hover/team:scale-110 transition-transform duration-300 flex items-center justify-center">
                                            {fixture.awayTeamLogo ? (
                                                <img
                                                    src={fixture.awayTeamLogo}
                                                    alt={fixture.awayTeam}
                                                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/default-team-logo-500.png&w=100&h=100`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-xl font-black text-primary">
                                                    {fixture.awayTeam.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs md:text-sm font-bold text-white line-clamp-1 group-hover/team:text-primary transition-colors">
                                            {fixture.awayTeam}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                                    <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                                        {fixture.kickoffTimeFormatted.includes('T')
                                            ? new Date(fixture.kickoffTimeFormatted).toLocaleString([], {
                                                weekday: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : fixture.kickoffTimeFormatted}
                                        {fixture.venue && ` • ${fixture.venue}`}
                                    </p>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex gap-1.5">
                                            {fixture.broadcast?.slice(0, 2).map((b, i) => (
                                                <span key={i} className="text-[8px] font-black text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            {isExternal ? "StreamNow" : "Watch"} <span className="text-xs">→</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default SportsMainContent;
