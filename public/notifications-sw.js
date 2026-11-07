// Event handlers loaded by the generated Workbox service worker.

// Notification Click Handler: Focus or open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const requested = new URL(event.notification.data?.url || '/', self.location.origin);
  const targetUrl = requested.origin === self.location.origin ? requested.href : self.location.origin;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const client = clientList.find(windowClient => new URL(windowClient.url).origin === self.location.origin);
      if (client) {
        return client.navigate(targetUrl).then(navigated => (navigated || client).focus());
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
