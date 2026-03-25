import { FC } from "react";
import { motion } from "framer-motion";
import { SPORTS_LEAGUES } from "../../shared/constants";

interface LeagueBentoGridProps {
    activeLeague: string;
    onLeagueSelect: (id: string) => void;
}

const LEAGUE_THEMES: Record<string, { color: string; glow: string; logo?: string; bg?: string }> = {
    epl: { color: "from-[#3d195b] to-[#1a0025]", glow: "shadow-[#3d195b]/60" },
    ucl: { color: "from-[#003399] to-[#001155]", glow: "shadow-[#003399]/60" },
    laliga: { color: "from-[#f9a825] to-[#b47800]", glow: "shadow-[#f9a825]/60" },
    seriea: { color: "from-[#002d72] to-[#00123a]", glow: "shadow-[#002d72]/60" },
    ligue1: { color: "from-[#1a1a2e] to-[#16213e]", glow: "shadow-[#daff00]/40" },
    bundesliga: { color: "from-[#d3010c] to-[#7a0006]", glow: "shadow-[#d3010c]/60" },
    nba: { color: "from-[#17408b] to-[#003366]", glow: "shadow-[#17408b]/60" },
    ufc: { color: "from-[#d20a0a] to-[#6b0000]", glow: "shadow-[#d20a0a]/60" },
    f1: { color: "from-[#e10600] to-[#6a0000]", glow: "shadow-[#e10600]/60" },
    wwe: { color: "from-[#1c1c1c] to-[#000000]", glow: "shadow-[#ffffff]/10" },
    rugby: { color: "from-[#004b23] to-[#002010]", glow: "shadow-[#004b23]/60" },
    afcon: { color: "from-[#009639] to-[#005520]", glow: "shadow-[#009639]/60" },
    athletics: { color: "from-[#4a148c] to-[#1a0042]", glow: "shadow-[#4a148c]/60" },
    "six-nations": { color: "from-[#0d47a1] to-[#00215a]", glow: "shadow-[#0d47a1]/60" },
};

const LeagueBentoGrid: FC<LeagueBentoGridProps> = ({ activeLeague, onLeagueSelect }) => {
    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    EXPLORE <span className="text-primary italic">LEAGUES</span>
                </h2>
                <button
                    onClick={() => onLeagueSelect("all")}
                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300 ${activeLeague === "all" ? "bg-white text-black border-white" : "border-white/10 text-gray-400 hover:border-white/30"}`}
                >
                    All Arenas
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {SPORTS_LEAGUES.map((league, idx) => {
                    const theme = LEAGUE_THEMES[league.id] || { color: "from-dark-lighten to-black", glow: "shadow-black/20" };
                    const isActive = activeLeague === league.id;

                    return (
                        <motion.button
                            key={league.id}
                            onClick={() => onLeagueSelect(league.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.03 }}
                            whileHover={{ y: -8, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`group relative h-28 md:h-36 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${isActive ? `ring-4 ring-primary ring-offset-4 ring-offset-dark ${theme.glow}` : "border border-white/5 hover:border-primary/40"}`}
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${theme.color}`} />

                            {/* Background Texture Logo */}
                            {theme.logo && (
                                <img
                                    src={theme.logo}
                                    alt=""
                                    className="absolute -right-4 -bottom-4 w-24 h-24 object-contain opacity-20 filter grayscale invert group-hover:scale-125 transition-transform duration-700"
                                />
                            )}

                            {/* Main Centered Logo (Large) */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                {league.logo || theme.logo ? (
                                    <img
                                        src={league.logo || theme.logo}
                                        alt={league.name}
                                        className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <span className="text-4xl md:text-5xl drop-shadow-2xl">
                                        {league.flag || "🏆"}
                                    </span>
                                )}
                            </div>

                            {/* Info Overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 pt-6">
                                <p className="text-[10px] md:text-xs font-black text-white/90 uppercase tracking-widest text-center truncate group-hover:text-primary transition-colors">
                                    {league.shortName}
                                </p>
                            </div>

                            {/* Glow & Particles effect on active */}
                            {isActive && (
                                <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
};

export default LeagueBentoGrid;
