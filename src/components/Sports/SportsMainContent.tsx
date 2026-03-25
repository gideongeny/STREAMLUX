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
import SportsCardSkeleton from "./SportsCardSkeleton";
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
    const [isLoading, setIsLoading] = useState(liveFixtures.length === 0);
    const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);

    // Fetch real live data with Caching & Stale-While-Revalidate
    const fetchData = async () => {
        setIsLoading(true);
        // Background fetch for non-live content
        try {
            const [upcoming, variety] = await Promise.all([
                getUpcomingFixturesAPI(),
                getVarietySports()
            ]);
            setUpcomingFixtures(upcoming);
            setVarietySports(variety);
            
            // Cache variety sports too
            safeStorage.set(`sports_variety_${CACHE_VERSION}`, JSON.stringify(variety));
        } catch (err) {
            console.error("Failed to fetch sports data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Init with cache immediately
        const cachedLive = safeStorage.get(`sports_live_fixtures_${CACHE_VERSION}`);
        if (cachedLive) {
            try { setLiveFixtures(JSON.parse(cachedLive)); } catch (e) {}
        }
        
        const cachedVariety = safeStorage.get(`sports_variety_${CACHE_VERSION}`);
        if (cachedVariety) {
            try { setVarietySports(JSON.parse(cachedVariety)); } catch (e) {}
        }

        const unsubscribe = subscribeToLiveScores((fixtures) => {
            if (fixtures && fixtures.length > 0) {
                setLiveFixtures(fixtures);
                // Background cache update
                safeStorage.set(`sports_live_fixtures_${CACHE_VERSION}`, JSON.stringify(fixtures));
            }
            setIsLoading(false);
        }, 60000);

        fetchData();

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
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Live data: ESPN / TheSportsDB + fallbacks</span>
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
                    {isLoading && filteredFixtures.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => <SportsCardSkeleton key={i} />)
                    ) : (
                        filteredFixtures.map((fixture) => (
                            <div key={fixture.id}>
                                <SportsPremiumMatchCard
                                    fixture={fixture}
                                    isExternal={!!(fixture.matchId || (fixture.streamSources?.length || 0) > 0)}
                                    getMatchLink={getMatchLink}
                                />
                            </div>
                        ))
                    )}
                    
                    {filteredFixtures.length === 0 && !isLoading && (
                        <div className="col-span-full py-32 text-center rounded-[3rem] bg-dark-lighten/20 border border-dashed border-white/10">
                            <MdCalendarToday size={48} className="mx-auto text-gray-700 mb-6" />
                            <h3 className="text-2xl font-black text-white mb-2">NO EVENTS FOUND</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-6">No matches currently match your criteria. Try selecting another competition.</p>
                            <button 
                                onClick={fetchData} 
                                className="px-8 py-3 bg-primary text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
                            >
                                Retry Fetch
                            </button>
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

            {/* Variety Sports - Adaptive Grid Refactor */}
            {varietySports.length > 0 && (
                <div className="space-y-24">
                    <Suspense fallback={null}>
                         {/* We swap horizontal sliders for a centralized 'See All' Browseable Grid for certain categories */}
                         <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                    Browse <span className="text-primary italic">Variety Arena</span>
                                </h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Grid View Enabled</p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {varietySports.slice(0, 10).map((s, idx) => (
                                    <div key={idx} className="group relative aspect-[16/9] rounded-2xl overflow-hidden bg-dark-lighten/20 border border-white/5 hover:border-primary/40 transition-all">
                                        <img src={s.thumb || s.poster_path} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <p className="text-[10px] font-black text-white uppercase truncate">{s.title}</p>
                                            <p className="text-[8px] text-primary font-bold uppercase tracking-tighter">{s.sportsCategory}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>

                        <SectionSlider
                            title={t('Elite Football Highlights')}
                            films={varietySports.filter(s => s.sportsCategory === "Elite Football" || s.sportsCategory === "Football")}
                        />
                        {/* More sliders can remain but prioritizing the grid above */}
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
