import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getHomeMovies,
  getHomeTVs,
  getMovieBannerInfo,
  getTVBannerInfo,
} from "../services/home";
import { BannerInfo, HomeFilms, Item } from "../shared/types";
import { safeStorage } from "../utils/safeStorage";

export const useHomeData = (type: "movies" | "tvs") => {
  const queryClient = useQueryClient();
  const cacheKey = `home-cache-${type}`;
  const getData = type === "movies" ? getHomeMovies : getHomeTVs;

  // Load from cache initially for instant feel
  const initialData = safeStorage.getParsed<HomeFilms | undefined>(cacheKey, undefined);

  const { data, isLoading, isError, error } = useQuery<HomeFilms, Error>(
    [`home-${type}`],
    async () => {
      const result = await getData();
      safeStorage.set(cacheKey, JSON.stringify(result));
      return result;
    },
    {
      initialData: initialData,
      staleTime: 1000 * 60 * 10, // 10 minutes
    }
  );

  const detailQuery = useQuery<BannerInfo[], Error>(
    [`detail${type.charAt(0).toUpperCase() + type.slice(1)}`, data?.Trending],
    () =>
      type === "movies"
        ? getMovieBannerInfo(data?.Trending as Item[])
        : getTVBannerInfo(data?.Trending as Item[]),
    {
      enabled: !!data?.Trending,
      staleTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  return { data, isLoading, isError, error, detailQuery };
};
