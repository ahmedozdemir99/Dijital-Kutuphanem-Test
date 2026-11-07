// Dijital Kütüphanem - Service Worker for Offline PWA & Background Notifications

const CACHE_NAME = 'dijital-kutuphanem-v6';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/icon.svg',
  '/manifest.webmanifest'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Precache partial fallback:', err);
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Notification Click Handler: Focus or open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Native Web Push Handler (Fires even when app & browser are closed, screen locked)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (parseErr) {
    try {
      data = { 
        title: '📖 Dijital Kütüphanem: Okuma Vakti', 
        body: event.data ? event.data.text() : 'Günün okuma ve tefekkür hedefini tamamlamaya davetlisiniz.' 
      };
    } catch {
      data = {};
    }
  }

  const title = data.title || '📖 Dijital Kütüphanem: Okuma Vakti';
  const options = {
    body: data.body || 'Bugünkü sayfa hedefinizi tamamlamak için harika bir vakit!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || `reading-reminder-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/?tab=today'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options).catch((err) => {
      console.warn('SW showNotification error:', err);
    })
  );
});

// Client Message Handler (Immediate & Scheduled System Notifications)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      renotify: true,
      tag: options?.tag || 'app-notification',
      ...options,
      data: {
        url: options?.url || '/?source=reminder'
      }
    };

    self.registration.showNotification(title || '📖 Dijital Kütüphanem', notificationOptions);
  }
});
