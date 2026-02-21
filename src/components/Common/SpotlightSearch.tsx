import { motion, AnimatePresence } from "framer-motion";
import { FC, useEffect, useState, useRef } from "react";
import { FiSearch, FiX, FiCommand } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getSearchResult } from "../../services/search";
import { Item } from "../../shared/types";
import { resizeImage } from "../../shared/utils";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setSpotlightOpen, toggleSpotlight } from "../../store/slice/uiSlice";

const SpotlightSearch: FC = () => {
    const dispatch = useAppDispatch();
    const { isSpotlightOpen: isOpen } = useAppSelector((state) => state.ui);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const { isMobile } = useCurrentViewportView();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                dispatch(toggleSpotlight());
            } else if (e.key === "Escape") {
                dispatch(setSpotlightOpen(false));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [dispatch]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            setQuery("");
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const data = await getSearchResult("multi", query, 1);
                setResults(data.results.slice(0, 6));
            } catch (error) {
                console.error("Spotlight search failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (item: Item) => {
        dispatch(setSpotlightOpen(false));
        if (item.media_type === "movie") navigate(`/movie/${item.id}`);
        else if (item.media_type === "tv") navigate(`/tv/${item.id}`);
        else if (item.media_type === "person") navigate(`/search?query=${item.name}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-4 md:px-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch(setSpotlightOpen(false))}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Search Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#1C1C1E]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden tw-glass"
                    >
                        <div className="flex items-center px-6 py-4 border-b border-white/5">
                            <FiSearch className="text-gray-400 mr-4" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search movies, TV shows, or people..."
                                className="flex-grow bg-transparent text-white outline-none text-lg placeholder:text-gray-500"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {!isMobile && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 font-mono">
                                    <FiCommand size={10} /> K
                                </div>
                            )}
                            <button
                                onClick={() => dispatch(setSpotlightOpen(false))}
                                className="ml-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Results Section */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {isLoading && (
                                <div className="px-6 py-12 flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    <p className="text-gray-500 text-sm">Searching the multiverse...</p>
                                </div>
                            )}

                            {!isLoading && results.length > 0 && (
                                <div className="py-2">
                                    <p className="px-6 py-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Results</p>
                                    {results.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            className="w-full flex items-center px-6 py-3 hover:bg-white/5 transition-colors group text-left"
                                        >
                                            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-lighten">
                                                <img
                                                    src={resizeImage(item.poster_path || item.profile_path || "", "w92")}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="ml-4 flex-grow">
                                                <p className="text-white font-medium group-hover:text-primary transition-colors">
                                                    {item.title || item.name}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    {item.media_type === "movie" ? "Movie" : item.media_type === "tv" ? "TV Show" : "Person"}
                                                    {item.release_date && ` • ${item.release_date.split("-")[0]}`}
                                                </p>
                                            </div>
                                            <FiCommand className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!isLoading && query && results.length === 0 && (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-gray-500">No matches found for "{query}"</p>
                                </div>
                            )}

                            {!query && (
                                <div className="px-6 py-8 text-center">
                                    <p className="text-gray-500 text-sm">Type to begin your search...</p>
                                    {!isMobile && (
                                        <p className="text-gray-600 text-[10px] mt-2 uppercase tracking-tighter">
                                            Use Arrow keys to navigate • Enter to select
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SpotlightSearch;
