import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdSportsSoccer } from "react-icons/md";
import { SportsFixtureConfig } from "../../shared/constants";
import { subscribeToLiveScores } from "../../services/sportsAPI";

const LiveSportsAlert: FC = () => {
    const [liveMatches, setLiveMatches] = useState<SportsFixtureConfig[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const unsubscribe = subscribeToLiveScores((fixtures) => {
            if (isMounted) {
                const live = fixtures.filter(f => f.status === "live");
                setLiveMatches(live);
                // Only show if there are live matches and we haven't dismissed it this session
                if (live.length > 0 && !sessionStorage.getItem("dismissedSportsAlert")) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            }
        }, 30000);

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const dismissAlert = () => {
        setIsVisible(false);
        sessionStorage.setItem("dismissedSportsAlert", "true");
    };

    if (!isVisible || liveMatches.length === 0) return null;

    const mainMatch = liveMatches[0];

    return (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-dark-lighten border border-primary/50 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden backdrop-blur-md">
                <div className="bg-primary/10 px-4 py-2 border-b border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Now</span>
                    </div>
                    <button
                        onClick={dismissAlert}
                        className="text-gray-400 hover:text-white transition"
                    >
                        ✕
                    </button>
                </div>
                <Link to="/sports" className="p-4 block hover:bg-white/5 transition">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <MdSportsSoccer size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-medium">{mainMatch.leagueId}</p>
                            <p className="text-sm text-white font-bold line-clamp-1">
                                {mainMatch.homeTeam} vs {mainMatch.awayTeam}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-white">{mainMatch.homeScore}</span>
                            <span className="text-gray-500 font-bold">-</span>
                            <span className="text-xl font-black text-white">{mainMatch.awayScore}</span>
                            {mainMatch.minute && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600/20 text-red-500 text-[10px] font-bold">
                                    {mainMatch.minute}
                                </span>
                            )}
                        </div>
                        <span className="text-primary text-xs font-bold group-hover:translate-x-1 transition">
                            Watch Live →
                        </span>
                    </div>
                </Link>
                {liveMatches.length > 1 && (
                    <div className="px-4 py-2 bg-black/20 text-[10px] text-gray-400 border-t border-white/5">
                        + {liveMatches.length - 1} other matches currently live
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveSportsAlert;
