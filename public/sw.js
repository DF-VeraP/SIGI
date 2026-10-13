const CACHE_NAME = 'sigi-pwa-v1';
const STATIC_ASSETS = [
  '/reportero/index.html',
  '/reportero/reportero.css',
  '/reportero/reportero.js',
  '/js/pwa-offline.js',
  '/js/session-timer.js',
  '/manifest.json'
];

// Instalación del Service Worker: cachear shell de la aplicación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SIGI Service Worker: Cacheando shell de la aplicación...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación del Service Worker: limpiar cachés obsoletas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Estrategia de Fetch: Network-First con fallback a Caché para estáticos
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // No interceptar peticiones de la API para permitir que la app gestione la cola offline
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Guardar copia fresca en caché
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // En caso de estar sin internet, responder desde la caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback al index de reportero si es navegación
          if (event.request.mode === 'navigate') {
            return caches.match('/reportero/index.html');
          }
        });
      })
  );
});
