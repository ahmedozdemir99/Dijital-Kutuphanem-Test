import { getCurriculumProgress } from '../data/readingPlanData';
import { readingDate } from '../utils/readingDate';
import React, { useState } from 'react';
import { Quote, Flame, BookOpen, GraduationCap, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getWisdomForDate, DAILY_WISDOMS, DailyWisdom } from '../data/dailyWisdomData';

export const StandaloneWidgetView: React.FC = () => {
  const { userProfile, userBooks, readingSessions, quranProgress } = useApp();

  const [wisdomIndex, setWisdomIndex] = useState<number>(() => {
    const todayW = getWisdomForDate();
    const idx = DAILY_WISDOMS.findIndex(w => w.id === todayW.id);
    return idx >= 0 ? idx : 0;
  });

  const activeWisdom: DailyWisdom = DAILY_WISDOMS[wisdomIndex] || getWisdomForDate();

  const handleNextWisdom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWisdomIndex(prev => (prev + 1) % DAILY_WISDOMS.length);
  };

  // Metric 1: Book Reading Today
  const todayStr = readingDate();
  const todaySessions = readingSessions.filter(s => s.date === todayStr);
  const totalPagesToday = todaySessions.reduce((acc, curr) => acc + curr.pagesRead, 0);
  const targetPages = userProfile.dailyTargetPages || 40;
  const bookPercentage = Math.min(100, Math.round((totalPagesToday / targetPages) * 100));

  // Metric 2: Quran Hatim Progress
  const completedJuzCount = quranProgress.completedJuzs?.length || 0;
  const hatimPercentage = Math.round((completedJuzCount / 30) * 100);
  const quranPage = quranProgress.lastReadPage || 1;
  const { completedBooks, totalBooks: totalCurriculumGoal, percent: curriculumPercentage } = getCurriculumProgress(userBooks);
  const formattedCurriculumPercent = Number(curriculumPercentage.toFixed(1));

  const typeLabels: Record<DailyWisdom['type'], string> = {
    'Hadis-i Şerif': 'Günün Hadis-i Şerifi',
    'Özlü Söz': 'Günün Özlü Sözü',
    'Kısa Şiir': 'Günün Hikmetli Mısrası',
    'Veciz Söz': 'Günün Veciz Sözü',
    'Kelâm-ı Kibâr': 'Günün Kelâm-ı Kibârı'
  };

  return (
    <div 
      onClick={() => {
        // Open main app top-level
        window.location.href = window.location.origin;
      }}
      className="min-h-screen w-full bg-[#18050B] text-white p-3 md:p-4 flex flex-col justify-between select-none cursor-pointer overflow-hidden font-sans border-4 border-[#B79A63]/40"
    >
      {/* WIDGET TOP BRAND BAR */}
      <div className="flex justify-between items-center border-b border-[#B79A63]/30 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#B79A63] text-slate-950 font-serif font-bold text-xs flex items-center justify-center shadow-sm">
            📖
          </div>
          <span className="font-serif-title font-bold text-xs md:text-sm tracking-wider text-[#B79A63]">
            DİJİTAL KÜTÜPHANEM
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-[#B79A63]/20 text-[#B79A63] text-[9px] font-bold border border-[#B79A63]/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Canlı Günlük Takip</span>
          </span>
          <button
            onClick={handleNextWisdom}
            className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-[#B79A63] text-[10px] transition-colors"
            title="Sözü Değiştir 🔄"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* TOP FEATURED: GÜNÜN VECİZESİ & HİKMETLİ SÖZÜ */}
      <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-black/40 via-[#2C0C16]/60 to-black/40 border border-[#B79A63]/30 shadow-lg space-y-1">
        <div className="flex items-center justify-between text-[9px] font-bold text-[#B79A63] uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Quote className="w-3 h-3 fill-current" />
            <span>{typeLabels[activeWisdom.type] || 'Günün Hikmeti'}</span>
          </span>
          <span className="opacity-70">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
        </div>

        <p className="text-xs md:text-sm font-serif italic text-white/95 leading-snug line-clamp-2">
          "{activeWisdom.text}"
        </p>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-[#B79A63] font-serif">
            — {activeWisdom.source || 'Anonim'}
          </span>
        </div>
      </div>

      {/* THREE METRICS GRID (MATCHING THE USER'S ATTACHED SCREENSHOT EXACTLY) */}
      <div className="grid grid-cols-3 gap-2 my-1">
        {/* METRIC 1: KİTAP */}
        <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-between text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400 fill-current" />
            <span>1. KİTAP</span>
          </span>

          {/* Radial Progress Badge */}
          <div className="relative w-12 h-12 rounded-full border-4 border-[#B79A63] flex items-center justify-center bg-black/50 shadow-inner">
            <div className="text-center leading-none">
              <span className="text-[11px] font-bold text-[#B79A63] block">%{bookPercentage}</span>
              <span className="text-[7px] text-slate-400 uppercase">TAMAM</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-300">
            <strong className="text-white text-xs">{totalPagesToday}</strong> / {targetPages} syf
            <span className="block text-[8px] text-slate-400">Günlük Okuma</span>
          </div>
        </div>

        {/* METRIC 2: KUR'AN */}
        <div className="p-2.5 rounded-2xl bg-black/40 border border-emerald-500/20 flex flex-col items-center justify-between text-center space-y-1">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-emerald-400" />
            <span>2. KUR'AN</span>
          </span>

          {/* Radial Progress Badge */}
          <div className="relative w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-black/50 shadow-inner">
            <div className="text-center leading-none">
              <span className="text-[11px] font-bold text-emerald-400 block">%{hatimPercentage}</span>
              <span className="text-[7px] text-slate-400 uppercase">HATİM</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-300">
            <strong className="text-white text-xs">{quranProgress.pagesReadToday || 0}</strong> / 1 Hizb
            <span className="block text-[8px] text-emerald-400/90">Sayfa {quranPage} (Syf {quranPage}/604)</span>
          </div>
        </div>

        {/* METRIC 3: İLİM */}
        <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-between text-center space-y-1">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-amber-400" />
            <span>3. İLİM</span>
          </span>

          {/* Radial Progress Badge */}
          <div className="relative w-12 h-12 rounded-full border-4 border-amber-500 flex items-center justify-center bg-black/50 shadow-inner">
            <div className="text-center leading-none">
              <span className="text-[10px] font-bold text-amber-400 block">%{formattedCurriculumPercent}</span>
              <span className="text-[7px] text-slate-400 uppercase">40 YIL</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-300">
            <strong className="text-white text-xs">{completedBooks}</strong> Eser
            <span className="block text-[8px] text-slate-400">{totalCurriculumGoal} öneri</span>
          </div>
        </div>
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-[#B79A63]">
        <span className="flex items-center gap-1 opacity-80">
          <span>Uygulamaya Git</span>
          <ExternalLink className="w-3 h-3" />
        </span>
        <span className="text-[9px] text-slate-400 font-mono">
          Her 30 dk canlı güncellenir
        </span>
      </div>
    </div>
  );
};
