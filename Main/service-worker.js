const CACHE_NAME = "sheetflow-shell-v10";
const APP_SHELL = [
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./js/core/core.js",
  "./js/core/utils.js",
  "./js/core/storage.js",
  "./js/sheet/csv-parser.js",
  "./js/sheet/sheet.js",
  "./js/sheet/grouping.js",
  "./js/features/table.js",
  "./js/features/ui.js",
  "./js/features/undo.js",
  "./js/features/export.js",
  "./js/tools/tools.js",
  "./js/sdk/core.js",
  "./js/sdk/events.js",
  "./js/sdk/data.js",
  "./js/sdk/modal.js",
  "./js/sdk/sidebar.js",
  "./js/sdk/topbar.js",
  "./js/sdk/shortcuts.js",
  "./js/sdk/init.js",
  "./js/actions.js",
  "./js/events.js",
  "./js/init.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }))
      .catch(() => caches.match("./index.html"))
  );
});
