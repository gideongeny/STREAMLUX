import axios from "../shared/axios";
import { ConfigType, Item, ItemsPage } from "../shared/types";
import {
  getAfricanCinema,
  getAsianDrama,
  getNollywoodMovies,
  getBollywoodContent,
  getEnhancedKenyanContent,
  getLatinAmericanContent,
  getMiddleEasternContent,
  getKDrama
} from "./home";

// Helper to map UI region names or fallback country codes to specialized regional functions
const getRegionalContent = async (regionInput: string, mediaType: "movie" | "tv"): Promise<Item[]> => {
  const r = regionInput.toLowerCase();

  // Standardize mapping: either friendly name or concatenated country codes
  let targetRegion = r;
  if (r.includes("ng") || r.includes("ke") || r.includes("za")) targetRegion = "africa";
  if (r.includes("kr") || r.includes("jp") || r.includes("in")) targetRegion = "asia";
  if (r.includes("mx") || r.includes("br")) targetRegion = "latin";
  if (r.includes("tr") || r.includes("ae")) targetRegion = "middleeast";

  console.log(`Explore Service: Resolved region [${regionInput}] to [${targetRegion}] for ${mediaType}`);

  try {
    if (targetRegion === "africa") return await getAfricanCinema(mediaType);
    if (targetRegion === "asia") return await getAsianDrama(mediaType);
    if (targetRegion === "nollywood") return await getNollywoodMovies();
    if (targetRegion === "kenya") return await getEnhancedKenyanContent();
    if (targetRegion === "bollywood" || targetRegion === "india") return await getBollywoodContent();
    if (targetRegion === "korea") return await getKDrama();
    if (targetRegion === "latin") return await getLatinAmericanContent();
    if (targetRegion === "middleeast") return await getMiddleEasternContent();
  } catch (error) {
    console.error(`Error in getRegionalContent for ${targetRegion}:`, error);
  }

  return [];
};

export const getExploreMovie: (
  page: number,
  config?: ConfigType
) => Promise<ItemsPage> = async (page, config = {}) => {
  const rawRegion = (config as any).region || config.with_origin_country;

  // PRIMARY: Specialized regional flow
  if (rawRegion && page === 1) {
    const regionalItems = await getRegionalContent(rawRegion, "movie");
    if (regionalItems.length > 0) {
      return {
        page: 1,
        total_pages: 1,
        results: regionalItems.map(i => ({ ...i, media_type: "movie" })),
        total_results: regionalItems.length
      };
    }
  }

  // SECONDARY: Standard TMDB Discovery
  const fetchPromises = [
    axios.get("/discover/movie", {
      params: { ...config, page },
      timeout: 5000,
    }).catch(() => ({ data: { results: [] } })),
    axios.get("/movie/popular", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
  ];

  const tmdbResults = await Promise.all(fetchPromises);
  const tmdbData = tmdbResults[0];
  const popularData = tmdbResults[1];

  const allItems = [
    ...((tmdbData as any).data?.results ?? []),
    ...((popularData as any).data?.results ?? []),
  ];

  const seen = new Set<number>();
  const finalItems = allItems
    .filter((item: Item) => item && item.poster_path && !seen.has(item.id))
    .map(item => { seen.add(item.id); return { ...item, media_type: "movie" as const }; });

  return {
    page: (tmdbData as any).data?.page ?? page,
    total_pages: (tmdbData as any).data?.total_pages ?? 1,
    results: finalItems,
    total_results: finalItems.length,
  };
};

export const getExploreTV: (
  page: number,
  config?: ConfigType
) => Promise<ItemsPage> = async (page, config = {}) => {
  const rawRegion = (config as any).region || config.with_origin_country;

  if (rawRegion && page === 1) {
    const regionalItems = await getRegionalContent(rawRegion, "tv");
    if (regionalItems.length > 0) {
      return {
        page: 1,
        total_pages: 1,
        results: regionalItems.map(i => ({ ...i, media_type: "tv" })),
        total_results: regionalItems.length
      };
    }
  }

  const fetchPromises = [
    axios.get("/discover/tv", {
      params: { ...config, page },
      timeout: 5000,
    }).catch(() => ({ data: { results: [] } })),
    axios.get("/tv/popular", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
  ];

  const tmdbResults = await Promise.all(fetchPromises);
  const tmdbData = tmdbResults[0];
  const popularData = tmdbResults[1];

  const allItems = [
    ...((tmdbData as any).data?.results ?? []),
    ...((popularData as any).data?.results ?? []),
  ];

  const seen = new Set<number>();
  const finalItems = allItems
    .filter((item: Item) => item && item.poster_path && !seen.has(item.id))
    .map(item => { seen.add(item.id); return { ...item, media_type: "tv" as const }; });

  return {
    page: (tmdbData as any).data?.page ?? page,
    total_pages: (tmdbData as any).data?.total_pages ?? 1,
    results: finalItems,
    total_results: finalItems.length,
  };
};
