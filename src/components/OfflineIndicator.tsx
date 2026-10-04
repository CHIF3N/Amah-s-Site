import React, { useEffect, useState } from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-950/90 border border-amber-500/70 px-3.5 py-2 text-xs font-mono font-medium text-amber-200 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
      <span>Offline Sanctum Active — Cached manga, poetry & vows available.</span>
    </div>
  );
};
