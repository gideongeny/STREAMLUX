// StreamLux Service Worker
//
// This file intentionally prevents third-party service workers from taking over
// the app and blocking the initial React bootstrap.
//
// We immediately unregister on activation and do not intercept fetches.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.registration.unregister();
      } finally {
        // Ensure any controlled clients can reload without SW influence.
        const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of clientsList) {
          client.navigate(client.url);
        }
      }
    })()
  );
});
