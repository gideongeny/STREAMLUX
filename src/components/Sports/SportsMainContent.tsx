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
import { safeStorage } from "../../utils/safeStorage";

// Unified calendar row
const UpcomingCalendar = lazy(() => import("../Home/UpcomingCalendar"));

const SportsMainContent: FC = () => {
    const { t } = useTranslation();
    const { isMobile } = useCurrentViewportView();
    const [activeLeague, setActiveLeague] = useState<string>("all");
    const [activeStatus, setActiveStatus] = useState<"live" | "upcoming" | "replay">("live");
    const [liveFixtures, setLiveFixtures] = useState<SportsFixtureConfig[]>([]);
    const [upcomingFixtures, setUpcomingFixtures] = useState<SportsFixtureConfig[]>([]);
    const [varietySports, setVarietySports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real live data with Caching
    useEffect(() => {
        const fetchRealData = async () => {
            setIsLoading(true);
            // 1. Check Cache
            const cachedLive = safeStorage.get("sports_live_fixtures");
            const cachedUpcoming = safeStorage.get("sports_upcoming_fixtures");
            const cachedTime = safeStorage.get("sports_cache_time");
            const now = Date.now();
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            if (cachedLive && cachedUpcoming && cachedTime && (now - Number(cachedTime) < CACHE_DURATION)) {
                try {
                    const live = JSON.parse(cachedLive);
                    const upcoming = JSON.parse(cachedUpcoming);
                    setLiveFixtures(live);
                    setUpcomingFixtures(upcoming);
                    setIsLoading(false);
                    if (live.length === 0 && upcoming.length > 0) setActiveStatus("upcoming");

                    // Still fetch variety in background
                    getVarietySports().then(setVarietySports);
                    return;
                } catch (e) { }
            }

            // 2. Fetch Fresh Data
            try {
                const [live, upcoming, variety] = await Promise.all([
                    getLiveFixturesAPI(),
                    getUpcomingFixturesAPI(),
                    getVarietySports(),
                ]);

                setLiveFixtures(live);
                setUpcomingFixtures(upcoming);
                setVarietySports(variety);

                if (live.length === 0 && upcoming.length > 0) {
                    setActiveStatus("upcoming");
                } else if (live.length > 0) {
                    setActiveStatus("live");
                }

                safeStorage.set("sports_live_fixtures", JSON.stringify(live));
                safeStorage.set("sports_upcoming_fixtures", JSON.stringify(upcoming));
                safeStorage.set("sports_cache_time", String(now));

            } catch (error) {
                console.error("Error fetching sports data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRealData();

        const unsubscribe = subscribeToLiveScores((fixtures) => {
            setLiveFixtures(fixtures);
            if (fixtures.length > 0 && activeStatus !== "live") setActiveStatus("live");
        }, 60000);

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
        () => allFixtures.filter((f) => {
            const matchLeague = activeLeague === "all" || f.leagueId === activeLeague;
            const matchStatus = f.status === activeStatus;
            return matchLeague && matchStatus;
        }),
        [activeLeague, activeStatus, allFixtures]
    );

    const featuredMatch = useMemo(() => {
        if (liveFixtures.length > 0) return liveFixtures[0];
        if (upcomingFixtures.length > 0) return upcomingFixtures[0];

        // Final fallback: Use a variety item as spotlight (e.g. Football Highlights or Documentary)
        if (varietySports.length > 0) {
            const spotlight = varietySports.find(s => s.sportsCategory === "Replay") ||
                varietySports.find(s => s.sportsCategory === "Documentary") ||
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
                        {t('Arena Dashboard').split(' ')[0]} <span className="text-primary italic">{t('Arena Dashboard').split(' ')[1]}</span>
                    </h2>
                    <p className="text-gray-400 font-medium text-lg leading-relaxed">
                        {t('Experience sports in ultra-high definition. From the Premier League to the UFC octagon, witness every legendary moment in real-time.')}
                    </p>
                </div>
                {!isMobile && <div className="w-full max-w-sm"><SearchBox relative={true} /></div>}
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
                            ? `${tab.bg} ${tab.color} border-${tab.id === 'live' ? 'red' : tab.id === 'upcoming' ? 'amber' : 'emerald'}-500/50 shadow-2xl scale-105`
                            : "border-white/5 text-gray-500 hover:text-white hover:border-white/20"
                            }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Match Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
                {filteredFixtures.map((fixture) => (
                    <SportsPremiumMatchCard
                        key={fixture.id}
                        fixture={fixture}
                        isExternal={!!(fixture.matchId || (fixture.streamSources?.length || 0) > 0)}
                        getMatchLink={getMatchLink}
                    />
                ))}
                {filteredFixtures.length === 0 && !isLoading && (
                    <div className="col-span-full py-32 text-center rounded-[3rem] bg-dark-lighten/20 border border-dashed border-white/10">
                        <MdCalendarToday size={48} className="mx-auto text-gray-700 mb-6" />
                        <h3 className="text-2xl font-black text-white mb-2">NO EVENTS FOUND</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">No matches currently match your criteria. Try selecting another competition.</p>
                    </div>
                )}
            </div>

            {/* Variety Sports - Thematic Sliders */}
            {varietySports.length > 0 && (
                <div className="space-y-20">
                    <Suspense fallback={null}>
                        <SectionSlider
                            title={t('Elite Football Highlights')}
                            films={varietySports.filter(s => s.sportsCategory === "Replay")}
                        />
                        <SectionSlider
                            title={t('NCAA Collegiate Specials')}
                            films={varietySports.filter(s => s.sportsCategory === "NCAA")}
                        />
                        <SectionSlider
                            title={t('Pro Wrestling Highlights')}
                            films={varietySports.filter(s => s.sportsCategory === "Wrestling")}
                        />
                        <div className="relative group">
                            <div className="absolute -inset-10 bg-primary/5 rounded-[5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <SectionSlider
                                title={t('Combat Sports')}
                                films={varietySports.filter(s => s.sportsCategory === "MMA")}
                            />
                        </div>
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
