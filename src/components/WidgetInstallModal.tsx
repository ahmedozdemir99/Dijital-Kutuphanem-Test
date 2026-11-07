import React, { useState } from 'react';
import { X, Smartphone, ExternalLink, Copy, Check, Download, Sparkles, BookOpen, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getWisdomForDate } from '../data/dailyWisdomData';

interface WidgetInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetInstallModal: React.FC<WidgetInstallModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, readingSessions } = useApp();
  const [copied, setCopied] = useState(false);
  const activeWisdom = getWisdomForDate();

  if (!isOpen) return null;

  const widgetUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?widget=true`
    : 'https://dijitalkutuphanem.ai.studio/?widget=true';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(widgetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPages = readingSessions
    .filter(s => s.date === todayStr)
    .reduce((sum, s) => sum + s.pagesRead, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-[#742C3C] to-[#541e2a] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-base sm:text-lg">Telefon Masaüstü Widget'ı</h3>
              <p className="text-xs text-white/70">Uygulama dışından masaüstünüzde canlı takip</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-100">
          
          {/* Live Mini Preview of the Widget */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#18050B] to-[#2B0B15] text-white border-2 border-[#B79A63]/60 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px]">
              <span className="font-serif font-bold text-[#B79A63] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>DİJİTAL KÜTÜPHANEM WIDGET</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Canlı Masaüstü
              </span>
            </div>

            <p className="font-serif italic text-xs leading-relaxed text-white/90 line-clamp-2">
              "{activeWisdom.text}"
            </p>
            
            <div className="flex items-center justify-between text-[11px] text-[#B79A63] font-serif pt-1">
              <span>— {activeWisdom.source || 'Günün Hikmeti'}</span>
              <span className="flex items-center gap-1 text-white/80 font-sans text-[10px]">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Bugün: <b>{todayPages}</b>/{userProfile.dailyTargetPages || 40} sayfa</span>
              </span>
            </div>
          </div>

          {/* Installation Methods */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Telefon Masaüstüne Nasıl Eklenir?
            </h4>

            {/* Method 1: Chrome Ana Ekrana Ekle */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">1</span>
                  <span>En Kolay Yol: Doğrudan Widget Olarak Ekle</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 font-bold">Önerilen</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Aşağıdaki butona basarak Widget sayfasını açın; ardından Chrome tarayıcınızın sağ üstündeki <b>(⋮) Menüsü</b>ne dokunup <b>"Ana Ekrana Ekle"</b> seçeneğini seçin. Telefonunuzun masaüstünde bağımsız çalışan bir widget simgesi oluşacaktır.
              </p>
              <a
                href="/?widget=true"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#742C3C] hover:bg-[#5a222f] text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <span>Widget Sayfasını Aç</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              </a>
            </div>

            {/* Method 2: KWGT & One4Widget & WebWidget */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#742C3C] text-white flex items-center justify-center text-[11px] font-bold">2</span>
                  <span>One4Widget / KWGT / WebWidget ile</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Android telefonunuzdaki herhangi bir widget aracında (WebView, One4Widget, KWGT) aşağıdaki canlı bağlantıyı kullanarak widget oluşturabilirsiniz:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={widgetUrl}
                  className="flex-1 bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 px-3 py-2 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 select-all"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3.5 py-2 rounded-xl bg-[#B79A63] text-slate-950 font-bold text-xs hover:bg-[#a68953] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href="/dijital_kutuphanem_widget.zip"
                  download="dijital_kutuphanem_widget.zip"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Hazır Widget Paketini İndir (.ZIP)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#151515] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#742C3C] text-white font-bold text-xs hover:bg-[#5a222f] transition-colors cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
