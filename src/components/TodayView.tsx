import React, { useState } from 'react';
import { 
  BookOpen, Target, Calendar as CalendarIcon, Award, TrendingUp, Flame, 
  ChevronRight, Plus, Play, Edit3, CheckCircle2, Layers, Compass, RefreshCw, Star, Sparkles,
  Quote, Copy, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserBook } from '../types';
import { BookCoverImage } from './BookCoverImage';
import { SmartBookRecommendations } from './SmartBookRecommendations';
import { DAILY_WISDOMS, DailyWisdom, getWisdomForDate } from '../data/dailyWisdomData';

interface FeaturedAuthor {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  bio: string;
  quote: string;
  topBooks: {
    title: string;
    category: string;
    coverUrl: string;
    description: string;
    totalPages: number;
    isMultiVolume?: boolean;
    volumeNumber?: number;
  }[];
}

const FEATURED_AUTHORS: FeaturedAuthor[] = [
  {
    id: 'tanpinar',
    name: 'Ahmet Hamdi Tanpınar',
    title: 'Türk Edebiyatı ve Doğu-Batı Sentezinin Şairi',
    avatarUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop',
    bio: 'Şiir, roman, deneme ve edebiyat tarihi alanlarında Türkçe edebiyatın en derin zihinlerinden biridir.',
    quote: 'Ne içindeyim zamanın, ne de büsbütün dışında...',
    topBooks: [
      {
        title: 'Saatleri Ayarlama Enstitüsü',
        category: 'Edebiyat',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
        description: 'Doğu ve Batı medeniyetleri arasındaki bocalayan insan tipimizi mizahi ve derin bir üslupla tahlil eden roman.',
        totalPages: 382
      },
      {
        title: 'Huzur',
        category: 'Edebiyat',
        coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop',
        description: 'İstanbul medeniyeti, musiki, estetik ve Mümtaz ile Nuran aşkının etrafında şekillenen klasik roman.',
        totalPages: 420
      },
      {
        title: 'Beş Şehir',
        category: 'Kültür, Sanat ve Medeniyet',
        coverUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop',
        description: 'Ankara, Erzurum, Konya, Bursa ve İstanbul üzerinden bir medeniyet ve şehir muhasebesi.',
        totalPages: 240
      },
      {
        title: 'Sahnenin Dışındakiler',
        category: 'Edebiyat',
        coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=600&auto=format&fit=crop',
        description: 'Milli Mücadele yıllarında İstanbul zihniyet yapısını ve aydın krizini ele alan eser.',
        totalPages: 310
      }
    ]
  },
  {
    id: 'necip-fazil',
    name: 'Necip Fazıl Kısakürek',
    title: 'Üstat ve Mistik Şiirin Zirvesi',
    avatarUrl: 'https://images.unsplash.com/photo-1474939557548-f842486be195?q=80&w=300&auto=format&fit=crop',
    bio: 'Şiiri, fikir dünyası, tiyatro eserleri ve aksiyon dolu hayatıyla 20. yüzyılın çilekeş mütefekkiri.',
    quote: 'Sonsuzluk kervanı, peşinizde ben varım!',
    topBooks: [
      {
        title: 'Çile',
        category: 'Şiir',
        coverUrl: 'https://images.unsplash.com/photo-1474939557548-f842486be195?q=80&w=600&auto=format&fit=crop',
        description: 'Üstadın bütün şiirlerini ve Şiirlerim ile Sanatım tahlilini içeren dev abide eser.',
        totalPages: 512
      },
      {
        title: 'İdeolocya Örgüsü',
        category: 'Felsefe',
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop',
        description: 'Büyük Doğu mimarisinin esaslarını teferruatıyla ortaya koyan fikir eseri.',
        totalPages: 390
      },
      {
        title: 'Bir Adam Yaratmak',
        category: 'Edebiyat',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
        description: 'Varoluş, zihin cinneti ve yaratma tutkusu üzerine Türk tiyatrosunun başyapıt piyesi.',
        totalPages: 160
      },
      {
        title: 'Aynadaki Yalan',
        category: 'Edebiyat',
        coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop',
        description: 'Felsefe profesörü Naci Çora\'nın hakikat arayışını ve içsel bunalımlarını anlatan roman.',
        totalPages: 280
      }
    ]
  },
  {
    id: 'sezai-karakoc',
    name: 'Sezai Karakoç',
    title: 'Diriliş Düşüncesinin ve Şiirinin Kurucusu',
    avatarUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=300&auto=format&fit=crop',
    bio: 'Şiiri medeniyet tasavvuru ile yoğuran, Diriliş dergisi ve akımıyla nesillere yön vermiş mütefekkir şair.',
    quote: 'Kaderin üstünde bir kader vardır...',
    topBooks: [
      {
        title: 'Monna Rosa & Bütün Şiirleri',
        category: 'Şiir',
        coverUrl: 'https://images.unsplash.com/photo-1474939557548-f842486be195?q=80&w=600&auto=format&fit=crop',
        description: 'Türk şiirinin efsaneleşmiş aşk ve idealizm destanı.',
        totalPages: 320
      },
      {
        title: 'Yitik Cennet',
        category: 'Felsefe',
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop',
        description: 'Peygamberler tarihi üzerinden insanlığın yükseliş ve düşüş krizlerinin felsefi tahlili.',
        totalPages: 210
      },
      {
        title: 'İnsan ve Sanat',
        category: 'Kültür, Sanat ve Medeniyet',
        coverUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop',
        description: 'Doğunun ve Batının sanat telakkilerini ruh ve madde boyutuyla irdeleyen estetik eseri.',
        totalPages: 180
      },
      {
        title: 'İslamın Dirilişi',
        category: 'Din ve İlahiyat',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
        description: 'İslam dünyasının zihni ve ameli diriliş yollarını gösteren manifesto niteliğindeki kitap.',
        totalPages: 140
      }
    ]
  },
  {
    id: 'cemil-meric',
    name: 'Cemil Meriç',
    title: 'Fikir Çilesinin ve Kültür Hafızasının Abidesi',
    avatarUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=300&auto=format&fit=crop',
    bio: 'Kütüphanelerin içinde bir ömür tüketen, Türk aydınının Doğu-Batı krizini cesaretle kaleme alan mütefekkir.',
    quote: 'Kamus bir milletin namusudur.',
    topBooks: [
      {
        title: 'Bu Ülke',
        category: 'Kültür, Sanat ve Medeniyet',
        coverUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop',
        description: 'Yerli düşüncenin nirengi noktası; aydın krizleri, kültür ve dil muhasebesi.',
        totalPages: 340
      },
      {
        title: 'Jurnal (1. ve 2. Cilt)',
        category: 'Biyografi ve Hatırat',
        coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop',
        description: 'Üstadın hususi dünyasına, entelektüel fırtınalarına tanıklık eden itiraflar.',
        totalPages: 480
      },
      {
        title: 'Mağara Dışındakiler',
        category: 'Felsefe',
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop',
        description: 'Aydın sosyolojisi ve Batılılaşma illüzyonlarının eleştirel incelemesi.',
        totalPages: 360
      },
      {
        title: 'Kırk Ambar',
        category: 'Kültür, Sanat ve Medeniyet',
        coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600&auto=format&fit=crop',
        description: 'Doğu ve Batı klasiklerinin derinlemesine kültür ve edebiyat hazinesi.',
        totalPages: 450
      }
    ]
  },
  {
    id: 'gazali',
    name: 'İmâm-ı Gazâlî',
    title: 'Hüccetü\'l-İslâm ve Hakikat Arayıcısı',
    avatarUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop',
    bio: 'İslam ilimlerinde fıkıh, kelam, felsefe ve tasavvufu harmanlayarak akıl ile kalbi buluşturan büyük imam.',
    quote: 'İlmin meyvesi tefekkür ve güzel ahlaktır.',
    topBooks: [
      {
        title: 'İhyâu \'Ulûmi\'d-Dîn (1. Cilt)',
        category: 'Din ve İlahiyat',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
        description: 'İbadetlerin içsel sırları ve ahlaki dönüşümün 4 ciltlik şaheserinin 1. cildi.',
        totalPages: 520,
        isMultiVolume: true,
        volumeNumber: 1
      },
      {
        title: 'El-Munkızu mine\'d-Dalâl',
        category: 'Felsefe',
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop',
        description: 'Gazâli\'nin kendi entelektüel krizini ve hakikate ulaşma yolculuğunu anlattığı otobiyografi.',
        totalPages: 160
      },
      {
        title: 'Kimyâ-yı Saâdet',
        category: 'Din ve İlahiyat',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
        description: 'İnsanın kendini bilmesi, Rabbini tanıması ve ebedi saadet ilkeleri.',
        totalPages: 410
      },
      {
        title: 'Tehâfütü\'l-Felâsife',
        category: 'Felsefe',
        coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop',
        description: 'Felsefecilerin meşşai tutarsızlıklarına karşı kaleme alınan eleştirel felsefe klasiği.',
        totalPages: 290
      }
    ]
  }
];

export const TodayView: React.FC = () => {
  const { 
    userBooks, 
    userProfile, 
    readingSessions, 
    updateBookProgress, 
    updateBookStatus,
    setActiveBookForReader,
    setActiveTab,
    addBookToLibrary,
    quranProgress,
    updateQuranProgress,
    setExploreSubTab,
    setSelectedBookForDetail
  } = useApp();

  const [selectedBookForUpdate, setSelectedBookForUpdate] = useState<UserBook | null>(null);
  const [inputPage, setInputPage] = useState<number>(0);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Active Featured Author Index state for "Yazarı Değiştir 🔄" feature
  const [authorIndex, setAuthorIndex] = useState<number>(0);
  const [addedBookTitle, setAddedBookTitle] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeFeaturedAuthor = FEATURED_AUTHORS[authorIndex % FEATURED_AUTHORS.length];

  const handleNextAuthor = () => {
    setAuthorIndex(prev => (prev + 1) % FEATURED_AUTHORS.length);
  };

  const handleAddRecommendedBook = (book: { title: string; category: string; coverUrl: string; description: string; totalPages: number; isMultiVolume?: boolean; volumeNumber?: number }, authorName: string) => {
    addBookToLibrary({
      title: book.title,
      author: authorName,
      category: book.category,
      publisher: 'Klasik Yayınları',
      totalPages: book.totalPages,
      currentPage: 0,
      coverUrl: book.coverUrl,
      description: book.description,
      status: 'reading',
      isMultiVolume: book.isMultiVolume,
      volumeNumber: book.volumeNumber || 1
    });
    setAddedBookTitle(book.title);
    setTimeout(() => setAddedBookTitle(null), 2500);
  };

  // Currently reading books
  const activeBooks = userBooks.filter(b => b.status === 'reading');

  // Calculate Today's Reading Stats from sessions
  const todaySessions = readingSessions.filter(s => s.date === todayStr);

  const singleVolumePagesToday = todaySessions
    .filter(s => !s.isMultiVolume)
    .reduce((acc, curr) => acc + curr.pagesRead, 0);

  const multiVolumePagesToday = todaySessions
    .filter(s => s.isMultiVolume)
    .reduce((acc, curr) => acc + curr.pagesRead, 0);

  const totalPagesToday = singleVolumePagesToday + multiVolumePagesToday;
  const targetTotal = userProfile.dailyTargetPages || 40;
  const targetSingle = userProfile.singleVolumeTargetPages || 20;
  const targetMulti = userProfile.multiVolumeTargetPages || 20;

  const totalPercentage = Math.min(100, Math.round((totalPagesToday / targetTotal) * 100));
  const singlePercentage = Math.min(100, Math.round((singleVolumePagesToday / targetSingle) * 100));
  const multiPercentage = Math.min(100, Math.round((multiVolumePagesToday / targetMulti) * 100));

  // Calendar Sessions for selected date
  const selectedDateSessions = readingSessions.filter(s => s.date === selectedCalendarDate);
  const selectedDateTotalPages = selectedDateSessions.reduce((sum, s) => sum + s.pagesRead, 0);

  // Statistics calculation
  const totalCompletedBooks = userBooks.filter(b => b.status === 'completed').length;
  
  // Weekly page calculation (last 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pagesThisWeek = readingSessions
    .filter(s => new Date(s.date) >= weekAgo)
    .reduce((acc, curr) => acc + curr.pagesRead, 0);

  const handleOpenPageUpdateModal = (book: UserBook) => {
    setSelectedBookForUpdate(book);
    setInputPage(book.currentPage);
  };

  const handleSavePageUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookForUpdate) {
      updateBookProgress(selectedBookForUpdate.id, inputPage);
      setSelectedBookForUpdate(null);
    }
  };

  // Past 14 days calendar generator
  const calendarDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dStr = d.toISOString().split('T')[0];
    const daySessions = readingSessions.filter(s => s.date === dStr);
    const dayPages = daySessions.reduce((acc, curr) => acc + curr.pagesRead, 0);
    return {
      date: dStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
      pages: dayPages,
      isToday: dStr === todayStr
    };
  });

  // Daily wisdom rotation (Hadis, Özlü Söz, Şiir, Veciz Söz, Kelâm-ı Kibâr)
  const initialWisdom = getWisdomForDate();
  const [wisdomIndex, setWisdomIndex] = useState<number>(() => {
    const idx = DAILY_WISDOMS.findIndex(w => w.id === initialWisdom.id);
    return idx >= 0 ? idx : 0;
  });
  const [isWisdomCopied, setIsWisdomCopied] = useState<boolean>(false);

  const activeWisdom = DAILY_WISDOMS[wisdomIndex] || initialWisdom;

  const handleNextWisdom = () => {
    setWisdomIndex(prev => (prev + 1) % DAILY_WISDOMS.length);
  };

  const handleCopyWisdom = () => {
    const textToCopy = `"${activeWisdom.text}" — ${activeWisdom.source || 'Anonim'}`;
    navigator.clipboard.writeText(textToCopy);
    setIsWisdomCopied(true);
    setTimeout(() => setIsWisdomCopied(false), 2000);
  };

  const wisdomTypeLabels: Record<DailyWisdom['type'], string> = {
    'Hadis-i Şerif': 'Günün Hadis-i Şerifi',
    'Özlü Söz': 'Günün Özlü Sözü',
    'Kısa Şiir': 'Günün Hikmetli Mısrası',
    'Veciz Söz': 'Günün Veciz Sözü',
    'Kelâm-ı Kibâr': 'Günün Kelâm-ı Kibârı'
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#742C3C] to-[#4B1E2B] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#B79A63]/20 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B79A63] mb-1">
              <Flame className="w-4 h-4 fill-current" />
              <span>Günlük Okuma Merkezim</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif-title font-bold text-white">
              Hoş Geldiniz, {userProfile.displayName}
            </h1>

            {/* Daily Wisdom Card (Hadis, Özlü Söz, Şiir, Veciz Söz, Kelâm-ı Kibâr) */}
            <div className="mt-3 max-w-xl bg-black/25 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 space-y-2 relative group shadow-inner">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B79A63] text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Quote className="w-3 h-3 fill-current" />
                  <span>{wisdomTypeLabels[activeWisdom.type] || 'Günün Hikmetli Sözü'}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyWisdom}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                    title="Alıntıyı Kopyala"
                  >
                    {isWisdomCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleNextWisdom}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors cursor-pointer"
                    title="Farklı Hikmetli Söz Göster 🔄"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs md:text-sm text-white/95 font-serif italic leading-relaxed pt-0.5">
                "{activeWisdom.text}"
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                <span className="text-white/60 text-[10px] font-mono">
                  {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="font-semibold text-[#B79A63] font-serif">
                  — {activeWisdom.source || 'Anonim'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {/* Elegant Green Quran Direct Access Button */}
            <button
              onClick={() => {
                setExploreSubTab('quran');
                setActiveTab('explore');
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-[#044B35] hover:from-emerald-500 hover:to-emerald-800 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all border border-emerald-400/40 active:scale-95 cursor-pointer"
              title="Kur'an-ı Kerim Bölümüne Doğrudan Git"
            >
              <BookOpen className="w-4 h-4 text-emerald-200" />
              <span>📖 Kur'an-ı Kerim</span>
            </button>

            <button 
              onClick={() => setActiveTab('explore')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#B79A63] hover:bg-[#a38752] text-slate-900 font-semibold text-xs transition-colors shadow-lg cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Katalog Keşfi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quran Reading & Progress Banner on Today View */}
      <div className="bg-gradient-to-r from-[#044B35] via-[#0D5C46] to-[#044B35] text-white rounded-3xl p-6 shadow-xl border border-[#D4AF37]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-slate-900 font-bold text-[10px]">
              Kur'an-ı Kerim İlerlemesi
            </span>
            <span className="text-xs text-[#D4AF37] font-semibold">1 Hizb / Gün Hedefi</span>
          </div>
          <h2 className="font-serif-title font-bold text-2xl text-white">
            Bugün Okunan Kur'an: {quranProgress.pagesReadToday || 0} Sayfa
          </h2>
          <p className="text-xs text-white/80 max-w-md">
            Kitap okuma hedefinizden bağımsız hesaplanır. Tamamlanan Cüz: <strong>{quranProgress.completedJuzs?.length || 0} / 30</strong> (%{Math.round(((quranProgress.completedJuzs?.length || 0) / 30) * 100)})
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => updateQuranProgress({ pagesReadToday: (quranProgress.pagesReadToday || 0) + 1 })}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
          >
            +1 Sayfa Ekle
          </button>

          <button
            onClick={() => {
              setExploreSubTab('quran');
              setActiveTab('explore');
            }}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#b89528] text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Kur'an Oku & Dinle →</span>
          </button>
        </div>
      </div>

      {/* 40-Page Target Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Compact & Elegant Target Progress */}
        <div className="lg:col-span-1 bg-white dark:bg-[#1E1E1E] rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title font-bold text-base text-[#742C3C] dark:text-[#B79A63] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#B79A63]" />
              <span>Günlük Hedef (40 Sayfa)</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63]">
              %{totalPercentage}
            </span>
          </div>

          {/* Compact Linear Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400">Bugünkü İlerleme</span>
              <span className="text-[#742C3C] dark:text-[#B79A63] font-bold text-sm">{totalPagesToday} <span className="text-xs font-normal text-slate-500">/ {targetTotal} syf</span></span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden p-0.5 border border-black/5">
              <div 
                className="bg-gradient-to-r from-[#742C3C] to-[#B79A63] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${totalPercentage}%` }}
              />
            </div>
          </div>

          {/* Compact Sub Breakdown */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-black/5 dark:border-white/5 text-[11px]">
            <div className="p-2.5 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] space-y-1">
              <span className="text-slate-500 block truncate">Tek Ciltli (4 Kitap)</span>
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>{singleVolumePagesToday} syf</span>
                <span className="text-[#742C3C] dark:text-[#B79A63]">%{singlePercentage}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] space-y-1">
              <span className="text-slate-500 block truncate">Çok Ciltli (1 Cilt)</span>
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>{multiVolumePagesToday} syf</span>
                <span className="text-[#B79A63]">%{multiPercentage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currently Reading Books Carousel / Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-md border border-black/5 dark:border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#B79A63]" />
              <span>Şu An Okuduklarım ({activeBooks.length})</span>
            </h3>
            <button 
              onClick={() => setActiveTab('library')}
              className="text-xs font-semibold text-[#742C3C] dark:text-[#B79A63] hover:underline flex items-center gap-1"
            >
              <span>Kütüphaneme Git</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeBooks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <BookOpen className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm">Şu an aktif okuduğunuz kitap bulunmuyor.</p>
              <button
                onClick={() => setActiveTab('library')}
                className="mt-3 px-4 py-2 rounded-xl bg-[#742C3C] text-white text-xs font-semibold"
              >
                Kütüphaneden Kitap Seç
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBooks.map(book => {
                const bookProgress = Math.round((book.currentPage / book.totalPages) * 100);
                return (
                  <div 
                    key={book.id}
                    onClick={() => setSelectedBookForDetail(book)}
                    className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 flex gap-4 items-center group hover:shadow-md transition-all cursor-pointer"
                    title="Kitap detayları, okuma durumu ve seçenekler için tıklayın"
                  >
                    {/* Book Cover with Fallback */}
                    <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 book-shadow relative">
                      <BookCoverImage 
                        src={book.coverUrl} 
                        alt={book.title} 
                        title={book.title}
                        author={book.author}
                        category={book.category}
                        isMultiVolume={book.isMultiVolume}
                        volumeNumber={book.volumeNumber}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="font-serif-title font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{book.author}</p>
                      
                      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <span>{book.currentPage} / {book.totalPages} syf</span>
                        <span>%{bookProgress}</span>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#742C3C] dark:bg-[#B79A63] h-full rounded-full" 
                          style={{ width: `${bookProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setActiveBookForReader(book)}
                          className="px-2.5 py-1 rounded-md bg-[#742C3C] text-white text-[11px] font-semibold hover:bg-[#4B1E2B] transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Okumaya Devam</span>
                        </button>

                        <button
                          onClick={() => handleOpenPageUpdateModal(book)}
                          className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 text-slate-700 dark:text-slate-300"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sayfa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SMART AI BOOK RECOMMENDATIONS */}
      <SmartBookRecommendations />

      {/* FEATURED MONTHLY AUTHOR & POPULAR 4 WORKS (Bulunduğumuz Ay Okuma Önerileri) */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 shadow-md border border-black/5 dark:border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B79A63] mb-1">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Bulunduğumuz Ay İçin Okuma Önerileri & Öne Çıkan Yazar</span>
            </div>
            <h2 className="font-serif-title font-bold text-xl md:text-2xl text-[#742C3C] dark:text-[#B79A63]">
              Ayın Popüler Yazarı: {activeFeaturedAuthor.name}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {activeFeaturedAuthor.title} — 1 Çok Ciltli Eser ve 4 Popüler Tek Ciltli Kitap Önerisi
            </p>
          </div>

          {/* Yazarı Değiştir 🔄 Button */}
          <button
            onClick={handleNextAuthor}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
            title="Farklı bir öneri yazarı göster"
          >
            <RefreshCw className="w-4 h-4 text-slate-950 animate-spin-once" />
            <span>Yazarı Değiştir 🔄</span>
          </button>
        </div>

        {/* Author Quote & Bio Banner */}
        <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#B79A63] shadow-md bg-[#742C3C] text-white flex items-center justify-center font-bold font-serif-title text-xl">
            {activeFeaturedAuthor.name[0]}
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <p className="font-serif italic text-sm text-[#742C3C] dark:text-[#B79A63] font-bold">
              "{activeFeaturedAuthor.quote}"
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {activeFeaturedAuthor.bio}
            </p>
          </div>
        </div>

        {/* 4 Popular Books Grid with Covers & 1-Click Kütüphaneme Ekle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeFeaturedAuthor.topBooks.map((book, idx) => {
            const isAdded = userBooks.some(b => b.title.toLowerCase() === book.title.toLowerCase());
            return (
              <div 
                key={idx}
                className="bg-[#F8F5EF] dark:bg-[#141414] rounded-2xl p-4 border border-black/5 dark:border-white/5 flex flex-col justify-between group hover:shadow-lg transition-all"
              >
                <div className="space-y-3">
                  {/* Book Cover */}
                  <div className="w-full aspect-[2/3] rounded-xl overflow-hidden book-shadow relative">
                    <BookCoverImage
                      src={book.coverUrl}
                      alt={book.title}
                      title={book.title}
                      author={activeFeaturedAuthor.name}
                      category={book.category}
                      isMultiVolume={book.isMultiVolume}
                      volumeNumber={book.volumeNumber}
                    />
                  </div>

                  {/* Book Title & Category */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#B79A63]">
                      {book.category} {book.isMultiVolume ? '· Çok Ciltli' : '· Tek Ciltli'}
                    </span>
                    <h4 className="font-serif-title font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-[#742C3C] dark:group-hover:text-[#B79A63]">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {book.description}
                    </p>
                  </div>
                </div>

                {/* Add to library button */}
                <button
                  onClick={() => handleAddRecommendedBook(book, activeFeaturedAuthor.name)}
                  className={`w-full mt-4 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    isAdded || addedBookTitle === book.title
                      ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#742C3C] hover:bg-[#4B1E2B] text-white shadow-rose-900/20'
                  }`}
                  title={isAdded ? 'Kütüphanede Mevcut' : 'Kütüphaneye Ekle'}
                >
                  {isAdded || addedBookTitle === book.title ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kütüphanemde</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#B79A63]" />
                      <span>Kütüphaneme Ekle</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reading Calendar & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Strip */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-md border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#B79A63]" />
              <span>Okuma Takvimi ve Günlük Kayıtlar</span>
            </h3>
            <span className="text-xs text-slate-500">Son 14 Gün</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin">
            {calendarDays.map((cd, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCalendarDate(cd.date)}
                className={`flex-1 min-w-[54px] p-2.5 rounded-2xl flex flex-col items-center justify-between border transition-all ${
                  selectedCalendarDate === cd.date
                    ? 'bg-[#742C3C] text-white border-[#742C3C] shadow-md scale-105'
                    : cd.pages > 0
                    ? 'bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63] border-[#742C3C]/20'
                    : 'bg-[#F8F5EF] dark:bg-[#141414] text-slate-600 dark:text-slate-400 border-transparent'
                }`}
              >
                <span className="text-[10px] font-medium uppercase">{cd.dayName}</span>
                <span className="text-base font-bold my-1">{cd.dayNum}</span>
                <span className="text-[10px] font-semibold">{cd.pages > 0 ? `${cd.pages} syf` : '-'}</span>
              </button>
            ))}
          </div>

          {/* Details for Selected Date */}
          <div className="mt-4 p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#742C3C] dark:text-[#B79A63]">
                {selectedCalendarDate === todayStr ? 'Bugünkü Okumalarınız' : `${selectedCalendarDate} Okuma Detayı`}
              </span>
              <span className="text-xs font-bold bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63] px-2 py-0.5 rounded">
                Toplam: {selectedDateTotalPages} Sayfa
              </span>
            </div>

            {selectedDateSessions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">Bu tarihte henüz okuma kaydı bulunmuyor.</p>
            ) : (
              <div className="space-y-2">
                {selectedDateSessions.map(sess => (
                  <div key={sess.id} className="flex justify-between items-center text-xs py-1 border-b border-black/5 dark:border-white/5 last:border-0">
                    <span className="font-serif-title font-medium truncate max-w-[240px]">{sess.bookTitle}</span>
                    <span className="font-semibold text-[#742C3C] dark:text-[#B79A63]">+{sess.pagesRead} sayfa</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Key Statistics Summary */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-md border border-black/5 dark:border-white/5 flex flex-col justify-between">
          <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63] flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <span>Okuma İstatistikleri</span>
          </h3>

          <div className="space-y-3.5">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Tamamlanan Kitaplar</p>
                <p className="text-xl font-bold font-serif-title text-emerald-950 dark:text-white">{totalCompletedBooks} Eser</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
              <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">Bu Hafta Okunan</p>
                <p className="text-xl font-bold font-serif-title text-indigo-950 dark:text-white">{pagesThisWeek} Sayfa</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20">
              <div className="p-3 rounded-xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Hedef İlerleme Başarısı</p>
                <p className="text-xl font-bold font-serif-title text-amber-950 dark:text-white">%{totalPercentage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Update Modal */}
      {selectedBookForUpdate && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-black/10 dark:border-white/10">
            <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63] mb-1">
              Sayfa İlerlemesini Güncelle
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedBookForUpdate.title}</p>

            <form onSubmit={handleSavePageUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Kalınan Sayfa (Toplam: {selectedBookForUpdate.totalPages})</label>
                <input 
                  type="number"
                  min={1}
                  max={selectedBookForUpdate.totalPages}
                  value={inputPage}
                  onChange={e => setInputPage(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center font-bold text-lg focus:outline-none focus:ring-1 focus:ring-[#742C3C]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookForUpdate(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800 hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#742C3C] text-white hover:bg-[#4B1E2B]"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
