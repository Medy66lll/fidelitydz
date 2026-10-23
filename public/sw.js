self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Nouvelle Offre', {
        body: data.body || '',
        icon: data.icon || '/api/icon',
        badge: data.icon || '/api/icon',
        vibrate: [200, 100, 200, 100, 200],
        tag: data.tag || 'offer-' + Date.now(),
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) return windowClients[0].focus();
      return clients.openWindow('/');
    })
  );
});
