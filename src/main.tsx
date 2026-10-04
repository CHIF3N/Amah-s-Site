import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for standalone installability & background push notifications
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version detected, updating cache...');
  },
  onOfflineReady() {
    console.log("[PWA] Leslye's Realm is ready for offline reading!");
  },
});

// Explicitly register /service-worker.js for background push & system notifications
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.log('[SW] Push Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SW] Push Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
