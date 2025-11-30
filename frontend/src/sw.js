// Credchit Service Worker - Offline-first with Background Sync
const CACHE_NAME = 'credchit-v1';
const SYNC_TAG = 'credchit-sync';
const API_CACHE = 'credchit-api-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets - cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});

// Handle API requests - network-first with offline queue for mutations
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // For GET requests, try network first, fall back to cache
  if (request.method === 'GET') {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // For mutations (POST, PUT, PATCH), try network, queue if offline
  try {
    return await fetch(request);
  } catch (error) {
    // Queue the request for later sync
    await queueRequest(request);
    return new Response(JSON.stringify({ 
      queued: true, 
      message: 'Request queued for sync when online' 
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Queue requests for background sync
async function queueRequest(request) {
  const db = await openDB();
  const tx = db.transaction('pending-requests', 'readwrite');
  const store = tx.objectStore('pending-requests');
  
  const body = await request.clone().text();
  await store.add({
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers),
    body,
    timestamp: Date.now()
  });

  // Register for background sync
  if ('sync' in self.registration) {
    await self.registration.sync.register(SYNC_TAG);
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncPendingRequests());
  }
});

// Process queued requests
async function syncPendingRequests() {
  const db = await openDB();
  const tx = db.transaction('pending-requests', 'readonly');
  const store = tx.objectStore('pending-requests');
  const requests = await store.getAll();

  for (const req of requests) {
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body
      });

      if (response.ok) {
        // Remove from queue
        const deleteTx = db.transaction('pending-requests', 'readwrite');
        await deleteTx.objectStore('pending-requests').delete(req.id);
        
        // Notify clients
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SYNC_COMPLETE', request: req });
          });
        });
      }
    } catch (error) {
      console.log('[SW] Sync failed, will retry:', req.url);
    }
  }
}

// IndexedDB helper for offline queue
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('credchit-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-requests')) {
        db.createObjectStore('pending-requests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'GET_PENDING_COUNT') {
    openDB().then((db) => {
      const tx = db.transaction('pending-requests', 'readonly');
      const store = tx.objectStore('pending-requests');
      store.count().onsuccess = (e) => {
        event.source.postMessage({ type: 'PENDING_COUNT', count: e.target.result });
      };
    });
  }
});

// Push notification support (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from Credchit',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Credchit', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});

