import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

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
    <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-xl bg-[#742C3C] text-white px-3 py-2 text-xs font-medium shadow-xl border border-[#B79A63]/30 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-[#B79A63]" />
      <span>Çevrimdışı Mod — Yerel önbellek verileri kullanılıyor.</span>
    </div>
  );
};
