import { FC, useState, useEffect } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { MdClose, MdOpenInFull } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const MiniPlayer: FC = () => {
    const { miniPlayerData, setMiniPlayerData } = usePlayer();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    if (!miniPlayerData) return null;

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMiniPlayerData(null);
    };

    const handleExpand = () => {
        const link =
            miniPlayerData.mediaType === "movie"
                ? `/movie/${miniPlayerData.mediaId}`
                : `/tv/${miniPlayerData.mediaId}`;

        // Pass state to force specific season/episode if needed?
        // Usually URL persistence handles this.
        navigate(link);
        setMiniPlayerData(null);
    };

    return (
        <div
            className="fixed bottom-4 right-4 z-50 w-[320px] aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-800 animate-in slide-in-from-bottom-5 duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Video */}
            <iframe
                src={miniPlayerData.sourceUrl}
                className="w-full h-full"
                allowFullScreen
                frameBorder="0"
            />

            {/* Overlay Controls */}
            {isHovered && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-opacity duration-200">
                    <button
                        onClick={handleExpand}
                        className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
                        title="Expand"
                    >
                        <MdOpenInFull size={24} className="text-white" />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-3 bg-red-500/80 hover:bg-red-600 rounded-full backdrop-blur-sm transition-all"
                        title="Close"
                    >
                        <MdClose size={24} className="text-white" />
                    </button>
                </div>
            )}

            {/* Title Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-6 pointer-events-none">
                <h4 className="text-white text-xs font-medium truncate px-1">
                    {miniPlayerData.title}
                </h4>
                {miniPlayerData.seasonId && (
                    <p className="text-gray-300 text-[10px] px-1">
                        S{miniPlayerData.seasonId} E{miniPlayerData.episodeId}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MiniPlayer;
