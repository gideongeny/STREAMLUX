import { FC, FormEvent, useState, useEffect, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { getSearchKeyword } from "../../services/search";

interface TopSearchBarProps {
  className?: string;
}

const TopSearchBar: FC<TopSearchBarProps> = ({ className = "" }) => {
  const [input, setInput] = useState("");
  const debounced = useDebounce<string>(input);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debounced.trim()) { setSuggestions([]); return; }
    getSearchKeyword(debounced.trim()).then(setSuggestions).catch(() => setSuggestions([]));
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

  const selectSuggestion = (s: string) => {
    navigate(`/search?query=${encodeURIComponent(s)}`);
    setInput(s);
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className={`relative z-50 ${className}`}>
      <form
        onSubmit={submitHandler}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-300 ${
          isFocused
            ? "bg-black/80 border-primary/60 shadow-[0_0_20px_rgba(255,107,53,0.25)]"
            : "bg-black/40 border-white/10 hover:border-white/30"
        } backdrop-blur-xl`}
      >
        <BiSearch
          size={20}
          className={`shrink-0 transition-colors ${isFocused ? "text-primary" : "text-gray-400"}`}
        />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search movies/ TV Shows"
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm min-w-0"
        />
        {input && (
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
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 py-2 z-50">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-gray-300 hover:text-white text-sm transition-colors group"
              >
                <BiSearch size={16} className="text-gray-600 group-hover:text-primary transition-colors shrink-0" />
                <span className="truncate">{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopSearchBar;
