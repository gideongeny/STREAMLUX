import axios from "../shared/axios";
import { BannerInfo, Item, HomeFilms } from "../shared/types";
import {
  getFZTrending,
  getFZPopular,
  getFZTopRated,
  getFZLatest,
  getFZContentByGenre,
  getFZContentByCountry,
} from "./fzmovies";
import { getAllSourceContent } from "./contentSources";
import { getAllAPIContent, getAllAPIContentByGenre } from "./movieAPIs";

// MOVIE TAB
///////////////////////////////////////////////////////////////
export const getHomeMovies = async (): Promise<HomeFilms> => {
  const endpoints: { [key: string]: string } = {
    Trending: "/trending/movie/day",
    Popular: "/movie/popular",
    "Top Rated": "/movie/top_rated",
    Hot: "/trending/movie/day?page=2",
    Upcoming: "/movie/upcoming",
  };

  // Priority 1: Fetch TMDB first (fast and reliable)
  const tmdbResponses = await Promise.all(
    Object.entries(endpoints).map((endpoint) => axios.get(endpoint[1]))
  );

  // Priority 2: Load additional sources in background (with timeout to prevent blocking)
  const additionalSourcesPromise = Promise.allSettled([
    getFZTrending("movie"),
    getFZPopular("movie", 1),
    getFZTopRated("movie", 1),
    getFZLatest("movie", 1),
  ]).then((results) => ({
    fzTrending: results[0].status === "fulfilled" ? results[0].value : [],
    fzPopular: results[1].status === "fulfilled" ? results[1].value : [],
    fzTopRated: results[2].status === "fulfilled" ? results[2].value : [],
    fzLatest: results[3].status === "fulfilled" ? results[3].value : [],
  }));

  // Start loading additional sources but don't wait for them initially
  const additionalSources = await Promise.race([
    additionalSourcesPromise,
    new Promise((resolve) => setTimeout(() => resolve({
      fzTrending: [],
      fzPopular: [],
      fzTopRated: [],
      fzLatest: [],
    }), 1500)), // 1.5 second timeout for faster loading
  ]) as { fzTrending: Item[], fzPopular: Item[], fzTopRated: Item[], fzLatest: Item[] };

  // Load other sources in background (non-blocking) - these will be available later if needed
  // Now includes Letterboxd, Rotten Tomatoes, and enhanced TMDB via getAllAPIContent
  Promise.allSettled([
    getAllSourceContent("movie", 1),
    getAllAPIContent("movie", "popular"), // Includes IMDB -> Letterboxd -> Rotten Tomatoes -> TMDB fallback
  ]).catch(() => {}); // Silently fail for background loading

  // Helper function to merge and deduplicate items from all sources
  const mergeAndDedupe = (tmdbItems: Item[], fzItems: Item[], otherItems: Item[] = []): Item[] => {
    const combined = [...tmdbItems, ...fzItems, ...otherItems];
    const seen = new Set<number>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path; // Only include items with posters
    });
  };

  const data = tmdbResponses.reduce((final, current, index) => {
    const key = Object.entries(endpoints)[index][0];
    const tmdbItems = current.data.results.map((item: Item) => ({
      ...item,
      media_type: "movie" as const,
    }));

    // Merge with FZMovies content based on category
    let fzItems: Item[] = [];
    if (key === "Trending" || key === "Hot") {
      fzItems = additionalSources.fzTrending;
    } else if (key === "Popular") {
      fzItems = additionalSources.fzPopular;
    } else if (key === "Top Rated") {
      fzItems = additionalSources.fzTopRated;
    } else if (key === "Upcoming") {
      fzItems = additionalSources.fzLatest;
    }

    // Use only TMDB + FZMovies for initial fast load
    final[key] = mergeAndDedupe(tmdbItems, fzItems, []);

    return final;
  }, {} as HomeFilms);

  return data;
};

export const getMovieBannerInfo = async (
  movies: Item[]
): Promise<BannerInfo[]> => {
  const detailRes = await Promise.all(
    movies.map((movie) => axios.get(`/movie/${movie.id}`))
  );

  const translationRes = await Promise.all(
    movies.map((movie) => axios.get(`/movie/${movie.id}/translations`))
  );

  const translations: string[][] = translationRes.map((item: any) =>
    item.data.translations
      .filter((translation: any) =>
        ["en", "sw", "fr", "es", "pt", "de", "it", "ru", "ja", "ko", "zh", "ar", "hi"].includes(translation.iso_639_1)
      )
      .reduce((acc: any, element: any) => {
        if (element.iso_639_1 === "en") {
          return [element, ...acc];
        } else if (element.iso_639_1 === "sw") {
          return [element, ...acc];
        }
        return [...acc, element];
      }, [] as any)
      .map((translation: any) => translation.data.title)
  );

  // translations will look like: [["Doctor Strange", "Daktari Strange", "Doctor Strange", "Dr. Strange"],["Spider Man Far From Home", "Spider Man Mbali na Nyumbani", "Spider-Man Lejos de Casa"],...]

  const genres: { name: string; id: number }[][] = detailRes.map((item: any) =>
    item.data.genres.filter((_: any, index: number) => index < 3)
  );

  // genres will look like: [[{name: "action", id: 14}, {name: "wild", id: 19}, {name: "love", ket: 23}],[{name: "fantasy", id: 22}, {name: "science", id: 99}],...]

  // we have translations.length = genres.length, so let's merge these 2 arrays together
  return genres.map((genre, index) => ({
    genre,
    translation: translations[index],
  })) as BannerInfo[];

  // yeah I admit that it's hard to understand my code :)
};

// TV TAB
///////////////////////////////////////////////////////////////

export const getHomeTVs = async (): Promise<HomeFilms> => {
  const endpoints: { [key: string]: string } = {
    Trending: "/trending/tv/day",
    Popular: "/tv/popular",
    "Top Rated": "/tv/top_rated",
    Hot: "/trending/tv/day?page=2",
    "On the air": "/tv/on_the_air",
  };

  // Priority 1: Fetch TMDB first (fast and reliable)
  const tmdbResponses = await Promise.all(
    Object.entries(endpoints).map((endpoint) => axios.get(endpoint[1]))
  );

  // Priority 2: Load additional sources in background (with timeout to prevent blocking)
  const additionalSourcesPromise = Promise.allSettled([
    getFZTrending("tv"),
    getFZPopular("tv", 1),
    getFZTopRated("tv", 1),
    getFZLatest("tv", 1),
  ]).then((results) => ({
    fzTrending: results[0].status === "fulfilled" ? results[0].value : [],
    fzPopular: results[1].status === "fulfilled" ? results[1].value : [],
    fzTopRated: results[2].status === "fulfilled" ? results[2].value : [],
    fzLatest: results[3].status === "fulfilled" ? results[3].value : [],
  }));

  // Start loading additional sources but don't wait for them initially
  const additionalSources = await Promise.race([
    additionalSourcesPromise,
    new Promise((resolve) => setTimeout(() => resolve({
      fzTrending: [],
      fzPopular: [],
      fzTopRated: [],
      fzLatest: [],
    }), 1500)), // 1.5 second timeout for faster loading
  ]) as { fzTrending: Item[], fzPopular: Item[], fzTopRated: Item[], fzLatest: Item[] };

  // Load other sources in background (non-blocking) - these will be available later if needed
  // Now includes Letterboxd, Rotten Tomatoes, and enhanced TMDB via getAllAPIContent
  Promise.allSettled([
    getAllSourceContent("tv", 1),
    getAllAPIContent("tv", "popular"), // Includes IMDB -> Letterboxd -> Rotten Tomatoes -> TMDB fallback
  ]).catch(() => {}); // Silently fail for background loading

  // Helper function to merge and deduplicate items from all sources
  const mergeAndDedupe = (tmdbItems: Item[], fzItems: Item[], otherItems: Item[] = []): Item[] => {
    const combined = [...tmdbItems, ...fzItems, ...otherItems];
    const seen = new Set<number>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path; // Only include items with posters
    });
  };

  const data = tmdbResponses.reduce((final, current, index) => {
    const key = Object.entries(endpoints)[index][0];
    const tmdbItems = current.data.results.map((item: Item) => ({
      ...item,
      media_type: "tv" as const,
    }));

    // Merge with FZMovies content based on category
    let fzItems: Item[] = [];
    if (key === "Trending" || key === "Hot") {
      fzItems = additionalSources.fzTrending;
    } else if (key === "Popular") {
      fzItems = additionalSources.fzPopular;
    } else if (key === "Top Rated") {
      fzItems = additionalSources.fzTopRated;
    } else if (key === "On the air") {
      fzItems = additionalSources.fzLatest;
    }

    // Use only TMDB + FZMovies for initial fast load
    final[key] = mergeAndDedupe(tmdbItems, fzItems, []);

    return final;
  }, {} as HomeFilms);

  return data;
};

export const getTVBannerInfo = async (tvs: Item[]): Promise<BannerInfo[]> => {
  const detailRes = await Promise.all(
    tvs.map((tv) => axios.get(`/tv/${tv.id}`))
  );

  const translationRes = await Promise.all(
    tvs.map((tv) => axios.get(`/tv/${tv.id}/translations`))
  );

  const translations = translationRes.map((item: any) =>
    item.data.translations
      .filter((translation: any) =>
        ["en", "sw", "fr", "es", "pt", "de", "it", "ru", "ja", "ko", "zh", "ar", "hi"].includes(translation.iso_639_1)
      )
      .reduce((acc: any, element: any) => {
        if (element.iso_639_1 === "en") {
          return [element, ...acc];
        } else if (element.iso_639_1 === "sw") {
          return [element, ...acc];
        }
        return [...acc, element];
      }, [] as any)
      .map((translation: any) => translation.data.name)
  );

  const genres = detailRes.map((item: any) =>
    item.data.genres.filter((_: any, index: number) => index < 3)
  );

  return genres.map((genre, index) => ({
    genre,
    translation: translations[index],
  })) as BannerInfo[];
};

// GENERAL
///////////////////////////////////////////////////////////////
export const getTrendingNow = async (): Promise<Item[]> => {
  // Optimized: Only use TMDB for fast loading, load others in background
  try {
    const tmdbResults = await Promise.race([
      axios.get("/trending/all/day?page=2"),
      new Promise((resolve) => setTimeout(() => resolve({ data: { results: [] } }), 3000)),
    ]) as { data: { results: Item[] } };

    const tmdbItems = tmdbResults.data.results || [];
    
    // Load additional sources in background (non-blocking)
    Promise.allSettled([
      getFZTrending("all").catch(() => []),
    ]).then((results) => {
      // Background update - doesn't block initial render
      if (results[0].status === "fulfilled") {
        // Could update cache here if needed
      }
    }).catch(() => {});

    const seen = new Set<number>();
    return tmdbItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path;
    }).slice(0, 20); // Limit to 20 for faster loading
  } catch (error) {
    console.error("Error fetching trending:", error);
    return [];
  }
};

// Global horror movies (for Horror Movies shelf) - Optimized for speed
export const getHorrorMovies = async (): Promise<Item[]> => {
  try {
    // Only use TMDB for fast loading
    const tmdbResponse = await Promise.race([
      axios.get(`/discover/movie`, {
        params: {
          with_genres: 27, // Horror
          sort_by: "popularity.desc",
          page: 1,
        },
        timeout: 3000,
      }),
      new Promise((resolve) => setTimeout(() => resolve({ data: { results: [] } }), 3000)),
    ]) as { data: { results: any[] } };

    const tmdbItems = (tmdbResponse.data.results || []).map((item: any) => ({
      ...item,
      media_type: "movie" as const,
    }));

    const seen = new Set<number>();
    return tmdbItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path;
    }).slice(0, 20); // Limit to 20 for faster loading
  } catch (error) {
    console.error("Error fetching horror movies:", error);
    return [];
  }
};

// Additional categories from moviebox.ph - Optimized for speed
export const getActionMovies = async (): Promise<Item[]> => {
  try {
    // Only use TMDB for fast loading
    const tmdbResponse = await Promise.race([
      axios.get(`/discover/movie`, {
        params: { with_genres: 28, sort_by: "popularity.desc", page: 1 },
        timeout: 3000,
      }),
      new Promise((resolve) => setTimeout(() => resolve({ data: { results: [] } }), 3000)),
    ]) as { data: { results: any[] } };
    
    const tmdbItems = (tmdbResponse.data.results || []).map((item: any) => ({
      ...item,
      media_type: "movie" as const,
    }));
    
    const seen = new Set<number>();
    return tmdbItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path;
    }).slice(0, 20); // Limit to 20 for faster loading
  } catch (error) {
    console.error("Error fetching action movies:", error);
    return [];
  }
};

export const getComedyMovies = async (): Promise<Item[]> => {
  try {
    // Only use TMDB for fast loading
    const tmdbResponse = await Promise.race([
      axios.get(`/discover/movie`, {
        params: { with_genres: 35, sort_by: "popularity.desc", page: 1 },
        timeout: 3000,
      }),
      new Promise((resolve) => setTimeout(() => resolve({ data: { results: [] } }), 3000)),
    ]) as { data: { results: any[] } };
    
    const tmdbItems = (tmdbResponse.data.results || []).map((item: any) => ({
      ...item,
      media_type: "movie" as const,
    }));
    
    const seen = new Set<number>();
    return tmdbItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path;
    }).slice(0, 20); // Limit to 20 for faster loading
  } catch (error) {
    console.error("Error fetching comedy movies:", error);
    return [];
  }
};

export const getDramaMovies = async (): Promise<Item[]> => {
  try {
    const tmdbResponse = await Promise.race([
      axios.get(`/discover/movie`, {
        params: { with_genres: 18, sort_by: "popularity.desc", page: 1 },
        timeout: 3000,
      }),
      new Promise((resolve) => setTimeout(() => resolve({ data: { results: [] } }), 3000)),
    ]) as { data: { results: any[] } };
    
    const tmdbItems = (tmdbResponse.data.results || []).map((item: any) => ({
      ...item,
      media_type: "movie" as const,
    }));
    
    const seen = new Set<number>();
    return tmdbItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path;
    }).slice(0, 20);
  } catch (error) {
    console.error("Error fetching drama movies:", error);
    return [];
  }
};

// Optimized helper function for genre movies - reduces API calls
const getGenreMoviesOptimized = async (genreId: number): Promise<Item[]> => {
  try {
    const tmdbResponse = await Promise.race([
      axios.get(`/discover/movie`, {
        params: { with_genres: genreId, sort_by: "popularity.desc", page: 1 },
        timeout: 3000,
      }),
      new Promise((resolve) => setTimeout(() => resolve({ data: { results: [] } }), 3000)),
    ]) as { data: { results: any[] } };
    
    const tmdbItems = (tmdbResponse.data.results || []).map((item: any) => ({
      ...item,
      media_type: "movie" as const,
    }));
    
    const seen = new Set<number>();
    return tmdbItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path;
    }).slice(0, 20);
  } catch (error) {
    return [];
  }
};

export const getThrillerMovies = async (): Promise<Item[]> => {
  try {
    return await getGenreMoviesOptimized(53);
  } catch (error) {
    console.error("Error fetching thriller movies:", error);
    return [];
  }
};

export const getRomanceMovies = async (): Promise<Item[]> => {
  try {
    return await getGenreMoviesOptimized(10749);
  } catch (error) {
    console.error("Error fetching romance movies:", error);
    return [];
  }
};

export const getSciFiMovies = async (): Promise<Item[]> => {
  try {
    return await getGenreMoviesOptimized(878);
  } catch (error) {
    console.error("Error fetching sci-fi movies:", error);
    return [];
  }
};

export const getAnimationMovies = async (): Promise<Item[]> => {
  try {
    return await getGenreMoviesOptimized(16);
  } catch (error) {
    console.error("Error fetching animation movies:", error);
    return [];
  }
};

export const getDocumentaryMovies = async (): Promise<Item[]> => {
  try {
    return await getGenreMoviesOptimized(99);
  } catch (error) {
    console.error("Error fetching documentary movies:", error);
    return [];
  }
};

export const getCrimeMovies = async (): Promise<Item[]> => {
  try {
    return await getGenreMoviesOptimized(80);
  } catch (error) {
    console.error("Error fetching crime movies:", error);
    return [];
  }
};

export const getAdventureMovies = async (): Promise<Item[]> => {
  try {
    return await getGenreMoviesOptimized(12);
  } catch (error) {
    console.error("Error fetching adventure movies:", error);
    return [];
  }
};

export const getFantasyMovies = async (): Promise<Item[]> => {
  try {
    return await getGenreMoviesOptimized(14);
  } catch (error) {
    console.error("Error fetching fantasy movies:", error);
    return [];
  }
};

// Helpers to enhance sourcing by networks/companies
const searchIds = async (
  type: "network" | "company",
  names: string[]
): Promise<number[]> => {
  try {
    const endpoint = type === "network" ? "/search/network" : "/search/company";
    const searches = await Promise.all(
      names.map((name) => axios.get(`${endpoint}`, { params: { query: name, page: 1 } }))
    );

    const ids = searches
      .flatMap((res) => (res.data.results || []))
      .map((r: any) => r.id)
      .filter((id: any) => typeof id === "number");

    // Remove duplicates
    return Array.from(new Set(ids));
  } catch (e) {
    return [];
  }
};

// Add methods for diverse content
export const getAfricanContent = async (): Promise<Item[]> => {
  try {
    const africanCountries = [
      "NG",
      "KE",
      "TZ",
      "UG",
      "ET",
      "RW",
      "ZM",
      "GH",
      "ZA",
      "EG",
    ].join("|");

    // Fetch from both TMDB and FZMovies in parallel
    const [moviePages, tvPages, fzMovies, fzTV] = await Promise.all([
      Promise.all(
        [1, 2].map((page) =>
          axios.get(`/discover/movie`, {
            params: {
              with_origin_country: africanCountries,
              sort_by: "popularity.desc",
              page,
            },
          })
        )
      ),
      Promise.all(
        [1, 2].map((page) =>
          axios.get(`/discover/tv`, {
            params: {
              with_origin_country: africanCountries,
              sort_by: "popularity.desc",
              page,
            },
          })
        )
      ),
      // Fetch from FZMovies for African countries
      Promise.all([
        getFZContentByCountry("NG", "movie", 1),
        getFZContentByCountry("KE", "movie", 1),
        getFZContentByCountry("ZA", "movie", 1),
        getFZContentByCountry("GH", "movie", 1),
      ]).then(results => results.flat()),
      Promise.all([
        getFZContentByCountry("NG", "tv", 1),
        getFZContentByCountry("KE", "tv", 1),
        getFZContentByCountry("ZA", "tv", 1),
        getFZContentByCountry("GH", "tv", 1),
      ]).then(results => results.flat()),
    ]);

    const movieResults = moviePages.flatMap((res) => res.data.results || []).filter((i: any) => i.poster_path);
    const tvResults = tvPages.flatMap((res) => res.data.results || []).filter((i: any) => i.poster_path);

    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));

    // Merge with FZMovies content and dedupe
    const combined = [...movies, ...tvs, ...fzMovies, ...fzTV];
    return combined.filter((item, idx, self) => idx === self.findIndex((t) => t.id === item.id));
  } catch (error) {
    console.error("Error fetching African content:", error);
    return [];
  }
};

// Separate function for East African content
export const getEastAfricanContent = async (): Promise<Item[]> => {
  try {
    const eastAfricanCountries = ["KE", "TZ", "UG", "ET", "RW", "ZM"].join("|");

    const moviePages = await Promise.all(
      [1, 2].map((page) =>
        axios.get(`/discover/movie`, {
          params: {
            with_origin_country: eastAfricanCountries,
            sort_by: "popularity.desc",
            page,
          },
        })
      )
    );
    const tvPages = await Promise.all(
      [1, 2].map((page) =>
        axios.get(`/discover/tv`, {
          params: {
            with_origin_country: eastAfricanCountries,
            sort_by: "popularity.desc",
            page,
          },
        })
      )
    );

    const movieResults = moviePages.flatMap((res) => res.data.results || []).filter((i: any) => i.poster_path);
    const tvResults = tvPages.flatMap((res) => res.data.results || []).filter((i: any) => i.poster_path);

    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));

    const combined = [...movies, ...tvs];
    return combined.filter((item, idx, self) => idx === self.findIndex((t) => t.id === item.id));
  } catch (error) {
    console.error("Error fetching East African content:", error);
    return [];
  }
};

// Separate function for South African content
export const getSouthAfricanContent = async (): Promise<Item[]> => {
  try {
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=ZA&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=ZA&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching South African content:", error);
    return [];
  }
};

// Kenyan TV Shows - Popular shows from major Kenyan channels
export const getKenyanTVShows = async (): Promise<Item[]> => {
  try {
    const curatedTitles = [
      "Maria",
      "Zora",
      "Sultana",
      "Selina",
      "Kina",
      "Njoro wa Uba",
      "Inspekta Mwala",
      "Tahidi High",
      "Papa Shirandula",
      "Machachari",
      "Mother-in-Law",
      "Varshita",
      "The Real Househelps of Kawangware",
      "Hulla Baloo Estate",
      "Crime and Justice",
      "Pepeta",
      "Single Kiasi",
      "Country Queen"
    ];

    const discoverKeTv = axios.get(`/discover/tv`, {
      params: {
        with_origin_country: "KE",
        sort_by: "popularity.desc",
        page: 1,
      },
    });

    const searchPromises = curatedTitles.map((title) =>
      axios.get(`/search/tv?query=${encodeURIComponent(title)}&page=1`)
    );

    const [discoverResponse, ...searchResponses] = await Promise.all([
      discoverKeTv,
      ...searchPromises,
    ]);

    const discoverResults = (discoverResponse.data.results || []).map((i: any) => ({
      ...i,
      media_type: "tv",
    }));

    const searchedResultsRaw = searchResponses.flatMap((res) => res.data.results || []);

    const curatedNameSet = new Set(curatedTitles.map((t) => t.toLowerCase()));
    const searchedResults = searchedResultsRaw
      .filter((item: any) => {
        const isKenyan = Array.isArray(item.origin_country) && item.origin_country.includes("KE");
        const matchesCurated = curatedNameSet.has((item.name || "").toLowerCase());
        return isKenyan || matchesCurated;
      })
      .map((i: any) => ({ ...i, media_type: "tv" }));

    const combined = [...discoverResults, ...searchedResults];
    const unique = combined
      .filter((i: any) => i.poster_path)
      .filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

    return unique;
  } catch (error) {
    console.error("Error fetching Kenyan TV shows:", error);
    return [];
  }
};

// Nigerian TV Shows and Nollywood content
export const getNigerianTVShows = async (): Promise<Item[]> => {
  try {
    const searchTerms = [
      "Nigerian TV series",
      "Nollywood TV",
      "Nigerian drama",
      "Nigerian soap opera",
      "Nigerian comedy",
      "Nigerian reality show",
      "Nigerian news"
    ];
    
    const searchPromises = searchTerms.map(term => 
      axios.get(`/search/tv?query=${encodeURIComponent(term)}&page=1`)
    );
    
    const searchResults = await Promise.all(searchPromises);
    
    const allResults = searchResults.flatMap(response => 
      response.data.results || []
    );
    
    const uniqueResults = allResults
      .filter((item: any, index: number, self: any[]) => 
        index === self.findIndex((t: any) => t.id === item.id)
      )
      .map((item: any) => ({ ...item, media_type: "tv" }));
    
    return uniqueResults;
  } catch (error) {
    console.error("Error fetching Nigerian TV shows:", error);
    return [];
  }
};

export const getAsianContent = async (): Promise<Item[]> => {
  try {
    // Fetch Asian movies and TV shows including Southeast Asia
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=KR&with_origin_country=JP&with_origin_country=CN&with_origin_country=IN&with_origin_country=PH&with_origin_country=TH&with_origin_country=VN&with_origin_country=MY&with_origin_country=SG&with_origin_country=ID&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=KR&with_origin_country=JP&with_origin_country=CN&with_origin_country=IN&with_origin_country=PH&with_origin_country=TH&with_origin_country=VN&with_origin_country=MY&with_origin_country=SG&with_origin_country=ID&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Asian content:", error);
    return [];
  }
};

// Separate function for Southeast Asian content
export const getSoutheastAsianContent = async (): Promise<Item[]> => {
  try {
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=PH&with_origin_country=TH&with_origin_country=VN&with_origin_country=MY&with_origin_country=SG&with_origin_country=ID&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=PH&with_origin_country=TH&with_origin_country=VN&with_origin_country=MY&with_origin_country=SG&with_origin_country=ID&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Southeast Asian content:", error);
    return [];
  }
};

// Separate function for Filipino content
export const getFilipinoContent = async (): Promise<Item[]> => {
  try {
    // Discover PH content, pages 1-2 for both movies and TV
    const moviePages = await Promise.all(
      [1, 2].map((page) =>
        axios.get(`/discover/movie`, {
          params: { with_origin_country: "PH", sort_by: "popularity.desc", page },
        })
      )
    );
    const tvPages = await Promise.all(
      [1, 2].map((page) =>
        axios.get(`/discover/tv`, {
          params: { with_origin_country: "PH", sort_by: "popularity.desc", page },
        })
      )
    );

    const discoverMovies = moviePages.flatMap((res) => res.data.results || []).map((i: any) => ({ ...i, media_type: "movie" }));
    const discoverTV = tvPages.flatMap((res) => res.data.results || []).map((i: any) => ({ ...i, media_type: "tv" }));

    // Curated ABS-CBN titles (Kapamilya/iWantTFC)
    const curatedAbsCbn = [
      "FPJ's Ang Probinsyano",
      "The Killer Bride",
      "La Luna Sangre",
      "Bagani",
      "The General's Daughter",
      "A Love to Last",
      "2 Good 2 Be True",
      "Pangako Sa 'Yo",
      "On the Wings of Love",
      "Got to Believe",
      "He's Into Her",
      "The Broken Marriage Vow"
    ];
    const absCbnSearch = await Promise.all(
      curatedAbsCbn.map((t) => axios.get(`/search/tv?query=${encodeURIComponent(t)}&page=1`))
    );
    const absCbnResults = absCbnSearch
      .flatMap((res) => res.data.results || [])
      .filter((i: any) => Array.isArray(i.origin_country) && i.origin_country.includes("PH"))
      .map((i: any) => ({ ...i, media_type: "tv" }));

    // Search ABS-CBN network/company IDs and query discover with them
    const absNetworks = await searchIds("network", ["ABS-CBN", "Kapamilya", "Kapamilya Channel", "iWantTFC"]);
    const absCompanies = await searchIds("company", ["ABS-CBN", "ABS-CBN Film Productions", "Star Cinema"]);
    const networkParam = absNetworks.join("|");
    const companyParam = absCompanies.join("|");
    const [absTvByNetwork, absMoviesByCompany] = await Promise.all([
      networkParam
        ? axios.get(`/discover/tv`, {
            params: { with_networks: networkParam, with_origin_country: "PH", page: 1, sort_by: "popularity.desc" },
          })
        : Promise.resolve({ data: { results: [] } } as any),
      companyParam
        ? axios.get(`/discover/movie`, {
            params: { with_companies: companyParam, with_origin_country: "PH", page: 1, sort_by: "popularity.desc" },
          })
        : Promise.resolve({ data: { results: [] } } as any),
    ]);
    const brandResults = [
      ...(absTvByNetwork.data.results || []).map((i: any) => ({ ...i, media_type: "tv" })),
      ...(absMoviesByCompany.data.results || []).map((i: any) => ({ ...i, media_type: "movie" })),
    ];

    const combined = [...discoverMovies, ...discoverTV, ...absCbnResults, ...brandResults]
      .filter((i: any) => i.poster_path);

    return combined.filter((item, idx, self) => idx === self.findIndex((t) => t.id === item.id));
  } catch (error) {
    console.error("Error fetching Filipino content:", error);
    return [];
  }
};

export const getLatinAmericanContent = async (): Promise<Item[]> => {
  try {
    // Fetch Latin American movies and TV shows including more countries
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=MX&with_origin_country=BR&with_origin_country=AR&with_origin_country=CO&with_origin_country=PE&with_origin_country=CL&with_origin_country=VE&with_origin_country=EC&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=MX&with_origin_country=BR&with_origin_country=AR&with_origin_country=CO&with_origin_country=PE&with_origin_country=CL&with_origin_country=VE&with_origin_country=EC&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Latin American content:", error);
    return [];
  }
};

// Separate function for Brazilian content
export const getBrazilianContent = async (): Promise<Item[]> => {
  try {
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=BR&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=BR&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Brazilian content:", error);
    return [];
  }
};

// Separate function for Mexican content
export const getMexicanContent = async (): Promise<Item[]> => {
  try {
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=MX&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=MX&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Mexican content:", error);
    return [];
  }
};

export const getMiddleEasternContent = async (): Promise<Item[]> => {
  try {
    // Fetch Middle Eastern movies and TV shows
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=TR&with_origin_country=EG&with_origin_country=SA&with_origin_country=AE&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=TR&with_origin_country=EG&with_origin_country=SA&with_origin_country=AE&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Middle Eastern content:", error);
    return [];
  }
};

export const getNollywoodContent = async (): Promise<Item[]> => {
  try {
    // Fetch Nigerian (Nollywood) content via multiple strategies
    const moviePages = await Promise.all(
      [1, 2].map((page) =>
        axios.get(`/discover/movie`, {
          params: { with_origin_country: "NG", sort_by: "popularity.desc", page },
        })
      )
    );
    const tvPages = await Promise.all(
      [1, 2].map((page) =>
        axios.get(`/discover/tv`, {
          params: { with_origin_country: "NG", sort_by: "popularity.desc", page },
        })
      )
    );

    // Networks/companies likely associated with Nollywood (e.g., Africa Magic, Showmax, iROKO)
    const ngNetworks = await searchIds("network", [
      "Africa Magic",
      "Showmax",
      "Africa Magic Showcase",
      "Africa Magic Urban",
      "Africa Magic Family",
    ]);
    const ngCompanies = await searchIds("company", [
      "iROKO Partners",
      "iROKOtv",
      "FilmOne Entertainment",
      "FilmOne Studios",
      "EbonyLife Films",
      "Ebonylife Studios",
      "Inkblot Productions",
    ]);

    const [tvByNetwork, movieByCompany] = await Promise.all([
      ngNetworks.length
        ? axios.get(`/discover/tv`, {
            params: { with_networks: ngNetworks.join("|"), with_origin_country: "NG", sort_by: "popularity.desc", page: 1 },
          })
        : Promise.resolve({ data: { results: [] } } as any),
      ngCompanies.length
        ? axios.get(`/discover/movie`, {
            params: { with_companies: ngCompanies.join("|"), with_origin_country: "NG", sort_by: "popularity.desc", page: 1 },
          })
        : Promise.resolve({ data: { results: [] } } as any),
    ]);

    const movieResults = moviePages.flatMap((res) => res.data.results || []);
    const tvResults = tvPages.flatMap((res) => res.data.results || []);
    const tvFromNetwork = (tvByNetwork.data.results || []);
    const moviesFromCompany = (movieByCompany.data.results || []);

    const movies = [...movieResults, ...moviesFromCompany]
      .filter((i: any) => i.poster_path)
      .map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = [...tvResults, ...tvFromNetwork]
      .filter((i: any) => i.poster_path)
      .map((item: any) => ({ ...item, media_type: "tv" }));
    
    const combined = [...movies, ...tvs];
    return combined.filter((item, idx, self) => idx === self.findIndex((t) => t.id === item.id));
  } catch (error) {
    console.error("Error fetching Nollywood content:", error);
    return [];
  }
};

export const getBollywoodContent = async (): Promise<Item[]> => {
  try {
    // Fetch Indian (Bollywood) content including TV shows
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=IN&with_keywords=210024|210025|210026&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=IN&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Bollywood content:", error);
    return [];
  }
};

export const getKoreanContent = async (): Promise<Item[]> => {
  try {
    // Fetch Korean content including TV shows
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=KR&with_keywords=210024|210025|210026&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=KR&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Korean content:", error);
    return [];
  }
};

export const getJapaneseContent = async (): Promise<Item[]> => {
  try {
    // Fetch Japanese content including TV shows
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=JP&with_keywords=210024|210025|210026&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=JP&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Japanese content:", error);
    return [];
  }
};

export const getChineseContent = async (): Promise<Item[]> => {
  try {
    // Fetch Chinese content including TV shows
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(
        `/discover/movie?with_origin_country=CN&with_keywords=210024|210025|210026&sort_by=popularity.desc&page=1`
      ),
      axios.get(
        `/discover/tv?with_origin_country=CN&sort_by=popularity.desc&page=1`
      )
    ]);
    
    const movieResults = movieResponse.data.results || [];
    const tvResults = tvResponse.data.results || [];
    
    const movies = movieResults.map((item: any) => ({ ...item, media_type: "movie" }));
    const tvs = tvResults.map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...movies, ...tvs];
  } catch (error) {
    console.error("Error fetching Chinese content:", error);
    return [];
  }
};

// Enhanced African TV content fetching with alternative methods
// Enhanced function to get more African TV content
export const getAfricanTVContent = async (): Promise<Item[]> => {
  try {
    // Enhanced: Use multiple strategies to get more African TV content
    // Strategy 1: Discover by country (multiple pages - expanded to 5 pages)
    const discoverPages = await Promise.all(
      [1, 2, 3, 4, 5].map((page) =>
        Promise.all([
          axios.get(`/discover/tv`, {
            params: {
              with_origin_country: "NG|KE|ZA|GH|TZ|UG|ET|RW|ZM|EG",
              sort_by: "popularity.desc",
              page,
            },
          }).catch(() => ({ data: { results: [] } })),
        ])
      )
    );

    const discoverResults = discoverPages
      .flatMap((pages) => pages.flatMap((res) => res.data.results || []))
      .filter((i: any) => i.poster_path && i.vote_count > 0) // Filter out low-quality entries
      .map((i: any) => ({ ...i, media_type: "tv" }))
      .filter((item, idx, self) => idx === self.findIndex((t) => t.id === item.id)); // Remove duplicates early

    // Strategy 2: Search with multiple terms - Enhanced with more specific shows
    const searchTerms = [
      // Kenyan TV shows - Specific titles
      "Citizen TV",
      "NTV Kenya", 
      "KTN Kenya",
      "Kenyan TV",
      "Kenyan drama",
      "Kenyan soap",
      "Kenyan comedy",
      "Papa Shirandula",
      "Machachari",
      "Inspekta Mwala",
      "The Real Househelps of Kawangware",
      "Mother-in-Law",
      "Sue na Jonnie",
      "Nairobi Diaries",
      "Tahidi High",
      "The Wives",
      // Nigerian TV shows - Specific titles
      "Nigerian TV",
      "Nollywood TV",
      "Nigerian drama",
      "Nigerian soap",
      "Tinsel",
      "Super Story",
      "Checkmate",
      "Fuji House of Commotion",
      "Nigerian Idol",
      "Big Brother Naija",
      "The Voice Nigeria",
      "Jenifa's Diary",
      "The Johnsons",
      "Hush",
      "Skinny Girl in Transit",
      "Anikulapo",
      "King of Boys",
      // South African TV shows - Specific titles
      "South African TV",
      "SABC",
      "eTV",
      "M-Net",
      "Generations",
      "Isidingo",
      "7de Laan",
      "Rhythm City",
      "Scandal",
      "The Queen",
      "Uzalo",
      "Muvhango",
      "Skeem Saam",
      "Imbewu",
      "The River",
      "House of Zwide",
      // Pan-African platforms and brands
      "Showmax",
      "Showmax Original",
      "MTV Africa",
      "MTV Shuga",
      "Viusasa",
      "Blood & Water",
      "Queen Sono",
      "How to Ruin Christmas",
      "The Girl from St. Agnes",
      // Tanzanian TV shows
      "Tanzanian TV",
      "TBC",
      "ITV Tanzania",
      // Ugandan TV shows
      "Ugandan TV",
      "NTV Uganda",
      "UBC",
      // Ghanaian TV shows
      "Ghanaian TV",
      "GTV",
      "TV3 Ghana",
      // Ethiopian TV shows
      "Ethiopian TV",
      "ETV",
      // Rwandan TV shows
      "Rwandan TV",
      "RTV",
      // Zambian TV shows
      "Zambian TV",
      "ZNBC",
      // General African content
      "African TV series",
      "African drama",
      "African soap opera",
      "African comedy",
      "African reality show",
      "African news",
      "African documentary"
    ];
    
    // Search with multiple pages for better results
    const searchPromises = searchTerms.flatMap(term => 
      [1, 2].map(page => 
        axios.get(`/search/tv?query=${encodeURIComponent(term)}&page=${page}`)
          .catch(() => ({ data: { results: [] } }))
      )
    );
    
    const searchResults = await Promise.all(searchPromises);

    const africanCountrySet = new Set(["NG","KE","TZ","UG","ET","RW","ZM","GH","ZA","EG"]);
    // Combine all results and filter for African content by origin country
    const allResults = searchResults.flatMap(response => response.data.results || []);

    const filtered = allResults
      .filter((item: any) => {
        // Check if it's from an African country OR has African-related keywords in title/overview
        const isAfricanCountry = Array.isArray(item.origin_country) && 
          item.origin_country.some((c: string) => africanCountrySet.has(c));
        const title = (item.name || item.title || "").toLowerCase();
        const overview = (item.overview || "").toLowerCase();
        const hasAfricanKeywords = [
          "nigerian", "nollywood", "kenyan", "south african", "ghanaian",
          "tanzanian", "ugandan", "ethiopian", "rwandan", "zambian",
          "african", "lagos", "nairobi", "johannesburg", "accra", "dar es salaam"
        ].some(keyword => title.includes(keyword) || overview.includes(keyword));
        
        return (isAfricanCountry || hasAfricanKeywords) && item.poster_path && item.vote_count > 0;
      });

    // Remove duplicates and ensure media_type is set
    const uniqueResults = filtered
      .filter((item: any, index: number, self: any[]) => index === self.findIndex((t: any) => t.id === item.id))
      .map((item: any) => ({ ...item, media_type: "tv" }));

    // Additionally pull platform-branded titles (Showmax/MTV/Viusasa) via search + network/company
    const [platformNetworks, platformCompanies] = await Promise.all([
      searchIds("network", ["Showmax", "MTV Africa"]),
      searchIds("company", ["Viusasa"]),
    ]);
    const [platformTV, platformMovies] = await Promise.all([
      platformNetworks.length
        ? axios.get(`/discover/tv`, { params: { with_networks: platformNetworks.join("|"), page: 1 } })
        : Promise.resolve({ data: { results: [] } } as any),
      platformCompanies.length
        ? axios.get(`/discover/movie`, { params: { with_companies: platformCompanies.join("|"), page: 1 } })
        : Promise.resolve({ data: { results: [] } } as any),
    ]);
    const platformItems = [
      ...(platformTV.data.results || []).map((i: any) => ({ ...i, media_type: "tv" })),
      ...(platformMovies.data.results || []).map((i: any) => ({ ...i, media_type: "movie" })),
    ].filter((i: any) => i.poster_path);

    // Strategy 3: Also get from discover with genre filters (Drama, Comedy, etc.) - multiple pages
    const genrePages = await Promise.all(
      [18, 35, 10751, 80, 99].map(genreId => // Drama, Comedy, Family, Crime, Documentary
        Promise.all(
          [1, 2].map(page =>
            axios.get(`/discover/tv`, {
              params: {
                with_genres: genreId,
                with_origin_country: "NG|KE|ZA|GH|TZ|UG|ET|RW|ZM|EG",
                sort_by: "popularity.desc",
                page,
              },
            }).catch(() => ({ data: { results: [] } }))
          )
        )
      )
    );
    
    const genreResults = genrePages
      .flatMap((pages: any) => {
        if (Array.isArray(pages)) {
          return pages.flatMap((res: any) => {
            // Handle both direct responses and wrapped responses
            const data = res.data || res;
            return data?.results || [];
          });
        }
        return [];
      })
      .filter((i: any) => i.poster_path && (i.vote_count || 0) > 0)
      .map((i: any) => ({ ...i, media_type: "tv" }));

    const merged = [...uniqueResults, ...platformItems, ...genreResults, ...discoverResults];
    // Final deduplication and sort by popularity
    const final = merged
      .filter((item, idx, self) => idx === self.findIndex((t) => t.id === item.id))
      .filter((item: any) => item.poster_path) // Ensure all have posters
      .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 100); // Increased limit to get more diverse content
    
    return final;
  } catch (error) {
    console.error("Error fetching African TV content:", error);
    return [];
  }
};

// Enhanced Nollywood content with better search terms
export const getEnhancedNollywoodContent = async (): Promise<Item[]> => {
  try {
    const searchTerms = [
      "Nollywood",
      "Nigerian movie",
      "Nigerian film",
      "Nigerian cinema",
      "Nigerian drama",
      "Nigerian comedy",
      "Nigerian action",
      "Nigerian romance",
      "Nigerian thriller",
      "Nigerian horror",
      "Nigerian family",
      "Nigerian documentary",
      "Lagos movie",
      "Abuja movie",
      "Nigerian TV series",
      "Nigerian soap opera",
      "Nigerian reality show",
      "Nigerian news",
      "Nigerian entertainment"
    ];
    
    const [moviePromises, tvPromises] = await Promise.all([
      searchTerms.map(term => 
        axios.get(`/search/movie?query=${encodeURIComponent(term)}&page=1`)
      ),
      searchTerms.map(term => 
        axios.get(`/search/tv?query=${encodeURIComponent(term)}&page=1`)
      )
    ]);
    
    const movieResults = await Promise.all(moviePromises);
    const tvResults = await Promise.all(tvPromises);
    
    const allMovieResults = movieResults.flatMap(response => 
      response.data.results || []
    );
    const allTVResults = tvResults.flatMap(response => 
      response.data.results || []
    );
    
    // Remove duplicates and set media_type
    const uniqueMovieResults = allMovieResults
      .filter((item: any, index: number, self: any[]) => 
        index === self.findIndex((t: any) => t.id === item.id)
      )
      .map((item: any) => ({ ...item, media_type: "movie" }));
    
    const uniqueTVResults = allTVResults
      .filter((item: any, index: number, self: any[]) => 
        index === self.findIndex((t: any) => t.id === item.id)
      )
      .map((item: any) => ({ ...item, media_type: "tv" }));
    
    return [...uniqueMovieResults, ...uniqueTVResults];
  } catch (error) {
    console.error("Error fetching enhanced Nollywood content:", error);
    return [];
  }
};

// Enhanced Kenyan content with specific channel shows
export const getEnhancedKenyanContent = async (): Promise<Item[]> => {
  try {
    const curatedTvTitles = [
      "Maria",
      "Zora",
      "Sultana",
      "Selina",
      "Kina",
      "Njoro wa Uba",
      "Inspekta Mwala",
      "Tahidi High",
      "Papa Shirandula",
      "Machachari",
      "Mother-in-Law",
      "Varshita",
      "The Real Househelps of Kawangware",
      "Hulla Baloo Estate",
      "Crime and Justice",
      "Pepeta",
      "Single Kiasi",
      "Country Queen"
    ];

    const curatedMovieTitles = [
      "Rafiki",
      "Nairobi Half Life",
      "Kati Kati",
      "Supa Modo",
      "Disconnect",
      "Plan B",
      "18 Hours",
      "Poacher",
      "You Again"
    ];

    const discoverKeMovie = axios.get(`/discover/movie`, {
      params: { with_origin_country: "KE", sort_by: "popularity.desc", page: 1 },
    });
    const discoverKeTv = axios.get(`/discover/tv`, {
      params: { with_origin_country: "KE", sort_by: "popularity.desc", page: 1 },
    });

    const tvSearchPromises = curatedTvTitles.map((t) =>
      axios.get(`/search/tv?query=${encodeURIComponent(t)}&page=1`)
    );
    const movieSearchPromises = curatedMovieTitles.map((t) =>
      axios.get(`/search/movie?query=${encodeURIComponent(t)}&page=1`)
    );

    const [discMovieRes, discTvRes, tvSearchResList, movieSearchResList] = await Promise.all([
      discoverKeMovie,
      discoverKeTv,
      Promise.all(tvSearchPromises),
      Promise.all(movieSearchPromises),
    ]);

    const discMovies = (discMovieRes.data.results || []).map((i: any) => ({ ...i, media_type: "movie" }));
    const discTvs = (discTvRes.data.results || []).map((i: any) => ({ ...i, media_type: "tv" }));

    const tvCuratedSet = new Set(curatedTvTitles.map((t) => t.toLowerCase()));
    const movieCuratedSet = new Set(curatedMovieTitles.map((t) => t.toLowerCase()));

    const searchedTvs = tvSearchResList
      .flatMap((res) => res.data.results || [])
      .filter((item: any) => {
        const isKenyan = Array.isArray(item.origin_country) && item.origin_country.includes("KE");
        const matchesCurated = tvCuratedSet.has((item.name || "").toLowerCase());
        return isKenyan || matchesCurated;
      })
      .map((i: any) => ({ ...i, media_type: "tv" }));

    const searchedMovies = movieSearchResList
      .flatMap((res) => res.data.results || [])
      .filter((item: any) => {
        const matchesCurated = movieCuratedSet.has((item.title || item.original_title || "").toLowerCase());
        return matchesCurated;
      })
      .map((i: any) => ({ ...i, media_type: "movie" }));

    const combined = [...discMovies, ...discTvs, ...searchedTvs, ...searchedMovies];
    const unique = combined.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

    return unique;
  } catch (error) {
    console.error("Error fetching enhanced Kenyan content:", error);
    return [];
  }
};
