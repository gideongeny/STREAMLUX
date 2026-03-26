import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  getHomeMovies,
  getHomeTVs,
  getMovieBannerInfo,
  getTVBannerInfo,
} from "../services/home";
import { BannerInfo, HomeFilms, Item } from "../shared/types";
import { safeStorage } from "../utils/safeStorage";

export const useHomeData = (type: "movie" | "tv", history?: Item[], enabled: boolean = true) => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const cacheKey = `home-cache-${type}-${i18n.language}`;
  const getData = type === "movie" ? getHomeMovies : getHomeTVs;

  // Load from cache initially for instant feel
  const initialData = safeStorage.getParsed<HomeFilms | undefined>(cacheKey, undefined);

  const { data, isLoading, isError, error } = useQuery<HomeFilms, Error>(
    [`home-${type}`, i18n.language, history?.length],
    async () => {
      const result = await getData(history);
      safeStorage.set(cacheKey, JSON.stringify(result));
      return result;
    },
    {
      initialData: initialData,
      staleTime: 1000 * 60 * 60, // 1 hour for home data (very stable)
      enabled: enabled, // Only fetch if this tab is active
    }
  );

  // Background Prefetching logic for the *other* type if this one is enabled
  useEffect(() => {
    if (enabled) {
      const otherType = type === "movie" ? "tv" : "movie";
      const prefetchTimer = setTimeout(() => {
        queryClient.prefetchQuery(
          [`home-${otherType}`, i18n.language, history?.length],
          () => (otherType === "movie" ? getHomeMovies(history) : getHomeTVs(history)),
          { staleTime: 1000 * 60 * 60 }
        );
      }, 6000); // 6-second delay to prioritize current tab and critical path rendering
      return () => clearTimeout(prefetchTimer);
    }
  }, [enabled, type, i18n.language, history, queryClient]);

  const detailCacheKey = `detail-cache-${type}-${i18n.language}`;
  const initialDetailData = safeStorage.getParsed<BannerInfo[] | undefined>(detailCacheKey, undefined);

  const detailQuery = useQuery<BannerInfo[], Error>(
    [`detail${type.charAt(0).toUpperCase() + type.slice(1)}`, data?.Trending],
    async () => {
      const result = type === "movie"
        ? await getMovieBannerInfo(data?.Trending as Item[])
        : await getTVBannerInfo(data?.Trending as Item[]);
      safeStorage.set(detailCacheKey, JSON.stringify(result));
      return result;
    },
    {
      initialData: initialDetailData,
      enabled: enabled && !!data?.Trending,
      staleTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  return { data, isLoading, isError, error, detailQuery };
};
