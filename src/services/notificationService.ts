// Client-Side Web Push & Service Worker Notification Service
// Provides reliable system notifications even when the app/tab is closed or in background.

import { savePushSubscriptionToCloud } from './firebase';

const FALLBACK_VAPID_PUBLIC_KEY = 'BDKFr-e8i0mSl7h7HjRct4ZW9JU7ZsqVD1YW4LOlHrE_vJ9xcyZspkGAFiK9iZvAjsUbgxb7pSID1BaO_7Hg4tg';

/**
 * Convert standard base64 URL VAPID key to Uint8Array for PushManager
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks whether Notification and Service Worker APIs are supported
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Register Service Worker for background push event handling
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    console.log('[NotificationService] ServiceWorker registered with scope:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[NotificationService] ServiceWorker registration warning:', err);
    return null;
  }
}

/**
 * Retrieves the current VAPID public key from backend server
 */
export async function getVapidPublicKey(): Promise<string> {
  try {
    const res = await fetch('/api/push/vapid-public-key');
    if (res.ok) {
      const data = await res.json();
      if (data.publicKey) return data.publicKey;
    }
  } catch (e) {
    console.warn('[NotificationService] Failed to fetch VAPID key from server, using fallback:', e);
  }
  return FALLBACK_VAPID_PUBLIC_KEY;
}

/**
 * Subscribe browser to Web Push notifications.
 * This registers the push subscription with the backend AND Firestore so notifications
 * arrive even when the browser tab is completely closed.
 */
export async function subscribeToPushNotifications(
  role: 'chif3n' | 'leslye'
): Promise<{ success: boolean; message: string; subscription?: PushSubscription | null }> {
  if (!isNotificationSupported()) {
    return {
      success: false,
      message: 'System notifications are not supported in this browser.'
    };
  }

  try {
    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        message: permission === 'denied'
          ? 'Notification permission was denied in browser settings. Please allow notifications for this site.'
          : 'Notification permission request was dismissed.'
      };
    }

    // 2. Ensure Service Worker is registered and ready
    await registerServiceWorker();
    const swRegistration = await navigator.serviceWorker.ready;

    if (!('pushManager' in swRegistration)) {
      return {
        success: true,
        message: 'Alerts active via local notification system (PushManager not available on this browser).'
      };
    }

    // 3. Get VAPID Public Key
    const vapidKey = await getVapidPublicKey();
    const convertedKey = urlBase64ToUint8Array(vapidKey);

    // 4. Retrieve or create push subscription
    let subscription = await swRegistration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource
      });
      console.log('[NotificationService] New push subscription created');
    }

    // 5. Send subscription to server for closed-app dispatch
    const subJSON = subscription.toJSON();
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          subscription: subJSON
        })
      });
    } catch (e) {
      console.warn('[NotificationService] Server push registration warning:', e);
    }

    // 6. Persist subscription in Firestore for cloud reliability
    try {
      await savePushSubscriptionToCloud(role, subJSON);
    } catch (e) {
      console.warn('[NotificationService] Firestore push subscription warning:', e);
    }

    return {
      success: true,
      message: '✨ Background & Closed-App Push Alerts Activated!',
      subscription
    };
  } catch (err: any) {
    console.error('[NotificationService] Push subscription error:', err);
    return {
      success: false,
      message: `Failed to configure push alerts: ${err?.message || 'Unknown error'}`
    };
  }
}

/**
 * Triggers a local system notification (used when app is open or tab is active/backgrounded)
 */
export async function triggerSystemNotification(
  title: string,
  body: string,
  tag: string = 'love-scroll',
  onClick?: () => void
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  let delivered = false;

  // 1. First choice: Use ServiceWorkerRegistration showNotification
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `scroll-${tag}`,
          data: { url: '/?openVault=true' }
        });
        delivered = true;
      }
    } catch (err) {
      console.warn('[NotificationService] ServiceWorker showNotification fallback:', err);
    }
  }

  // 2. Second choice: Standard window.Notification
  if (!delivered) {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `scroll-${tag}`
      });
      if (onClick) {
        notif.onclick = () => {
          onClick();
          notif.close();
        };
      }
      delivered = true;
    } catch (err) {
      console.warn('[NotificationService] window.Notification fallback:', err);
    }
  }

  // 3. Third choice: Service Worker postMessage
  if (!delivered && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options: {
          body,
          icon: '/favicon.ico',
          tag: `scroll-${tag}`
        }
      });
      delivered = true;
    } catch (e) {}
  }

  return delivered;
}

/**
 * Dispatches a test Web Push notification directly from the server.
 * This verifies that notifications work even if the user minimizes or closes the tab!
 */
export async function sendTestBackgroundPush(
  role: 'chif3n' | 'leslye'
): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const res = await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || 'Test push notification dispatched.',
      count: data.sentCount
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to dispatch test push: ${err?.message || 'Network error'}`
    };
  }
}
