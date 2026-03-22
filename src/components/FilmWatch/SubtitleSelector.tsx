import { FC, useState, useEffect, useCallback } from "react";
import { MdSubtitles, MdClose, MdCheck } from "react-icons/md";
import { subtitleService, Subtitle } from "../../services/subtitles";
import Skeleton from "../Common/Skeleton";

interface SubtitleSelectorProps {
    mediaType: "movie" | "tv";
    id: string | number;
    imdbId?: string;
    season?: number;
    episode?: number;
    onSelect: (subtitle: Subtitle | null) => void;
    currentSubtitle: Subtitle | null;
    className?: string;
}

const SubtitleSelector: FC<SubtitleSelectorProps> = ({
    mediaType,
    id,
    imdbId,
    season,
    episode,
    onSelect,
    currentSubtitle,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const loadSubtitles = useCallback(async () => {
        setIsLoading(true);
        const results = await subtitleService.searchSubtitles(mediaType, id, imdbId, season, episode);
        setSubtitles(results);
        setIsLoading(false);
    }, [mediaType, id, imdbId, season, episode]);

    useEffect(() => {
        if (isOpen && subtitles.length === 0) {
            loadSubtitles();
        }
    }, [isOpen, subtitles.length, loadSubtitles]);

    const filteredSubtitles = subtitles.filter(s =>
        s.language.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold ${currentSubtitle ? "bg-primary text-black" : "bg-dark-lighten hover:bg-dark-lighten/80 text-white"
                    }`}
                title="Subtitles / Captions"
            >
                <MdSubtitles className="text-lg" />
                <span className="hidden sm:inline">
                    {currentSubtitle ? currentSubtitle.language : "Subtitles"}
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full mt-3 left-0 md:left-4 min-w-[280px] max-w-[90vw] bg-[#0a0a1a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7)] overflow-hidden z-[100] animate-fade-in flex flex-col max-h-[400px]">
                        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                SUBTITLE TRACKS
                            </span>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <MdClose size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col overflow-y-auto custom-scrollbar p-2 space-y-1">
                            <button
                                onClick={() => {
                                    onSelect(null);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-3 rounded-xl text-left text-sm transition-all flex justify-between items-center ${!currentSubtitle ? "bg-primary text-black font-black" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span>No Subtitles</span>
                                {!currentSubtitle && <MdCheck size={18} />}
                            </button>

                            <div className="px-4 py-2 mt-1">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest opacity-60">Available Tracks</span>
                            </div>

                            {isLoading ? (
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                </div>
                            ) : (
                                filteredSubtitles.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => {
                                            onSelect(sub);
                                            setIsOpen(false);
                                        }}
                                        className={`px-4 py-3 rounded-xl text-left text-sm transition-all flex justify-between items-center ${currentSubtitle?.id === sub.id ? "bg-primary text-black font-black" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold">{sub.language}</span>
                                            {sub.source !== "Sample" && (
                                                <span className={`text-[8px] uppercase tracking-tighter ${currentSubtitle?.id === sub.id ? "text-black/60" : "text-gray-500 opacity-60"}`}>{sub.source}</span>
                                            )}
                                        </div>
                                        {currentSubtitle?.id === sub.id && <MdCheck size={18} />}
                                    </button>
                                ))
                            )}

                            {!isLoading && filteredSubtitles.length === 0 && (
                                <div className="p-6 text-center text-gray-500 text-xs italic">
                                    No subtitles found.
                                </div>
                            )}
                        </div>
                        
                        <div className="p-3 bg-white/5 border-t border-white/5">
                            <p className="text-[8px] text-gray-500 text-center uppercase tracking-widest font-bold opacity-30">Powered by OpenSubtitles</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SubtitleSelector;
