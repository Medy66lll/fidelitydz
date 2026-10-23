self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon,
      badge: data.icon,
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
    if (windowClients.length > 0) {
      windowClients[0].focus();
    } else {
      clients.openWindow('/');
    }
  }));
});
