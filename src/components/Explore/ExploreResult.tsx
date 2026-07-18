import { FunctionComponent } from "react";
import { Item, ItemsPage } from "../../shared/types";
import ExploreResultContent from "./ExploreResultContent";

interface ExploreResultProps {
  currentTab: "movie" | "tv";
  data: Item[];
  isLoading: boolean;
  error: string | null;
}

/**
 * ExploreResult component
 * Simplified to remove redundant fetching. Now just wraps ExploreResultContent
 * and passes the data through in the expected ItemsPage format.
 */
const ExploreResult: FunctionComponent<ExploreResultProps> = ({
  currentTab,
  data,
  isLoading,
  error,
}) => {
  if (error) return <div className="text-red-500 py-10 text-center">ERROR: {error}</div>;

  // Show skeletons while loading if we have no data yet
  if (isLoading && (!data || data.length === 0)) {
    return (
      <div className="text-white">
        <div className="grid grid-cols-sm lg:grid-cols-lg gap-x-8 gap-y-10 pt-2 px-2">
          {[...new Array(15)].map((_, index) => (
            <div key={index} className="h-0 pb-[160%] bg-gray-800/50 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Convert the flat data array into the ItemsPage format expected by ExploreResultContent
  // This allows us to keep the existing infinite scroll UI while using the new hub-and-spoke simplified fetching
  const pages: ItemsPage[] = [{
    page: 1,
    results: data,
    total_pages: 1,
    total_results: data.length,
  }];

  return (
    <div>
      <ExploreResultContent
        data={pages}
        fetchNext={() => { }} // Hook handles basic pagination or we just show the full initial set
        hasMore={false}
        currentTab={currentTab}
      />
    </div>
  );
};

export default ExploreResult;
