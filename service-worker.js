const CACHE_NAME = 'lions-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './LZB1.png',
  './LZB1-preview.png',
  './LZB2.png',
  './LZB2-preview.png',
  './LZB3.png',
  './LZB3-preview.png',
  './LZB4.png',
  './LZB4-preview.png',
  './Icons/icon-192.png',
  './Icons/icon-512.png',
  './Images/bg.jpg',
  './Sounds/Lion-Roar.wav'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response ||
      fetch(event.request).catch(() => {
        // You could return a fallback image or page here if needed
        return caches.match('./index.html');
      })
    )
  );
});
