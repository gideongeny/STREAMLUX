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
  rating: string = "0"
): TMDBCollectionQueryResult => {
  const [data, setData] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Map region names to country codes for TMDB fallback
        let targetCountries: string[] = [];
        if (region) {
          switch (region.toLowerCase()) {
            case "africa": targetCountries = ["NG", "KE", "ZA", "GH", "TZ", "UG"]; break;
            case "asia": targetCountries = ["KR", "JP", "CN", "IN", "PH", "TH"]; break;
            case "latin": targetCountries = ["MX", "BR", "AR", "CO"]; break;
            case "middleeast": targetCountries = ["TR", "EG", "SA", "AE"]; break;
            case "nollywood": targetCountries = ["NG"]; break;
            case "bollywood": targetCountries = ["IN"]; break;
            case "korea": targetCountries = ["KR"]; break;
            case "japan": targetCountries = ["JP"]; break;
            case "kenya": targetCountries = ["KE"]; break;
          }
        }

        const exploreConfig: any = {
          sort_by: sortBy,
          ...(genres.length > 0 && { with_genres: genres.join(",") }),
          "vote_average.gte": rating,
          region: region, // AUTHORITATIVE: Pass the clean region name
          ...(targetCountries.length > 0 && { with_origin_country: targetCountries.join("|") }),
        };

        // FETCH: Use authoritative explore service
        const exploreResult = mediaType === "movie"
          ? await getExploreMovie(1, exploreConfig)
          : await getExploreTV(1, exploreConfig);

        let results = Array.isArray(exploreResult?.results) ? exploreResult.results : [];

        // CLIENT-SIDE FILTERING: Only apply if NOT in a specialized regional tab
        // Specialized regional content (African, Nollywood, etc.) often has incomplete metadata.
        // We TRUST the service's decision to include these items.
        if (!region) {
          // Apply standard filters only for global discovery
          if (Number(rating) > 0) {
            results = results.filter(i => (i.vote_average || 0) >= Number(rating));
          }
          if (genres.length > 0) {
            results = results.filter(i => i.genre_ids && genres.some(g => i.genre_ids?.includes(g)));
          }
          if (runtime) {
            results = results.filter(i => {
              const r = (i as any).runtime || 0;
              if (runtime === "short") return r <= 90;
              if (runtime === "medium") return r >= 90 && r <= 150;
              if (runtime === "long") return r >= 150;
              return true;
            });
          }
        }

        // Final sanity checks
        let filteredResults: Item[] = results
          .filter((item) => Boolean(item.poster_path))
          .map(item => ({ ...item, media_type: mediaType } as Item))
          .slice(0, 100);

        // FALLBACK: If absolutely empty, show popular
        if (filteredResults.length === 0) {
          console.warn(`Query for ${region || 'global'} returned 0 results. Falling back to popular.`);
          const fallback = mediaType === "movie" ? await getExploreMovie(1, {}) : await getExploreTV(1, {});
          filteredResults = (fallback?.results || []).slice(0, 20);
        }

        setData(filteredResults);
      } catch (err) {
        console.error("Explore Retrieval Error:", err);
        setError("Failed to load content. Showing featured items instead.");
        // Try featured fallback
        const fallback = mediaType === "movie" ? await getExploreMovie(1, {}) : await getExploreTV(1, {});
        setData(fallback?.results?.slice(0, 20) || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mediaType, sortBy, genres, year, runtime, region, rating]);

  return { data, isLoading, error };
};

// Legacy hook kept for Firebase/Firestore compatibility if used elsewhere
export const useCollectionQuery = (id: any, collection: any) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!data);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection, (qs: any) => {
      setData(qs); setIsLoading(false); setIsError(false);
    }, (err: any) => {
      setIsError(true); setIsLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  return { isLoading, isError, data };
};
