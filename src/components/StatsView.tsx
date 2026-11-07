import { readingDate } from '../utils/readingDate';
import React, { useMemo } from 'react';
import { 
  TrendingUp, BarChart3, PieChart, BookOpen, Award, Flame, Calendar, Sparkles, Clock, CheckCircle2, Layers 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StatsView: React.FC = () => {
  const { userBooks, readingSessions, quotations, reviews } = useApp();

  // Calculations
  const totalBooks = userBooks.length;
  const completedBooks = userBooks.filter(b => b.status === 'completed').length;
  const readingBooks = userBooks.filter(b => b.status === 'reading').length;
  const totalPagesRead = userBooks.reduce((sum, b) => sum + b.currentPage, 0);
  const totalLibraryPages = userBooks.reduce((sum, b) => sum + b.totalPages, 0);
  const completionRate = totalLibraryPages > 0 ? Math.round((totalPagesRead / totalLibraryPages) * 100) : 0;

  // Last 7 days reading speed
  const last7DaysData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = readingDate(d);
      const daySessions = readingSessions.filter(s => s.date === dStr);
      const pages = daySessions.reduce((acc, curr) => acc + curr.pagesRead, 0);
      days.push({
        date: dStr,
        dayName: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
        pages
      });
    }
    return days;
  }, [readingSessions]);

  const activeDays = last7DaysData.filter(day => day.pages > 0).length;
  const authorCounts = new Map<string, number>();
  const completionYears = new Map<string, number>();
  for (const book of userBooks) {
    if (book.status !== 'completed') continue;
    if (book.author) authorCounts.set(book.author, (authorCounts.get(book.author) || 0) + 1);
    const year = book.endDate?.match(/^\d{4}(?=-)/u)?.[0] || 'Tarih belirtilmedi';
    completionYears.set(year, (completionYears.get(year) || 0) + 1);
  }
  const topAuthor = [...authorCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'))[0];
  const completionsByYear = [...completionYears].sort((a, b) => {
    if (a[0] === 'Tarih belirtilmedi') return 1;
    if (b[0] === 'Tarih belirtilmedi') return -1;
    return Number(b[0]) - Number(a[0]);
  });

  const maxWeeklyPages = Math.max(10, ...last7DaysData.map(d => d.pages));
  const totalWeekPages = last7DaysData.reduce((sum, d) => sum + d.pages, 0);
  const avgDailySpeed = Math.round(totalWeekPages / 7);

  // Genre / Category Breakdown
  const categoryStats = useMemo(() => {
    const map: { [cat: string]: { count: number; pages: number } } = Object.create(null);
    userBooks.forEach(b => {
      const cat = b.category || 'Diğer';
      if (!map[cat]) {
        map[cat] = { count: 0, pages: 0 };
      }
      map[cat].count += 1;
      map[cat].pages += b.currentPage;
    });
    return Object.entries(map).map(([category, data]) => ({
      category,
      count: data.count,
      pages: data.pages
    })).sort((a, b) => b.pages - a.pages);
  }, [userBooks]);

  const maxCategoryPages = Math.max(1, ...categoryStats.map(c => c.pages));

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#742C3C] via-[#5a222f] to-[#4B1E2B] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#B79A63]/20 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B79A63]">
              <TrendingUp className="w-4 h-4 text-[#B79A63]" />
              <span>İlim ve Okuma Analitiği</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif-title font-bold">
              Okuma İstatistikleri ve Alışkanlıklar
            </h1>
            <p className="text-xs md:text-sm text-white/80 max-w-xl">
              Okuma hızınız, haftalık ilerleme performansınız ve tür bazlı kütüphane dağılımınızın görsel analizi.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
            <Award className="w-8 h-8 text-[#B79A63]" />
            <div>
              <span className="text-[10px] text-white/70 block uppercase font-bold">Genel Tamamlama</span>
              <span className="text-lg font-serif-title font-bold text-white">%{completionRate} Başarı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/5 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Toplam Eser</span>
          <p className="text-2xl font-serif-title font-bold text-[#742C3C] dark:text-[#B79A63]">{totalBooks} Kitap</p>
          <p className="text-[11px] text-slate-400">{completedBooks} Tamamlanan</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/5 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Okunan Sayfa</span>
          <p className="text-2xl font-serif-title font-bold text-[#742C3C] dark:text-[#B79A63]">{totalPagesRead.toLocaleString('tr-TR')} syf</p>
          <p className="text-[11px] text-slate-400">Aktif Kütüphane</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/5 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Okuma İstikrarı</span>
          <p className="text-2xl font-serif-title font-bold text-emerald-600 dark:text-emerald-400">{activeDays} / 7 Gün</p>
          <p className="text-[11px] text-slate-400">Son 7 Günlük Performans</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/5 space-y-1">
          <span className="text-xs text-slate-500 font-medium">En Çok Okunan Yazar</span>
          <p className="text-sm font-serif-title font-bold text-amber-600 dark:text-amber-400 mt-1 truncate">{topAuthor?.[0] || 'Henüz veri yok'}</p>
          <p className="text-[11px] text-slate-400">{topAuthor ? `${topAuthor[1]} tamamlanan eser` : 'Tamamlanan kitaplardan hesaplanır'}</p>
        </div>
      </div>

      <section className="space-y-3 rounded-3xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-[#1E1E1E]">
        <h2 className="font-serif-title font-bold">Yıllara göre tamamlanan kitaplar</h2>
        {completionsByYear.length ? (
          <ul className="divide-y divide-black/5 text-sm dark:divide-white/10">
            {completionsByYear.map(([year, count]) => (
              <li key={year} className="flex justify-between gap-2 py-2"><span>{year}</span><strong>{count} eser</strong></li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-500">Henüz tamamlanan kitap kaydı yok.</p>}
      </section>

      {/* Journey Summary */}
      <div className="bg-[#F8F5EF] dark:bg-[#141414] rounded-3xl p-6 border border-black/5 dark:border-white/5">
        <h3 className="font-serif-title font-bold text-base text-[#742C3C] dark:text-[#B79A63] mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Okuma Yolculuğu Özeti</span>
        </h3>
        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Kütüphanenizdeki {totalBooks} eserin {completedBooks} tanesini tamamlayarak önemli bir entelektüel mesafe katettiniz. 
          {categoryStats[0]?.pages > 0 ? `En çok sayfa okunan alan ${categoryStats[0].category}.` : 'Kategori ilerlemesi için sayfa kaydı gerekiyor.'}
          Okuma disiplininizi korumaya devam ederek 40 yıllık planınızın hedeflerine adım adım yaklaşıyorsunuz.
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart (Last 7 Days) */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-md border border-black/5 dark:border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#B79A63]" />
              <span>Haftalık Okuma İlerlemesi (Son 7 Gün)</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63]">
              Toplam: {totalWeekPages} Sayfa
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-black/5 dark:border-white/5">
            {last7DaysData.map((d, idx) => {
              const heightPercent = Math.max(12, Math.round((d.pages / maxWeeklyPages) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.pages} syf
                  </span>
                  <div 
                    className="w-full bg-gradient-to-t from-[#742C3C] to-[#B79A63] rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-sm"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 text-center">
            Haftalık istikrarınız okuma serinizi (streak) güçlendirir ve ilim yolculuğunuzu kalıcı kılar.
          </p>
        </div>

        {/* Genre-Based Reading Habits (Tür Bazlı Alışkanlıklar) */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-md border border-black/5 dark:border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63] flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#B79A63]" />
              <span>Tür Bazlı Okuma Alışkanlıkları</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">{categoryStats.length} Farklı Tür</span>
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
            {categoryStats.map((cat, idx) => {
              const percent = Math.round((cat.pages / Math.max(1, totalPagesRead)) * 100);
              const barWidth = Math.max(8, Math.round((cat.pages / maxCategoryPages) * 100));
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{cat.category} ({cat.count} Eser)</span>
                    <span className="text-[#742C3C] dark:text-[#B79A63]">{cat.pages} sayfa (%{percent})</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#742C3C] to-[#B79A63] h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 text-center">
            Kütüphanenizdeki eserlerin kategorilere ve okunan sayfalara göre dağılım yüzdeleri.
          </p>
        </div>
      </div>
    </div>
  );
};
