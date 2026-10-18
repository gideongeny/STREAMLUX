import React, { FC, useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BiSearch } from "react-icons/bi";
import { MdBolt, MdPlayArrow, MdOutlineFilterList, MdLocalMovies, MdTv } from "react-icons/md";
import SEO from "../components/Common/SEO";
import TopSearchBar from "../components/Common/TopSearchBar";
import Footer from "../components/Footer/Footer";
import ProviderSelector from "../components/Navigation/ProviderSelector";
import { providerCatalog, ProviderPost } from "../services/providers/providerCatalog";
import { getSearchSuggestions } from "../services/search";
import { Item } from "../shared/types";
import { tmdbImageSrc } from "../shared/utils";

interface UnifiedItem {
  id: string;
  title: string;
  image: string;
  providerValue?: string;
  link?: string;
  type: "provider" | "tmdb";
  mediaType?: "movie" | "tv";
  tag?: string;
  year?: string;
}

const Search: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query") || "";

  const [inputVal, setInputVal] = useState(query);
  const [filter, setFilter] = useState<"all" | "providers" | "tmdb">("all");
  const [results, setResults] = useState<UnifiedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProviderName, setActiveProviderName] = useState(
    providerCatalog.getActiveProvider().display_name
  );

  useEffect(() => {
    setInputVal(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    let isCurrent = true;

    // Concurrent multi-engine search across all top Vega providers and TMDB
    Promise.allSettled([
      providerCatalog.searchAllProviders(query),
      getSearchSuggestions(query),
    ]).then(([provRes, tmdbRes]) => {
      if (!isCurrent) return;

      const unified: UnifiedItem[] = [];

      // Add provider posts
      if (provRes.status === "fulfilled" && Array.isArray(provRes.value)) {
        for (const p of provRes.value) {
          unified.push({
            id: `p-${p.providerValue}-${p.link}`,
            title: p.title,
            image: p.image || "/logo.svg",
            providerValue: p.providerValue,
            link: p.link,
            type: "provider",
            tag: p.tag || "Direct Stream",
          });
        }
      }

      // Add TMDB items
      if (tmdbRes.status === "fulfilled" && Array.isArray(tmdbRes.value)) {
        for (const s of tmdbRes.value) {
          unified.push({
            id: `tmdb-${s.id}`,
            title: s.title || s.name || "Untitled",
            image: tmdbImageSrc(s.poster_path, "w342"),
            type: "tmdb",
            mediaType: s.media_type as any,
            year: s.release_date?.split("-")[0] || s.first_air_date?.split("-")[0],
          });
        }
      }

      setResults(unified);
      setIsLoading(false);
    }).catch(() => {
      if (isCurrent) setIsLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchParams({ query: inputVal.trim() });
  };

  const handleCardClick = (item: UnifiedItem) => {
    if (item.type === "provider" && item.link) {
      navigate(
        `/provider/info?link=${encodeURIComponent(item.link)}&title=${encodeURIComponent(
          item.title
        )}&provider=${encodeURIComponent(item.providerValue || "")}&image=${encodeURIComponent(
          item.image
        )}`
      );
    } else {
      const tmdbId = item.id.replace("tmdb-", "");
      navigate(`/${item.mediaType || "movie"}/${tmdbId}`);
    }
  };

  const filteredResults = results.filter((item) => {
    if (filter === "providers") return item.type === "provider";
    if (filter === "tmdb") return item.type === "tmdb";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col">
      <SEO
        title={query ? `Search: ${query} | StreamLux` : "Unified Search | StreamLux"}
        description="Search across 36 native direct engines and movies catalog simultaneously"
      />
      <TopSearchBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 md:px-8 pt-24 md:pt-28 pb-20 space-y-6">
        {/* Search Header Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#FF6B35] text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(255,107,53,0.4)]">
                <MdBolt size={12} />
                Unified Engine Search
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] font-bold border border-white/10">
                Active: {activeProviderName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {query ? `Results for "${query}"` : "Search Across All 36 Engines"}
            </h1>

            {/* In-page Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-xl">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 focus-within:border-[#FF6B35]/50 focus-within:bg-[#0d0d0d] transition-all">
                <BiSearch size={18} className="text-[#FF6B35]" />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Type a movie or TV show title..."
                  className="bg-transparent outline-none text-white text-xs sm:text-sm font-bold w-full placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#ff7b4b] text-black font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(255,107,53,0.3)] shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Filters and Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto streamlux-category-scroll pb-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filter === "all"
                  ? "bg-[#FF6B35] text-black font-black shadow-[0_0_15px_rgba(255,107,53,0.35)]"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              <span>All Sources</span>
              <span className="text-[10px] opacity-75 font-mono">({results.length})</span>
            </button>

            <button
              onClick={() => setFilter("providers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filter === "providers"
                  ? "bg-[#FF6B35] text-black font-black shadow-[0_0_15px_rgba(255,107,53,0.35)]"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              <MdBolt size={14} />
              <span>Direct Engines</span>
              <span className="text-[10px] opacity-75 font-mono">
                ({results.filter((r) => r.type === "provider").length})
              </span>
            </button>

            <button
              onClick={() => setFilter("tmdb")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filter === "tmdb"
                  ? "bg-[#FF6B35] text-black font-black shadow-[0_0_15px_rgba(255,107,53,0.35)]"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              <MdLocalMovies size={14} />
              <span>TMDB Library</span>
              <span className="text-[10px] opacity-75 font-mono">
                ({results.filter((r) => r.type === "tmdb").length})
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ProviderSelector />
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-2xl bg-white/[0.04] animate-pulse border border-white/5 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {filteredResults.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(item)}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#0d0e14] border border-white/10 hover:border-[#FF6B35]/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(255,107,53,0.2)]"
              >
                {/* Poster 2:3 Aspect Ratio */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />

                  {/* Top Badge: Provider Source or TMDB */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    {item.type === "provider" ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#FF6B35] text-black text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-0.5">
                        <MdBolt size={10} />
                        {item.providerValue || "Direct"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider">
                        {item.mediaType || "Movie"}
                      </span>
                    )}

                    {item.year && (
                      <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono text-gray-300">
                        {item.year}
                      </span>
                    )}
                  </div>

                  {/* Play Button Overlay on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#FF6B35] text-black flex items-center justify-center shadow-[0_0_25px_rgba(255,107,53,0.8)]">
                      <MdPlayArrow size={26} className="fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Meta details footer */}
                <div className="p-3 bg-[#0d0e14] space-y-1">
                  <h3 className="text-xs md:text-sm font-black text-white truncate group-hover:text-[#FF6B35] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium truncate flex items-center gap-1">
                    {item.type === "provider" ? "⚡ Direct Stream Available" : "TMDB Collection"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : query ? (
          <div className="py-20 text-center rounded-3xl bg-white/[0.02] border border-white/5 my-8 max-w-lg mx-auto p-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center mx-auto">
              <BiSearch size={28} />
            </div>
            <h3 className="text-lg font-black text-white">No results found for &quot;{query}&quot;</h3>
            <p className="text-xs text-gray-400">
              Try searching with a shorter title, or switch to another engine like MovieBox Web, Vega, or MultiStream.
            </p>
            <div className="pt-2 flex justify-center">
              <ProviderSelector />
            </div>
          </div>
        ) : (
          <div className="py-24 text-center text-gray-500 text-sm font-bold">
            Type a title above to discover movies & series across all 36 native engines.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Search;
