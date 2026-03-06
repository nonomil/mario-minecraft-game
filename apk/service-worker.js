// Versioned cache strategy - cache name bound to version.json
let CACHE_NAME = "mmwg-v1.19.11"; // fallback if version.json fails to load

const PRECACHE = [
  "./Game.html",
  "./src/styles.css",
  "./src/defaults.js",
  "./src/storage.js",
  "./words/vocabs/manifest.js",
  "./config/game.json",
  "./config/controls.json",
  "./config/levels.json",
  "./config/biomes.json",
  "./config/village.json"
];

// Load version from version.json and update cache name
async function initCacheName() {
  try {
    const response = await fetch('./version.json');
    const versionData = await response.json();
    CACHE_NAME = `mmwg-v${versionData.versionName || '1.19.11'}`;
    console.log('SW cache name:', CACHE_NAME);
  } catch (err) {
    console.warn('Failed to load version.json, using fallback cache name:', err);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    initCacheName()
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    initCacheName()
      .then(() => caches.keys())
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME && k.startsWith('mmwg-'))
            .map((k) => {
              console.log('Deleting old cache:', k);
              return caches.delete(k);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Network-first for API requests or external resources
  if (url.origin !== location.origin || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for local resources
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});
