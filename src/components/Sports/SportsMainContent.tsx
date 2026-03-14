import { FC, useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { MdSportsSoccer, MdFlashOn, MdCalendarToday, MdHistory } from "react-icons/md";
import SearchBox from "../Common/SearchBox";
import LiveScoreboard from "./LiveScoreboard";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { SPORTS_LEAGUES, SportsFixtureConfig } from "../../shared/constants";
import { getLiveFixturesAPI, getUpcomingFixturesAPI, getVarietySports, subscribeToLiveScores, getMatchLink } from "../../services/sportsAPI";
import SportsHero from "./SportsHero";
import LeagueBentoGrid from "./LeagueBentoGrid";
import SportsPremiumMatchCard from "./SportsPremiumMatchCard";
import SectionSlider from "../Slider/SectionSlider";
import MatchCenterModal from "./MatchCenterModal";
import TeamScheduleWidget from "./TeamScheduleWidget";
import { safeStorage } from "../../utils/safeStorage";

// Unified calendar row
const UpcomingCalendar = lazy(() => import("../Home/UpcomingCalendar"));

const CACHE_VERSION = "v2.2_elite"; // Force refresh for unified aggregator

const SportsMainContent: FC = () => {
    const { t } = useTranslation();
    const { isMobile } = useCurrentViewportView();
    const [activeLeague, setActiveLeague] = useState<string>("all");
    const [activeStatus, setActiveStatus] = useState<"live" | "upcoming" | "replay">("live");
    const [liveFixtures, setLiveFixtures] = useState<SportsFixtureConfig[]>([]);
    const [upcomingFixtures, setUpcomingFixtures] = useState<SportsFixtureConfig[]>([]);
    const [varietySports, setVarietySports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);

    // Fetch real live data with Caching & Stale-While-Revalidate
    useEffect(() => {
        // Init with cache immediately
        const cachedLive = safeStorage.get(`sports_live_fixtures_${CACHE_VERSION}`);
        if (cachedLive) {
            try { setLiveFixtures(JSON.parse(cachedLive)); } catch (e) {}
        }

        const unsubscribe = subscribeToLiveScores((fixtures) => {
            if (fixtures && fixtures.length > 0) {
                setLiveFixtures(fixtures);
                setIsLoading(false);
                // Background cache update
                safeStorage.set(`sports_live_fixtures_${CACHE_VERSION}`, JSON.stringify(fixtures));
            } else {
                // If we get 0 from subscriber, we DON'T overwrite if we already have data
                // This prevents the "refreshing back to 0" issue during silent aggregator failures
                console.warn("Subscriber returned empty. Retaining stale data.");
                setIsLoading(false);
            }
        }, 60000);

        // Background fetch for non-live content
        getUpcomingFixturesAPI().then(setUpcomingFixtures);
        getVarietySports().then(setVarietySports);

        return () => unsubscribe();
    }, []);

    const allFixtures = useMemo(() => {
        const combined = [...liveFixtures, ...upcomingFixtures];
        const seen = new Set<string>();
        const unique: SportsFixtureConfig[] = [];
        combined.forEach((f) => {
            if (!seen.has(f.id)) {
                seen.add(f.id);
                unique.push(f);
            }
        });
        return unique;
    }, [liveFixtures, upcomingFixtures]);

    const filteredFixtures = useMemo(
        () => {
            const matches = allFixtures.filter((f) => {
                const matchLeague = activeLeague === "all" || f.leagueId === activeLeague;
                const matchStatus = f.status === activeStatus;
                return matchLeague && matchStatus;
            });

            // FORCE LOGIC: If Live tab is empty, show top variety items (replays/highlights) instead of upcoming
            if (activeStatus === "live" && matches.length === 0) {
                return varietySports
                    .filter(s => activeLeague === "all" || s.leagueId === activeLeague)
                    .slice(0, 6)
                    .map(s => {
                        // Parse title to extract teams if possible (e.g. "Liverpool vs Chelsea Highlights")
                        const titleParts = s.title?.split(/\s+vs\s+|\s+-\s+|\s+v\s+/i) || [];
                        const home = titleParts[0]?.trim() || s.title?.substring(0, 10) || "Match";
                        const away = titleParts[1]?.trim() || "Highlights";
                        
                        return { 
                            ...s, 
                            status: "live" as any, 
                            isUpcomingMarquee: true,
                            homeTeam: home,
                            awayTeam: away,
                            homeTeamLogo: s.thumb || s.poster_path || "",
                            awayTeamLogo: s.thumb || s.poster_path || "",
                            kickoffTimeFormatted: "WATCH REPLAY",
                            venue: "VOD"
                        };
                    });
            }

            return matches;
        },
        [activeLeague, activeStatus, allFixtures]
    );

    const featuredMatch = useMemo(() => {
        if (liveFixtures.length > 0) return liveFixtures[0];
        if (upcomingFixtures.length > 0) return upcomingFixtures[0];

        // Final fallback: Use a variety item as spotlight (e.g. Football Highlights or Documentary)
        if (varietySports.length > 0) {
            const spotlight = varietySports.find(s => s.sportsCategory === "Replay" && s.youtubeId) ||
                varietySports.find(s => s.sportsCategory === "Documentary") ||
                varietySports.find(s => s.youtubeId) ||
                varietySports[0];
            return spotlight as SportsFixtureConfig;
        }
        return null;
    }, [liveFixtures, upcomingFixtures, varietySports]);

    return (
        <div className="w-full pb-20">
            {/* World Class Hero */}
            <div className="mb-12">
                <SportsHero
                    featuredMatch={featuredMatch}
                    isLoading={isLoading}
                    getMatchLink={getMatchLink}
                />
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
                        <MdFlashOn className="text-primary animate-pulse" />
                        {t('Arena Dashboard').includes(' ') ? (
                            <>
                                {t('Arena Dashboard').split(' ')[0]} <span className="text-primary italic">{t('Arena Dashboard').split(' ')[1]}</span>
                            </>
                        ) : (
                            <span className="text-primary italic">{t('Arena Dashboard')}</span>
                        )}
                    </h2>
                    <p className="text-gray-400 font-medium text-lg leading-relaxed">
                        {t('Experience sports in ultra-high definition. From the Premier League to the UFC octagon, witness every legendary moment in real-time.')}
                    </p>
                </div>
                {!isMobile && (
                    <div className="flex flex-col items-end gap-4 w-full max-w-sm">
                        <SearchBox relative={true} />
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Sportmonks Real-time Data Active</span>
                        </div>
                    </div>
                )}
            </div>

            {/* League Navigation Grid */}
            <LeagueBentoGrid activeLeague={activeLeague} onLeagueSelect={setActiveLeague} />

            {/* Live Scoreboard */}
            <div className="my-12">
                <LiveScoreboard />
            </div>

            {/* Content Tabs */}
            <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {[
                    { id: "live", label: t("Live Now"), icon: MdFlashOn, color: "text-red-500", bg: "bg-red-500/10" },
                    { id: "upcoming", label: t("Upcoming"), icon: MdCalendarToday, color: "text-amber-400", bg: "bg-amber-400/10" },
                    { id: "replay", label: t("Replays & Clips"), icon: MdHistory, color: "text-emerald-400", bg: "bg-emerald-400/10" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveStatus(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all duration-300 border ${activeStatus === tab.id
                            ? `${tab.bg} ${tab.color} border-primary shadow-2xl scale-105`
                            : "border-white/5 text-gray-500 hover:text-white hover:border-white/20"
                            }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-10 mb-20">
                {/* Main Match Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredFixtures.map((fixture) => (
                        <div key={fixture.id}>
                            <SportsPremiumMatchCard
                                fixture={fixture}
                                isExternal={!!(fixture.matchId || (fixture.streamSources?.length || 0) > 0)}
                                getMatchLink={getMatchLink}
                            />
                        </div>
                    ))}
                    {filteredFixtures.length === 0 && !isLoading && (
                        <div className="col-span-full py-32 text-center rounded-[3rem] bg-dark-lighten/20 border border-dashed border-white/10">
                            <MdCalendarToday size={48} className="mx-auto text-gray-700 mb-6" />
                            <h3 className="text-2xl font-black text-white mb-2">NO EVENTS FOUND</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">No matches currently match your criteria. Try selecting another competition.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Widget */}
                {!isMobile && (
                    <div className="w-full lg:w-80 space-y-8">
                        <TeamScheduleWidget teamId="3468" />
                        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary to-indigo-900 shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Streaming <span className="opacity-60 italic">Elite</span></h3>
                                <p className="text-xs text-white/70 font-bold mb-6">Install the StreamLux APK for zero-buffer 4K sports experience.</p>
                                <a href="https://github.com/gideongeny/STREAMLUX/releases/latest/download/app-release-unsigned.apk" className="inline-block px-6 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Get APK</a>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        </div>
                    </div>
                )}
            </div>

            {/* Variety Sports - Thematic Sliders */}
            {varietySports.length > 0 && (
                <div className="space-y-20">
                    <Suspense fallback={null}>
                    <SectionSlider
                            title={t('Elite Football Highlights')}
                            films={varietySports.filter(s => s.sportsCategory === "Elite Football" || s.sportsCategory === "Football")}
                        />
                        <SectionSlider
                            title={t('NBA Elite Clips')}
                            films={varietySports.filter(s => s.sportsCategory === "NBA" || s.sportsCategory === "Basketball")}
                        />
                        <SectionSlider
                            title={t('UFC Knockouts')}
                            films={varietySports.filter(s => s.sportsCategory === "UFC" || s.sportsCategory === "Combat Sports")}
                        />
                        <SectionSlider
                            title={t('Formula 1 On-Boards')}
                            films={varietySports.filter(s => s.sportsCategory === "F1" || s.sportsCategory === "Racing")}
                        />
                        <SectionSlider
                            title={t('Cricket Thrillers')}
                            films={varietySports.filter(s => s.sportsCategory === "Cricket")}
                        />
                         <SectionSlider
                            title={t('Tennis Masters')}
                            films={varietySports.filter(s => s.sportsCategory === "Tennis")}
                        />
                        <SectionSlider
                            title={t('NCAA Collegiate Specials')}
                            films={varietySports.filter(s => s.sportsCategory === "NCAA Collegiate")}
                        />
                        <SectionSlider
                            title={t('Pro Wrestling Highlights')}
                            films={varietySports.filter(s => s.sportsCategory === "Pro Wrestling")}
                        />
                        <SectionSlider
                            title={t('Sports Documentaries')}
                            films={varietySports.filter(s => s.sportsCategory === "Documentary" || s.sportsCategory === "Movie")}
                        />
                        <div className="py-12 px-8 rounded-[3rem] bg-gradient-to-br from-indigo-900/20 to-black border border-white/5">
                            <UpcomingCalendar title={t('Historical Match Replays')} contentType="sports" />
                        </div>
                    </Suspense>
                </div>
            )}

            {varietySports.length === 0 && !isLoading && (
                <div className="py-20 text-center">
                    <p className="text-gray-500">{t('Try another competition')}</p>
                </div>
            )}
        </div>
    );
};

export default SportsMainContent;
