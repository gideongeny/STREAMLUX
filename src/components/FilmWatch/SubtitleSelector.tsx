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
                    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[400px] max-h-[80vh] bg-[#0a0a1a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] overflow-hidden z-[1001] animate-zoom-in flex flex-col">
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <MdSubtitles className="text-primary text-xl" />
                                </div>
                                <span className="text-xs font-black text-gray-200 uppercase tracking-widest leading-none">
                                    Subtitle Settings
                                </span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition">
                                <MdClose size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col overflow-y-auto custom-scrollbar p-3 space-y-1">
                            <button
                                onClick={() => {
                                    onSelect(null);
                                    setIsOpen(false);
                                }}
                                className={`group px-4 py-4 rounded-2xl text-left text-sm transition-all flex justify-between items-center ${!currentSubtitle ? "bg-primary text-black font-black" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <MdClose className={!currentSubtitle ? "text-black" : "text-gray-500"} />
                                    <span>No Subtitles</span>
                                </div>
                                {!currentSubtitle && <MdCheck size={20} />}
                            </button>

                            <div className="px-4 py-2 mt-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Available Tracks</span>
                            </div>

                            {isLoading ? (
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                </div>
                            ) : (
                                filteredSubtitles.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => {
                                            onSelect(sub);
                                            setIsOpen(false);
                                        }}
                                        className={`group px-4 py-4 rounded-2xl text-left text-sm transition-all flex justify-between items-center ${currentSubtitle?.id === sub.id ? "bg-primary text-black font-black" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold">{sub.language}</span>
                                            {sub.source !== "Sample" && (
                                                <span className={`text-[9px] uppercase tracking-tighter ${currentSubtitle?.id === sub.id ? "text-black/60" : "text-gray-500 opacity-60"}`}>{sub.source}</span>
                                            )}
                                        </div>
                                        {currentSubtitle?.id === sub.id && <MdCheck size={20} />}
                                    </button>
                                ))
                            )}

                            {!isLoading && filteredSubtitles.length === 0 && (
                                <div className="p-8 text-center text-gray-500 text-xs italic">
                                    No subtitles found.
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 bg-white/5 border-t border-white/5">
                            <p className="text-[9px] text-gray-500 text-center uppercase tracking-widest font-bold opacity-40">Powered by OpenSubtitles</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SubtitleSelector;
