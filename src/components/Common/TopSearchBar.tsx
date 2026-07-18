import { FC, FormEvent, useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { MdClose, MdArrowBack, MdFolderSpecial } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/useDebounce";
import { getSearchSuggestions } from "../../services/search";
import { useCurrentViewportView } from "../../hooks/useCurrentViewportView";
import { useTypedPlaceholder } from "../../hooks/useTypedPlaceholder";
import { useSidebar } from "../../hooks/useSidebar";
import { Item } from "../../shared/types";
import { tmdbImageSrc } from "../../shared/utils";
import { safeStorage } from "../../utils/safeStorage";
import LanguageSelector from "./LanguageSelector";
import Logo from "./Logo";
import { useAppSelector } from "../../store/hooks";
import { sanitizeInput } from "../../utils/sanitize";

interface TopSearchBarProps {
  className?: string;
  activeTab?: string;
  onSearch?: (query: string) => void;
}

const TopSearchBar: FC<TopSearchBarProps> = ({ className = "", activeTab = "movie", onSearch }) => {
  const [input, setInput] = useState("");
  const debounced = useDebounce<string>(input);
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useCurrentViewportView();
  const currentUser = useAppSelector(state => state.auth.user);
  const { toggle: toggleSidebar, isSidebarVisible, marginClass, widthClass } = useSidebar();
  
  const dynamicPlaceholder = useTypedPlaceholder();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getContextualPlaceholder = () => {
    switch (activeTab) {
      case 'sports': return "Search matches, teams, leagues...";
      case 'live-tv': return "Search 100,000+ channels...";
      case 'music': return "Search artists, songs, albums...";
      default: return dynamicPlaceholder;
    }
  };

  // Theme toggle removed for Cinematic Mode

  useEffect(() => {
    if (activeTab === 'movie' || activeTab === 'tv') {
      if (!debounced.trim()) { setSuggestions([]); return; }
      getSearchSuggestions(debounced.trim()).then(setSuggestions).catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      if (onSearch) onSearch(debounced);
    }
  }, [debounced, activeTab, onSearch]);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    const sanitizedQuery = sanitizeInput(input);
    if (!sanitizedQuery.trim()) return;
    // For media tabs: navigate to search page
    if (activeTab === 'movie' || activeTab === 'tv') {
      navigate(`/search?query=${encodeURIComponent(sanitizedQuery.trim())}`);
      setSuggestions([]);
      setIsFocused(false);
      inputRef.current?.blur();
    } else {
      // For live-tv, music, sports: filter in-page only
      if (onSearch) onSearch(sanitizedQuery.trim());
      setSuggestions([]);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const selectSuggestion = (s: Item) => {
    navigate(`/${s.media_type}/${s.id}`);
    setInput("");
    setSuggestions([]);
    setIsFocused(false);
  };

  const navLinks = [
    { label: "TV Shows", path: "/?tab=tv", tab: "tv" },
    { label: "Movies", path: "/?tab=movie", tab: "movie" },
    { label: "Sports", path: "/?tab=sports", tab: "sports" },
    { label: "Live TV", path: "/?tab=live-tv", tab: "live-tv" },
    { label: "Music", path: "/?tab=music", tab: "music" },
  ];

  return (
    <header 
      ref={containerRef}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex flex-col ${
        isScrolled ? "bg-black/80 backdrop-blur-[60px] shadow-[0_8px_32px_rgba(0,0,0,0.8)] border-b border-white/[0.04] py-2" : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-3 md:py-5"
      } ${marginClass} ${widthClass}`}
    >
      <div className="max-w-[1920px] mx-auto w-full px-1 md:px-12 flex items-center justify-between gap-2 md:gap-4">
        {/* Left: Sidebar Toggle & Logo & Nav */}
        <div className="flex items-center gap-1 md:gap-10 shrink-0">
          {location.pathname !== '/' && (
            <button 
              onClick={() => navigate(-1)}
              className="text-white transition-all duration-300 hover:text-primary pl-1 opacity-100"
            >
              <MdArrowBack size={22} className="md:w-6 md:h-6" />
            </button>
          )}

          <Link to="/" className="flex items-center shrink-0">
            <Logo className="w-8 h-8 md:w-9 md:h-9 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
          </Link>

          {!isMobile && (
            <nav className="flex items-center gap-8 ml-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:text-white sl-hover-underline ${
                    activeTab === link.tab ? "text-white" : "text-[#666]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Search & Utils */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-between md:justify-end max-w-2xl w-full">
          <form 
            onSubmit={submitHandler}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-2.5 rounded-full border transition-all duration-300 relative group flex-1 md:flex-none ${
              isFocused ? "bg-[#0d0d0d] border-primary/40 shadow-[0_0_40px_rgba(255,107,53,0.15)] md:w-full" : "bg-white/[0.04] border-white/[0.06] md:w-80 hover:border-white/[0.1]"
            }`}
          >
            <BiSearch className={`shrink-0 ${isFocused ? "text-primary" : "text-gray-400"}`} size={16} />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={isFocused ? "Search..." : getContextualPlaceholder()}
              className="bg-transparent outline-none text-white text-[10px] md:text-xs w-full font-bold placeholder-gray-600 truncate"
            />
            {input && (
              <button type="button" onClick={() => setInput("")} className="text-gray-500 hover:text-white shrink-0">
                <MdClose size={14} className="md:w-[18px] md:h-[18px]" />
              </button>
            )}

            <AnimatePresence>
              {isFocused && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[110]"
                >
                  {suggestions.slice(0, 6).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => selectSuggestion(s)}
                      className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <img src={tmdbImageSrc(s.poster_path, "w92")} alt="" className="w-10 h-14 object-cover rounded-md shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-white text-[11px] font-black uppercase tracking-tight truncate">{s.title || s.name}</p>
                        <p className="text-gray-500 text-[10px] uppercase font-bold truncate">{s.media_type} • {s.release_date?.split('-')[0] || s.first_air_date?.split('-')[0]}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="flex items-center gap-2">
            <LanguageSelector />
          </div>

          <Link 
            to="/library"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#555] hover:text-white hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-500 shrink-0"
            title="My Library"
          >
            <MdFolderSpecial size={16} className="md:w-5 md:h-5" />
          </Link>

          <div 
            onClick={() => navigate('/profile')}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black text-[10px] md:text-xs cursor-pointer hover:border-primary/50 hover:shadow-neon-primary transition-all duration-500 overflow-hidden shrink-0"
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
