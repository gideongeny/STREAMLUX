import { FC, FormEvent, useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { MdClose, MdArrowBack, MdDarkMode, MdLightMode } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/useDebounce";
import { getSearchSuggestions } from "../../services/search";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { useTypedPlaceholder } from "../../hooks/useTypedPlaceholder";
import { Item } from "../../shared/types";
import { tmdbImageSrc } from "../../shared/utils";
import { safeStorage } from "../../utils/safeStorage";
import { themeService } from "../../services/theme";

interface TopSearchBarProps {
  className?: string;
}

const TopSearchBar: FC<TopSearchBarProps> = ({ className = "" }) => {
  const [input, setInput] = useState("");
  const debounced = useDebounce<string>(input);
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useCurrentViewportView();
  const dynamicPlaceholder = useTypedPlaceholder();
  const typedPlaceholder = isMobile ? "Search..." : dynamicPlaceholder;
  const [surfaceMode, setSurfaceMode] = useState<"midnight" | "night">(() => {
    const saved = (safeStorage.get("surface_mode") as "midnight" | "night") || "midnight";
    return saved === "night" ? "night" : "midnight";
  });

  const toggleSurface = () => {
    const next = surfaceMode === "night" ? "midnight" : "night";
    setSurfaceMode(next);
    themeService.applySurfaceMode(next);
  };

  useEffect(() => {
    if (!debounced.trim()) { setSuggestions([]); return; }
    getSearchSuggestions(debounced.trim()).then(setSuggestions).catch(() => setSuggestions([]));
  }, [debounced]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    navigate(`/search?query=${encodeURIComponent(input.trim())}`);
    setSuggestions([]);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const selectSuggestion = (s: Item) => {
    if (s.media_type === "brand") {
      navigate(`/?brand=${s.id}`);
    } else {
      navigate(`/${s.media_type}/${s.id}`);
    }
    setInput("");
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[150]"
          />
        )}
      </AnimatePresence>

      <form
        onSubmit={submitHandler}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-300 relative z-[160] ${
          isFocused
            ? "bg-black/80 border-primary/60 shadow-[0_0_20px_rgba(255,107,53,0.3)]"
            : "bg-black/40 border-white/10 hover:border-white/30"
        } backdrop-blur-xl ${isMobile && isFocused ? "fixed top-4 left-4 right-4" : ""}`}
      >
        {isMobile && isFocused ? (
          <button
            type="button"
            onClick={() => setIsFocused(false)}
            className="text-primary"
          >
            <MdArrowBack size={20} />
          </button>
        ) : (
          <BiSearch
            size={20}
            className={`shrink-0 transition-colors ${isFocused ? "text-primary" : "text-gray-400"}`}
          />
        )}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={isFocused ? "Type to search..." : typedPlaceholder}
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm min-w-0"
        />

        {/* Light/Dark toggle */}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleSurface}
            className="shrink-0 w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/10 transition flex items-center justify-center text-white"
            title={surfaceMode === "night" ? "Switch to Midnight" : "Switch to Night"}
          >
            {surfaceMode === "night" ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
          </button>
        )}

        {(input || (isMobile && isFocused)) && (
          <button
            type="button"
            onClick={() => { setInput(""); setSuggestions([]); inputRef.current?.focus(); }}
            className="text-gray-500 hover:text-white transition-colors shrink-0"
          >
            <MdClose size={18} />
          </button>
        )}
      </form>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute left-0 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 py-2 z-[160] ${
              isMobile && isFocused ? "fixed top-[70px] left-4 right-4" : "top-full mt-2"
            }`}
          >
            {suggestions.map((s, i) => (
              <li key={s.id}>
                <button
                  onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                  className="w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-white/5 text-gray-300 hover:text-white transition-all group border-b border-white/5 last:border-0"
                >
                  <div className="w-10 h-14 rounded-md overflow-hidden bg-gray-800 shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                     <img 
                       src={tmdbImageSrc(s.poster_path, "w92")} 
                       alt="" 
                       className="w-full h-full object-cover"
                       onError={(e) => (e.currentTarget.src = "/fallback-poster.jpg")}
                     />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                      {s.title || s.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter ${
                        s.media_type === "brand" ? "bg-primary/20 text-primary" : "bg-white/10 text-gray-400"
                      }`}>
                        {s.media_type === "brand" ? "Brand" : s.media_type === "movie" ? "Movie" : "TV Show"}
                      </span>
                      {s.media_type !== "brand" && (
                        <span className="text-[10px] text-gray-500 font-medium">
                          {(s.release_date || s.first_air_date || "").split("-")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <BiSearch size={16} className="text-gray-600 group-hover:text-primary transition-colors shrink-0 md:block hidden" />
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopSearchBar;
