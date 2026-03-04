import { FC } from "react";
import { motion } from "framer-motion";
import { SPORTS_LEAGUES } from "../../shared/constants";

interface LeagueBentoGridProps {
    activeLeague: string;
    onLeagueSelect: (id: string) => void;
}

const LEAGUE_THEMES: Record<string, { color: string, glow: string }> = {
    epl: { color: "bg-[#3d195b]", glow: "shadow-[#3d195b]/40" },
    ucl: { color: "bg-[#003399]", glow: "shadow-[#003399]/40" },
    laliga: { color: "bg-[#f9a825]", glow: "shadow-[#f9a825]/40" },
    seria: { color: "bg-[#002d72]", glow: "shadow-[#002d72]/40" },
    ligue1: { color: "bg-[#daff00]", glow: "shadow-[#daff00]/40" },
    bundesliga: { color: "bg-[#d3010c]", glow: "shadow-[#d3010c]/40" },
    nba: { color: "bg-[#17408b]", glow: "shadow-[#17408b]/40" },
    ufc: { color: "bg-[#d20a0a]", glow: "shadow-[#d20a0a]/40" },
    f1: { color: "bg-[#e10600]", glow: "shadow-[#e10600]/40" },
    wwe: { color: "bg-[#0b0b0b]", glow: "shadow-[#ffffff]/10" },
    rugby: { color: "bg-[#004b23]", glow: "shadow-[#004b23]/40" },
};

const LeagueBentoGrid: FC<LeagueBentoGridProps> = ({ activeLeague, onLeagueSelect }) => {
    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">EXPLORE <span className="text-primary italic">LEAGUES</span></h2>
                <button
                    onClick={() => onLeagueSelect("all")}
                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300 ${activeLeague === "all" ? "bg-white text-black border-white" : "border-white/10 text-gray-400 hover:border-white/30"}`}
                >
                    All Arenas
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {SPORTS_LEAGUES.map((league, idx) => {
                    const theme = LEAGUE_THEMES[league.id] || { color: "bg-dark-lighten", glow: "shadow-black/20" };
                    const isActive = activeLeague === league.id;

                    return (
                        <motion.button
                            key={league.id}
                            onClick={() => onLeagueSelect(league.id)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            whileHover={{ y: -5, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`group relative h-24 md:h-32 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${isActive ? `ring-4 ring-primary ${theme.glow}` : "border border-white/5 hover:border-white/20"}`}
                        >
                            {/* Theme Background */}
                            <div className={`absolute inset-0 ${theme.color} opacity-80 group-hover:opacity-100 transition-opacity`} />

                            {/* Glass Overlay */}
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

                            {/* Content */}
                            <div className="absolute inset-0 p-4 flex flex-col justify-between items-start text-left">
                                <span className="text-2xl md:text-3xl text-white drop-shadow-lg">{league.flag || "🏆"}</span>
                                <div>
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                        Competition
                                    </p>
                                    <p className="text-xs md:text-sm font-black text-white leading-tight uppercase tracking-tighter">
                                        {league.shortName}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Glow */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
};

export default LeagueBentoGrid;
