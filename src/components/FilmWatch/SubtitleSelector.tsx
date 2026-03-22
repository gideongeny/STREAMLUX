import { FC, useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
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
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 320 });

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

    // Calculate the absolute screen position of the dropdown using the button's bounding rect.
    // This uses a portal so the dropdown is rendered at the document body level,
    // completely escaping any parent overflow:hidden or backdrop-filter clipping.
    const openDropdown = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Allow some responsiveness: cap left to not overflow viewport
            const rawLeft = rect.left;
            const dropW = 320;
            const safeLeft = Math.min(rawLeft, window.innerWidth - dropW - 16);
            setDropdownPos({
                top: rect.bottom + 10,
                left: Math.max(8, safeLeft),
                width: dropW,
            });
        }
        setIsOpen(o => !o);
    };

    const filteredSubtitles = subtitles;

    const dropdown = isOpen
        ? createPortal(
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-[9990]"
                    onClick={() => setIsOpen(false)}
                />
                {/* Dropdown Panel */}
                <div
                    className="fixed z-[9999] flex flex-col bg-[#050510] border border-white/10 rounded-2xl shadow-[0_35px_90px_-20px_rgba(0,0,0,0.95)] overflow-hidden"
                    style={{
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                        maxHeight: "min(420px, calc(100vh - 80px))",
                    }}
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                        <div className="flex items-center gap-2">
                            <MdSubtitles className="text-primary text-lg" />
                            <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                SUBTITLE TRACKS
                            </span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1">
                            <MdClose size={18} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex flex-col overflow-y-auto p-2 space-y-1" style={{ maxHeight: "340px" }}>
                        <button
                            onClick={() => { onSelect(null); setIsOpen(false); }}
                            className={`px-4 py-3 rounded-xl text-left text-sm transition-all flex justify-between items-center ${!currentSubtitle
                                ? "bg-primary/20 text-primary font-black border border-primary/30"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <span>No Subtitles</span>
                            {!currentSubtitle && <MdCheck size={18} />}
                        </button>

                        <div className="px-4 py-1.5">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest opacity-60">Available Tracks</span>
                        </div>

                        {isLoading ? (
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-10 w-full rounded-xl" />
                                <Skeleton className="h-10 w-full rounded-xl" />
                                <Skeleton className="h-10 w-full rounded-xl" />
                            </div>
                        ) : (
                            filteredSubtitles.map((sub) => (
                                <button
                                    key={sub.id}
                                    onClick={() => { onSelect(sub); setIsOpen(false); }}
                                    className={`px-4 py-3 rounded-xl text-left text-sm transition-all flex justify-between items-center ${currentSubtitle?.id === sub.id
                                        ? "bg-primary text-black font-black"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
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

                    {/* Footer */}
                    <div className="p-3 bg-white/5 border-t border-white/5 shrink-0">
                        <p className="text-[8px] text-gray-500 text-center uppercase tracking-widest font-bold opacity-30">Powered by OpenSubtitles</p>
                    </div>
                </div>
            </>,
            document.body
        )
        : null;

    return (
        <div className={`relative ${className}`}>
            <button
                ref={buttonRef}
                onClick={openDropdown}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold ${currentSubtitle ? "bg-primary text-black" : "bg-dark-lighten hover:bg-dark-lighten/80 text-white"
                    }`}
                title="Subtitles / Captions"
            >
                <MdSubtitles className="text-lg" />
                <span className="hidden sm:inline">
                    {currentSubtitle ? currentSubtitle.language : "Subtitles"}
                </span>
            </button>

            {dropdown}
        </div>
    );
};

export default SubtitleSelector;
