import { FC, useMemo } from "react";
import { motion } from "framer-motion";
import { LEAGUE_STREAMS, SPORTS_LEAGUES } from "../../shared/constants";
import { Link } from "react-router-dom";

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
    const streams = useMemo(() => LEAGUE_STREAMS, []);

    const activeStream =
        streams.find((s) => s.leagueId === activeLeague) ||
        (activeLeague === "all" ? streams[0] : undefined);

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

                            {/* Watch overlay (if stream exists) */}
                            {streams.some((s) => s.leagueId === league.id) && (
                                <div className="absolute inset-x-0 top-0 p-2 flex justify-end">
                                    <Link
                                        to={`/sports/league/${league.id}/watch`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/50 backdrop-blur border border-white/15 text-white hover:bg-primary/30 hover:border-primary/30 transition"
                                    >
                                        Watch
                                    </Link>
                                </div>
                            )}

                            {/* Glow & Particles effect on active */}
                            {isActive && (
                                <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Live League Stream Embed */}
            <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                        LIVE <span className="text-primary italic">STREAM</span>
                    </h3>
                    <a
                        href={activeStream?.providerUrl || "https://StreamSports99.website"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-primary hover:underline"
                    >
                        Powered by StreamSports99
                    </a>
                </div>

                <div className="bg-dark-lighten border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex flex-wrap gap-2 p-3 border-b border-white/10">
                        {streams.slice(0, 12).map((s) => (
                            <button
                                key={s.leagueId}
                                onClick={() => onLeagueSelect(s.leagueId)}
                                className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition ${
                                    activeLeague === s.leagueId
                                        ? "bg-white text-black border-white"
                                        : "border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                                }`}
                            >
                                {s.leagueId}
                            </button>
                        ))}
                    </div>

                    <div className="p-4">
                        {activeStream ? (
                            <div className="max-w-[900px] mx-auto">
                                <div className="bg-[#1a1a2e] px-4 py-3 rounded-xl rounded-b-none border border-[#333] border-b-0">
                                    <p className="text-white font-bold text-sm">{activeStream.title}</p>
                                </div>
                                <div className="relative w-full overflow-hidden border border-[#333] rounded-xl rounded-t-none bg-black" style={{ paddingBottom: "56.25%" }}>
                                    <iframe
                                        src={activeStream.src}
                                        className="absolute inset-0 w-full h-full border-0"
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                        referrerPolicy="no-referrer"
                                        title={activeStream.title}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">
                                Select a league above to load its live stream.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LeagueBentoGrid;
