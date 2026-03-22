import { FC, useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
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
    mediaType, id, imdbId, season, episode, onSelect, currentSubtitle, className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const loadSubtitles = useCallback(async () => {
        setIsLoading(true);
        const results = await subtitleService.searchSubtitles(mediaType, id, imdbId, season, episode);
        setSubtitles(results);
        setIsLoading(false);
    }, [mediaType, id, imdbId, season, episode]);

    useEffect(() => {
        if (isOpen && subtitles.length === 0) loadSubtitles();
    }, [isOpen, subtitles.length, loadSubtitles]);

    // Recalculate position every time dropdown opens or window resizes/scrolls.
    // Using viewport-relative (fixed) coords from getBoundingClientRect.
    useLayoutEffect(() => {
        if (!isOpen || !buttonRef.current) return;

        const updatePos = () => {
            if (!buttonRef.current) return;
            const rect = buttonRef.current.getBoundingClientRect();
            const dropW = Math.min(320, window.innerWidth - 16);
            const safeLeft = Math.min(rect.left, window.innerWidth - dropW - 8);
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 8,
                left: Math.max(8, safeLeft),
                width: dropW,
                zIndex: 99999,
            });
        };

        updatePos();
        window.addEventListener("resize", updatePos);
        window.addEventListener("scroll", updatePos, true);
        return () => {
            window.removeEventListener("resize", updatePos);
            window.removeEventListener("scroll", updatePos, true);
        };
    }, [isOpen]);

    const toggleOpen = () => setIsOpen(o => !o);

    const panel = isOpen ? createPortal(
        <>
            {/* Invisible backdrop to close on outside click */}
            <div style={{ position: "fixed", inset: 0, zIndex: 99998 }} onClick={() => setIsOpen(false)} />

            {/* Dropdown Panel */}
            <div
                style={dropdownStyle}
                className="flex flex-col bg-[#0b0b18] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden"
            >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-white/5 flex justify-between items-center bg-white/[0.03] shrink-0">
                    <div className="flex items-center gap-2">
                        <MdSubtitles className="text-primary text-lg" />
                        <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Subtitles</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white p-1 transition-colors">
                        <MdClose size={16} />
                    </button>
                </div>

                {/* Scrollable list — max-height capped so it doesn't overflow viewport */}
                <div className="overflow-y-auto p-2 space-y-0.5" style={{ maxHeight: "min(360px, 60vh)" }}>
                    <button
                        onClick={() => { onSelect(null); setIsOpen(false); }}
                        className={`w-full px-4 py-3 rounded-xl text-left text-sm transition-all flex justify-between items-center ${!currentSubtitle
                            ? "bg-primary/15 text-primary font-bold border border-primary/25"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                    >
                        <span>No Subtitles</span>
                        {!currentSubtitle && <MdCheck size={16} className="text-primary" />}
                    </button>

                    <div className="px-4 pt-3 pb-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Available Tracks</span>
                    </div>

                    {isLoading ? (
                        <div className="p-3 space-y-2">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    ) : subtitles.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-xs italic">No subtitles found.</div>
                    ) : (
                        subtitles.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => { onSelect(sub); setIsOpen(false); }}
                                className={`w-full px-4 py-3 rounded-xl text-left text-sm transition-all flex justify-between items-center ${currentSubtitle?.id === sub.id
                                    ? "bg-primary text-black font-bold"
                                    : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold">{sub.language}</span>
                                    {sub.source !== "Sample" && (
                                        <span className={`text-[8px] uppercase tracking-wider ${currentSubtitle?.id === sub.id ? "text-black/50" : "text-gray-500"}`}>{sub.source}</span>
                                    )}
                                </div>
                                {currentSubtitle?.id === sub.id && <MdCheck size={16} className="text-black shrink-0" />}
                            </button>
                        ))
                    )}
                </div>

                <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.02] shrink-0">
                    <p className="text-[8px] text-gray-600 text-center uppercase tracking-widest">Powered by OpenSubtitles</p>
                </div>
            </div>
        </>,
        document.body
    ) : null;

    return (
        <div className={`relative ${className}`}>
            <button
                ref={buttonRef}
                onClick={toggleOpen}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold ${currentSubtitle ? "bg-primary text-black" : "bg-dark-lighten hover:bg-dark-lighten/80 text-white"}`}
                title="Subtitles / Captions"
            >
                <MdSubtitles className="text-lg" />
                <span className="hidden sm:inline">{currentSubtitle ? currentSubtitle.language : "Subtitles"}</span>
            </button>
            {panel}
        </div>
    );
};

export default SubtitleSelector;
