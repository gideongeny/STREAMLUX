import { pushNotificationService } from "./pushNotifications";
import { safeStorage } from "../utils/safeStorage";
import { notificationHub } from "./notificationHub";
import axios from "axios";

const TMDB_API_KEY = process.env.REACT_APP_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const trendingNotificationService = {
    checkAndNotifyTrending: async () => {
        try {
            const settings = safeStorage.get("notification_settings");
            if (settings) {
                const parsed = JSON.parse(settings);
                if (parsed.trending === false) return;
            }

            const url = `${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`;
            const response = await axios.get(url);
            const topItem = response.data.results[0];

            if (!topItem) return;

            const lastNotifiedId = safeStorage.get("last_notified_trending_id");
            if (lastNotifiedId === String(topItem.id)) return;

            const title = topItem.title || topItem.name;
            const type = topItem.media_type === "movie" ? "movie" : "tv";

            // 1. App-Internal Notification
            notificationHub.add({
                type: 'trending',
                title: `🔥 Trending: ${title}`,
                body: `Everyone is talking about ${title}. Start watching the buzz!`,
                link: `/${type}/${topItem.id}`
            });

            // 2. System-Level Notification (if native)
            await pushNotificationService.scheduleLocalNotification(
                `🔥 Trending Now: ${title}`,
                `A new ${type === 'movie' ? 'Movie' : 'TV Show'} is trending on StreamLux!`,
                { id: topItem.id, media_type: topItem.media_type }
            );

            safeStorage.set("last_notified_trending_id", String(topItem.id));
            console.log(`[TrendingNotification] Dispatched alerts for: ${title}`);

        } catch (error) {
            console.warn("[TrendingNotification] Failed to check trending:", error);
        }
    }
};
