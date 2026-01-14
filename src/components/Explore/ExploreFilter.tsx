import { FunctionComponent } from "react";
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
  return (
    <>
      {/* Tab switching */}
      <div className="bg-dark-lighten rounded-md shadow-md px-4 py-3 mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onTabChange("movie")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              currentTab === "movie"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => onTabChange("tv")}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              currentTab === "tv"
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
