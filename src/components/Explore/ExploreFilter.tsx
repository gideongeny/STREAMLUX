import { FunctionComponent } from "react";
import { useSearchParams } from "react-router-dom";
import FilterBy from "./FilterBy";
import SortBy from "./SortBy";

interface ExploreFilterProps {
  currentTab: "movie" | "tv";
  onTabChange: (tab: "movie" | "tv") => void;
  filters: {
    sortBy: string;
    genres: number[];
    year: string;
    runtime: string;
    region: string;
  };
  onFilterChange: (newFilters: Partial<{
    sortBy: string;
    genres: number[];
    year: string;
    runtime: string;
    region: string;
  }>) => void;
}

const ExploreFilter: FunctionComponent<ExploreFilterProps> = ({
  currentTab,
  onTabChange,
  filters,
  onFilterChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSource = searchParams.get("source") || "tmdb";

  const handleSourceChange = (source: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("source", source);
    if (source === "tmdb") {
      newParams.delete("region");
      newParams.delete("category");
    }
    setSearchParams(newParams);
  };

  return (
    <>
      {/* Content Source Selector */}
      <div className="bg-dark-lighten rounded-md shadow-md px-4 py-3 mb-4">
        <p className="text-gray-400 text-sm mb-2 uppercase font-bold tracking-wider">Content Source</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleSourceChange("tmdb")}
            className={`py-2 px-4 rounded-md transition-all flex items-center justify-between ${currentSource === "tmdb"
              ? "bg-primary text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            <span>☁️ Cloud (TMDB)</span>
            {currentSource === "tmdb" && <span className="text-[10px] bg-white/20 px-1 rounded">Active</span>}
          </button>
          <button
            onClick={() => handleSourceChange("youtube")}
            className={`py-2 px-4 rounded-md transition-all flex items-center justify-between ${currentSource === "youtube"
              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            <span>📺 YouTube Full Movies</span>
            {currentSource === "youtube" && <span className="text-[10px] bg-white/20 px-1 rounded">Active</span>}
          </button>
        </div>
      </div>

      {/* Tab switching */}
      <div className="bg-dark-lighten rounded-md shadow-md px-4 py-3 mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onTabChange("movie")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${currentTab === "movie"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            Movies
          </button>
          <button
            onClick={() => onTabChange("tv")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${currentTab === "tv"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            TV Shows
          </button>
        </div>
      </div>

      <SortBy />
      <FilterBy currentTab={currentTab} />
    </>
  );
};

export default ExploreFilter;
