import axios from "../shared/axios";
import { pushNotificationService } from "./pushNotifications";
import { safeStorage } from "../utils/safeStorage";
import { getBackendBase } from "./download";
import { registerPlugin, Capacitor } from "@capacitor/core";

const EliteNotification = registerPlugin<any>("EliteNotification");

const ELITE_TEMPLATES = [
    { title: "🔥 Trending #1 Now", body: "Everyone is watching {title}. Don't miss the buzz!" },
    { title: "🚨 Just Added", body: "{title} is now streaming. Watch it first!" },
    { title: "🍿 Weekend Binge", body: "Need a plan? {title} is the perfect choice for tonight." },
    { title: "🌟 Top Choice", body: "Based on your interests, we recommend {title}." },
    { title: "🎬 Cinema Night", body: "Bring the theater home with {title} on StreamLux." },
    { title: "🔥 Popular Today", body: "Join thousands of fans watching {title} right now." },
    { title: "👀 Continuing Soon?", body: "The story of {title} is waiting for you. Dive back in!" },
    { title: "🧡 StreamLux Selection", body: "Our curators picked {title} as today's must-watch." },
];

export const trendingNotificationService = {
    /**
     * Schedules a "Flood" of 24 hourly notifications based on trending content.
     * Matches the frequency of MovieBox and Netflix.
     */
    checkAndNotifyTrending: async () => {
        try {
            const settingsStr = safeStorage.get("notification_settings");
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                if (settings.trending === false) return;
            }

            // 1. Fetch Top 20 Trending Items
            const response = await axios.get(`${getBackendBase()}/api/proxy/tmdb`, {
                params: { endpoint: `/trending/all/day` }
            });
            const results = response.data.results || [];
            if (results.length === 0) return;

            // 2. Clear previous queue to prevent double-scheduling
            await pushNotificationService.cancelAllLocalNotifications();

            // 3. Schedule 24 Hourly Notifications
            console.log(`[EliteNotifications] Scheduling 24-hour flood batch...`);

            for (let i = 0; i < 24; i++) {
                // Select an item (round-robin if results < 24)
                const item = results[i % results.length];
                const template = ELITE_TEMPLATES[i % ELITE_TEMPLATES.length];
                
                const title = item.title || item.name;
                const mediaType = item.media_type === "movie" ? "movie" : "tv";
                const imageUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined;

                const scheduledTime = new Date();
                scheduledTime.setHours(scheduledTime.getHours() + i + 1); // +1h, +2h, ... +24h

                await pushNotificationService.scheduleLocalNotification(
                    template.title,
                    template.body.replace("{title}", title),
                    {
                        id: item.id,
                        media_type: item.media_type,
                        imageUrl: imageUrl,
                        route: `/${mediaType}/${item.id}`
                    },
                    scheduledTime
                );
            }

            // 4. Trigger the Elite Native Grid (Show 10 Top Posters)
            if (Capacitor.isNativePlatform()) {
                const postersForGrid = results.slice(0, 10).map((item: any) => 
                    item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : ""
                );
                
                await EliteNotification.showGrid({ posters: postersForGrid });
                console.log(`[EliteNotifications] NATIVE GRID DEPLOYED. 🛰️🖼️`);
            }

            console.log(`[EliteNotifications] 24 HOURLY NOTIFICATIONS QUEUED. ✅🚀`);

        } catch (error) {
            console.warn("[TrendingNotification] Elite batch failed:", error);
        }
    }
};
