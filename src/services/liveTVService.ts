import { 
  collection, 
  query, 
  where, 
  limit, 
  startAfter, 
  getDocs, 
  getDoc,
  doc,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import axios from "axios";
import { db } from "../shared/firebase";
import { TVChannel, ALL_TV_CHANNELS, sortChannelsKenyaFirst } from "../utils/tvChannelMap";

const CHANNELS_COLLECTION = "live_channels";

export interface ChannelFilters {
  category?: string;
  country?: string;
  searchQuery?: string;
}

export interface FetchChannelsResult {
  channels: TVChannel[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  isInstant?: boolean;
}

const INSTANT_CACHE_KEY = 'streamlux_instant_channels_v2';

// Memory cache with disk persistence for instant channels
let cachedInstantChannels: TVChannel[] | null = (() => {
  try {
    const stored = localStorage.getItem(INSTANT_CACHE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
})();

export const liveTVService = {
  /**
   * Fetches channels from iptv-org directly for instant availability and merges with local embedded channels.
   */
  getCachedChannels(): TVChannel[] | null {
    return cachedInstantChannels;
  },

  filterAndSortChannels(channels: TVChannel[], filters: ChannelFilters): TVChannel[] {
    let result = [...channels];
    if (filters.category && filters.category !== 'All') {
      result = result.filter(c => c.category === filters.category);
    }
    if (filters.country && filters.country !== 'All') {
      result = result.filter(c => c.country === filters.country || c.countryCode === filters.country);
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    return sortChannelsKenyaFirst(result);
  },

  async fetchInstantChannels(): Promise<TVChannel[]> {
    if (cachedInstantChannels) return cachedInstantChannels;

    try {
      const [channelsRes, streamsRes] = await Promise.all([
        axios.get("https://iptv-org.github.io/api/channels.json"),
        axios.get("https://iptv-org.github.io/api/streams.json")
      ]);

      const streamsMap = new Map();
      streamsRes.data.forEach((s: any) => {
        if (!streamsMap.has(s.channel)) streamsMap.set(s.channel, s.url);
      });

      const mapped = channelsRes.data
        .filter((c: any) => streamsMap.has(c.id))
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          url: streamsMap.get(c.id),
          category: c.categories?.[0] || "General",
          country: c.countries?.[0]?.name || "Global",
          countryCode: c.countries?.[0]?.code || "GL",
          logo: c.logo || "",
          type: "hls",
          isExternal: true
        }));

      // Combine with local embedded channels
      const allCombined = [...ALL_TV_CHANNELS, ...mapped];
      cachedInstantChannels = allCombined;
      
      // Persist to disk for true instant feel on next visit
      try {
        localStorage.setItem(INSTANT_CACHE_KEY, JSON.stringify(allCombined));
      } catch { /* ignore */ }
      
      return allCombined;
    } catch (err) {
      console.error("Failed to fetch instant channels:", err);
      // Fallback to local embedded channels if API fails
      cachedInstantChannels = ALL_TV_CHANNELS;
      return ALL_TV_CHANNELS;
    }
  },

  /**
   * Fetches a single channel by ID from Firestore or Instant Cache
   */
  async getChannelById(channelId: string): Promise<TVChannel | null> {
    try {
      const docRef = doc(db, CHANNELS_COLLECTION, channelId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as TVChannel;
      }
      
      // Fallback check in instant channels
      const instant = await this.fetchInstantChannels();
      const instantChannel = instant.find(c => c.id === channelId);
      if (instantChannel) return instantChannel;

      return null;
    } catch (err) {
      console.error("Error fetching channel by ID:", err);
      return null;
    }
  },

  /**
   * Fetches channels from Firestore with pagination and filtering, augmenting with Instant Channels.
   */
  async fetchChannels(
    filters: ChannelFilters = {},
    pageSize: number = 32,
    lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<FetchChannelsResult> {
    try {
      // Always check for instant channels to augment or fallback
      const instant = await this.fetchInstantChannels();

      // If search query is present, use specialized search logic
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        const queryTerm = filters.searchQuery.toLowerCase();
        
        // Search in Firestore first
        const firestoreChannels = await this.searchChannels(filters.searchQuery, pageSize, lastVisible);
        
        // Search in Instant cache
        const instantFiltered = instant.filter(c => 
          c.name.toLowerCase().includes(queryTerm) || 
          c.category.toLowerCase().includes(queryTerm)
        ).slice(0, pageSize);

        // Merge and deduplicate
        const merged = [...firestoreChannels];
        const seenIds = new Set(merged.map(c => c.id));
        instantFiltered.forEach(c => {
          if (!seenIds.has(c.id)) merged.push(c);
        });

        return {
          channels: merged.slice(0, pageSize),
          lastDoc: null,
          hasMore: merged.length >= pageSize
        };
      }

      let q = query(collection(db, CHANNELS_COLLECTION), orderBy("name"));

      if (filters.category && filters.category !== 'All') {
        q = query(q, where("category", "==", filters.category));
      }

      if (filters.country && filters.country !== 'All') {
        q = query(q, where("country", "==", filters.country));
      }

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      q = query(q, limit(pageSize));

      const snapshot = await getDocs(q);
      
      const channels = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TVChannel[];

      // If Firestore results are low, fill with instant channels
      if (channels.length < pageSize) {
        const seenIds = new Set(channels.map(c => c.id));
        const fill = instant
            .filter(c => !seenIds.has(c.id))
            .filter(c => (filters.category === 'All' || !filters.category) ? true : c.category === filters.category)
            .filter(c => (filters.country === 'All' || !filters.country) ? true : c.country === filters.country)
            .slice(0, pageSize - channels.length);
        channels.push(...fill);
      }

      return {
        channels,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === pageSize || channels.length >= pageSize
      };
    } catch (error) {
      console.error("Error fetching channels from Firestore:", error);
      // Fallback on error if initial load
      if (!lastVisible) {
        const instant = await this.fetchInstantChannels();
        return { channels: instant, lastDoc: null, hasMore: false, isInstant: true };
      }
      return { channels: [], lastDoc: null, hasMore: false };
    }
  },

  async searchChannels(
    searchTerm: string, 
    maxResults: number = 50,
    lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<TVChannel[]> {
    if (!searchTerm) return [];
    
    try {
      let q = query(
        collection(db, CHANNELS_COLLECTION),
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff"),
        orderBy("name")
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      q = query(q, limit(maxResults));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TVChannel[];
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  },

  /**
   * Subscribes to channel updates (simulated for now by polling)
   */
  subscribeToLiveChannels(
    callback: (channels: TVChannel[]) => void,
    filters: ChannelFilters = {},
    interval: number = 60000
  ): () => void {
    let isActive = true;

    const fetchAndUpdate = async () => {
      if (!isActive) return;
      const result = await this.fetchChannels(filters, 20);
      if (isActive) callback(result.channels);
    };

    fetchAndUpdate();
    const intervalId = setInterval(fetchAndUpdate, interval);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }
};
