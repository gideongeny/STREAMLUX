import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

export const persistentNotificationService = {
  /**
   * Shows the permanent, non-swipable "Elite Command Center" notification.
   */
  showCommandCenter: async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // 1. Define the Elite Center ID (static)
      const ELITE_CENTER_ID = 999999;

      // 2. Schedule the persistent notification
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "StreamLux",
            body: "Premium Cinema Streaming",
            id: ELITE_CENTER_ID,
            ongoing: true, // Cannot be swiped away
            autoCancel: false,
            smallIcon: "ic_stat_elite",
            largeIcon: "mipmap/ic_launcher", // The Logo presence
            iconColor: "#FF6B35",
            actionTypeId: "COMMAND_CENTER_ACTIONS",
            extra: { 
              type: "command_center",
              version: "3.1.0"
            }
          }
        ]
      });

      console.log("[PersistentCenter] Elite Command Center deployed. 🛰️💎");
    } catch (error) {
      console.error("[PersistentCenter] Deployment failed:", error);
    }
  }
};
