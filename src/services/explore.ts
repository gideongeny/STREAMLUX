import axios from "../shared/axios";
import { ConfigType, Item, ItemsPage } from "../shared/types";
import { getFZContentByGenre, getFZContentByCountry } from "./fzmovies";

export const getExploreMovie: (
  page: number,
  config?: ConfigType
) => Promise<ItemsPage> = async (page, config = {}) => {
  const genreId = config.with_genres ? Number(config.with_genres) : undefined;
  const originCountry = config.with_origin_country || (config as any).region;

  const fetchPromises = [
    axios.get("/discover/movie", {
      params: { ...config, page, ...(genreId && { with_genres: genreId }), ...(originCountry && { with_origin_country: originCountry }) },
      timeout: 5000,
    }).catch(() => ({ data: { results: [] } })),
    axios.get("/movie/popular", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
    axios.get("/trending/movie/day", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
    ...(originCountry ? [
      getFZContentByGenre(genreId || 0, "movie", page).catch(() => []),
      Promise.all([1, 2, 3].map(p =>
        axios.get("/discover/movie", { params: { ...config, page: p, with_origin_country: originCountry } })
          .then(res => res.data.results || []).catch(() => [])
      )).then(results => results.flat()).catch(() => []),
      Promise.all((typeof originCountry === 'string' ? originCountry.split('|') : [originCountry])
        .slice(0, 5).map(country => getFZContentByCountry(country, "movie", page).catch(() => []))
      ).then(results => results.flat()).catch(() => []),
    ] : []),
  ];

  const [tmdbData, popularData, trendingData, fzMovies, regionalDiscover, regionalScraper] = await Promise.all(fetchPromises);
  const allResults = [
    ...(tmdbData as any).data?.results ?? [],
    ...(popularData as any).data?.results ?? [],
    ...(trendingData as any).data?.results ?? [],
    ...(regionalDiscover as Item[] || []),
    ...(regionalScraper as Item[] || []),
    ...(fzMovies as Item[] || []),
  ];

  const seen = new Set<number>();
  const adjustedItems = allResults
    .filter((item: Item) => {
      if (!item || !item.poster_path || seen.has(item.id)) return false;
      seen.add(item.id);
      if (genreId && item.genre_ids && !item.genre_ids.includes(genreId)) return false;
      if (originCountry) {
        const isFromRegionalSource = (regionalDiscover as Item[] || []).some(r => r.id === item.id) ||
          (regionalScraper as Item[] || []).some(r => r.id === item.id);
        if (!isFromRegionalSource) {
          const countries = item.origin_country || [];
          const filterCountries = typeof originCountry === 'string' ? originCountry.split('|') : [originCountry];
          if (countries.length > 0 && !countries.some((c: string) => filterCountries.includes(c))) return false;
        }
      }
      return true;
    })
    .map((item: Item) => ({ ...item, media_type: "movie" as const }));

  if (adjustedItems.length === 0) {
    const fallback = await axios.get("/movie/popular", { params: { page: 1 } }).catch(() => ({ data: { results: [] } }));
    return { page: 1, total_pages: 1, results: fallback.data.results.map((i: any) => ({ ...i, media_type: "movie" })), total_results: fallback.data.results.length };
  }

  return {
    page: (tmdbData as any).data?.page ?? page,
    total_pages: (tmdbData as any).data?.total_pages ?? 1,
    results: adjustedItems,
    total_results: adjustedItems.length,
  };
};

export const getExploreTV: (
  page: number,
  config?: ConfigType
) => Promise<ItemsPage> = async (page, config = {}) => {
  const genreId = config.with_genres ? Number(config.with_genres) : undefined;
  const originCountry = config.with_origin_country || (config as any).region;

  const fetchPromises = [
    axios.get("/discover/tv", {
      params: { ...config, page, ...(genreId && { with_genres: genreId }), ...(originCountry && { with_origin_country: originCountry }) },
      timeout: 5000,
    }).catch(() => ({ data: { results: [] } })),
    axios.get("/tv/popular", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
    ...(originCountry ? [
      getFZContentByGenre(genreId || 0, "tv", page).catch(() => []),
      Promise.all([1, 2, 3].map(p =>
        axios.get("/discover/tv", { params: { ...config, page: p, with_origin_country: originCountry } })
          .then(res => res.data.results || []).catch(() => [])
      )).then(results => results.flat()).catch(() => []),
      Promise.all((typeof originCountry === 'string' ? originCountry.split('|') : [originCountry])
        .slice(0, 5).map(country => getFZContentByCountry(country, "tv", page).catch(() => []))
      ).then(results => results.flat()).catch(() => []),
    ] : []),
  ];

  const [tmdbData, popularData, fzTV, regionalDiscover, regionalScraper] = await Promise.all(fetchPromises);
  const allResults = [
    ...(tmdbData as any).data?.results ?? [],
    ...(popularData as any).data?.results ?? [],
    ...(regionalDiscover as Item[] || []),
    ...(regionalScraper as Item[] || []),
    ...(fzTV as Item[] || []),
  ];

  const seen = new Set<number>();
  const adjustedItems = allResults
    .filter((item: Item) => {
      if (!item || !item.poster_path || seen.has(item.id)) return false;
      seen.add(item.id);
      if (genreId && item.genre_ids && !item.genre_ids.includes(genreId)) return false;
      if (originCountry) {
        const isFromRegionalSource = (regionalDiscover as Item[] || []).some(r => r.id === item.id) ||
          (regionalScraper as Item[] || []).some(r => r.id === item.id);
        if (!isFromRegionalSource) {
          const countries = item.origin_country || [];
          const filterCountries = typeof originCountry === 'string' ? originCountry.split('|') : [originCountry];
          if (countries.length > 0 && !countries.some((c: string) => filterCountries.includes(c))) return false;
        }
      }
      return true;
    })
    .map((item: Item) => ({ ...item, media_type: "tv" as const }));

  if (adjustedItems.length === 0) {
    const fallback = await axios.get("/tv/popular", { params: { page: 1 } }).catch(() => ({ data: { results: [] } }));
    return { page: 1, total_pages: 1, results: fallback.data.results.map((i: any) => ({ ...i, media_type: "tv" })), total_results: fallback.data.results.length };
  }

  return {
    page: (tmdbData as any).data?.page ?? page,
    total_pages: (tmdbData as any).data?.total_pages ?? 1,
    results: adjustedItems,
    total_results: adjustedItems.length,
  };
};
