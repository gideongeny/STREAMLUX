import { useQuery } from "@tanstack/react-query";
import {
  getHomeMovies,
  getHomeTVs,
  getMovieBannerInfo,
  getTVBannerInfo,
  getTrendingMovies,
  getTrendingTVs,
} from "../services/home";
import { BannerInfo, HomeFilms, Item } from "../shared/types";

export const useHomeData = (type: "movies" | "tvs") => {
  const getData = type === "movies" ? getHomeMovies : getHomeTVs;
  const getTrending = type === "movies" ? getTrendingMovies : getTrendingTVs;

  // 1. Fetch Banner/Trending first (High Priority)
  const bannerQuery = useQuery<Item[], Error>(
    [`trending-${type}`],
    getTrending,
    { staleTime: 1000 * 60 * 10 } // Cache for 10 mins
  );

  // 2. Fetch Secondary Sections (Lower Priority)
  const { data, isLoading, isError, error } = useQuery<HomeFilms, Error>(
    [`home-${type}`],
    getData,
    {
      staleTime: 1000 * 60 * 5,
      enabled: !!bannerQuery.data // Optional: Start sections after banner starts
    }
  );

  // 3. Fetch Banner Details (Genre/Translation)
  const detailQuery = useQuery<BannerInfo[], Error>(
    [`detail${type.charAt(0).toUpperCase() + type.slice(1)}`, bannerQuery.data],
    () =>
      type === "movies"
        ? getMovieBannerInfo(bannerQuery.data as Item[])
        : getTVBannerInfo(bannerQuery.data as Item[]),
    {
      enabled: !!(bannerQuery.data && Array.isArray(bannerQuery.data) && bannerQuery.data.length > 0),
      refetchOnWindowFocus: false,
    }
  );

  return { data, isLoading, isError, error, detailQuery, bannerData: bannerQuery.data };
};
