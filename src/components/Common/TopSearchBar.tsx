import { FC, FormEvent, useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { MdClose, MdArrowBack, MdFolderSpecial, MdBolt } from "react-icons/md";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/useDebounce";
import { getSearchSuggestions } from "../../services/search";
import { providerCatalog, ProviderPost } from "../../services/providers/providerCatalog";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { useSidebar } from "../../hooks/useSidebar";
import { Item } from "../../shared/types";
import { tmdbImageSrc } from "../../shared/utils";
import Logo from "./Logo";
import { useAppSelector } from "../../store/hooks";
import { sanitizeInput } from "../../utils/sanitize";
import ProviderSelector from "../Navigation/ProviderSelector";

interface TopSearchBarProps {
  className?: string;
  activeTab?: string;
  onSearch?: (query: string) => void;
}

interface UnifiedSuggestion {
  id: string;
  title: string;
  image: string;
  subtitle: string;
  providerValue?: string;
  link?: string;
  isProvider: boolean;
}

const TopSearchBar: FC<TopSearchBarProps> = ({ className = "", onSearch }) => {
  const [input, setInput] = useState("");
  const debounced = useDebounce<string>(input, 250);
  const [suggestions, setSuggestions] = useState<UnifiedSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useCurrentViewportView();
  const currentUser = useAppSelector(state => state.auth.user);
  const { marginClass, widthClass } = useSidebar();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const query = debounced.trim();
    if (!query) {
      setSuggestions([]);
      return;
    }

    let isCurrent = true;

    // Concurrent search: Query providers + TMDB suggestions
    Promise.allSettled([
      providerCatalog.searchAllProviders(query),
      getSearchSuggestions(query),
    ]).then(([provRes, tmdbRes]) => {
      if (!isCurrent) return;

      const unified: UnifiedSuggestion[] = [];

      if (provRes.status === "fulfilled" && Array.isArray(provRes.value)) {
        for (const p of provRes.value.slice(0, 5)) {
          unified.push({
            id: `p-${p.providerValue}-${p.link}`,
            title: p.title,
            image: p.image || '/logo.svg',
            subtitle: `${p.providerValue || 'Provider'} • Direct`,
            providerValue: p.providerValue,
            link: p.link,
            isProvider: true,
          });
        }
      }

      if (tmdbRes.status === "fulfilled" && Array.isArray(tmdbRes.value)) {
        for (const s of tmdbRes.value.slice(0, 3)) {
          unified.push({
            id: `tmdb-${s.id}`,
            title: s.title || s.name || 'Untitled',
            image: tmdbImageSrc(s.poster_path, "w92"),
            subtitle: `${s.media_type || 'Movie'} • ${s.release_date?.split('-')[0] || s.first_air_date?.split('-')[0] || 'HD'}`,
            isProvider: false,
          });
        }
      }

      setSuggestions(unified);
    });

    return () => {
      isCurrent = false;
    };
  }, [debounced]);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    const sanitizedQuery = sanitizeInput(input);
    if (!sanitizedQuery.trim()) return;

    navigate(`/search?query=${encodeURIComponent(sanitizedQuery.trim())}`);
    setSuggestions([]);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const selectSuggestion = (s: UnifiedSuggestion) => {
    if (s.isProvider && s.link) {
      navigate(`/provider/info?link=${encodeURIComponent(s.link)}&title=${encodeURIComponent(s.title)}&provider=${encodeURIComponent(s.providerValue || '')}&image=${encodeURIComponent(s.image)}`);
    } else {
      const tmdbId = s.id.replace('tmdb-', '');
      navigate(`/movie/${tmdbId}`);
    }
    setInput("");
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <header 
      ref={containerRef}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex flex-col ${
        isScrolled ? "bg-black/85 backdrop-blur-[60px] shadow-[0_8px_32px_rgba(0,0,0,0.85)] border-b border-white/[0.04] py-2.5" : "bg-gradient-to-b from-black/90 via-black/50 to-transparent py-3 md:py-4"
      } ${marginClass} ${widthClass} ${className}`}
    >
      <div className="max-w-[1920px] mx-auto w-full px-3 md:px-10 flex items-center justify-between gap-3 md:gap-6">
        {/* Left: Logo & Engine Badge */}
        <div className="flex items-center gap-3 shrink-0">
          {location.pathname !== '/' && (
            <button 
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all duration-300 hover:text-primary"
              title="Go Back"
            >
              <MdArrowBack size={18} />
            </button>
          )}

          <Link to="/?tab=provider" className="flex items-center gap-2.5 shrink-0 group">
            <Logo className="w-8 h-8 md:w-9 md:h-9 filter drop-shadow-[0_0_8px_rgba(255,107,53,0.35)]" />
            <span className="hidden sm:inline-block font-black text-sm md:text-base tracking-wider uppercase text-white group-hover:text-primary transition-colors">
              STREAM<span className="text-primary">LUX</span>
            </span>
          </Link>

          <span className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-black tracking-widest text-gray-300 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            36 Native Engines
          </span>
        </div>

        {/* Center / Right: Unified Search & Utils */}
        <div className="flex items-center gap-2.5 md:gap-4 flex-1 justify-end max-w-2xl w-full">
          <form 
            onSubmit={submitHandler}
            className={`flex items-center gap-2 md:gap-3 px-3.5 md:px-5 py-2 md:py-2.5 rounded-full border transition-all duration-300 relative group flex-1 md:flex-none ${
              isFocused ? "bg-[#0d0d0d] border-primary/50 shadow-[0_0_35px_rgba(255,107,53,0.2)] md:w-full" : "bg-white/[0.04] border-white/[0.08] md:w-80 hover:border-white/[0.15]"
            }`}
          >
            <BiSearch className={`shrink-0 ${isFocused ? "text-primary" : "text-gray-400"}`} size={16} />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
              placeholder="Search movies, series across all engines..."
              className="bg-transparent outline-none text-white text-[11px] md:text-xs w-full font-bold placeholder-gray-500 truncate"
            />
            {input && (
              <button type="button" onClick={() => setInput("")} className="text-gray-500 hover:text-white shrink-0">
                <MdClose size={16} />
              </button>
            )}

            {/* Live Search Suggestions Dropdown */}
            <AnimatePresence>
              {isFocused && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#0c0d12] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] z-[110] divide-y divide-white/5"
                >
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => selectSuggestion(s)}
                      className="flex items-center gap-3.5 p-3 hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <img 
                        src={s.image} 
                        alt="" 
                        className="w-9 h-12 object-cover rounded-lg shrink-0 bg-black/40 border border-white/10"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/logo.svg'; }}
                      />
                      <div className="overflow-hidden flex-1 min-w-0">
                        <p className="text-white text-xs font-black uppercase tracking-tight truncate">{s.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {s.isProvider && (
                            <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                              <MdBolt size={10} />
                              Direct
                            </span>
                          )}
                          <span className="text-gray-400 text-[10px] font-medium uppercase truncate">{s.subtitle}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div 
                    onClick={() => {
                      if (input.trim()) navigate(`/search?query=${encodeURIComponent(input.trim())}`);
                    }}
                    className="p-2.5 text-center text-[10px] font-bold text-primary hover:bg-primary/10 cursor-pointer uppercase tracking-wider transition-colors"
                  >
                    View all unified results for &quot;{input}&quot; →
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* ⚡ Provider Selector - Vega Native Engine Pill */}
          <ProviderSelector className="flex" />

          {/* Library Link */}
          <Link 
            to="/library"
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/[0.2] hover:bg-white/[0.08] transition-all duration-300 shrink-0"
            title="My Library"
          >
            <MdFolderSpecial size={16} />
          </Link>

          {/* Profile Avatar */}
          <div 
            onClick={() => navigate('/profile')}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-primary font-black text-[10px] md:text-xs cursor-pointer hover:border-primary hover:shadow-neon-primary transition-all duration-300 overflow-hidden shrink-0"
            title="My Profile"
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="tracking-tighter uppercase font-black">SL</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopSearchBar;
