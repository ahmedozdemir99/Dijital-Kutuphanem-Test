import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#742C3C] text-white text-xs font-medium hover:bg-[#4B1E2B] transition shadow-sm"
      >
        <Download className="w-3.5 h-3.5 text-[#B79A63]" />
        <span>Uygulamayı Yükle</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#742C3C]/30 text-xs font-medium text-[#742C3C] dark:text-[#B79A63] hover:bg-[#742C3C]/10 transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iOS'e Yükle</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1E1E1E] p-6 shadow-2xl border border-black/10 dark:border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-serif-title font-bold text-[#742C3C] dark:text-[#B79A63]">
                  iPhone / iPad'e Yükleme
                </h3>
                <button onClick={() => setShowIOSGuide(false)} className="p-1 rounded hover:bg-black/5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                1. Safari alt menüsündeki <strong>Paylaş</strong> butonuna dokunun.<br />
                2. Açılan listede <strong>Ana Ekrana Ekle</strong> seçeneğine tıklayın.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#742C3C] py-2.5 text-xs font-semibold text-white hover:bg-[#4B1E2B]"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
