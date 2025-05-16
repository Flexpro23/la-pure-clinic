// This is a simple service worker that will be auto-registered by next-pwa
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('la-pure-clinic').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/images/icon-192x192.png',
        '/images/icon-512x512.png',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); 