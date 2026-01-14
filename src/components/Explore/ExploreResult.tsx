import { motion, AnimatePresence } from "framer-motion";
import { FunctionComponent, useState, useEffect } from "react";
import { Item, ItemsPage } from "../../shared/types";
import ExploreResultContent from "./ExploreResultContent";
import { getExploreMovie, getExploreTV } from "../../services/explore";
import { useSearchParams } from "react-router-dom";
import axios from "../../shared/axios";

interface ExploreResultProps {
  currentTab: "movie" | "tv";
  data: Item[];
  isLoading: boolean;
  error: string | null;
}

const ExploreResult: FunctionComponent<ExploreResultProps> = ({
  currentTab,
  data,
  isLoading,
  error,
}) => {
  const [searchParams] = useSearchParams();
  const [pages, setPages] = useState<ItemsPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Build config from search params
  const buildConfig = () => {
    const config: any = {};
    const genre = searchParams.get("genre");
    const sortBy = searchParams.get("sort_by");
    const year = searchParams.get("year");
    const runtime = searchParams.get("runtime");
    const region = searchParams.get("region");
    
    if (genre) config.with_genres = genre;
    if (sortBy) config.sort_by = sortBy;
    if (year) {
      const currentYear = new Date().getFullYear();
      if (year === "2020s") {
        config["primary_release_date.gte"] = "2020-01-01";
        config["primary_release_date.lte"] = `${currentYear}-12-31`;
      } else if (year === "2010s") {
        config["primary_release_date.gte"] = "2010-01-01";
        config["primary_release_date.lte"] = "2019-12-31";
      }
    }
    if (runtime) {
      if (runtime === "short") config["with_runtime.lte"] = 90;
      else if (runtime === "medium") {
        config["with_runtime.gte"] = 90;
        config["with_runtime.lte"] = 150;
      } else if (runtime === "long") config["with_runtime.gte"] = 150;
    }
    // Add region/origin_country filter
    if (region) {
      // Map region to origin_country codes
      const regionMap: Record<string, string> = {
        "africa": "NG|ZA|KE|GH|TZ|UG|ET|RW|ZM|EG",
        "asia": "KR|JP|CN|IN",
        "latin": "MX|BR|AR|CO",
        "middleeast": "TR|EG|SA|AE",
        "nollywood": "NG",
        "bollywood": "IN",
        "korea": "KR",
        "japan": "JP",
        "china": "CN",
        "philippines": "PH",
        "kenya": "KE",
      };
      if (regionMap[region]) {
        config.with_origin_country = regionMap[region];
      }
    }
    return config;
  };

  // Use the filtered data from useTMDBCollectionQuery, with fallback to explore functions
  useEffect(() => {
    const loadData = async () => {
      // First try to use the filtered data from useTMDBCollectionQuery
      if (!isLoading && !error && data && data.length > 0) {
        // Convert the filtered data array to ItemsPage format
        const filteredByType = data.filter((item) => item.media_type === currentTab);
        if (filteredByType.length > 0) {
          const result: ItemsPage = {
            page: 1,
            results: filteredByType,
            total_pages: 1,
            total_results: filteredByType.length,
          };
          setPages([result]);
          setHasMore(false);
          return;
        }
      }
      
      // Fallback: If no data or error, use explore functions
      if (!isLoading) {
        try {
          setPages([]);
          setCurrentPage(1);
          setHasMore(true);
          const config = buildConfig();
          
          // Try with config first
          let result = currentTab === "movie" 
            ? await getExploreMovie(1, config)
            : await getExploreTV(1, config);
          
          // If no results, try popular content immediately (explore.ts should handle this, but double-check)
          if (!result || !result.results || result.results.length === 0) {
            console.log("No results from explore, trying popular content directly");
            result = currentTab === "movie" 
              ? await getExploreMovie(1, {}) // Empty config = popular
              : await getExploreTV(1, {});
          }
          
          if (result && result.results && result.results.length > 0) {
            setPages([result]);
            setHasMore(result.page < result.total_pages);
          } else {
            // Last resort: Try TMDB popular directly
            try {
              const popularResponse = await axios.get(
                currentTab === "movie" ? "/movie/popular" : "/tv/popular",
                { params: { page: 1 }, timeout: 5000 }
              ).catch(() => ({ data: { results: [] } }));
              
              const popularItems = (popularResponse.data?.results || []).slice(0, 20).map((item: any) => ({
                ...item,
                media_type: currentTab,
              })).filter((item: Item) => item.poster_path);
              
              if (popularItems.length > 0) {
                setPages([{
                  page: 1,
                  total_pages: 1,
                  results: popularItems,
                  total_results: popularItems.length,
                }]);
                setHasMore(false);
              } else {
                setPages([]);
                setHasMore(false);
              }
            } catch (err) {
              console.error("Final fallback failed:", err);
              setPages([]);
              setHasMore(false);
            }
          }
        } catch (err) {
          console.error("Error loading explore data:", err);
          // Try final fallback even on error
          try {
            const popularResponse = await axios.get(
              currentTab === "movie" ? "/movie/popular" : "/tv/popular",
              { params: { page: 1 }, timeout: 5000 }
            ).catch(() => ({ data: { results: [] } }));
            
            const popularItems = (popularResponse.data?.results || []).slice(0, 20).map((item: any) => ({
              ...item,
              media_type: currentTab,
            })).filter((item: Item) => item.poster_path);
            
            if (popularItems.length > 0) {
              setPages([{
                page: 1,
                total_pages: 1,
                results: popularItems,
                total_results: popularItems.length,
              }]);
              setHasMore(false);
            } else {
              setPages([]);
              setHasMore(false);
            }
          } catch (fallbackErr) {
            setPages([]);
            setHasMore(false);
          }
        }
      }
    };
    
    loadData();
  }, [currentTab, data, isLoading, error, searchParams.toString()]);

  const fetchNext = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const config = buildConfig();
      const nextPage = currentPage + 1;
      const result = currentTab === "movie"
        ? await getExploreMovie(nextPage, config)
        : await getExploreTV(nextPage, config);
      setPages(prev => [...prev, result]);
      setCurrentPage(nextPage);
      setHasMore(result.page < result.total_pages);
    } catch (err) {
      console.error("Error loading more:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (error) return <div className="text-red-500">ERROR: {error}</div>;
  if (isLoading && pages.length === 0) {
    return (
      <div className="text-white">
        <div className="grid grid-cols-sm lg:grid-cols-lg gap-x-8 gap-y-10 pt-2 px-2">
          {[...new Array(15)].map((_, index) => (
            <div key={index} className="h-0 pb-[160%] bg-gray-800 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ExploreResultContent
        data={pages}
        fetchNext={fetchNext}
        hasMore={hasMore}
        currentTab={currentTab}
      />
    </div>
  );
};

export default ExploreResult;
