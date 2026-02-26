const CACHE_NAME = "mmwg-apk-v1";
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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
