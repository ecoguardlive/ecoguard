// ══════════════════════════════════════════════════════════════════
//  ECO GUARD TECHNOLOGIES — Service Worker
//  Enables offline support and PWA install
// ══════════════════════════════════════════════════════════════════

const CACHE_NAME = 'ecoguard-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/data.js',
  '/js/audio.js',
  '/js/render.js',
  '/js/events.js',
];

// Install: cache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
