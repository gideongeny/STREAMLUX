import { useState, useEffect, useCallback, useRef } from "react";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { liveTVService, ChannelFilters } from "../services/liveTVService";
import { TVChannel, ALL_TV_CHANNELS } from "../utils/tvChannelMap";

export const useLiveChannels = (filters: ChannelFilters, pageSize: number = 24) => {
  const cached = liveTVService.getCachedChannels();
  // Start with ALL_TV_CHANNELS (local) as a bare minimum so something is ALWAYS there
  const initialChannels = cached 
    ? liveTVService.filterAndSortChannels(cached, filters).slice(0, pageSize) 
    : liveTVService.filterAndSortChannels(ALL_TV_CHANNELS, filters).slice(0, pageSize);
  
  const [channels, setChannels] = useState<TVChannel[]>(initialChannels);
  // We only show a loading spinner if we have absolutely nothing (shouldn't happen with ALL_TV_CHANNELS)
  const [loading, setLoading] = useState(cached === null && initialChannels.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(cached ? cached.length > pageSize : true);
  const [error, setError] = useState<string | null>(null);
  const [isInstant, setIsInstant] = useState(cached !== null);
  
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const fetchInitialChannels = useCallback(async () => {
    if (channels.length === 0) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const result = await liveTVService.fetchChannels(filters, pageSize);
      setChannels(result.channels);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
      setIsInstant(!!result.isInstant);
    } catch (err) {
      setError("Failed to fetch channels");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, pageSize, channels.length]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDocRef.current) return;

    setLoadingMore(true);
    try {
      const result = await liveTVService.fetchChannels(filters, pageSize, lastDocRef.current);
      setChannels(prev => [...prev, ...result.channels]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Error loading more channels:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [filters, pageSize, loadingMore, hasMore]);

  useEffect(() => {
    fetchInitialChannels();
  }, [fetchInitialChannels]);

  return {
    channels,
    loading,
    isRefreshing,
    loadingMore,
    hasMore,
    error,
    isInstant,
    loadMore
  };
};
