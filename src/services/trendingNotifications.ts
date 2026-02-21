import { pushNotificationService } from "./pushNotifications";
import { safeStorage } from "../utils/safeStorage";
import axios from "axios";

const TMDB_API_KEY = process.env.REACT_APP_API_KEY; // TMDB uses REACT_APP_API_KEY based on service files
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const trendingNotificationService = {
    checkAndNotifyTrending: async () => {
        try {
            // 1. Check if user has enabled notifications
            const settings = safeStorage.get("notification_settings");
            if (settings) {
                const parsed = JSON.parse(settings);
                if (parsed.trending === false) return; // User opted out
            }

            // 2. Fetch trending content
            const url = `${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`;
            const response = await axios.get(url);
            const topItem = response.data.results[0];

            if (!topItem) return;

            // 3. Compare with last notified item
            const lastNotifiedId = safeStorage.get("last_notified_trending_id");
            if (lastNotifiedId === String(topItem.id)) return; // Already notified

            // 4. Trigger notification
            const title = topItem.title || topItem.name;
            const type = topItem.media_type === "movie" ? "Movie" : "TV Show";

            await pushNotificationService.scheduleLocalNotification(
                `🔥 Trending Now: ${title}`,
                `A new ${type} is trending! Watch ${title} now on StreamLux.`,
                { id: topItem.id, media_type: topItem.media_type }
            );

            // 5. Update storage
            safeStorage.set("last_notified_trending_id", String(topItem.id));
            console.log(`[TrendingNotification] Notified user about: ${title}`);

        } catch (error) {
            console.warn("[TrendingNotification] Failed to check trending:", error);
        }
    }
};
