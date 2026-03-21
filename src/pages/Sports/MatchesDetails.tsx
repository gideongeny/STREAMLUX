import { FC, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdFlashOn, MdCalendarToday, MdHistory, MdArrowBack, MdShare, MdFullscreen, MdInfo } from "react-icons/md";
import { RiRobot2Fill } from "react-icons/ri";

import { getLiveFixturesAPI, getUpcomingFixturesAPI, getMatchEvents, getMatchStatistics } from "../../services/sportsAPI";
import { getMatchDetails } from "../../services/sportmonksAPI";

import SearchBox from "../../components/Common/SearchBox";
import Footer from "../../components/Footer/Footer";
import { hapticImpact } from "../../shared/utils";

const MatchesDetails: FC = () => {
    const { fixtureId } = useParams<{ fixtureId: string }>();
    const navigate = useNavigate();
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"stream" | "stats" | "events" | "lineups">("stream");
    const [hotMatches, setHotMatches] = useState<any[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [countdown, setCountdown] = useState<string>("");
    const [statusLabel, setStatusLabel] = useState<string>("");

    useEffect(() => {
        if (!match) return;
        
        const updateStatus = () => {
            const now = new Date();
            const kickoffText = match?.kickoffTimeFormatted || "";
            let kickoffDate = new Date(kickoffText);
            
            if (isNaN(kickoffDate.getTime())) {
                 const matches = kickoffText.match(/\d+/g);
                 const hours = matches?.[0] || "0";
                 const minutes = matches?.[1] || "0";
                 kickoffDate = new Date();
                 kickoffDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            }

            const diff = kickoffDate.getTime() - now.getTime();

            if (match.status === "live") {
                setStatusLabel("LIVE");
                setCountdown("");
            } else if (match.status === "ended" || match.status === "FT" || match.status === "Full Time") {
                setStatusLabel("FT");
                setCountdown("");
            } else if (diff > 0) {
                setStatusLabel("Upcoming");
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            } else {
                setStatusLabel(match.status || "Check App");
                setCountdown("");
            }
        };

        updateStatus();
        const timer = setInterval(updateStatus, 1000);
        return () => clearInterval(timer);
    }, [match]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Fetch Hot Matches for sidebar
                const live = await getLiveFixturesAPI();
                setHotMatches(live.slice(0, 5));

                // If it's a Sportmonks match, get deep details
                if (fixtureId?.startsWith("sm-")) {
                    const rawId = fixtureId.replace("sm-live-", "").replace("sm-up-", "");
                    const details = await getMatchDetails(rawId);
                    setMatch(details);
                    
                    // Fetch real-time stats/events if it's a SM match
                    const [smStats, smEvents] = await Promise.all([
                        getMatchStatistics(fixtureId),
                        getMatchEvents(fixtureId)
                    ]);
                    setStats(smStats);
                    setEvents(smEvents);
                } else {
                    // Fallback or generic match logic
                    // For now, find it in the live list
                    const found = live.find(m => String(m.id) === fixtureId);
                    if (found) setMatch(found);
                }
            } catch (error) {
                console.error("Error loading match details:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [fixtureId]);

    const homeTeam = useMemo(() => {
        if (fixtureId?.startsWith("sm-")) {
            return match?.participants?.find((p: any) => p.meta?.location === "home");
        }
        return { name: match?.homeTeam, image_path: match?.homeTeamLogo };
    }, [match, fixtureId]);

    const awayTeam = useMemo(() => {
        if (fixtureId?.startsWith("sm-")) {
            return match?.participants?.find((p: any) => p.meta?.location === "away");
        }
        return { name: match?.awayTeam, image_path: match?.awayTeamLogo };
    }, [match, fixtureId]);

    const streamUrl = useMemo(() => {
        if (match?.streamSources?.[0]?.url) return match.streamSources[0].url;
        // Construct predictive stream link if no explicit source
        const slug = `${homeTeam?.name?.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeam?.name?.toLowerCase().replace(/\s+/g, '-')}`;
        return `https://sportslive.run/matches/${slug}`;
    }, [match, homeTeam, awayTeam]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary font-black animate-pulse tracking-[0.3em] uppercase text-xs">Initializing Arena...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
            

            <main className="flex-grow flex flex-col lg:flex-row h-screen overflow-hidden">
                {/* Left Section: Match & Stream */}
                <div className="flex-grow flex flex-col overflow-y-auto scrollbar-hide">
                    {/* Header Nav */}
                    <div className="p-6 flex items-center justify-between border-b border-white/5 bg-black/40 sticky top-0 z-50 backdrop-blur-xl">
                        <div className="flex items-center gap-6">
                            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
                                <MdArrowBack size={24} />
                            </button>
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-tighter">Match <span className="text-primary italic">Intelligence</span></h1>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{match?.league?.name || match?.leagueName || "Global Competition"}</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <SearchBox relative={true} />
                            <MdShare size={24} className="text-gray-400 cursor-pointer hover:text-white transition" />
                        </div>
                    </div>

                    {/* Immersive Match Card */}
                    <div className="p-6">
                        <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-900/40 to-black border border-white/10 shadow-2xl mb-8">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                            
                            {/* Scoreboard Area */}
                            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black/40 border border-white/10 p-4 flex items-center justify-center backdrop-blur-md shadow-2xl">
                                        <img src={homeTeam?.image_path} alt={homeTeam?.name} className="max-w-full max-h-full object-contain drop-shadow-glow" />
                                    </div>
                                    <h2 className="text-white font-black text-lg md:text-2xl uppercase tracking-tighter max-w-[200px]">{homeTeam?.name}</h2>
                                    <span className="text-[10px] font-black py-1 px-3 bg-white/5 rounded-full text-gray-400">HOME</span>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-6 md:gap-12 text-6xl md:text-8xl font-black italic tracking-tighter drop-shadow-glow">
                                        <span className={(statusLabel === "LIVE" || statusLabel === "FT") ? "text-white" : "text-white/20"}>{match?.homeScore || 0}</span>
                                        <span className="text-primary animate-pulse">:</span>
                                        <span className={(statusLabel === "LIVE" || statusLabel === "FT") ? "text-white" : "text-white/20"}>{match?.awayScore || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`px-5 py-2 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center gap-2 ${
                                            statusLabel === "Upcoming" ? "bg-amber-600 shadow-amber-600/50" :
                                            statusLabel === "LIVE" ? "bg-red-600 animate-pulse" :
                                            "bg-blue-600 shadow-blue-600/50"
                                        }`}>
                                            {(statusLabel === "LIVE" || statusLabel === "Upcoming") && <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>}
                                            <span className="text-[12px] font-black uppercase tracking-widest">
                                                {statusLabel} {countdown && `| ${countdown}`} {statusLabel === "LIVE" && match?.minute && `| ${match.minute}'`}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{match?.venue || "Main Arena"}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black/40 border border-white/10 p-4 flex items-center justify-center backdrop-blur-md shadow-2xl">
                                        <img src={awayTeam?.image_path} alt={awayTeam?.name} className="max-w-full max-h-full object-contain drop-shadow-glow" />
                                    </div>
                                    <h2 className="text-white font-black text-lg md:text-2xl uppercase tracking-tighter max-w-[200px]">{awayTeam?.name}</h2>
                                    <span className="text-[10px] font-black py-1 px-3 bg-white/5 rounded-full text-gray-400">AWAY</span>
                                </div>
                            </div>

                            {/* Momentum Tracker (Mini) */}
                            <div className="px-12 pb-8 flex items-center gap-4 relative z-10">
                                <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden flex">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-primary"></motion.div>
                                    <div className="h-full bg-indigo-500 w-[10%]"></div>
                                    <div className="h-full bg-white/20 w-[25%]"></div>
                                </div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Momentum Live</span>
                            </div>
                        </div>

                        {/* Tabs Container */}
                        <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-[2.5rem] mb-8">
                            {[
                                { id: "stream", label: "Live Stream", icon: MdFlashOn },
                                { id: "stats", label: "Intelligence", icon: MdInfo },
                                { id: "events", label: "Timeline", icon: MdHistory },
                                { id: "lineups", label: "Lineups", icon: MdArrowBack }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id as any); hapticImpact(); }}
                                    className={`flex-1 py-4 flex items-center justify-center gap-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-primary text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content: Stream Player */}
                        <AnimatePresence mode="wait">
                            {activeTab === "stream" && (
                                <motion.div
                                    key="stream"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative aspect-video rounded-[3rem] overflow-hidden bg-black border border-white/10 group mb-10"
                                >
                                    <iframe
                                        src={streamUrl}
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                        title="Live Stream"
                                    ></iframe>
                                    <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Secure Stream Active</span>
                                    </div>
                                    <button className="absolute bottom-6 right-6 w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:scale-110">
                                        <MdFullscreen size={24} />
                                    </button>
                                </motion.div>
                            )}

                            {activeTab === "stats" && (
                                <motion.div
                                    key="stats"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
                                >
                                    {stats.length > 0 ? stats.map((stat, idx) => (
                                        <div key={idx} className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                                            <div className="flex justify-between text-[11px] font-black text-white uppercase tracking-widest mb-3">
                                                <span>{stat.home_value || 0}</span>
                                                <span className="text-primary">{stat.type?.name}</span>
                                                <span>{stat.away_value || 0}</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-primary" style={{ width: `${(stat.home_value / (stat.home_value + stat.away_value)) * 100}%` }}></div>
                                                <div className="h-full bg-white/20" style={{ width: `${(stat.away_value / (stat.home_value + stat.away_value)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-gray-500 font-bold uppercase tracking-widest">Stats are populating live...</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "events" && (
                                <motion.div
                                    key="events"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 mb-10"
                                >
                                    {events.map((event, idx) => (
                                        <div key={idx} className="flex gap-6 items-start">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                <span className="text-xl font-black text-primary">{event.minute}'</span>
                                            </div>
                                            <div className="flex-grow p-6 rounded-[2rem] bg-white/5 border border-white/5">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="text-sm font-black text-white uppercase">{event.type?.name}</h4>
                                                    <span className="text-[10px] font-bold text-gray-500">{event.player?.name}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium">Recorded in match log</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom Disclaimer */}
                        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 text-[10px] text-gray-500 leading-relaxed font-medium uppercase tracking-wider mb-20 text-center">
                            Streaming data is aggregated from reliable global sources including VipSport, FoxTrend, and WeScore. 
                            StreamLux does not host any content. All trademarks belong to their respective owners.
                        </div>
                    </div>
                </div>

                {/* Right Section: Hot Matches & Discovery */}
                <aside className="w-full lg:w-[400px] border-l border-white/5 bg-black overflow-y-auto p-8 scrollbar-hide">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Hot <span className="text-primary">Matches</span></h3>
                        <div className="px-3 py-1 bg-primary/10 rounded-lg text-primary text-[10px] font-black">LIVE NOW</div>
                    </div>

                    <div className="space-y-6">
                        {hotMatches.map((m) => (
                            <Link 
                                to={`/matches/details/${m.id}`} 
                                key={m.id}
                                className="block group"
                            >
                                <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{m.leagueName || "Elite League"}</span>
                                        <span className="text-[9px] font-black text-red-500 flex items-center gap-1 uppercase">
                                            <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                                            LIVE
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex -space-x-3">
                                            <img src={m.homeTeamLogo} className="w-10 h-10 rounded-full border-2 border-black bg-white object-contain p-1" />
                                            <img src={m.awayTeamLogo} className="w-10 h-10 rounded-full border-2 border-black bg-white object-contain p-1" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-xs font-black text-white text-ellipsis overflow-hidden line-clamp-1 truncate">{m.homeTeam} vs {m.awayTeam}</p>
                                            <p className="text-[10px] text-gray-500 font-bold">{m.venue || "Stadium"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-grow h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                                        </div>
                                        <span className="text-[8px] font-black text-primary">WATCH</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Genius AI Mini Widget */}
                    <div className="mt-12 p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-indigo-900 border border-primary/30 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white mb-6 shadow-2xl rotate-3">
                            <RiRobot2Fill size={32} />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase mb-2">Genius Match Analyzer</h4>
                        <p className="text-xs text-white/70 font-medium mb-6 leading-relaxed">Let StreamLux Genius analyze live statistics and predict the winner for you.</p>
                        <button className="w-full py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition active:scale-95">Open Genius</button>
                    </div>
                </aside>
            </main>

            <Footer />
        </div>
    );
};

export default MatchesDetails;
