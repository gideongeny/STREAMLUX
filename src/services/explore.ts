import axios from "../shared/axios";
import { ConfigType, Item, ItemsPage } from "../shared/types";
import { getFZContentByGenre, getFZContentByCountry } from "./fzmovies";

// Helper to map UI region names to TMDB country codes and search queries
const mapRegionToCodes = (region: string): { codes: string, queries: string[] } => {
  const r = region.toLowerCase();

  if (r === "africa") return { codes: "NG|KE|ZA|GH|TZ|UG|ET|RW|ZM|EG", queries: ["african", "nollywood"] };
  if (r === "asia") return { codes: "IN|KR|JP|CN|TH|PH|VN|MY|ID", queries: ["asian", "bollywood", "k-drama", "anime"] };
  if (r === "latin") return { codes: "MX|BR|AR|CO|CL|PE", queries: ["latin", "mexican", "brazilian", "spanish"] };
  if (r === "middleeast") return { codes: "TR|EG|SA|AE|IR|JO|LB", queries: ["middle eastern", "turkish", "egyptian"] };
  if (r === "nollywood") return { codes: "NG", queries: ["nollywood", "nigerian"] };
  if (r === "kenya") return { codes: "KE", queries: ["kenyan"] };
  if (r === "south africa") return { codes: "ZA", queries: ["south african"] };
  if (r === "india" || r === "bollywood") return { codes: "IN", queries: ["bollywood", "indian"] };
  if (r === "korea") return { codes: "KR", queries: ["korean", "k-drama"] };
  if (r === "japan") return { codes: "JP", queries: ["japanese", "anime"] };
  if (r === "china") return { codes: "CN", queries: ["chinese", "mandarin"] };
  if (r === "philippines") return { codes: "PH", queries: ["filipino", "tagalog"] };
  if (r === "thailand") return { codes: "TH", queries: ["thai"] };
  if (r === "mexico") return { codes: "MX", queries: ["mexican"] };
  if (r === "brazil") return { codes: "BR", queries: ["brazilian"] };
  if (r === "turkey") return { codes: "TR", queries: ["turkish"] };

  return { codes: region, queries: [region] };
};

export const getExploreMovie: (
  page: number,
  config?: ConfigType
) => Promise<ItemsPage> = async (page, config = {}) => {
  const genreId = config.with_genres ? Number(config.with_genres) : undefined;
  const rawRegion = config.with_origin_country || (config as any).region;
  const { codes: originCountry, queries } = mapRegionToCodes(rawRegion || "");

  const fetchPromises = [
    axios.get("/discover/movie", {
      params: { ...config, page, ...(genreId && { with_genres: genreId }), ...(originCountry && { with_origin_country: originCountry }) },
      timeout: 5000,
    }).catch(() => ({ data: { results: [] } })),
    axios.get("/movie/popular", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
    axios.get("/trending/movie/day", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
    ...(originCountry ? [
      getFZContentByGenre(genreId || 0, "movie", page).catch(() => []),
      // Multi-page TMDB discovery for regions
      Promise.all([1, 2, 3, 4, 5].map(p =>
        axios.get("/discover/movie", { params: { ...config, page: p, with_origin_country: originCountry } })
          .then(res => res.data.results || []).catch(() => [])
      )).then(results => results.flat()).catch(() => []),
      // Regional scraper discovery
      Promise.all(originCountry.split('|').slice(0, 5).map(country =>
        getFZContentByCountry(country, "movie", page).catch(() => [])
      )).then(results => results.flat()).catch(() => []),
    ] : []),
  ];

  const tmdbResults = await Promise.all(fetchPromises);
  const tmdbData = tmdbResults[0];
  const popularData = tmdbResults[1];
  const trendingData = tmdbResults[2];
  const fzMovies = tmdbResults[3] || [];
  const regionalDiscover = tmdbResults[4] || [];
  const regionalScraper = tmdbResults[5] || [];

  const allResults = [
    ...(tmdbData as any).data?.results ?? [],
    ...(popularData as any).data?.results ?? [],
    ...(trendingData as any).data?.results ?? [],
    ...(regionalDiscover as Item[]),
    ...(regionalScraper as Item[]),
    ...(fzMovies as Item[]),
  ];

  const seen = new Set<number>();
  const adjustedItems = allResults
    .filter((item: Item) => {
      if (!item || !item.poster_path || seen.has(item.id)) return false;
      seen.add(item.id);
      if (genreId && item.genre_ids && !item.genre_ids.includes(genreId)) return false;

      // Regional check: If a region is selected, priority to items from that region
      if (originCountry) {
        const isFromRegionalSource = (regionalDiscover as Item[]).some(r => r.id === item.id) ||
          (regionalScraper as Item[]).some(r => r.id === item.id);
        if (!isFromRegionalSource) {
          const countries = item.origin_country || [];
          const filterCountries = originCountry.split('|');
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
  const rawRegion = config.with_origin_country || (config as any).region;
  const { codes: originCountry } = mapRegionToCodes(rawRegion || "");

  const fetchPromises = [
    axios.get("/discover/tv", {
      params: { ...config, page, ...(genreId && { with_genres: genreId }), ...(originCountry && { with_origin_country: originCountry }) },
      timeout: 5000,
    }).catch(() => ({ data: { results: [] } })),
    axios.get("/tv/popular", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
    ...(originCountry ? [
      getFZContentByGenre(genreId || 0, "tv", page).catch(() => []),
      Promise.all([1, 2, 3, 4, 5].map(p =>
        axios.get("/discover/tv", { params: { ...config, page: p, with_origin_country: originCountry } })
          .then(res => res.data.results || []).catch(() => [])
      )).then(results => results.flat()).catch(() => []),
      Promise.all(originCountry.split('|').slice(0, 5).map(country =>
        getFZContentByCountry(country, "tv", page).catch(() => [])
      )).then(results => results.flat()).catch(() => []),
    ] : []),
  ];

  const tmdbResults = await Promise.all(fetchPromises);
  const tmdbData = tmdbResults[0];
  const popularData = tmdbResults[1];
  const fzTV = tmdbResults[2] || [];
  const regionalDiscover = tmdbResults[3] || [];
  const regionalScraper = tmdbResults[4] || [];

  const allResults = [
    ...(tmdbData as any).data?.results ?? [],
    ...(popularData as any).data?.results ?? [],
    ...(regionalDiscover as Item[]),
    ...(regionalScraper as Item[]),
    ...(fzTV as Item[]),
  ];

  const seen = new Set<number>();
  const adjustedItems = allResults
    .filter((item: Item) => {
      if (!item || !item.poster_path || seen.has(item.id)) return false;
      seen.add(item.id);
      if (genreId && item.genre_ids && !item.genre_ids.includes(genreId)) return false;
      if (originCountry) {
        const isFromRegionalSource = (regionalDiscover as Item[]).some(r => r.id === item.id) ||
          (regionalScraper as Item[]).some(r => r.id === item.id);
        if (!isFromRegionalSource) {
          const countries = item.origin_country || [];
          const filterCountries = originCountry.split('|');
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
