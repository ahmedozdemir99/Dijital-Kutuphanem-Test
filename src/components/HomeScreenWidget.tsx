import { readingDate } from '../utils/readingDate';
import React, { useState } from 'react';
import { 
  Quote, Flame, BookOpen, Plus, Sparkles, RefreshCw, Copy, Check, 
  Smartphone, ExternalLink, HelpCircle, Layers, Info, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getWisdomForDate, DAILY_WISDOMS, DailyWisdom } from '../data/dailyWisdomData';

export const HomeScreenWidget: React.FC = () => {
  const { 
    userProfile, 
    userBooks, 
    readingSessions, 
    quranProgress, 
    updateQuranProgress,
    setActiveTab,
    setExploreSubTab
  } = useApp();

  const [wisdomIndex, setWisdomIndex] = useState<number>(() => {
    const todayW = getWisdomForDate();
    const idx = DAILY_WISDOMS.findIndex(w => w.id === todayW.id);
    return idx >= 0 ? idx : 0;
  });

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showWidgetGuide, setShowWidgetGuide] = useState<boolean>(false);

  const activeWisdom: DailyWisdom = DAILY_WISDOMS[wisdomIndex] || getWisdomForDate();

  // Calculation for today's reading
  const todayStr = readingDate();
  const todaySessions = readingSessions.filter(s => s.date === todayStr);
  const totalPagesToday = todaySessions.reduce((acc, curr) => acc + curr.pagesRead, 0);
  const targetPages = userProfile.dailyTargetPages || 40;
  const progressPercent = Math.min(100, Math.round((totalPagesToday / targetPages) * 100));

  const handleNextWisdom = () => {
    setWisdomIndex(prev => (prev + 1) % DAILY_WISDOMS.length);
  };

  const handleCopyWisdom = () => {
    const textToCopy = `"${activeWisdom.text}" — ${activeWisdom.source || 'Anonim'}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const typeLabels: Record<DailyWisdom['type'], string> = {
    'Hadis-i Şerif': 'Günün Hadis-i Şerifi',
    'Özlü Söz': 'Günün Özlü Sözü',
    'Kısa Şiir': 'Günün Hikmetli Mısrası',
    'Veciz Söz': 'Günün Veciz Sözü',
    'Kelâm-ı Kibâr': 'Günün Kelâm-ı Kibârı'
  };

  return (
    <div className="bg-gradient-to-br from-[#1E1216] via-[#2A151D] to-[#18080E] text-white rounded-3xl p-5 md:p-6 shadow-2xl border-2 border-[#B79A63]/30 relative overflow-hidden space-y-4">
      {/* Background Decorative Glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#B79A63]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Widget Header Badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#B79A63] text-slate-950 font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B79A63] block">
              Günün Vecizesi & Okuma Widget'ı
            </span>
            <h3 className="font-serif-title font-bold text-sm text-white">
              {typeLabels[activeWisdom.type] || 'Günün Hikmeti'}
            </h3>
          </div>
        </div>

        <button
          onClick={() => setShowWidgetGuide(true)}
          className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[#B79A63] text-[11px] font-bold flex items-center gap-1 border border-[#B79A63]/30 transition-all cursor-pointer"
          title="Ana Ekrana Widget Olarak Ekleme Rehberi"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Widget Yap 📲</span>
        </button>
      </div>

      {/* SECTION 1: GÜNÜN VECİZESİ & HİKMETLİ SÖZÜ */}
      <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 relative">
        <div className="flex justify-between items-center text-[10px] font-bold text-[#B79A63]">
          <span className="flex items-center gap-1">
            <Quote className="w-3 h-3 fill-current text-[#B79A63]" />
            <span>{activeWisdom.type}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyWisdom}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1 cursor-pointer"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
            <button
              onClick={handleNextWisdom}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Değiştir 🔄"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        <p className="text-xs md:text-sm font-serif italic text-slate-100 leading-relaxed">
          "{activeWisdom.text}"
        </p>

        <div className="text-right pt-1 border-t border-white/5">
          <span className="text-[11px] font-semibold text-[#B79A63] font-serif">
            — {activeWisdom.source || 'Anonim'}
          </span>
        </div>
      </div>

      {/* SECTION 2: CANLI HEDEF KARTİ & KONTROL BARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Okuma Hedefi */}
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-current" />
              <span>40 Sayfa Hedefi</span>
            </span>
            <span className="font-bold text-[#B79A63]">%{progressPercent}</span>
          </div>

          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5">
            <div 
              className="bg-gradient-to-r from-amber-500 to-[#B79A63] h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
            <span>Okunan: {totalPagesToday} / {targetPages} syf</span>
            <span className="text-emerald-400 font-bold">{targetPages - totalPagesToday > 0 ? `${targetPages - totalPagesToday} syf kaldı` : '🎉 Tamamlandı'}</span>
          </div>
        </div>

        {/* Kur'an-ı Kerim İlerlemesi */}
        <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 space-y-1.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kur'an-ı Kerim</span>
            </span>
            <span className="text-[10px] font-bold text-amber-300">Cüz {Math.ceil((quranProgress.lastReadPage || 1) / 20)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-200">Bugün: <strong>{quranProgress.pagesReadToday || 0} Syf</strong></span>
            <button
              onClick={() => {
                setExploreSubTab('quran');
                setActiveTab('explore');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all cursor-pointer shadow-xs"
            >
              Kur'an'a Git →
            </button>
          </div>
        </div>
      </div>

      {/* WIDGET GUIDE MODAL */}
      {showWidgetGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 max-w-md w-full p-6 rounded-3xl shadow-2xl border border-[#B79A63]/40 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#742C3C] dark:text-[#B79A63]" />
                <h3 className="font-serif-title font-bold text-base text-[#742C3C] dark:text-[#B79A63]">
                  Android / iPhone Masaüstü Widget Yapma Rehberi
                </h3>
              </div>
              <button 
                onClick={() => setShowWidgetGuide(false)}
                className="p-1 rounded-full hover:bg-black/5 font-bold text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-1">
                <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Yöntem: Telefon Ana Ekranına Kısayol / Widget Ekleme</span>
                </h4>
                <p>
                  Telefonunuzda Chrome tarayıcısını açıp <strong>`dijitalkutuphanem.ai.studio`</strong> adresine girin. Sağ üstteki 3 noktaya basıp <strong>"Ana Ekrana Ekle / Uygulamayı Yükle"</strong> deyin. Artık uygulamanın simgesine basılı tuttuğunuzda <em>Günün Vecizesi & Okuma İlerlemesi</em> menü olarak açılacaktır.
                </p>
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-1">
                <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Yöntem: Appmint APK ile Doğrudan Widget</span>
                </h4>
                <p>
                  Appmint panelinden APK olarak indirdiğinizde, telefonunuzun ana ekranına basılı tutup <strong>Widget'lar</strong> sekmesinden <em>Dijital Kütüphanem Vecize Widget'ı</em> seçip masaüstünüze sürükleyebilirsiniz.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowWidgetGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#742C3C] text-white font-bold text-xs shadow-md"
              >
                Anladım, Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
