import axios from "../shared/axios";
import { pushNotificationService } from "./pushNotifications";
import { safeStorage } from "../utils/safeStorage";
import { notificationHub } from "./notificationHub";
import { getBackendBase } from "./download";

export const trendingNotificationService = {
    checkAndNotifyTrending: async () => {
        try {
            const settings = safeStorage.get("notification_settings");
            if (settings) {
                const parsed = JSON.parse(settings);
                if (parsed.trending === false) return;
            }

            const response = await axios.get(`${getBackendBase()}/api/proxy/tmdb`, {
                params: {
                    endpoint: `/trending/all/day`,
                }
            });
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
            const imageUrl = topItem.poster_path ? `https://image.tmdb.org/t/p/w500${topItem.poster_path}` : undefined;
            
            await pushNotificationService.scheduleLocalNotification(
                `🔥 Trending Now: ${title}`,
                `Everyone is talking about ${title}. Start watching the buzz on StreamLux!`,
                { 
                    id: topItem.id, 
                    media_type: topItem.media_type,
                    imageUrl: imageUrl
                }
            );

            safeStorage.set("last_notified_trending_id", String(topItem.id));
            console.log(`[TrendingNotification] Dispatched alerts for: ${title}`);

        } catch (error) {
            console.warn("[TrendingNotification] Failed to check trending:", error);
        }
    }
};
