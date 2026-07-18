import axios from "../shared/axios";
import { HomeFilms, Item, BannerInfo } from "../shared/types";

/**
 * Optimized Home Content Service v5.6.1
 * Features: Staggered Loading, Premium-Only Discovery, Global Cinema Buckets
 */

import { getYouTubeMovies, getYouTubeTVShows, getYouTubeByGenre } from "./youtubeContent";
import { interleaveArrays } from "../utils/array";

// --- Base Fetcher ---
const fetchItems = async (url: string, params = {}): Promise<Item[]> => {
  try {
    const res = await axios.get(url, { params });
    const inferredType = url.includes("/movie") ? "movie" : url.includes("/tv") ? "tv" : undefined;
    
    return (res.data.results || []).map((item: any) => ({
      ...item,
      media_type: item.media_type || inferredType,
    }));
  } catch (error) {
    console.error(`[HomeService] Fetch failed for ${url}:`, error);
    return [];
  }
};

// --- Helpers ---
const filterPremium = (items: Item[]) => 
  items.filter(item => item.isYouTube || (item.backdrop_path && item.poster_path));

const mergeAndDedupe = (arrays: Item[][], limit = 20): Item[] => {
  const seen = new Set();
  const merged: Item[] = [];
  for (const arr of arrays) {
    if (!arr) continue;
    for (const item of arr) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
      if (merged.length >= limit) break;
    }
    if (merged.length >= limit) break;
  }
  return merged;
};

/** TMDB-only top 20 for the ranking slider (YouTube items are excluded there). */
const buildTop20TmdbOnly = async (
  trendingPath: string,
  popularPath: string,
  mediaType: "movie" | "tv"
): Promise<Item[]> => {
  const tmdbOnly = (items: Item[]) =>
    items.filter(
      (item) =>
        !item.isYouTube &&
        !item.youtubeId &&
        (item.poster_path || item.backdrop_path) &&
        !String(item.poster_path || "").includes("ytimg.com")
    );

  let pool = tmdbOnly(
    filterPremium((await fetchItems(trendingPath)).map((i) => ({ ...i, media_type: mediaType })))
  );
  if (pool.length < 20) {
    const popular = tmdbOnly(
      filterPremium((await fetchItems(popularPath)).map((i) => ({ ...i, media_type: mediaType })))
    );
    pool = mergeAndDedupe([pool, popular], 20);
  }
  return pool.slice(0, 20);
};

// --- Individual Exports for DiverseContent ---
export const getTrendingNow = () => fetchItems("/trending/all/day");
export const getTrendingMovies = () => fetchItems("/trending/movie/day");
export const getTrendingTV = () => fetchItems("/trending/tv/day");
export const getNewReleases = () => fetchItems("/movie/now_playing");

// Movies by Genre
export const getActionMovies = () => fetchItems("/discover/movie", { with_genres: 28 });
export const getAdventureMovies = () => fetchItems("/discover/movie", { with_genres: 12 });
export const getAnimationMovies = () => fetchItems("/discover/movie", { with_genres: 16 });
export const getComedyMovies = () => fetchItems("/discover/movie", { with_genres: 35 });
export const getCrimeMovies = () => fetchItems("/discover/movie", { with_genres: 80 });
export const getDocumentaryMovies = () => fetchItems("/discover/movie", { with_genres: 99 });
export const getDramaMovies = () => fetchItems("/discover/movie", { with_genres: 18 });
export const getFamilyMovies = () => fetchItems("/discover/movie", { with_genres: 10751 });
export const getFantasyMovies = () => fetchItems("/discover/movie", { with_genres: 14 });
export const getHistoryMovies = () => fetchItems("/discover/movie", { with_genres: 36 });
export const getHorrorMovies = () => fetchItems("/discover/movie", { with_genres: 27 });
export const getMusicMovies = () => fetchItems("/discover/movie", { with_genres: 10402 });
export const getMysteryMovies = () => fetchItems("/discover/movie", { with_genres: 9648 });
export const getRomanceMovies = () => fetchItems("/discover/movie", { with_genres: 10749 });
export const getSciFiMovies = () => fetchItems("/discover/movie", { with_genres: 878 });
export const getTVMovies = () => fetchItems("/discover/movie", { with_genres: 10770 });
export const getThrillerMovies = () => fetchItems("/discover/movie", { with_genres: 53 });
export const getWarMovies = () => fetchItems("/discover/movie", { with_genres: 10752 });
export const getWesternMovies = () => fetchItems("/discover/movie", { with_genres: 37 });

// TV by Genre
export const getActionAdventureTV = () => fetchItems("/discover/tv", { with_genres: 10759 });
export const getAnimationTV = () => fetchItems("/discover/tv", { with_genres: 16 });
export const getComedyTV = () => fetchItems("/discover/tv", { with_genres: 35 });
export const getCrimeTV = () => fetchItems("/discover/tv", { with_genres: 80 });
export const getDocumentaryTV = () => fetchItems("/discover/tv", { with_genres: 99 });
export const getDramaTV = () => fetchItems("/discover/tv", { with_genres: 18 });
export const getFamilyTV = () => fetchItems("/discover/tv", { with_genres: 10751 });
export const getKidsTV = () => fetchItems("/discover/tv", { with_genres: 10762 });
export const getMysteryTV = () => fetchItems("/discover/tv", { with_genres: 9648 });
export const getNewsTV = () => fetchItems("/discover/tv", { with_genres: 10763 });
export const getRealityTV = () => fetchItems("/discover/tv", { with_genres: 10764 });
export const getSciFiFantasyTV = () => fetchItems("/discover/tv", { with_genres: 10765 });
export const getSoapTV = () => fetchItems("/discover/tv", { with_genres: 10766 });
export const getTalkTV = () => fetchItems("/discover/tv", { with_genres: 10767 });
export const getWarPoliticsTV = () => fetchItems("/discover/tv", { with_genres: 10768 });

// Regional Content
export const getAfricanContent = () => fetchItems("/discover/movie", { with_original_language: "sw|yo|ig|zu|xh" });
export const getAfricanCinema = () => getAfricanContent();
export const getAsianContent = () => fetchItems("/discover/movie", { with_original_language: "zh|ja|ko|vi|th" });
export const getAsianDrama = () => fetchItems("/discover/tv", { with_original_language: "zh|ja|ko" });
export const getLatinAmericanContent = () => fetchItems("/discover/movie", { with_original_language: "es|pt", with_origin_country: "MX|BR|AR|CO" });
export const getMiddleEasternContent = () => fetchItems("/discover/movie", { with_original_language: "ar|fa|tr" });
export const getNollywoodContent = () => fetchItems("/discover/movie", { with_original_language: "en", with_origin_country: "NG" });
export const getNollywoodMovies = () => getNollywoodContent();
export const getBollywoodContent = () => fetchItems("/discover/movie", { with_original_language: "hi|te|ta|ml|kn" });
export const getKoreanContent = () => fetchItems("/discover/movie", { with_original_language: "ko" });
export const getKDrama = () => fetchItems("/discover/tv", { with_original_language: "ko" });
export const getJapaneseContent = () => fetchItems("/discover/movie", { with_original_language: "ja" });
export const getChineseContent = () => fetchItems("/discover/movie", { with_original_language: "zh" });
export const getEastAfricanContent = () => fetchItems("/discover/movie", { with_origin_country: "KE|TZ|UG|ET" });
export const getSouthAfricanContent = () => fetchItems("/discover/movie", { with_origin_country: "ZA" });
export const getSoutheastAsianContent = () => fetchItems("/discover/movie", { with_origin_country: "TH|VN|ID|MY|PH" });
export const getFilipinoContent = () => fetchItems("/discover/movie", { with_origin_country: "PH" });
export const getBrazilianContent = () => fetchItems("/discover/movie", { with_origin_country: "BR" });
export const getMexicanContent = () => fetchItems("/discover/movie", { with_origin_country: "MX" });

// Regional Content (TV)
export const getKenyanTVShows = () => fetchItems("/discover/tv", { with_origin_country: "KE" });
export const getNigerianTVShows = () => fetchItems("/discover/tv", { with_origin_country: "NG" });
export const getAfricanTVContent = () => fetchItems("/discover/tv", { with_origin_country: "ZA|NG|KE|EG|MA" });
export const getEnhancedNollywoodContent = () => fetchItems("/discover/movie", { with_original_language: "en", with_origin_country: "NG", sort_by: "popularity.desc" });
export const getEnhancedKenyanContent = () => fetchItems("/discover/movie", { with_origin_country: "KE", sort_by: "vote_average.desc" });

// Niche
export const getIndieAndRareContent = () => fetchItems("/discover/movie", { "vote_count.gte": 50, "vote_count.lte": 500, sort_by: "popularity.desc" });
export const getNicheAnimeContent = () => fetchItems("/discover/movie", { with_genres: 16, with_original_language: "ja", "vote_average.gte": 7.5 });
export const getGenreContent = (genreId: number, type: "movie" | "tv") => fetchItems(`/discover/${type}`, { with_genres: genreId });

// --- Video/Trailer Fetcher ---
export const getVideo = async (id: number, type: "movie" | "tv") => {
  try {
    const res = await axios.get(`/${type}/${id}/videos`);
    return res.data.results || [];
  } catch (error) {
    console.error(`[HomeService] Video fetch failed for ${type}/${id}:`, error);
    return [];
  }
};

// --- Banner Info ---
export const getMovieBannerInfo = async (movies: Item[]): Promise<BannerInfo[]> => {
  if (!movies) return [];
  const topMovies = movies.slice(0, 6);
  return Promise.all(topMovies.map(async (movie) => {
    try {
      const [detailsRes, videosRes] = await Promise.all([
        axios.get(`/movie/${movie.id}`, { params: { append_to_response: "images" } }),
        axios.get(`/movie/${movie.id}/videos`)
      ]);
      
      const details = detailsRes.data;
      const videos = videosRes.data.results || [];
      const trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube")?.key 
                   || videos.find((v: any) => v.type === "Teaser" && v.site === "YouTube")?.key;
                   
      const logo = details.images?.logos?.find((l: any) => l.iso_639_1 === "en")?.file_path 
                || details.images?.logos?.[0]?.file_path;
                   
      return { ...details, trailer, logo };
    } catch (e) {
      console.error("[HomeService] Failed to fetch banner detail:", e);
      return { id: movie.id } as any;
    }
  }));
};

export const getTVBannerInfo = async (tvs: Item[]): Promise<BannerInfo[]> => {
  if (!tvs) return [];
  const topTVs = tvs.slice(0, 6);
  return Promise.all(topTVs.map(async (tv) => {
    try {
      const [detailsRes, videosRes] = await Promise.all([
        axios.get(`/tv/${tv.id}`, { params: { append_to_response: "images" } }),
        axios.get(`/tv/${tv.id}/videos`)
      ]);

      const details = detailsRes.data;
      const videos = videosRes.data.results || [];
      const trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube")?.key
                   || videos.find((v: any) => v.type === "Teaser" && v.site === "YouTube")?.key;

      const logo = details.images?.logos?.find((l: any) => l.iso_639_1 === "en")?.file_path 
                || details.images?.logos?.[0]?.file_path;

      return { ...details, trailer, logo };
    } catch (e) {
      console.error("[HomeService] Failed to fetch banner detail:", e);
      return { id: tv.id } as any;
    }
  }));
};

// --- Unified Home Aggregators ---
export const getHomeMovies = async (history: Item[]): Promise<HomeFilms> => {
  const endpoints = {
    Trending: "/trending/movie/day",
    Hot: "/movie/popular",
  };

  const results: HomeFilms = {};
  const seenIds = new Set<string | number>();

  // Fetch YouTube content in parallel for all genres
  const keysToFetch = ["Trending", "Hot"];
  
  const ytFetchPromises = keysToFetch.map(key => {
    if (key === "Trending" || key === "Hot") return getYouTubeMovies().catch(() => []);
    let searchKey = key;
    if (key === "SciFi") searchKey = "Sci-Fi";
    if (key === "Music") searchKey = "Musical";
    if (key === "TVMovies") searchKey = "TV Movie";
    return getYouTubeByGenre(searchKey, "movie").catch(() => []);
  });

  const ytResultsArray = await Promise.all(ytFetchPromises);
  const ytGenreMap: Record<string, Item[]> = {};
  keysToFetch.forEach((key, index) => {
    ytGenreMap[key] = ytResultsArray[index] || [];
  });

  // Personalization: Because You Watched
  if (history && history.length > 0) {
    const lastItem = history[history.length - 1];
    try {
      const recommendations = await axios.get(`/movie/${lastItem.id}/recommendations`);
      const recs = filterPremium(recommendations.data.results || []).slice(0, 20);
      recs.forEach(item => seenIds.add(item.id));
      results["BecauseYouWatched"] = recs;
    } catch (e) {
      console.error("Failed to fetch movie recommendations", e);
    }
  }

  const keys = Object.keys(endpoints);
  const chunks = [keys];

  for (const chunk of chunks) {
    await new Promise((r) => setTimeout(r, 300));
    const data = await Promise.all(chunk.map(key => axios.get((endpoints as any)[key])));
    data.forEach((res, i) => {
      const key = chunk[i];
      const tmdbItems = filterPremium(res.data.results || []);
      
      // Deduplicate: filter out items already displayed in previous rows
      const uniqueTmdb = tmdbItems.filter(item => !seenIds.has(item.id));

      const ytContent = ytGenreMap[key] || [];
      const uniqueYt = ytContent.filter(item => !seenIds.has(item.id));

      // Interleave YouTube Content using structured ratio
      let items = interleaveArrays(uniqueTmdb, uniqueYt, 3).slice(0, 20);

      // Backfill fallback: if filtering made the row too small, fill up from the original list
      if (items.length < 12 && tmdbItems.length > 0) {
        const extraItems = tmdbItems.filter(item => !seenIds.has(item.id) && !items.some(x => x.id === item.id)).slice(0, 20 - items.length);
        items = [...items, ...extraItems].slice(0, 20);
      }

      // Add to seen tracking list
      items.forEach(item => seenIds.add(item.id));

      results[key] = items;
    });
  }

  results["Top20Today"] = await buildTop20TmdbOnly(
    "/trending/movie/day",
    "/movie/popular",
    "movie"
  );
  // Dedicated row: free full movies on YouTube (same engine as Yung-Music / InnerTube)
  const ytMovies = (ytGenreMap.Trending || []).filter((i) => !seenIds.has(i.id)).slice(0, 20);
  if (ytMovies.length > 0) {
    results["YouTubeFree"] = ytMovies;
    ytMovies.forEach((i) => seenIds.add(i.id));
  }
  return results;
};

export const getHomeTVs = async (history: Item[]): Promise<HomeFilms> => {
  const endpoints = {
    Trending: "/trending/tv/day",
    Hot: "/tv/popular",
  };

  const results: HomeFilms = {};
  const seenIds = new Set<string | number>();

  // Fetch YouTube TV Shows in parallel for all genres
  const keysToFetch = ["Trending", "Hot"];
  
  const ytFetchPromises = keysToFetch.map(key => {
    if (key === "Trending" || key === "Hot") return getYouTubeTVShows().catch(() => []);
    let searchKey = key;
    if (key === "SciFi") searchKey = "Sci-Fi";
    return getYouTubeByGenre(searchKey, "tv").catch(() => []);
  });

  const ytResultsArray = await Promise.all(ytFetchPromises);
  const ytGenreMap: Record<string, Item[]> = {};
  keysToFetch.forEach((key, index) => {
    ytGenreMap[key] = ytResultsArray[index] || [];
  });

  // Personalization: Because You Watched
  if (history && history.length > 0) {
    const lastItem = history[history.length - 1];
    try {
      const recommendations = await axios.get(`/tv/${lastItem.id}/recommendations`);
      const recs = filterPremium(recommendations.data.results || []).slice(0, 20);
      recs.forEach(item => seenIds.add(item.id));
      results["BecauseYouWatched"] = recs;
    } catch (e) {
      console.error("Failed to fetch tv recommendations", e);
    }
  }

  const keys = Object.keys(endpoints);
  const chunks = [keys];

  for (const chunk of chunks) {
    await new Promise((r) => setTimeout(r, 300));
    const data = await Promise.all(chunk.map(key => axios.get((endpoints as any)[key])));
    data.forEach((res, i) => {
      const key = chunk[i];
      const tmdbItems = filterPremium(res.data.results || []);

      // Deduplicate: filter out items already displayed in previous rows
      const uniqueTmdb = tmdbItems.filter(item => !seenIds.has(item.id));

      const ytContent = ytGenreMap[key] || [];
      const uniqueYt = ytContent.filter(item => !seenIds.has(item.id));

      // Interleave YouTube TV Content
      let items = interleaveArrays(uniqueTmdb, uniqueYt, 3).slice(0, 20);

      // Backfill fallback: if filtering made the row too small, fill up from the original list
      if (items.length < 12 && tmdbItems.length > 0) {
        const extraItems = tmdbItems.filter(item => !seenIds.has(item.id) && !items.some(x => x.id === item.id)).slice(0, 20 - items.length);
        items = [...items, ...extraItems].slice(0, 20);
      }

      // Add to seen tracking list
      items.forEach(item => seenIds.add(item.id));

      results[key] = items;
    });
  }

  results["Top20Today"] = await buildTop20TmdbOnly(
    "/trending/tv/day",
    "/tv/popular",
    "tv"
  );
  const ytTv = (ytGenreMap.Trending || []).filter((i) => !seenIds.has(i.id)).slice(0, 20);
  if (ytTv.length > 0) {
    results["YouTubeFree"] = ytTv;
    ytTv.forEach((i) => seenIds.add(i.id));
  }
  return results;
};
export const homeService = {
  getHomeMovies,
  getHomeTVs
};
