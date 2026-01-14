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
  region: string = ""
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
              targetCountries = ["NG", "KE", "TZ", "UG", "ET", "RW", "ZM", "GH", "ZA", "EG"];
              break;
            }
            case "asia": {
              targetCountries = ["KR", "JP", "CN", "IN"];
              break;
            }
            case "latin": {
              targetCountries = ["MX", "BR", "AR", "CO"];
              break;
            }
            case "middleeast": {
              targetCountries = ["TR", "EG", "SA", "AE"];
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
              targetCountries = ["CN"];
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
            region: region 
          }),
        };

        // Use enhanced explore functions that fetch from all sources
        const exploreResult = mediaType === "movie" 
          ? await getExploreMovie(1, exploreConfig).catch(() => ({ results: [] }))
          : await getExploreTV(1, exploreConfig).catch(() => ({ results: [] }));

        // Get results from explore (already includes multiple sources)
        let uniqueResults = exploreResult.results || [];

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

        // Filter by region (client-side) - STRICT FILTERING
        if (targetCountries.length > 0) {
          filteredResults = filteredResults.filter((item) => {
            const countries = item.origin_country || [];
            // Only include if at least one country matches
            return countries.some((c: string) => targetCountries.includes(c));
          });
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

        // Fallback: If no results after filtering, get popular content instead
        if (filteredResults.length === 0) {
          console.log("No results after filtering, falling back to popular content");
          try {
            const fallbackResult = mediaType === "movie" 
              ? await getExploreMovie(1, {}).catch(() => ({ results: [] }))
              : await getExploreTV(1, {}).catch(() => ({ results: [] }));
            
            const fallbackItems = (fallbackResult.results || [])
              .filter((item: Item) => item.media_type === mediaType && Boolean(item.poster_path))
              .slice(0, 20);
            
            if (fallbackItems.length > 0) {
              setData(fallbackItems);
              setIsLoading(false);
              return;
            }
          } catch (fallbackErr) {
            console.warn("Fallback to popular content failed:", fallbackErr);
          }
        }

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
