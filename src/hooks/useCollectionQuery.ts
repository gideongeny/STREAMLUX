import { useState, useEffect } from "react";
import { Item } from "../shared/types";
import { getExploreMovie, getExploreTV } from "../services/explore";
import {
  CollectionReference,
  DocumentData,
  onSnapshot,
  Query,
  QuerySnapshot,
} from "firebase/firestore";

interface TMDBCollectionQueryParams {
  mediaType: "movie" | "tv";
  sortBy: string;
  genres: number[];
  year: string;
  runtime: string;
  region: string;
  voteAverageGte: string;
  withOriginalLanguage: string;
}

interface TMDBCollectionQueryResult {
  data: Item[];
  isLoading: boolean;
  error: string | null;
}

export const useTMDBCollectionQuery = (
  mediaType: "movie" | "tv",
  sortBy: string = "popularity.desc",
  genres: number[] = [],
  year: string = "",
  runtime: string = "",
  region: string = "",
  voteAverageGte: string = "0",
  withOriginalLanguage: string = ""
): TMDBCollectionQueryResult => {
  const [data, setData] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get target countries for region filter (for client-side filtering)
        let targetCountries: string[] = [];
        if (region) {
          switch (region) {
            case "africa": {
              targetCountries = ["NG", "KE", "TZ", "UG", "ET", "RW", "ZM", "GH", "ZA", "EG", "MA", "SN"];
              break;
            }
            case "asia": {
              targetCountries = ["KR", "JP", "CN", "IN", "TH", "VN", "ID", "PH", "TW", "HK", "MY", "SG"];
              break;
            }
            case "latin": {
              targetCountries = ["MX", "BR", "AR", "CO", "CL", "PE", "VE", "EC", "GT", "CU"];
              break;
            }
            case "middleeast": {
              targetCountries = ["TR", "EG", "SA", "AE", "IR", "LB", "QA", "KW", "JO"];
              break;
            }
            case "nollywood":
              targetCountries = ["NG"];
              break;
            case "bollywood":
              targetCountries = ["IN"];
              break;
            case "korea":
              targetCountries = ["KR"];
              break;
            case "japan":
              targetCountries = ["JP"];
              break;
            case "china":
              targetCountries = ["CN", "HK", "TW"];
              break;
            case "philippines":
              targetCountries = ["PH"];
              break;
            case "kenya":
              targetCountries = ["KE"];
              break;
          }
        }

        // Enhanced: Use explore service which fetches from multiple sources
        // This provides better content for regions outside NA/Europe/East Asia
        const exploreConfig: any = {
          sort_by: sortBy,
          ...(genres.length > 0 && { with_genres: genres.join(",") }),
          ...(region && targetCountries.length > 0 && {
            with_origin_country: targetCountries.join("|"),
            // Only pass 'region' param if it's a valid ISO-3166-1 2-letter code
            // Prevents API errors when passing "africa", "asia" etc.
            ...(region.length === 2 && { region: region })
          }),
          ...(voteAverageGte !== "0" && { "vote_average.gte": voteAverageGte }),
          ...(withOriginalLanguage && { with_original_language: withOriginalLanguage }),
          // CRITICAL: Skip external sources (FZMovies) for World Cinema to prevent network congestion
          // We only want TMDB data here to ensure fast loading and avoid 200+ pending requests
          skipExternalSources: true,
        };

        // Use enhanced explore functions that fetch from all sources
        const exploreResult = mediaType === "movie"
          ? await getExploreMovie(1, exploreConfig).catch(() => ({ results: [] }))
          : await getExploreTV(1, exploreConfig).catch(() => ({ results: [] }));

        let resultsPage1 = exploreResult.results || [];

        // ENHANCED FALLBACK: If regional search, also fetch Page 2 to ensure coverage
        if (region && resultsPage1.length < 40) {
          try {
            const page2Result = mediaType === "movie"
              ? await getExploreMovie(2, exploreConfig).catch(() => ({ results: [] }))
              : await getExploreTV(2, exploreConfig).catch(() => ({ results: [] }));
            if (page2Result.results) {
              resultsPage1 = [...resultsPage1, ...page2Result.results];
            }
          } catch (e) {
            console.warn("Regional Page 2 fetch failed", e);
          }
        }

        // Get results from explore (already includes multiple sources)
        let uniqueResults = resultsPage1;

        // Apply client-side filters (like MovieBox does)
        let filteredResults = uniqueResults;

        // Filter by genre (client-side)
        if (genres.length > 0) {
          filteredResults = filteredResults.filter((item) =>
            item.genre_ids && genres.some((genreId) => item.genre_ids?.includes(genreId))
          );
        }

        // Filter by year (client-side)
        if (year) {
          const currentYear = new Date().getFullYear();
          let startYear = 0;
          let endYear = currentYear;

          if (year === "2020s") {
            startYear = 2020;
            endYear = currentYear;
          } else if (year === "2010s") {
            startYear = 2010;
            endYear = 2019;
          } else if (year === "2000s") {
            startYear = 2000;
            endYear = 2009;
          } else if (year === "1990s") {
            startYear = 1990;
            endYear = 1999;
          }

          filteredResults = filteredResults.filter((item) => {
            const releaseDate = mediaType === "movie"
              ? item.release_date
              : item.first_air_date;
            if (!releaseDate) return false;
            const itemYear = Number.parseInt(releaseDate.split("-")[0], 10);
            return itemYear >= startYear && itemYear <= endYear;
          });
        }

        // Filter by runtime (client-side)
        if (runtime) {
          filteredResults = filteredResults.filter((item) => {
            const itemRuntime = (item as any).runtime || 0;
            if (runtime === "short") return itemRuntime <= 90;
            if (runtime === "medium") return itemRuntime >= 90 && itemRuntime <= 150;
            if (runtime === "long") return itemRuntime >= 150;
            return true;
          });
        }

        // Filter by region (client-side) - RELAXED
        // We already use 'with_origin_country' in the API call, so we trust the API results.
        // Strict client-side filtering often removes valid movies that lack the 'origin_country' field in list responses.
        if (targetCountries.length > 0) {
          // Optional: You could check item.original_language as a secondary heuristic if needed
          // But for now, we trust the API to return the correct region content.
        }

        // Sort results
        if (sortBy === "popularity.desc") {
          filteredResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        } else if (sortBy === "vote_average.desc") {
          filteredResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        } else if (sortBy === "release_date.desc") {
          filteredResults.sort((a, b) => {
            const dateA = mediaType === "movie" ? a.release_date : a.first_air_date;
            const dateB = mediaType === "movie" ? b.release_date : b.first_air_date;
            return (dateB || "").localeCompare(dateA || "");
          });
        }

        // Limit to reasonable number and ensure posters exist
        filteredResults = filteredResults
          .filter((item) => Boolean(item.poster_path))
          .slice(0, 100); // Limit to 100 items

        setData(filteredResults);
      } catch (err) {
        console.error("Error fetching collection data:", err);
        // Try fallback on error too
        try {
          const fallbackResult = mediaType === "movie"
            ? await getExploreMovie(1, {}).catch(() => ({ results: [] }))
            : await getExploreTV(1, {}).catch(() => ({ results: [] }));

          const fallbackItems = (fallbackResult.results || [])
            .filter((item: Item) => item.media_type === mediaType && Boolean(item.poster_path))
            .slice(0, 20);

          if (fallbackItems.length > 0) {
            setData(fallbackItems);
            setError(null); // Clear error if fallback succeeds
          } else {
            setError(err instanceof Error ? err.message : "Failed to fetch data");
            setData([]);
          }
        } catch (fallbackErr) {
          setError(err instanceof Error ? err.message : "Failed to fetch data");
          setData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mediaType, sortBy, genres, year, runtime, region]);

  return { data, isLoading, error };
};

// Keep the old Firebase hook for backward compatibility
export const useCollectionQuery: (
  id: number | string | undefined,
  collection: CollectionReference | Query<DocumentData>
) => {
  isLoading: boolean;
  isError: boolean;
  data: QuerySnapshot<DocumentData> | null;
} = (id, collection) => {
  const [data, setData] = useState<QuerySnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(!data);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection,
      (querySnapshot) => {
        setData(querySnapshot);
        setIsLoading(false);
        setIsError(false);
      },
      (error) => {
        console.log(error, 111);
        setData(null);
        setIsLoading(false);
        setIsError(true);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return { isLoading, isError, data };
};
