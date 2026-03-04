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
            dragElastic={0.1}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-[9999] w-[300px] aspect-video bg-black/60 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 group cursor-grab p-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-full h-full rounded-xl overflow-hidden">
                {/* Video */}
                <iframe
                    src={miniPlayerData.sourceUrl}
                    className="w-full h-full"
                    allowFullScreen
                    frameBorder="0"
                    title="StreamLux Mini Player"
                />

                {/* Overlay Controls */}
                <motion.div
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center gap-6 pointer-events-none group-hover:pointer-events-auto transition-opacity"
                >
                    <button
                        onClick={handleExpand}
                        className="p-3 bg-white/10 hover:bg-primary/20 rounded-full backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all text-white hover:text-primary"
                        title="Expand"
                    >
                        <MdOpenInFull size={22} />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-full backdrop-blur-md border border-white/10 hover:border-red-500/50 transition-all text-white"
                        title="Close"
                    >
                        <MdClose size={22} />
                    </button>
                </motion.div>

                {/* Title Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-3 pt-8 pointer-events-none">
                    <h4 className="text-white text-[11px] font-bold truncate">
                        {miniPlayerData.title}
                    </h4>
                    {miniPlayerData.seasonId && (
                        <p className="text-primary text-[9px] font-black uppercase tracking-widest mt-0.5">
                            S{miniPlayerData.seasonId} • E{miniPlayerData.episodeId}
                        </p>
                    )}
                </div>
            </div>

            {/* Draggable Indicator */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
};

export default MiniPlayer;
