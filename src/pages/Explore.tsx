import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoArrowBack } from "react-icons/io5";
import Sidebar from "../components/Common/Sidebar";
import ExploreFilter from "../components/Explore/ExploreFilter";
import ExploreResult from "../components/Explore/ExploreResult";
import SEO from "../components/Common/SEO";
import { useTMDBCollectionQuery } from "../hooks/useCollectionQuery";
import { useYouTubeVideos } from "../hooks/useYouTube";
import { convertYouTubeToItem } from "../services/youtubeContent";
import { Item } from "../shared/types";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  // CONSOLIDATED STATE: Ensure everything stays in sync
  const [filters, setFilters] = useState({
    type: (searchParams.get("type") as "movie" | "tv") || (localStorage.getItem("currentTab") as "movie" | "tv") || "movie",
    sortBy: searchParams.get("sort_by") || "popularity.desc",
    genres: searchParams.getAll("genre").map(Number),
    year: searchParams.get("from") && searchParams.get("to") ? `${searchParams.get("from")}-${searchParams.get("to")}` : "",
    runtime: "", // Calculated below
    region: searchParams.get("region") || "",
    rating: searchParams.get("vote_average.gte") || "0",
  });

  // Derived currentTab from filters
  const currentTab = filters.type;

  const { data: tmdbData, isLoading: tmdbLoading, error } = useTMDBCollectionQuery(
    currentTab,
    filters.sortBy,
    filters.genres,
    filters.year,
    filters.runtime,
    filters.region,
    filters.rating
  );

  const { videos: ytVideos, loading: ytLoading } = useYouTubeVideos({
    region: filters.region || undefined,
    type: currentTab,
  });

  useEffect(() => {
    const region = searchParams.get("region") || "";
    const type = (searchParams.get("type") as "movie" | "tv") || "movie";
    const genres = searchParams.getAll("genre").map(Number);
    const sortBy = searchParams.get("sort_by") || "popularity.desc";
    const minRuntime = searchParams.get("minRuntime");
    const maxRuntime = searchParams.get("maxRuntime");

    let runtime = "";
    if (minRuntime === "0" && maxRuntime === "90") runtime = "short";
    else if (minRuntime === "90" && maxRuntime === "150") runtime = "medium";
    else if (minRuntime === "150" && maxRuntime === "200") runtime = "long";

    setFilters({
      type,
      region,
      genres,
      sortBy,
      runtime,
      year: searchParams.get("from") && searchParams.get("to") ? `${searchParams.get("from")}-${searchParams.get("to")}` : "",
      rating: searchParams.get("vote_average.gte") || "0",
    });

    if (type) localStorage.setItem("currentTab", type);
  }, [searchParams]);

  const handleTabChange = (tab: "movie" | "tv") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("type", tab);
    setSearchParams(newParams);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    // This is mainly for sub-components that might call it, but we mostly use URL params
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getRegionTitle = (region: string) => {
    const regionTitles: Record<string, string> = {
      "africa": "🌍 African Cinema & TV",
      "asia": "🌏 Asian Cinema",
      "latin": "🌎 Latin American Cinema",
      "middleeast": "🕌 Middle Eastern Cinema",
      "nollywood": "🎬 Movies from the Nollywood industry (Nigeria)",
      "bollywood": "🎭 Bollywood (Indian Movies)",
      "korea": "🇰🇷 Korean Drama & Movies",
      "japan": "🇯🇵 Japanese Anime & Movies",
      "china": "🇨🇳 Chinese Cinema",
      "philippines": "🇵🇭 Filipino Movies & TV",
      "kenya": "🇰🇪 Kenyan Movies & TV"
    };
    return regionTitles[region] || "Explore Movies & TV Shows";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SEO
        title={filters.region ? getRegionTitle(filters.region) : `Explore ${currentTab === "movie" ? "Movies" : "TV Shows"}`}
        description={`Discover and explore a world of ${currentTab === "movie" ? "movies" : "TV shows"} ${filters.region ? `from ${filters.region}` : ""}.`}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex md:hidden justify-between items-center mb-5">
          <Link to="/" className="flex gap-2 items-center">
            <img src="/logo.svg" alt="StreamLux Logo" className="h-10 w-10" />
            <p className="text-xl text-white font-medium tracking-wider uppercase">
              Stream<span className="text-primary">Lux</span>
            </p>
          </Link>
          <button onClick={() => setIsSidebarActive((prev) => !prev)}>
            <GiHamburgerMenu size={25} />
          </button>
        </div>

        <div className="md:hidden">
          <Sidebar onCloseSidebar={() => setIsSidebarActive(false)} isSidebarActive={isSidebarActive} />
        </div>

        <div className="hidden md:flex items-center mb-6">
          <Link to="/" className="flex gap-2 items-center">
            <img src="/logo.svg" alt="StreamLux Logo" className="h-10 w-10" />
            <p className="text-xl text-white font-medium tracking-wider uppercase">
              Stream<span className="text-primary">Lux</span>
            </p>
          </Link>
        </div>

        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <IoArrowBack size={20} />
            <span>Back to Home</span>
          </Link>

          <h1 className="text-4xl font-bold mb-2">
            {filters.region ? getRegionTitle(filters.region) : "Explore Movies & TV Shows"}
          </h1>
          <p className="text-gray-400">
            Discover amazing {currentTab === "movie" ? "movies" : "TV shows"} from around the world
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ExploreFilter
              currentTab={currentTab}
              onTabChange={handleTabChange}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div className="lg:col-span-3">
            {(() => {
              // Combine and Deduplicate
              const combinedResults: Item[] = [...(tmdbData || [])];
              if (ytVideos && ytVideos.length > 0) {
                const converted = ytVideos.map((v, i) => convertYouTubeToItem(v, i + 5000));
                combinedResults.push(...converted);
              }

              const seen = new Set<number>();
              const finalData = combinedResults.filter(item => {
                if (!item || seen.has(item.id)) return false;
                seen.add(item.id);
                // Trust the service's media_type mapping
                return true;
              });

              return (
                <ExploreResult
                  data={finalData}
                  isLoading={tmdbLoading || ytLoading}
                  error={error}
                  currentTab={currentTab}
                />
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
