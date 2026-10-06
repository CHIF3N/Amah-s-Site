// Service Worker for Leslye's Realm - Web Push Background Notifications
// Handles push notifications even when the browser tab is closed or in background.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for incoming Web Push events from the Demigod backend server
// This executes even when the browser tab or app is closed!
self.addEventListener('push', (event) => {
  let data = {
    title: "💌 New Love Scroll",
    body: "You have received a new decree in Leslye's Realm!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: { url: "/?openVault=true" },
    tag: "love-scroll-push"
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      const text = event.data.text();
      if (text) data.body = text;
    }
  }

  const tagId = data.tag || `scroll-${Date.now()}`;
  const notificationOptions = {
    body: data.body,
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    tag: tagId,
    renotify: true,
    requireInteraction: false,
    data: data.data || { url: "/?openVault=true" },
    actions: [
      { action: "open", title: "Open Vault 💌" },
      { action: "dismiss", title: "Dismiss" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions).catch((err) => {
      // Fallback for browsers/platforms that do not support actions
      console.warn('[SW Push] Fallback notification without actions:', err);
      return self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/favicon.ico",
        tag: tagId
      });
    })
  );
});

// Handle notification click: focus app or open vault when user taps notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/?openVault=true';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and tell it to open the vault
      for (const client of windowClients) {
        if ('focus' in client) {
          client.postMessage({ type: 'OPEN_VAULT' });
          return client.focus();
        }
      }
      // If no window is open (app was closed), launch the browser window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Allow client scripts to request notifications directly through the Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, options).catch((err) => {
        console.warn('[SW message notification error]:', err);
      })
    );
  }
});
