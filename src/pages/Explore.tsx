import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoArrowBack } from "react-icons/io5";
import Sidebar from "../components/Common/Sidebar";
import ExploreFilter from "../components/Explore/ExploreFilter";
import ExploreResult from "../components/Explore/ExploreResult";
import { useTMDBCollectionQuery } from "../hooks/useCollectionQuery";
import { useYouTubeVideos } from "../hooks/useYouTube";
import YouTubeGrid from "../components/Explore/YouTubeGrid";
import SeasonalBanner from "../components/Explore/SeasonalBanner";

const Explore = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Get currentTab from URL or localStorage, default to movie
  const [currentTab, setCurrentTab] = useState<"movie" | "tv">(
    (searchParams.get("type") as "movie" | "tv") ||
    (localStorage.getItem("currentTab") as "movie" | "tv") ||
    "movie"
  );
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: "popularity.desc",
    genres: [] as number[],
    year: "",
    runtime: "",
    region: searchParams.get("region") || "" // Add region filter
  });

  const { data, isLoading, error } = useTMDBCollectionQuery(
    currentTab,
    filters.sortBy,
    filters.genres,
    filters.year,
    filters.runtime,
    filters.region // Pass region to the query
  );

  // Use YouTube hook when a region or category is selected
  const { videos: ytVideos, loading: ytLoading, error: ytError } = useYouTubeVideos({
    region: filters.region || undefined,
    category: searchParams.get("category") || undefined,
    type: currentTab,
  });

  useEffect(() => {
    // Update filters when URL params change
    const region = searchParams.get("region");
    const type = searchParams.get("type") as "movie" | "tv" | null;

    if (region) {
      setFilters(prev => ({ ...prev, region }));
    }

    // Update currentTab from URL or localStorage
    if (type && (type === "movie" || type === "tv")) {
      setCurrentTab(type);
      localStorage.setItem("currentTab", type);
    } else {
      // Read from localStorage if not in URL
      const savedTab = localStorage.getItem("currentTab") as "movie" | "tv" | null;
      if (savedTab && (savedTab === "movie" || savedTab === "tv")) {
        setCurrentTab(savedTab);
      }
    }
  }, [searchParams]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleTabChange = (tab: "movie" | "tv") => {
    setCurrentTab(tab);
    localStorage.setItem("currentTab", tab);
    // Update URL to include type
    const newParams = new URLSearchParams(searchParams);
    newParams.set("type", tab);
    window.history.replaceState({}, "", `?${newParams.toString()}`);
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
      "philippines": "🇵🇭 Filipino Movies & TV (ABS-CBN/iWantTFC)",
      "kenya": "🇰🇪 Kenyan Movies & TV (Citizen, NTV, KTN, Showmax)"
    };
    return regionTitles[region] || "Explore Movies & TV Shows";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile header with clickable logo, consistent with other pages */}
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

        {/* Sidebar for navigation on mobile */}
        <div className="md:hidden">
          <Sidebar onCloseSidebar={() => setIsSidebarActive(false)} isSidebarActive={isSidebarActive} />
        </div>

        {/* Desktop header with logo */}
        <div className="hidden md:flex items-center mb-6">
          <Link to="/" className="flex gap-2 items-center">
            <img src="/logo.svg" alt="StreamLux Logo" className="h-10 w-10" />
            <p className="text-xl text-white font-medium tracking-wider uppercase">
              Stream<span className="text-primary">Lux</span>
            </p>
          </Link>
        </div>

        <div className="mb-8">
          {/* Back button */}
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <IoArrowBack size={20} />
            <span>Back to Home</span>
          </Link>

          <h1 className="text-4xl font-bold mb-2">
            {filters.region ? getRegionTitle(filters.region) : "Explore Movies & TV Shows"}
          </h1>
          {filters.region && (
            <p className="text-gray-400">
              Discover amazing {currentTab === "movie" ? "movies" : "TV shows"} from around the world
            </p>
          )}
        </div>

        <SeasonalBanner onSelectCategory={(cat) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set("category", cat);
          newParams.delete("region"); // Clear region if category is selected
          navigate(`?${newParams.toString()}`);
        }} />

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
            {filters.region || searchParams.get("category") ? (
              <YouTubeGrid videos={ytVideos} loading={ytLoading} error={ytError} />
            ) : (
              <ExploreResult
                data={data}
                isLoading={isLoading}
                error={error}
                currentTab={currentTab}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
