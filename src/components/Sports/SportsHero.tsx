import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPlayArrow, MdInfoOutline, MdNotificationsActive } from "react-icons/md";
import { SportsFixtureConfig } from "../../shared/constants";
import SportsHeroTrailer from "../Home/HeroTrailer";

interface SportsHeroProps {
    featuredMatch: SportsFixtureConfig | null;
    isLoading?: boolean;
    getMatchLink: (f: SportsFixtureConfig) => string;
}

const SportsHero: FC<SportsHeroProps> = ({ featuredMatch, isLoading, getMatchLink }) => {
    if (isLoading || !featuredMatch) {
        return (
            <div className="w-full aspect-[21/9] min-h-[400px] rounded-[2.5rem] bg-dark-lighten/10 animate-pulse border border-white/5" />
        );
    }

    const isLive = featuredMatch.status === "live";

    return (
        <section className="relative w-full aspect-[21/9] min-h-[450px] md:min-h-[550px] rounded-[3rem] overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10">
            {/* Immersive Background */}
            <div className="absolute inset-0">
                <img
                    src={featuredMatch.banner || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80"}
                    alt="Featured Match"
                    className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110"
                />

                {/* Auto-playing Trailer Backdrop */}
                <div className="absolute inset-0 z-10">
                    <SportsHeroTrailer
                        mediaId={Number(featuredMatch.id.replace(/[^0-9]/g, "")) || 0}
                        mediaType="movie" // Sports can reuse movie trailer logic for YT search
                        isActive={true}
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-20" />
            </div>

            {/* Dynamic Ambient Glow */}
            <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-20`} />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 z-30">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-4xl space-y-6"
                >
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl backdrop-blur-xl border border-white/10 ${isLive ? "bg-red-600/30 border-red-500/50" : "bg-white/10"}`}>
                            {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                            <span className={`text-xs font-black uppercase tracking-widest ${isLive ? "text-red-400" : "text-white"}`}>
                                {isLive ? "Live Match Center" : "Upcoming Spotlight"}
                            </span>
                        </div>
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                            {featuredMatch.leagueName || featuredMatch.leagueId.toUpperCase()}
                        </span>
                    </div>

                    {/* Title / Teams */}
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl">
                        {featuredMatch.homeTeam} <span className="text-primary/80 italic text-3xl md:text-5xl align-middle mx-2 md:mx-4">vs</span> {featuredMatch.awayTeam}
                    </h1>

                    {/* Score / Time Overlay */}
                    <div className="flex items-center gap-8 md:gap-12 py-4">
                        {isLive ? (
                            <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="flex flex-col items-center">
                                    <span className="text-5xl font-black text-white tabular-nums drop-shadow-lg">{featuredMatch.homeScore ?? 0}</span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase">Home</span>
                                </div>
                                <div className="h-10 w-px bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <span className="text-5xl font-black text-white tabular-nums drop-shadow-lg">{featuredMatch.awayScore ?? 0}</span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase">Away</span>
                                </div>
                                {featuredMatch.minute && (
                                    <>
                                        <div className="h-10 w-px bg-white/10" />
                                        <div className="px-3 py-1 bg-red-600 rounded-lg text-xs font-black italic">{featuredMatch.minute}</div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                                <MdNotificationsActive className="text-primary" size={20} />
                                <span className="text-lg font-bold text-white tracking-tight">
                                    Kicking off at {new Date(featuredMatch.kickoffTimeFormatted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-medium leading-relaxed drop-shadow-lg hidden md:block">
                        {featuredMatch.status === "live"
                            ? `Witness the clash of titans live from ${featuredMatch.venue || 'the stadium'}. Stream in flawless 4K with multi-cam angles.`
                            : `Prepare for an epic showdown as ${featuredMatch.homeTeam} hosts ${featuredMatch.awayTeam}. Set your reminders for this world-class event.`}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <a
                            href={getMatchLink(featuredMatch)}
                            className="flex items-center gap-3 px-10 py-5 bg-primary text-black rounded-[2rem] font-black text-lg transition-all duration-300 hover:scale-105 hover:bg-white shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] group/btn"
                        >
                            <MdPlayArrow size={28} className="transition-transform group-hover/btn:scale-125" />
                            {isLive ? "WATCH LIVE NOW" : "GET READY"}
                        </a>
                        <button className="flex items-center gap-3 px-8 py-5 bg-white/10 backdrop-blur-xl text-white rounded-[2rem] font-bold border border-white/10 transition-all duration-300 hover:bg-white/20">
                            <MdInfoOutline size={24} />
                            MATCH DETAILS
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Premium Corner Accent */}
            <div className="absolute top-10 right-10 hidden md:block">
                <div className="flex flex-col items-end gap-2 text-right">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Stadium Live</span>
                    <span className="text-sm font-black text-white tracking-widest">STREAMLUX <span className="text-primary italic">ULTRA</span></span>
                </div>
            </div>
        </section>
    );
};

export default SportsHero;
