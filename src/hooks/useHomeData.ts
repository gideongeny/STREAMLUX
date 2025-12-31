import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import axios from "../shared/axios";
import {
  getMovieBannerInfo,
  getTVBannerInfo,
  getTrendingMovies,
  getTrendingTVs,
} from "../services/home";
import { BannerInfo, HomeFilms, Item } from "../shared/types";

export const useHomeData = (type: "movies" | "tvs", enabled: boolean = true) => {
  const getTrending = type === "movies" ? getTrendingMovies : getTrendingTVs;

  // 1. Fetch Banner/Trending first (High Priority)
  const bannerQuery = useQuery<Item[], Error>(
    [`trending-${type}`],
    getTrending,
    { staleTime: 1000 * 60 * 10 } // Cache for 10 mins
  );

  const popularQuery = useQuery([`home-${type}-popular`], async () => {
    const res = await axios.get(type === "movies" ? "/movie/popular" : "/tv/popular");
    return res.data.results || [];
  }, { staleTime: 1000 * 60 * 10, enabled: enabled && !!bannerQuery.data });

  const topRatedQuery = useQuery([`home-${type}-toprated`], async () => {
    const res = await axios.get(type === "movies" ? "/movie/top_rated" : "/tv/top_rated");
    return res.data.results || [];
  }, { staleTime: 1000 * 60 * 10, enabled: enabled && !!bannerQuery.data });

  const hotQuery = useQuery([`home-${type}-hot`], async () => {
    const res = await axios.get(type === "movies" ? "/trending/movie/day?page=2" : "/trending/tv/day?page=2");
    return res.data.results || [];
  }, { staleTime: 1000 * 60 * 10, enabled: enabled && !!bannerQuery.data });

  const upcomingQuery = useQuery([`home-${type}-upcoming`], async () => {
    const res = await axios.get(type === "movies" ? "/movie/upcoming" : "/tv/on_the_air");
    return res.data.results || [];
  }, { staleTime: 1000 * 60 * 10, enabled: enabled && !!bannerQuery.data });

  const futureHitsQuery = useQuery([`home-${type}-future`], async () => {
    const { getFutureUpcoming } = await import("../services/home");
    return await getFutureUpcoming(type === "movies" ? "movie" : "tv");
  }, { staleTime: 1000 * 60 * 60 * 24, enabled: enabled && !!bannerQuery.data });

  // Combine data for backward compatibility
  const data = useMemo(() => {
    if (!bannerQuery.data) return undefined;
    const combined: HomeFilms = {
      Trending: bannerQuery.data,
      Popular: popularQuery.data || [],
      "Top Rated": topRatedQuery.data || [],
      Hot: hotQuery.data || [],
      Upcoming: upcomingQuery.data || [],
      "Future Hits (2026+)": futureHitsQuery.data || [],
    };
    return combined;
  }, [bannerQuery.data, popularQuery.data, topRatedQuery.data, hotQuery.data, upcomingQuery.data, futureHitsQuery.data]);

  const isLoading = bannerQuery.isLoading;
  const isError = bannerQuery.isError;
  const error = bannerQuery.error;

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

  return {
    data,
    isLoading,
    isError,
    error,
    detailQuery,
    bannerData: bannerQuery.data,
    popularQuery,
    topRatedQuery,
    hotQuery,
    upcomingQuery
  };
};
