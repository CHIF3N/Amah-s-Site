// Client-side Web Push Service for Background Notifications when the App is Closed
import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const DEFAULT_VAPID_PUBLIC_KEY = 'BDKFr-e8i0mSl7h7HjRct4ZW9JU7ZsqVD1YW4LOlHrE_vJ9xcyZspkGAFiK9iZvAjsUbgxb7pSID1BaO_7Hg4tg';

/**
 * Convert URL-safe base64 string to Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
 * Register Service Worker at root /sw.js
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    console.log('[PushService] Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[PushService] Service Worker registration failed:', err);
    return null;
  }
}

/**
 * Subscribe current browser to background Web Push notifications (delivers when tab/app is completely closed)
 */
export async function subscribeToBackgroundPush(role: 'chif3n' | 'leslye'): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[PushService] Web Push is not supported in this browser environment.');
    return false;
  }

  try {
    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[PushService] Notification permission was not granted:', permission);
      return false;
    }

    // 2. Ensure Service Worker is active
    let registration: ServiceWorkerRegistration | null | undefined = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await registerServiceWorker();
    }
    if (!registration) {
      console.warn('[PushService] Could not obtain ServiceWorkerRegistration');
      return false;
    }

    // 3. Get VAPID public key from backend or default
    let vapidKey = DEFAULT_VAPID_PUBLIC_KEY;
    try {
      const res = await fetch('/api/push/vapid-public-key');
      const data = await res.json();
      if (data?.publicKey) {
        vapidKey = data.publicKey;
      }
    } catch (e) {
      console.warn('[PushService] Using default VAPID public key');
    }

    // 4. Check for existing subscription or create new one
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource
      });
    }

    if (!subscription) {
      console.warn('[PushService] Failed to obtain PushSubscription');
      return false;
    }

    const subJson = subscription.toJSON();

    // 5. Register with backend server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, subscription: subJson })
    }).catch(err => console.warn('[PushService] Backend registration warning:', err));

    // 6. Also persist in Firestore pushSubscriptions collection for multi-device cross-session persistence
    try {
      const subEndpointHash = btoa(subJson.endpoint || '').slice(0, 32).replace(/[^a-zA-Z0-9]/g, '_');
      const docRef = doc(collection(db, 'pushSubscriptions'), `${role}_${subEndpointHash}`);
      await setDoc(docRef, {
        role,
        subscription: subJson,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (fsErr) {
      console.warn('[PushService] Firestore subscription persistence notice:', fsErr);
    }

    console.log('[PushService] Background Push successfully subscribed for:', role);
    return true;
  } catch (err) {
    console.warn('[PushService] Error subscribing to background push:', err);
    return false;
  }
}

/**
 * Dispatch test push alert from server (verifies delivery when app is closed)
 */
export async function sendTestBackgroundPush(role: 'chif3n' | 'leslye'): Promise<boolean> {
  try {
    const res = await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    return !!data.success;
  } catch (e) {
    console.warn('[PushService] Test push failed:', e);
    return false;
  }
}
