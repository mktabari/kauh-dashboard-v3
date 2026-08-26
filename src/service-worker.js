import { build, files, version } from "$service-worker";

// const CACHE_NAME = `cache-${version}`;
// const ASSETS = [...build, ...files];

// // Install service worker and cache assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  //   // Pre-cache all application assets
  //   async function addFilesToCache() {
  //     const cache = await caches.open(CACHE_NAME);
  //     await cache.addAll(ASSETS);
  //     self.skipWaiting();
  //   }
  //   event.waitUntil(addFilesToCache());
});

// // Activate service worker and clear old caches
// self.addEventListener("activate", (event) => {
//   // Clean up old caches from previous deployments
//   async function deleteOldCaches() {
//     for (const key of await caches.keys()) {
//       if (key !== CACHE_NAME) await caches.delete(key);
//     }
//   }
//   event.waitUntil(deleteOldCaches());
// });
// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches
//       .keys()
//       .then((keys) => {
//         return Promise.all(
//           keys.map((key) => {
//             if (key !== CACHE_NAME) return caches.delete(key);
//           }),
//         );
//       })
//       .then(() => {
//         self.clients.claim();
//       }),
//   );
// });

// Intercept fetch requests and serve from cache if offline
// self.addEventListener("fetch", (event) => {
//   // Ignore POST requests and external APIs
//   if (event.request.method !== "GET") return;

//   async function respond() {
//     const url = new URL(event.request.url);
//     const cache = await caches.open(CACHE_NAME);

//     // Serve cached assets instantly if available
//     if (ASSETS.includes(url.pathname)) {
//       const cachedResponse = await cache.match(url.pathname);
//       if (cachedResponse) return cachedResponse;
//     }

//     // Otherwise, try network, fall back to cache if offline
//     try {
//       const response = await fetch(event.request);
//       if (response.status === 200 && url.protocol.startsWith("http")) {
//         cache.put(event.request, response.clone());
//       }
//       return response;
//     } catch {
//       const cachedResponse = await cache.match(event.request);
//       if (cachedResponse) return cachedResponse;
//       return new Response("Offline content not available", { status: 408 });
//     }
//   }

//   event.respondWith(respond());
// });
// self.addEventListener("fetch", (event) => {
//   if (event.request.method !== "GET") return;

//   event.respondWith(
//     caches.match(event.request).then((cachedResponse) => {
//       if (cachedResponse) return cachedResponse;

//       return fetch(event.request).catch(() => {
//         // Fallback or offline behavior can go here
//         console.warn("Fetch failed; returning offline page instead.");
//       });
//     }),
//   );
// });

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || "You have a new update!",
    icon: data.icon || "/icon.png",
    badge: data.badge || "/badge.png",
    image: data.image || "/banner.jpg",
    data: { url: data.url || "/" },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Notification", options),
  );
});

// Handle notification click to open or focus the app window
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app window is open, focus it; otherwise, open a new window
        for (const client of clientList) {
          if (client.url === event.notification.data.url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      }),
  );
});
