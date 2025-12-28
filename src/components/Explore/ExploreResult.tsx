import { motion, AnimatePresence } from "framer-motion";
import { FunctionComponent, useState, useEffect } from "react";
import { Item, ItemsPage } from "../../shared/types";
import ExploreResultContent from "./ExploreResultContent";
import { getExploreMovie, getExploreTV } from "../../services/explore";
import { useSearchParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

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
    if (region) {
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

  useEffect(() => {
    if (data && data.length > 0) {
      const itemsPage: ItemsPage = {
        page: 1,
        results: data,
        total_pages: 1,
        total_results: data.length,
      };
      setPages([itemsPage]);
      setHasMore(false);
      return;
    }

    const loadData = async () => {
      try {
        setPages([]);
        setCurrentPage(1);
        setHasMore(true);
        const config = buildConfig();

        let result = currentTab === "movie"
          ? await getExploreMovie(1, config)
          : await getExploreTV(1, config);

        if (result && result.results && result.results.length > 0) {
          setPages([result]);
          setHasMore((result?.page || 1) < (result?.total_pages || 1));
        } else {
          setPages([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error loading explore data:", err);
        setPages([]);
        setHasMore(false);
      }
    };

    if (!isLoading) {
      loadData();
    }
  }, [currentTab, data, isLoading, searchParams.toString()]);

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
      setHasMore((result?.page || 0) < (result?.total_pages || 0));
    } catch (err) {
      console.error("Error loading more:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const allItems = pages.flatMap(page => page.results);

  if (error) return <div className="text-red-500 text-center mt-10">ERROR: {error}</div>;

  if (isLoading && pages.length === 0) {
    return (
      <div className="text-white">
        <div className="grid grid-cols-sm lg:grid-cols-lg gap-x-8 gap-y-10 pt-2 px-2">
          {[...new Array(15)].map((_, index) => (
            <div key={index} className="h-0 pb-[160%] bg-gray-800 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={allItems.length}
      next={fetchNext}
      hasMore={hasMore}
      loader={
        <div className="grid grid-cols-sm lg:grid-cols-lg gap-x-8 gap-y-10 pt-10 px-2 overflow-hidden">
          {[...new Array(5)].map((_, index) => (
            <div key={index} className="h-0 pb-[160%] bg-gray-800 animate-pulse rounded-xl" />
          ))}
        </div>
      }
      endMessage={
        <p className="text-center mt-10 text-gray-400 font-medium">
          You have seen it all! 🎬
        </p>
      }
      style={{ overflow: 'hidden' }}
    >
      <ExploreResultContent
        data={pages}
        fetchNext={fetchNext}
        hasMore={false}
        currentTab={currentTab}
      />
    </InfiniteScroll>
  );
};

export default ExploreResult;
