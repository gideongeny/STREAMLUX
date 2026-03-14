import { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdOutlineStadium, MdAccessTime, MdTrendingUp } from "react-icons/md";
import { SportsFixtureConfig } from "../../shared/constants";
import { hapticImpact } from "../../shared/utils";
import { searchYouTube } from "../../services/youtubeContent";

interface MatchCardPremiumProps {
    fixture: SportsFixtureConfig;
    isExternal?: boolean;
    getMatchLink: (f: SportsFixtureConfig) => string;
}

const SportsPremiumMatchCard: FC<MatchCardPremiumProps> = ({ fixture, isExternal, getMatchLink }) => {
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<string>("");
    const [statusLabel, setStatusLabel] = useState<string>(fixture.status || "");

    useEffect(() => {
        const updateStatus = () => {
            const now = new Date();
            const kickoffText = fixture.kickoffTimeFormatted || "";
            const kickoff = kickoffText.includes('T') ? new Date(kickoffText) : new Date();
            
            // If the kickoff format doesn't have T, it might be a simple time string, we need to handle that
            let kickoffDate = new Date(kickoffText);
            if (isNaN(kickoffDate.getTime())) {
                // Try today with the given time
                 const matches = kickoffText.match(/\d+/g);
                 const hours = matches?.[0] || "0";
                 const minutes = matches?.[1] || "0";
                 kickoffDate = new Date();
                 kickoffDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            }

            const diff = kickoffDate.getTime() - now.getTime();

            if (fixture.status === "live") {
                setStatusLabel("LIVE");
                setCountdown("");
            } else if (fixture.status === "ended" || fixture.status === "FT" || fixture.status === "Full Time") {
                setStatusLabel("FT");
                setCountdown("");
            } else if (diff > 0) {
                setStatusLabel("Upcoming");
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            } else {
                setStatusLabel(fixture.status || "Check App");
                setCountdown("");
            }
        };

        updateStatus();
        const timer = setInterval(updateStatus, 1000);
        return () => clearInterval(timer);
    }, [fixture]);

    useEffect(() => {
        if ((fixture as any).isUpcomingMarquee) {
            const query = `${fixture.homeTeam} vs ${fixture.awayTeam} highlights`;
            const cacheKey = `sports_bg_${query.replace(/\s+/g, '_')}`;
            
            // 1. Check permanent cache first
            try {
                const cachedBg = localStorage.getItem(cacheKey);
                if (cachedBg) {
                    setBgImage(cachedBg);
                    return; // Skip API call entirely
                }
            } catch (e) {}

            // 2. Fetch if not cached
            searchYouTube(query, "multi")
                .then(res => {
                    if (res && res.length > 0) {
                        const img = res[0].backdrop_path || res[0].poster_path || null;
                        if (img) {
                            setBgImage(img);
                            try {
                                localStorage.setItem(cacheKey, img); // Save permanently
                            } catch (e) {}
                        }
                    }
                })
                .catch(() => {});
        }
    }, [fixture.homeTeam, fixture.awayTeam, fixture]);

    const handlePress = () => {
        hapticImpact();
    };

    const homeProb = fixture.homeProb || Math.floor(Math.random() * 41 + 30);
    const awayProb = 100 - homeProb;

    return (
        <motion.a
            href={getMatchLink(fixture)}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : ""}
            onClick={handlePress}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative block w-full aspect-[4/5] md:aspect-[3/4] rounded-3xl overflow-hidden bg-dark-lighten/20 border border-white/5 shadow-2xl transition-all duration-500 hover:shadow-primary/20"
        >
            {/* Dynamic Background Image for Marquee */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-75 transition-opacity duration-700 bg-slate-900"
                style={{ 
                    backgroundImage: bgImage 
                        ? `url(${bgImage})` 
                        : `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop')`,
                    backgroundBlendMode: "overlay"
                }}
            />

            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-700 ${bgImage ? 'mix-blend-overlay' : ''}`} />

            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">

                {/* League & Status */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                        {fixture.leagueName || fixture.leagueId.toUpperCase()}
                    </span>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-tighter uppercase border ${statusLabel === "Upcoming"
                        ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                        : statusLabel === "LIVE"
                            ? "bg-red-500/20 text-red-500 border-red-500/40 animate-pulse"
                            : statusLabel === "FT"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                                : "bg-white/5 text-gray-400 border-white/10"
                        }`}>
                        {statusLabel} {countdown && `• ${countdown}`}
                    </div>
                </div>

                {/* Main Match Visuals */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 p-3 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm shadow-xl">
                            {fixture.homeTeamLogo ? (
                                <img src={fixture.homeTeamLogo} alt={fixture.homeTeam} className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                            ) : (
                                <span className="text-xl font-black text-white">{fixture.homeTeam.charAt(0)}</span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-white text-center line-clamp-1">{fixture.homeTeam}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        {(statusLabel === "LIVE" || statusLabel === "FT") ? (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl md:text-3xl font-black text-white tabular-nums">{fixture.homeScore ?? 0}</span>
                                <span className="text-gray-600">:</span>
                                <span className="text-2xl md:text-3xl font-black text-white tabular-nums">{fixture.awayScore ?? 0}</span>
                            </div>
                        ) : (
                            <span className="text-xl font-black text-gray-500 italic opacity-50">VS</span>
                        )}
                        {fixture.minute && statusLabel === "LIVE" && (
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md italic">{fixture.minute}'</span>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 p-3 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm shadow-xl">
                            {fixture.awayTeamLogo ? (
                                <img src={fixture.awayTeamLogo} alt={fixture.awayTeam} className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                            ) : (
                                <span className="text-xl font-black text-white">{fixture.awayTeam.charAt(0)}</span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-white text-center line-clamp-1">{fixture.awayTeam}</span>
                    </div>
                </div>

                {/* Stats Layer */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col">
                        <span className="text-[8px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
                            <MdTrendingUp size={10} className="text-green-500" /> Win Prob
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="h-1 flex-grow bg-gray-800 rounded-full overflow-hidden flex">
                                <div style={{ width: `${homeProb}%` }} className="h-full bg-primary" />
                                <div style={{ width: `${awayProb}%` }} className="h-full bg-gray-600" />
                            </div>
                            <span className="text-[10px] font-black text-white">{homeProb}%</span>
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col justify-center">
                        <span className="text-[8px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
                            <MdOutlineStadium size={10} className="text-blue-400" /> Venue
                        </span>
                        <span className="text-[9px] font-medium text-white line-clamp-1">
                            {fixture.venue || "Official Arena"}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <MdAccessTime size={14} />
                        <span className="text-[10px] font-medium tracking-tight">
                            {fixture.kickoffTimeFormatted.includes('T')
                                ? new Date(fixture.kickoffTimeFormatted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : fixture.kickoffTimeFormatted}
                        </span>
                    </div>
                    <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform">
                        WATCH NOW →
                    </span>
                </div>
            </div>

            {/* Gloss Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 -rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] pointer-events-none" />
        </motion.a>
    );
};

export default SportsPremiumMatchCard;
