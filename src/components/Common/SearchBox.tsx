import { FC, FormEvent, useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { getSearchKeyword } from "../../services/search";

interface SearchBoxProps {
  autoFocus?: boolean;
  relative?: boolean;
}

let isInitial = true;

const SearchBox: FC<SearchBoxProps> = ({ autoFocus = false, relative = false }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("query") || ""
  );
  const debounceSearchInput = useDebounce<string>(searchInput);
  // const timeoutRef = useRef<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // if (timeoutRef.current) {
    //   clearTimeout(timeoutRef.current);
    // }

    setSuggestions([]);

    if (!debounceSearchInput.trim()) return;

    getSearchKeyword(debounceSearchInput.trim()).then((keywords) =>
      setSuggestions(keywords)
    );

    if (isInitial) {
      // When user search for "doctor strange", the search params change to "query=doctor+strange". If user now reload the page, the searchBox still hold value "doctor strange". That's good. But I don't like the fact that the suggestion also showing up on first mount/page-reload, so I put this check here to stop it
      isInitial = false;
      setSuggestions([]);
    }
  }, [debounceSearchInput]);

  const searchSubmitHandler = (e: FormEvent) => {
    e.preventDefault();

    if (!searchInput.trim()) return;

    navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);

    // clearTimeout(timeoutRef.current);
    setSuggestions([]);
  };

  useEffect(() => {
    setSuggestions([]);
    // clearTimeout(timeoutRef.current);
  }, [location.search]);

  return (
    <div
      className={`${relative ? "relative" : "absolute z-30 left-6 right-6 top-7"} shadow-2xl group transition-all duration-500 ease-in-out ${
        suggestions.length > 0 ? "bg-dark/80 backdrop-blur-2xl border border-white/20 rounded-[28px]" : "bg-dark-lighten rounded-full border border-white/5 hover:border-white/20"
      }`}
    >
      <form className="relative" onSubmit={searchSubmitHandler}>
        <button className="absolute top-1/2 -translate-y-1/2 left-5 z-10 text-gray-400 group-focus-within:text-primary transition-colors duration-300">
          <BiSearch size={22} />
        </button>
        <input
          className="w-full pl-14 pr-6 outline-none bg-transparent py-3.5 placeholder-gray-500 text-white text-sm font-medium focus:ring-0 appearance-none"
          type="text"
          placeholder="Search movies, tv shows..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          autoFocus={autoFocus}
        />
      </form>

      {suggestions.length > 0 && (
        <div className="hidden group-focus-within:block overflow-hidden relative">
          <div className="h-[1px] w-[90%] mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <ul className="flex flex-col py-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    navigate(`/search?query=${encodeURIComponent(suggestion)}`);
                    setSuggestions([]);
                  }}
                  className="flex items-center gap-4 w-full px-6 py-2.5 hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 group/item text-left"
                >
                  <BiSearch size={18} className="text-gray-500 group-hover/item:text-primary transition-colors" />
                  <span className="text-sm font-medium tracking-wide">{suggestion}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
