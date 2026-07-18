import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../shared/firebase";
import { YouTubeVideo } from "./youtube";

const CACHE_COLLECTION = "youtubeCache";
const CACHE_TTL_HOURS = 24;

export interface CachedYouTubeData {
    videos: YouTubeVideo[];
    timestamp: Timestamp;
    nextPageToken?: string;
}

export const getCachedYouTubeResults = async (query: string): Promise<CachedYouTubeData | null> => {
    try {
        const queryHash = generateHash(query.toLowerCase());
        const cacheRef = doc(db, CACHE_COLLECTION, queryHash);
        const cacheSnap = await getDoc(cacheRef);

        if (cacheSnap.exists()) {
            const data = cacheSnap.data() as CachedYouTubeData;
            
            // Check if cache is expired
            const now = Timestamp.now().toMillis();
            const cacheTime = data.timestamp.toMillis();
            const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);

            if (hoursDiff < CACHE_TTL_HOURS) {
                // Cache is still valid
                return data;
            }
        }
        return null;
    } catch (error) {
        console.warn("Failed to read YouTube cache:", error);
        return null;
    }
};

export const setCachedYouTubeResults = async (query: string, videos: YouTubeVideo[], nextPageToken?: string): Promise<void> => {
    try {
        const queryHash = generateHash(query.toLowerCase());
        const cacheRef = doc(db, CACHE_COLLECTION, queryHash);
        
        await setDoc(cacheRef, {
            videos,
            nextPageToken,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.warn("Failed to write YouTube cache:", error);
    }
};

// Extremely simple hashing just to generate valid Firestore Document IDs from search queries
function generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Encode to base64-like string to avoid invalid characters in doc ID
    return Math.abs(hash).toString(36);
}
