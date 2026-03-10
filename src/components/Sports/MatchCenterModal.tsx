import { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMatchDetails } from "../../services/sportmonksAPI";

interface MatchCenterModalProps {
    fixtureId: string;
    onClose: () => void;
}

const MatchCenterModal: FC<MatchCenterModalProps> = ({ fixtureId, onClose }) => {
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"info" | "lineups" | "stats" | "events">("info");

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const data = await getMatchDetails(fixtureId.replace("sm-live-", ""));
            setMatch(data);
            setLoading(false);
        };
        fetchDetails();
    }, [fixtureId]);

    const homeTeam = match?.participants?.find((p: any) => p.meta?.location === "home");
    const awayTeam = match?.participants?.find((p: any) => p.meta?.location === "away");

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f0f0f] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Header: Scoreboard */}
                    <div className="p-8 bg-gradient-to-b from-primary/20 to-transparent border-b border-white/5">
                        <div className="flex items-center justify-between gap-4 md:gap-12">
                            <div className="flex flex-col items-center gap-3 flex-1 text-center">
                                <img src={homeTeam?.image_path} alt={homeTeam?.name} className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-glow" />
                                <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter">{homeTeam?.name}</h3>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="text-4xl md:text-6xl font-black text-white flex items-center gap-4 italic tracking-tighter">
                                    <span>{match?.scores?.find((s: any) => s.description === "CURRENT" && s.score?.participant === "home")?.score?.goals || 0}</span>
                                    <span className="text-white/20">:</span>
                                    <span>{match?.scores?.find((s: any) => s.description === "CURRENT" && s.score?.participant === "away")?.score?.goals || 0}</span>
                                </div>
                                <span className="bg-red-600 animate-pulse text-white text-[10px] font-black px-3 py-1 rounded-full">{match?.state?.name || "LIVE"}</span>
                            </div>

                            <div className="flex flex-col items-center gap-3 flex-1 text-center">
                                <img src={awayTeam?.image_path} alt={awayTeam?.name} className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-glow" />
                                <h3 className="text-white font-black text-sm md:text-xl uppercase tracking-tighter">{awayTeam?.name}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex border-b border-white/5 bg-black/40">
                        {["info", "lineups", "stats", "events"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-500 hover:text-white"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        {loading ? (
                            <div className="h-40 flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {activeTab === "info" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">League</p>
                                            <p className="text-white font-bold">{match?.league?.name}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Venue</p>
                                            <p className="text-white font-bold">{match?.venue?.name}</p>
                                        </div>

                                        {/* Elite External Streams */}
                                        <div className="md:col-span-2 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[10px] text-primary font-black uppercase tracking-widest">Elite External Streams (High Quality)</p>
                                                <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded">AUTO-GENERATED</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <a
                                                    href={`https://footstreams.co/${homeTeam?.name?.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeam?.name?.toLowerCase().replace(/\s+/g, '-')}/`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-[10px] font-black text-center uppercase transition-all shadow-lg shadow-blue-900/20"
                                                >
                                                    Footstreams HD
                                                </a>
                                                <a
                                                    href={`https://www.soccertvhd.com/score808-live-${homeTeam?.name?.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeam?.name?.toLowerCase().replace(/\s+/g, '-')}/`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-xl text-[10px] font-black text-center uppercase transition-all shadow-lg shadow-green-900/20"
                                                >
                                                    Score808 Live
                                                </a>
                                                <a
                                                    href="https://www.skysports.com/football/results"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl text-[10px] font-black text-center uppercase transition-all shadow-lg shadow-red-900/20"
                                                >
                                                    Sky Sports Hub
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "stats" && (
                                    <div className="space-y-4">
                                        {match?.statistics?.map((stat: any, idx: number) => (
                                            <div key={idx} className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-black text-white uppercase tracking-tighter">
                                                    <span>{stat.home_value || 0}</span>
                                                    <span>{stat.type?.name}</span>
                                                    <span>{stat.away_value || 0}</span>
                                                </div>
                                                <div className="h-1 bg-white/10 rounded-full overflow-hidden flex">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${(stat.home_value / (stat.home_value + stat.away_value)) * 100}%` }}
                                                    />
                                                    <div
                                                        className="h-full bg-white/40"
                                                        style={{ width: `${(stat.away_value / (stat.home_value + stat.away_value)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === "events" && (
                                    <div className="space-y-4 relative">
                                        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />
                                        {match?.events?.map((event: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 items-start relative z-10">
                                                <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-black text-primary">{event.minute}'</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex-1">
                                                    <p className="text-xs font-black text-white uppercase">{event.type?.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{event.player?.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MatchCenterModal;
