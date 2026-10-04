// =========================================================================
// LESLYE'S REALM - IMPERIAL SERVICE WORKER
// Handles background 'push' events, system-level OS notifications,
// and notification click actions when browser is closed.
// =========================================================================

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming background push notifications (even when app/browser is closed)
self.addEventListener('push', (event) => {
  let data = {
    title: "🌿 Imperial Decree from Sir Chif3n",
    body: "A new sacred message has arrived in your Secret Vault.",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: "imperial-love-scroll",
    url: "/"
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (err) {
      data.body = event.data.text() || data.body;
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon || "/pwa-192x192.png",
    badge: data.badge || "/pwa-192x192.png",
    vibrate: [200, 100, 200, 100, 300],
    tag: data.tag || "imperial-love-scroll",
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || "/",
      timestamp: Date.now()
    },
    actions: [
      { action: "open_vault", title: "💌 Open Vault" },
      { action: "dismiss", title: "Dismiss" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Handle notification tap / click by user
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and tell it to open the vault
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({ type: 'OPEN_SECRET_VAULT' });
          return client.focus();
        }
      }
      // If no window is currently open (browser was closed), open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Support direct message dispatch from the client to show background notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const finalOptions = {
      body: options?.body || "A new update has arrived.",
      icon: options?.icon || "/pwa-192x192.png",
      badge: options?.badge || "/pwa-192x192.png",
      vibrate: options?.vibrate || [200, 100, 200],
      tag: options?.tag || "imperial-love-scroll",
      renotify: true,
      requireInteraction: true,
      data: {
        url: "/",
        timestamp: Date.now(),
        ...(options?.data || {})
      },
      actions: [
        { action: "open_vault", title: "💌 Open Vault" },
        { action: "dismiss", title: "Dismiss" }
      ]
    };

    self.registration.showNotification(title || "🌿 Leslye's Realm", finalOptions);
  }
});
