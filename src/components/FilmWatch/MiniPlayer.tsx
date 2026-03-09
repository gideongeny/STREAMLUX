import { FC, useState } from "react";
import { motion } from "framer-motion";
import { usePlayer } from "../../context/PlayerContext";
import { MdClose, MdOpenInFull } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

const MiniPlayer: FC = () => {
    const { miniPlayerData, setMiniPlayerData } = usePlayer();
    const location = useLocation();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    // Don't show mini player if we are currently on a watch page
    const isWatchPage = location.pathname.includes("/watch");

    if (!miniPlayerData || isWatchPage) return null;

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMiniPlayerData(null);
    };

    const handleExpand = () => {
        const link =
            miniPlayerData.mediaType === "movie"
                ? `/movie/${miniPlayerData.mediaId}`
                : `/tv/${miniPlayerData.mediaId}`;
        navigate(link);
        setMiniPlayerData(null);
    };

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.05}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-[9999] w-[320px] aspect-video bg-black/40 backdrop-blur-3xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden border border-white/10 group cursor-grab p-[2px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Ambient Glow tied to Primary Color */}
            <div
                className="absolute inset-x-0 bottom-0 h-1/2 opacity-20 blur-[60px] pointer-events-none transition-colors duration-700"
                style={{ backgroundColor: 'var(--color-primary)' }}
            />

            <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-black/20">
                {/* Video */}
                <iframe
                    src={miniPlayerData.sourceUrl}
                    className="w-full h-full scale-[1.01]"
                    allowFullScreen
                    frameBorder="0"
                    title="StreamLux Mini Player"
                />

                {/* Glass Overlay Controls */}
                <motion.div
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-8 pointer-events-none group-hover:pointer-events-auto transition-opacity"
                >
                    <button
                        onClick={handleExpand}
                        className="p-4 bg-white/10 hover:bg-primary/30 rounded-full backdrop-blur-xl border border-white/20 hover:border-primary/50 transition-all text-white hover:text-primary active:scale-90 shadow-xl"
                        title="Expand"
                    >
                        <MdOpenInFull size={24} />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-4 bg-red-500/20 hover:bg-red-500/40 rounded-full backdrop-blur-xl border border-white/20 hover:border-red-500/50 transition-all text-white active:scale-90 shadow-xl"
                        title="Close"
                    >
                        <MdClose size={24} />
                    </button>
                </motion.div>

                {/* Premium Title Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-10 pointer-events-none">
                    <h4 className="text-white text-xs font-bold truncate tracking-tight">
                        {miniPlayerData.title}
                    </h4>
                    {miniPlayerData.seasonId ? (
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                            S{miniPlayerData.seasonId} • E{miniPlayerData.episodeId}
                        </p>
                    ) : (
                        <p className="text-gray-400 text-[10px] font-medium uppercase tracking-[0.1em] mt-1">
                            {miniPlayerData.mediaType} • Playing Now
                        </p>
                    )}
                </div>
            </div>

            {/* Premium Handle */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/20 rounded-full opacity-30 group-hover:opacity-100 group-hover:bg-primary/40 transition-all duration-300" />
        </motion.div>
    );
};

export default MiniPlayer;
