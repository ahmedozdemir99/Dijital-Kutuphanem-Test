import React, { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, RefreshCw, Plus, Check, ChevronRight, Compass, Flame, Lightbulb, BookmarkCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SmartRecommendation {
  title: string;
  author: string;
  category: string;
  totalPages: number;
  reason: string;
  estimatedDays: number;
  tag: string;
}

const DEFAULT_INITIAL_RECOMMENDATIONS: SmartRecommendation[] = [
  {
    title: "İhyâ'u Ulûmi'd-Dîn (İlim ve Kalp)",
    author: "İmâm-ı Gazâlî",
    category: "Din ve İlahiyat",
    totalPages: 480,
    reason: "Kişinin zihnini ve kalbini tezkiye eden, ibadet ve ahlakın manevi sırlarını açan şaheser.",
    estimatedDays: 12,
    tag: "Temel Başyapıt"
  },
  {
    title: "Doğu ve Batı Arasında İslam",
    author: "Aliya İzzetbegoviç",
    category: "Felsefe",
    totalPages: 380,
    reason: "Modern fikir akımlarıyla İslam medeniyetinin ruh-madde dengesini inşa eden entelektüel anıt.",
    estimatedDays: 9,
    tag: "Ufuk Açıcı"
  },
  {
    title: "Saatleri Ayarlama Enstitüsü",
    author: "Ahmet Hamdi Tanpınar",
    category: "Edebiyat",
    totalPages: 382,
    reason: "Doğu-Batı ikilemini, zaman felsefesini ve toplum psikolojisini mizahla harmanlayan Türk klasiği.",
    estimatedDays: 10,
    tag: "Edebiyat Klasiği"
  },
  {
    title: "İnsanın Anlam Arayışı",
    author: "Viktor E. Frankl",
    category: "Psikoloji",
    totalPages: 168,
    reason: "Zorluklar karşısında insanın içsel anlam ve gaye bularak ayakta kalmasını anlatan eser.",
    estimatedDays: 4,
    tag: "Ruh & İrade"
  }
];

export const SmartBookRecommendations: React.FC = () => {
  const { userBooks, userProfile, addBookToLibrary } = useApp();

  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>(DEFAULT_INITIAL_RECOMMENDATIONS);
  const [curatorNote, setCuratorNote] = useState<string>('Okuma ritminize ve kütüphanenize göre seçilen akıllı öneriler:');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFocus, setSelectedFocus] = useState<string>('all');
  const [addedBookTitles, setAddedBookTitles] = useState<string[]>([]);

  const fetchRecommendations = async (focusCategory: string = selectedFocus) => {
    setIsLoading(true);
    try {
      const activeBooks = userBooks.map(b => ({
        title: b.title,
        author: b.author,
        category: b.category,
        status: b.status
      }));

      const res = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentBooks: activeBooks.slice(-8),
          preferredCategory: focusCategory === 'all' ? 'Edebiyat, Felsefe, Tefsir, Tarih, Tasavvuf' : focusCategory,
          dailyTarget: userProfile.dailyTargetPages || 40,
          mood: 'Zihni derinleştiren, ufuk açıcı nitelikli başyapıtlar'
        })
      });

      if (!res.ok) throw new Error('API Hatası');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setCuratorNote(data.curatorNote || 'Okuma ritminize göre seçilen akıllı eserler:');
    } catch (err) {
      console.warn('Smart recommendations fallback triggered', err);
      // Premium curated fallback
      setRecommendations([
        {
          title: "İhya'u Ulumi'd-Din (İlim & Kalp Yolu)",
          author: "İmâm-ı Gazâlî",
          category: "Din ve İlahiyat",
          totalPages: 480,
          reason: "Kişinin zihnini tezkiye eden, ibadet ve ahlakın manevi sırlarını açan kalıcı bir şaheser.",
          estimatedDays: 12,
          tag: "Temel Başyapıt"
        },
        {
          title: "Doğu ve Batı Arasında İslam",
          author: "Aliya İzzetbegoviç",
          category: "Felsefe",
          totalPages: 380,
          reason: "Modern fikir akımlarıyla İslam medeniyetinin ruh-madde dengesini inşa eden entelektüel anıt eser.",
          estimatedDays: 9,
          tag: "Ufuk Açıcı"
        },
        {
          title: "Saatleri Ayarlama Enstitüsü",
          author: "Ahmet Hamdi Tanpınar",
          category: "Edebiyat",
          totalPages: 382,
          reason: "Doğu-Batı ikilemini, zaman felsefesini ve toplum psikolojisini mizahla harmanlayan Türk edebiyatı zirvesi.",
          estimatedDays: 10,
          tag: "Edebiyat Klasiği"
        },
        {
          title: "İnsanın Anlam Arayışı",
          author: "Viktor E. Frankl",
          category: "Psikoloji",
          totalPages: 168,
          reason: "Zorluklar karşısında insanın içsel anlam ve gaye bularak ayakta kalmasını anlatan psikoterapi klasiği.",
          estimatedDays: 4,
          tag: "Ruh & İrade"
        }
      ]);
      setCuratorNote("Kütüphane okuma çizginize göre özenle seçilmiş akıllı okuma rotası:");
    } finally {
      setIsLoading(false);
    }
  };

  // Mount effect: keep instant recommendations active, fetch updates in background without UI freeze
  useEffect(() => {
    // Only fetch if empty
    if (recommendations.length === 0) {
      fetchRecommendations('all');
    }
  }, []);

  const handleAddBook = (rec: SmartRecommendation) => {
    addBookToLibrary({
      title: rec.title,
      author: rec.author,
      category: rec.category,
      publisher: 'Klasik Yayınları',
      totalPages: rec.totalPages || 250,
      currentPage: 0,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
      description: rec.reason,
      status: 'reading'
    });
    setAddedBookTitles(prev => [...prev, rec.title]);
  };

  const categories = [
    { id: 'all', label: 'Tüm Alanlar' },
    { id: 'Felsefe & Tefekkür', label: 'Felsefe & Tefekkür' },
    { id: 'Türk & Dünya Edebiyatı', label: 'Klasik Edebiyat' },
    { id: 'Din, İlahiyat & Tasavvuf', label: 'İlim & Tasavvuf' },
    { id: 'Tarih & Medeniyet', label: 'Tarih & Medeniyet' },
    { id: 'Psikoloji & Şahsiyet', label: 'Psikoloji & Şahsiyet' },
  ];

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 shadow-md border border-black/5 dark:border-white/5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B79A63] mb-1">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Kişiselleştirilmiş Yapay Zekâ Destekli Okuma Danışmanı</span>
          </div>
          <h2 className="font-serif-title font-bold text-xl md:text-2xl text-[#742C3C] dark:text-[#B79A63]">
            Akıllı Kitap Önerileri
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Kütüphanenizdeki kitaplar, günlük okuma hızınız ve ilgi alanlarınıza göre size özel seçilen başyapıtlar.
          </p>
        </div>

        {/* Refresh & Generate Button */}
        <button
          onClick={() => fetchRecommendations(selectedFocus)}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#742C3C] to-[#4B1E2B] hover:from-[#5a222f] hover:to-[#35141e] text-white text-xs font-bold shadow-md shadow-[#742C3C]/20 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 border border-[#B79A63]/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[#B79A63] ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Öneriler Hazırlanıyor...' : 'Yeni Öneriler Üret 🔄'}</span>
        </button>
      </div>

      {/* Focus Category Filter Chips */}
      <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar text-xs">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedFocus(c.id);
              fetchRecommendations(c.id);
            }}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFocus === c.id
                ? 'bg-[#742C3C] text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Curator Note Banner */}
      {curatorNote && (
        <div className="p-3.5 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-[#B79A63]/25 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="font-medium italic">{curatorNote}</p>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => {
          const isAdded = addedBookTitles.includes(rec.title) || userBooks.some(b => b.title.toLowerCase() === rec.title.toLowerCase());

          return (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 hover:border-[#B79A63]/40 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#742C3C]/10 dark:bg-[#B79A63]/15 text-[#742C3C] dark:text-[#B79A63] border border-[#742C3C]/20 dark:border-[#B79A63]/30">
                    {rec.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {rec.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif-title font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-[#742C3C] dark:group-hover:text-[#B79A63] transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {rec.author}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-white/60 dark:bg-black/20 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                  "{rec.reason}"
                </p>
              </div>

              {/* Bottom Metadata & Quick Add */}
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  <span>{rec.totalPages} Sayfa</span>
                  <span>•</span>
                  <span>~{rec.estimatedDays} Günde Biter</span>
                </div>

                <button
                  onClick={() => handleAddBook(rec)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#742C3C] hover:bg-[#5a222f] text-white border border-[#B79A63]/40'
                  }`}
                  title={isAdded ? 'Kütüphanede Mevcut' : 'Kütüphaneye Ekle'}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kütüphanemde</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Kütüphaneme Ekle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
