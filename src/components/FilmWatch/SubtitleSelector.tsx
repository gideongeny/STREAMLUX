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
                    <div className="absolute bottom-full mb-2 right-0 min-w-[240px] max-w-[300px] bg-dark-lighten border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-black/20">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Subtitles
                            </span>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                                <MdClose size={18} />
                            </button>
                        </div>

                        <div className="p-2 border-b border-gray-700">
                            <input
                                type="text"
                                placeholder="Search language..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-primary/50 transition"
                            />
                        </div>

                        <div className="flex flex-col max-h-[250px] overflow-y-auto custom-scrollbar">
                            <button
                                onClick={() => {
                                    onSelect(null);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex justify-between items-center ${!currentSubtitle ? "text-primary font-bold" : "text-gray-300"
                                    }`}
                            >
                                <span>Off</span>
                                {!currentSubtitle && <MdCheck className="text-primary" />}
                            </button>

                            {isLoading ? (
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-4 w-full rounded" />
                                    <Skeleton className="h-4 w-3/4 rounded" />
                                    <Skeleton className="h-4 w-full rounded" />
                                </div>
                            ) : (
                                filteredSubtitles.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => {
                                            onSelect(sub);
                                            setIsOpen(false);
                                        }}
                                        className={`px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex justify-between items-center ${currentSubtitle?.id === sub.id ? "text-primary font-bold" : "text-gray-300"
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span>{sub.language}</span>
                                            <span className="text-[10px] text-gray-500">{sub.source}</span>
                                        </div>
                                        {currentSubtitle?.id === sub.id && <MdCheck className="text-primary" />}
                                    </button>
                                ))
                            )}

                            {!isLoading && filteredSubtitles.length === 0 && (
                                <div className="p-6 text-center text-gray-500 text-xs italic">
                                    No subtitles found.
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2 bg-black/10 text-[9px] text-gray-600 border-t border-gray-700">
                            * Selected subtitles will be applied to compatible servers.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SubtitleSelector;
