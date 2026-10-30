const CACHE_NAME = 'sigi-pwa-v3';
const STATIC_ASSETS = [
  '/reportero/index.html',
  '/reportero/reportero.css',
  '/reportero/reportero.js',
  '/js/pwa-offline.js',
  '/js/session-timer.js',
  '/js/sigi-ml-assistant.js',
  '/js/sigi-realtime.js',
  '/manifest.json',
  '/assets/img/logo_sigi.png',
  '/assets/img/logo.png',
  '/uploads/incidentes/placeholder.svg'
];

// Instalación del Service Worker: cachear shell de la aplicación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SIGI Service Worker: Cacheando shell de la aplicación...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Advertencia en precaché de recursos:', err);
      });
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
  // El Cache Storage API SOLO soporta solicitudes GET
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // No interceptar peticiones dinámicas del backend, autenticación, API o WebSockets
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/socket.io') ||
    url.pathname.startsWith('/buscarBarrioPorCoordenada') ||
    url.pathname.startsWith('/usuario') ||
    url.pathname.startsWith('/logout')
  ) {
    return;
  }

  // Tampoco cachear esquemas no soportados (ej. chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Guardar copia fresca en caché solo para respuestas exitosas GET
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === 'basic' || networkResponse.type === 'cors')
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // En caso de estar sin internet, responder desde la caché
        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback al index de reportero si es navegación
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/reportero/index.html');
          if (fallback) return fallback;
        }

        // Fallback de imagen para evitar broken image
        if (event.request.destination === 'image') {
          const placeholder = await caches.match('/uploads/incidentes/placeholder.svg');
          if (placeholder) return placeholder;
        }

        // IMPORTANTE: Responder con un Response válido para no romper la promesa de FetchEvent
        return new Response('Recurso no disponible sin conexión', {
          status: 503,
          statusText: 'Service Unavailable (Offline)',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      })
  );
});
