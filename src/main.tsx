import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for standalone installability without reload loops
registerSW({
  immediate: false,
  onNeedRefresh() {
    console.log('[PWA] New version ready.');
  },
  onOfflineReady() {
    console.log("[PWA] Leslye's Realm is ready for offline reading!");
  },
});

createRoot(document.getElementById('root')!).render(<App />);
