import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoArrowBack } from "react-icons/io5";
import Sidebar from "../components/Common/Sidebar";
import Title from "../components/Common/Title";
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
    sortBy: searchParams.get("sort_by") || "popularity.desc",
    genres: searchParams.get("genre") ? searchParams.get("genre")!.split(",").map(Number) : [] as number[],
    year: searchParams.get("year") || "",
    runtime: searchParams.get("runtime") || "",
    region: searchParams.get("region") || "",
    voteAverageGte: searchParams.get("vote_average.gte") || "0",
    withOriginalLanguage: searchParams.get("with_original_language") || "",
    status: searchParams.get("status") || ""
  });

  const { data, isLoading, error } = useTMDBCollectionQuery(
    currentTab,
    filters.sortBy,
    filters.genres,
    filters.year,
    filters.runtime,
    filters.region,
    filters.voteAverageGte,
    filters.withOriginalLanguage
  );

  // Use YouTube hook when a region or category is selected
  const { videos: ytVideos, loading: ytLoading, error: ytError } = useYouTubeVideos({
    region: filters.region || undefined,
    category: searchParams.get("category") || undefined,
    type: currentTab,
  });

  useEffect(() => {
    // Parse all params from URL
    const region = searchParams.get("region") || "";
    const type = (searchParams.get("type") as "movie" | "tv") || null;
    const genreParam = searchParams.get("genre");
    const genres = genreParam ? genreParam.split(",").map(Number) : [];
    const year = searchParams.get("year") || "";
    const runtime = searchParams.get("runtime") || "";
    const sortBy = searchParams.get("sort_by") || "popularity.desc";
    const voteAverageGte = searchParams.get("vote_average.gte") || "0";
    const withOriginalLanguage = searchParams.get("with_original_language") || "";
    const status = searchParams.get("status") || "";

    // update currentTab
    if (type && (type === "movie" || type === "tv")) {
      setCurrentTab(type);
      localStorage.setItem("currentTab", type);
    } else {
      const savedTab = localStorage.getItem("currentTab") as "movie" | "tv" | null;
      if (savedTab && (savedTab === "movie" || savedTab === "tv")) {
        setCurrentTab(savedTab);
      }
    }

    // Batch update filters if they changed (simple comparison)
    setFilters(prev => {
      // Only update if something changed to prevent infinite loops if we were using complex effects
      if (
        prev.region === region &&
        prev.year === year &&
        prev.runtime === runtime &&
        prev.sortBy === sortBy &&
        prev.voteAverageGte === voteAverageGte &&
        prev.withOriginalLanguage === withOriginalLanguage &&
        prev.status === status &&
        JSON.stringify(prev.genres) === JSON.stringify(genres)
      ) {
        return prev;
      }

      return {
        ...prev,
        region,
        genres,
        year,
        runtime,
        sortBy,
        voteAverageGte,
        withOriginalLanguage,
        status
      };
    });
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

  // Map YouTube videos to Item type for hybrid display
  const mappedYtItems: any[] = (ytVideos || []).map(video => ({
    id: video.id as any,
    title: video.title,
    name: video.title,
    overview: video.description,
    poster_path: video.thumbnail,
    backdrop_path: video.thumbnail,
    media_type: video.type === "movie" ? "movie" : "tv",
    vote_average: 0,
    vote_count: 0,
    popularity: 0,
    genre_ids: [],
    original_language: "en",
    youtubeId: video.id,
  }));

  // Interleave TMDB and YouTube results for the hybrid view
  const combinedItems: any[] = [];
  const maxLen = Math.max(data?.length || 0, mappedYtItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (data && i < data.length) combinedItems.push(data[i]);
    if (i < mappedYtItems.length) combinedItems.push(mappedYtItems[i]);
  }

  const currentSource = searchParams.get("source") || "tmdb";

  return (
    <>
      <Title value={filters.region ? `${getRegionTitle(filters.region)} | StreamLux` : "Explore | StreamLux"} />

      <div className="flex md:hidden justify-between items-center px-5 my-5">
        <Link to="/" className="flex gap-2 items-center">
          <img
            src="/logo.png"
            alt="StreamLux Logo"
            className="h-10 w-10"
          />
          <p className="text-xl text-white font-medium tracking-wider uppercase">
            Stream<span className="text-primary">Lux</span>
          </p>
        </Link>
        <button onClick={() => setIsSidebarActive((prev) => !prev)}>
          <GiHamburgerMenu size={25} />
        </button>
      </div>

      <div className="flex items-start relative">
        <Sidebar
          onCloseSidebar={() => setIsSidebarActive(false)}
          isSidebarActive={isSidebarActive}
        />

        <div className="flex-grow md:pt-7 pt-0 pb-7 border-x md:px-[2vw] px-[4vw] border-gray-darken min-h-screen bg-dark relative z-0 min-w-0">
          <div className="mb-8">
            {/* Back button */}
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
            >
              <IoArrowBack size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>

            <h1 className="text-4xl font-bold mb-4 text-white">
              {filters.region ? getRegionTitle(filters.region) : "Explore Content"}
            </h1>
            <p className="text-gray-400 text-lg">
              {filters.region
                ? `Discover hand-picked ${currentTab === "movie" ? "movies" : "TV shows"} from this region.`
                : `Filter and discover the best ${currentTab === "movie" ? "movies" : "TV shows"} matching your preference.`
              }
            </p>
          </div>

          <SeasonalBanner onSelectCategory={(cat) => {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("category", cat);
            newParams.delete("region"); // Clear region if category is selected
            navigate(`?${newParams.toString()}`);
          }} />

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[300px] shrink-0">
              <ExploreFilter
                currentTab={currentTab}
                onTabChange={handleTabChange}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div className="flex-grow overflow-hidden">
              {currentSource === "youtube" ? (
                <YouTubeGrid
                  videos={ytVideos}
                  loading={ytLoading}
                  error={ytError}
                />
              ) : (
                <ExploreResult
                  data={combinedItems}
                  isLoading={isLoading || ytLoading}
                  error={data && data.length > 0 ? (error || null) : (error || ytError)}
                  currentTab={currentTab}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Explore;
