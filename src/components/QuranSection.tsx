import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Play, Pause, Volume2, Bookmark, Star, Share2, 
  Search, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, 
  Settings, MessageSquare, Compass, Award, Calendar, ExternalLink, Sliders, Moon, Sun, Info, Layers,
  Minimize2, Maximize2, Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_SURAHS, JUZ_LIST, RECITERS, fetchSurahVerses, fetchPageVerses, getGlobalAyahNumber } from '../data/quranData';
import { Ayah, Reciter, Surah } from '../types';

export const QuranSection: React.FC = () => {
  const { quranProgress, updateQuranProgress, bookmarkAyah, toggleFavoriteAyah, saveAyahNote } = useApp();

  // Navigation state
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'mushaf' | 'favorites' | 'hatim'>('surahs');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(quranProgress.lastReadSurah || 1);
  const [mushafPage, setMushafPage] = useState<number>(quranProgress.lastReadPage || 1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reader Settings
  const [fontSize, setFontSize] = useState<number>(28);
  const [quranTheme, setQuranTheme] = useState<'ivory' | 'night' | 'sepia'>('ivory');
  const [showMealInMushaf, setShowMealInMushaf] = useState<boolean>(true);

  // Verses state & loader
  const [currentVerses, setCurrentVerses] = useState<Ayah[]>([]);
  const [mushafPageVerses, setMushafPageVerses] = useState<Ayah[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(true);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);

  // Audio Reciter Player state
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [playingAyahIndex, setPlayingAyahIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isAudioMinimized, setIsAudioMinimized] = useState<boolean>(true); // Minimized by default to avoid screen overlay!
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tefsir & Note Modal state
  const [activeTefsirAyah, setActiveTefsirAyah] = useState<Ayah | null>(null);
  const [noteModalAyah, setNoteModalAyah] = useState<Ayah | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(false);

  // Load verses when Surah changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingVerses(true);
    setPlayingAyahIndex(null);

    fetchSurahVerses(selectedSurahNumber).then(verses => {
      if (isMounted) {
        setCurrentVerses(verses);
        setIsLoadingVerses(false);
        
        // Auto-play the first ayah if we just transitioned surahs
        if (autoPlayNext && verses.length > 0) {
          setAutoPlayNext(false);
          setPlayingAyahIndex(0);
          setIsPlaying(true);
          if (audioRef.current) {
            audioRef.current.src = getAudioUrl(verses[0].surahNumber, verses[0].number, verses);
            audioRef.current.play().catch(e => console.warn("Auto-play next surah error:", e));
          }
        }
      }
    });

    return () => { isMounted = false; };
  }, [selectedSurahNumber]);

  // Load verses when Mushaf Page changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPage(true);

    fetchPageVerses(mushafPage).then(verses => {
      if (isMounted) {
        setMushafPageVerses(verses);
        setIsLoadingPage(false);

        // Auto-play the first ayah of the new page if we just transitioned pages
        if (autoPlayNext && verses.length > 0) {
          setAutoPlayNext(false);
          setPlayingAyahIndex(0);
          setIsPlaying(true);
          if (audioRef.current) {
            audioRef.current.src = getAudioUrl(verses[0].surahNumber, verses[0].number, verses);
            audioRef.current.play().catch(e => console.warn("Auto-play next page error:", e));
          }
        }
      }
    });

    return () => { isMounted = false; };
  }, [mushafPage]);

  // Audio Playback handling
  const [isMushafAudioMode, setIsMushafAudioMode] = useState<boolean>(false);

  const getAudioUrl = (surahNum: number, ayahNum: number, targetVerses: Ayah[] = currentVerses) => {
    const formattedSurah = String(surahNum).padStart(3, '0');
    const formattedAyah = String(ayahNum).padStart(3, '0');

    if (selectedReciter.id === 'alafasy') {
      const ayahObj = targetVerses.find(v => v.surahNumber === surahNum && v.number === ayahNum);
      const globalNum = ayahObj?.globalNumber || getGlobalAyahNumber(surahNum, ayahNum);
      return `${selectedReciter.cdnPrefix}/${globalNum}.mp3`;
    }

    if (selectedReciter.id === 'aloosi') {
      return `${selectedReciter.cdnPrefix}/${formattedSurah}.mp3`;
    }

    return `${selectedReciter.cdnPrefix}/${formattedSurah}${formattedAyah}.mp3`;
  };

  const handlePlayAyah = (index: number, isMushafPage: boolean = false) => {
    setIsMushafAudioMode(isMushafPage);
    const verseList = isMushafPage ? mushafPageVerses : currentVerses;
    
    if (playingAyahIndex === index && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setPlayingAyahIndex(index);
      setIsPlaying(true);
      const ayah = verseList[index];
      if (ayah && audioRef.current) {
        audioRef.current.src = getAudioUrl(ayah.surahNumber, ayah.number, verseList);
        audioRef.current.playbackRate = playbackSpeed;
        
        // Resume from last position if same ayah
        if (quranProgress.lastReadSurah === ayah.surahNumber && 
            quranProgress.lastReadAyah === ayah.number && 
            quranProgress.lastAudioPosition) {
          audioRef.current.currentTime = quranProgress.lastAudioPosition;
        }

        audioRef.current.play().catch(e => console.warn("Audio play error:", e));

        // Seamless Progress Sync: Keep both Mushaf and Surah modes in perfect sync
        updateQuranProgress({
          lastReadSurah: ayah.surahNumber,
          lastReadAyah: ayah.number,
          lastReadPage: ayah.pageNumber || mushafPage
        });
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleUpdate = () => {
      // Save position occasionally to avoid excessive updates
      if (Math.floor(audio.currentTime) % 5 === 0) {
        updateQuranProgress({ lastAudioPosition: audio.currentTime });
      }
    };

    audio.addEventListener('timeupdate', handleUpdate);
    audio.addEventListener('pause', () => {
      updateQuranProgress({ lastAudioPosition: audio.currentTime });
    });

    return () => {
      audio.removeEventListener('timeupdate', handleUpdate);
      audio.removeEventListener('pause', () => {});
    };
  }, []);

  const handleAudioEnded = () => {
    const verseList = isMushafAudioMode ? mushafPageVerses : currentVerses;
    
    // 1. Logic for segmented reciters (Mishary, Maher, etc.)
    if (selectedReciter.id !== 'aloosi') {
      if (playingAyahIndex !== null && playingAyahIndex < verseList.length - 1) {
        // Continue to next ayah in current list
        const nextIdx = playingAyahIndex + 1;
        setPlayingAyahIndex(nextIdx);
        const ayah = verseList[nextIdx];
        if (audioRef.current && ayah) {
          audioRef.current.src = getAudioUrl(ayah.surahNumber, ayah.number, verseList);
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.play().catch(e => console.warn("Audio play error:", e));

          updateQuranProgress({
            lastReadSurah: ayah.surahNumber,
            lastReadAyah: ayah.number,
            lastReadPage: ayah.pageNumber || mushafPage
          });
        }
      } else {
        // Reached end of current list (Page or Surah)
        if (isMushafAudioMode && mushafPage < 604) {
          // Move to next Mushaf page
          setMushafPage(prev => prev + 1);
          setAutoPlayNext(true);
        } else if (!isMushafAudioMode && selectedSurahNumber < 114) {
          // Move to next Surah
          setSelectedSurahNumber(prev => prev + 1);
          setAutoPlayNext(true);
        } else {
          // End of Quran
          setIsPlaying(false);
          setPlayingAyahIndex(null);
        }
      }
    } 
    // 2. Logic for surah-based reciters (Abdurrahman el Ussi)
    else {
      if (!isMushafAudioMode && selectedSurahNumber < 114) {
        // Move to next surah file
        setSelectedSurahNumber(prev => prev + 1);
        setAutoPlayNext(true);
      } else {
        setIsPlaying(false);
        setPlayingAyahIndex(null);
      }
    }
  };

  const handleMarkLastRead = (surahNum: number, ayahNum: number, pageNum: number) => {
    updateQuranProgress({
      lastReadSurah: surahNum,
      lastReadAyah: ayahNum,
      lastReadPage: pageNum
    });
  };

  const handleCopyAyah = (ayah: Ayah) => {
    const text = `"${ayah.translationTurkish}"\n(${ayah.surahName} Sûresi, ${ayah.number}. Âyet - Diyanet Kur'an Yolu Meali)`;
    navigator.clipboard.writeText(text);
    setShareFeedback(`Âyet panoya kopyalandı!`);
    setTimeout(() => setShareFeedback(null), 2500);
  };

  const selectedSurahMeta = ALL_SURAHS.find(s => s.number === selectedSurahNumber) || ALL_SURAHS[0];

  const filteredSurahs = ALL_SURAHS.filter(s => 
    s.nameTurkish.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.translationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString() === searchQuery
  );

  return (
    <div className={`space-y-6 pb-24 transition-colors ${
      quranTheme === 'night' ? 'bg-[#0F1715] text-[#E0E7E5]' :
      quranTheme === 'sepia' ? 'bg-[#F4EFE6] text-[#2C261F]' :
      'bg-[#F8F6F0] text-slate-800'
    } min-h-screen p-4 md:p-6 rounded-3xl relative`}>
      
      {/* Hidden Audio Player Element */}
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
        onError={() => setIsPlaying(false)}
      />

      {/* Header Banner - Emerald & Gold Theme */}
      <div className="bg-gradient-to-r from-[#044B35] via-[#0D5C46] to-[#044B35] text-white p-6 md:p-8 rounded-3xl shadow-xl border border-[#D4AF37]/30 space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-slate-900 font-bold text-xs shadow-md">
                Kur'an-ı Kerim & Diyanet Meali
              </span>
              <span className="text-xs text-[#D4AF37] font-semibold">114 Sûre • 604 Sayfa • Diyanet Tefsiri</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif-title font-bold text-white flex items-center gap-3">
              <span>Kur'an-ı Kerim Okuma ve Hatim Portalı</span>
            </h1>
            <p className="text-xs text-white/80 max-w-xl">
              Geleneksel altın tezhipli mushaf sayfa görünümü, Diyanet Kur'an Yolu meali ve tefsiri, 5 farklı karî dinleme seçeneği.
            </p>
          </div>

          {/* Quick Return to Last Read */}
          {quranProgress.lastReadSurah && (
            <button
              onClick={() => {
                setSelectedSurahNumber(quranProgress.lastReadSurah);
                setActiveTab('surahs');
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#D4AF37] text-slate-900 font-bold text-xs hover:bg-[#b89528] transition-colors flex items-center gap-2 shadow-lg shrink-0"
            >
              <Bookmark className="w-4 h-4 fill-slate-900" />
              <span>Son Okunan: {ALL_SURAHS.find(s => s.number === quranProgress.lastReadSurah)?.nameTurkish} ({quranProgress.lastReadAyah}. Âyet)</span>
            </button>
          )}
        </div>

        {/* Navigation Sub-Tabs - Mobile Optimized Full Visibility */}
        <div className="flex overflow-x-auto gap-1.5 pt-2 border-t border-white/10 no-scrollbar text-xs font-semibold w-full pb-1">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'surahs' ? 'bg-[#D4AF37] text-slate-900 font-bold shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sûreler (114)</span>
          </button>

          <button
            onClick={() => setActiveTab('mushaf')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'mushaf' ? 'bg-[#D4AF37] text-slate-900 font-bold shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mushaf & Meal (604)</span>
          </button>

          <button
            onClick={() => setActiveTab('juz')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'juz' ? 'bg-[#D4AF37] text-slate-900 font-bold shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Cüzler (30)</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'favorites' ? 'bg-[#D4AF37] text-slate-900 font-bold shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Favoriler ({quranProgress.favoriteAyahs?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('hatim')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'hatim' ? 'bg-[#D4AF37] text-slate-900 font-bold shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Hatim (%{Math.round(((quranProgress.completedJuzs?.length || 0) / 30) * 100)})</span>
          </button>
        </div>
      </div>

      {/* Global Toast Notification */}
      {shareFeedback && (
        <div className="fixed top-6 right-6 z-50 bg-[#044B35] text-[#D4AF37] px-4 py-2.5 rounded-2xl shadow-2xl border border-[#D4AF37]/40 text-xs font-bold animate-in fade-in">
          ✔ {shareFeedback}
        </div>
      )}

      {/* TAB 1: SURAHLER & READER */}
      {activeTab === 'surahs' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Surah Selector List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Sûre adı veya No ara..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#1E1E1E] border border-black/10 text-xs font-medium"
                />
              </div>

              <div className="max-h-[600px] overflow-y-auto space-y-1 pr-1">
                {filteredSurahs.map(surah => {
                  const isSelected = surah.number === selectedSurahNumber;
                  const isLastRead = surah.number === quranProgress.lastReadSurah;

                  return (
                      <div
                        key={surah.number}
                        onClick={() => setSelectedSurahNumber(surah.number)}
                        role="button"
                        tabIndex={0}
                        className={`w-full p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#044B35] text-white shadow-md' 
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-[#D4AF37] text-slate-900' : 'bg-black/5 dark:bg-white/10 text-slate-600'
                          }`}>
                            {surah.number}
                          </div>
                          <div>
                            <p className="font-bold text-xs flex items-center gap-1.5">
                              <span>{surah.nameTurkish}</span>
                              {isLastRead && <span className="w-2 h-2 rounded-full bg-[#D4AF37]" title="Son Okunan" />}
                            </p>
                            <p className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                              {surah.translationName} • {surah.verseCount} Âyet
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSurahNumber(surah.number);
                              // Trigger play when data is ready
                              setAutoPlayNext(true);
                            }}
                            className={`p-2 rounded-lg ${isSelected ? 'bg-[#D4AF37] text-slate-900' : 'bg-black/5 dark:bg-white/10 hover:bg-[#044B35] hover:text-white'}`}
                            title="Bu Sûreyi Dinlemeye Başla"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <span className={`font-quran text-base ${isSelected ? 'text-[#D4AF37]' : 'text-[#044B35]'}`}>
                            {surah.nameArabic}
                          </span>
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 3 Columns: Active Reader Panel */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Reader Controls Bar */}
            <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#044B35] text-[#D4AF37] font-serif-title font-bold text-lg flex items-center justify-center shadow-md">
                  {selectedSurahMeta.number}
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-lg text-[#044B35] dark:text-[#D4AF37] flex items-center gap-2">
                    <span>{selectedSurahMeta.nameTurkish} Sûresi</span>
                    <span className="font-quran text-xl text-[#044B35]">{selectedSurahMeta.nameArabic}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedSurahMeta.revelationType} İnişli • {selectedSurahMeta.verseCount} Âyet • {selectedSurahMeta.juzNumber}. Cüz (Sayfa {selectedSurahMeta.startPage})
                  </p>
                </div>
              </div>

              {/* Toolbar - Responsive & Proportional */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs w-full sm:w-auto">
                <div className="flex-1 sm:flex-none flex items-center justify-between gap-2 bg-[#F8F5EF] dark:bg-[#1E1E1E] px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10">
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Yazı Boyutu</span>
                  <input
                    type="range"
                    min={20}
                    max={44}
                    value={fontSize}
                    onChange={e => setFontSize(parseInt(e.target.value, 10))}
                    className="w-16 sm:w-20 accent-[#044B35]"
                  />
                  <span className="font-bold text-[11px] whitespace-nowrap min-w-[30px] text-right">{fontSize}px</span>
                </div>

                <div className="flex-1 sm:flex-none flex bg-[#F8F5EF] dark:bg-[#1E1E1E] p-1 rounded-xl border border-black/5 dark:border-white/10 justify-between">
                  <button
                    onClick={() => setQuranTheme('ivory')}
                    className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${quranTheme === 'ivory' ? 'bg-[#044B35] text-white shadow-sm' : 'text-slate-500'}`}
                  >
                    Fildişi
                  </button>
                  <button
                    onClick={() => setQuranTheme('sepia')}
                    className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${quranTheme === 'sepia' ? 'bg-[#8C6D46] text-white shadow-sm' : 'text-slate-500'}`}
                  >
                    Sepya
                  </button>
                  <button
                    onClick={() => setQuranTheme('night')}
                    className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${quranTheme === 'night' ? 'bg-[#0F1715] text-[#D4AF37] shadow-sm' : 'text-slate-500'}`}
                  >
                    Gece
                  </button>
                </div>
              </div>
            </div>

            {/* Bismillah Header */}
            {selectedSurahNumber !== 9 && (
              <div className="text-center py-6 bg-[#044B35]/5 dark:bg-[#044B35]/20 rounded-2xl border border-[#044B35]/10">
                <p className="font-quran text-3xl text-[#044B35] dark:text-[#D4AF37]">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-xs text-slate-500 mt-2">Rahmân ve Rahîm olan Allah'ın adıyla</p>
              </div>
            )}

            {/* Verses Container */}
            {isLoadingVerses ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#044B35] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Âyet-i kerimeler ve Diyanet meali yükleniyor...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentVerses.map((ayah, index) => {
                  const isPlayingThis = playingAyahIndex === index;
                  const isFavorited = quranProgress.favoriteAyahs?.some(f => f.surahNumber === selectedSurahNumber && f.ayahNumber === ayah.number);
                  const isBookmarked = quranProgress.bookmarkedAyahs?.some(b => b.surahNumber === selectedSurahNumber && b.ayahNumber === ayah.number);
                  const hasNote = quranProgress.ayahNotes?.[`${selectedSurahNumber}_${ayah.number}`];

                  return (
                    <div 
                      key={ayah.number}
                      className={`p-6 rounded-3xl transition-all space-y-4 border ${
                        isPlayingThis 
                          ? 'bg-[#044B35]/10 border-[#044B35] shadow-lg ring-2 ring-[#D4AF37]' 
                          : 'bg-white dark:bg-[#141414] border-black/5 dark:border-white/5 hover:border-[#044B35]/30'
                      }`}
                    >
                      {/* Top Bar per Verse - Fixed Responsive Wrapping */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 border-b border-black/5 dark:border-white/5 pb-3">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="w-7 h-7 rounded-full bg-[#044B35] text-[#D4AF37] font-bold flex items-center justify-center text-xs">
                            {ayah.number}
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {selectedSurahMeta.nameTurkish} • {ayah.number}. Âyet
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Sayfa {ayah.pageNumber}</span>
                        </div>

                        {/* Action Buttons - Flex Wrap for Mobile Fit */}
                        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                          <button
                            onClick={() => handlePlayAyah(index)}
                            className={`p-2 rounded-xl transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                              isPlayingThis ? 'bg-[#044B35] text-white' : 'bg-black/5 dark:bg-white/10 hover:bg-[#044B35] hover:text-white'
                            }`}
                          >
                            {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isPlayingThis ? 'Durdur' : 'Dinle'}</span>
                          </button>

                          <button
                            onClick={() => setActiveTefsirAyah(ayah)}
                            className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-[#044B35] hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Tefsir</span>
                          </button>

                          <button
                            onClick={() => {
                              setNoteModalAyah(ayah);
                              setTempNoteText(hasNote || '');
                            }}
                            className={`p-2 rounded-xl transition-colors ${hasNote ? 'bg-amber-500/20 text-amber-600' : 'bg-black/5 dark:bg-white/10'}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleFavoriteAyah({
                              surahNumber: selectedSurahNumber,
                              ayahNumber: ayah.number,
                              textArabic: ayah.textArabic,
                              translationTurkish: ayah.translationTurkish,
                              createdAt: new Date().toISOString()
                            })}
                            className={`p-2 rounded-xl transition-colors ${isFavorited ? 'bg-amber-500 text-slate-900' : 'bg-black/5 dark:bg-white/10'}`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-slate-900' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleMarkLastRead(selectedSurahNumber, ayah.number, ayah.pageNumber)}
                            className={`p-2 rounded-xl transition-colors ${isBookmarked ? 'bg-[#D4AF37] text-slate-900 font-bold' : 'bg-black/5 dark:bg-white/10'}`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-slate-900' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleCopyAyah(ayah)}
                            className="p-2 rounded-xl bg-black/5 dark:bg-white/10"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Arabic Verse Text */}
                      <div className="text-right py-2">
                        <p 
                          className="font-quran text-[#044B35] dark:text-[#D4AF37] leading-relaxed"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {ayah.textArabic} ﴿{ayah.number}﴾
                        </p>
                      </div>

                      {/* Turkish Meal Text */}
                      <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-1">
                        <span className="text-[10px] font-bold text-[#044B35] dark:text-[#D4AF37] uppercase tracking-wider block">
                          Diyanet Kur'an Yolu Meali:
                        </span>
                        <p className="text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-serif-title">
                          {ayah.translationTurkish}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GERÇEK MUSHAF SAYFA GÖRÜNÜMÜ + DİYANET MEAL (1-604) */}
      {activeTab === 'mushaf' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-black/5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#044B35] text-[#D4AF37] font-bold flex items-center justify-center text-sm shadow">
                {mushafPage}
              </span>
              <div>
                <h3 className="font-serif-title font-bold text-lg text-[#044B35] dark:text-[#D4AF37]">
                  Orijinal Mushaf Sayfası {mushafPage} / 604
                </h3>
                <p className="text-xs text-slate-500">Geleneksel altın tezhipli çerçeve ve Diyanet Meali</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMealInMushaf(!showMealInMushaf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  showMealInMushaf ? 'bg-[#044B35] text-white' : 'bg-black/5 text-slate-600'
                }`}
              >
                {showMealInMushaf ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>Diyanet Mealini {showMealInMushaf ? 'Gizle' : 'Göster'}</span>
              </button>

              <button
                disabled={mushafPage <= 1}
                onClick={() => setMushafPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-xl bg-black/5 hover:bg-black/10 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <input
                type="number"
                min={1}
                max={604}
                value={mushafPage}
                onChange={e => setMushafPage(Math.min(604, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-16 px-2 py-1 rounded-xl bg-[#F8F6F0] dark:bg-[#1E1E1E] text-center font-bold text-sm border"
              />

              <button
                disabled={mushafPage >= 604}
                onClick={() => setMushafPage(prev => Math.min(604, prev + 1))}
                className="p-2 rounded-xl bg-black/5 hover:bg-black/10 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* REAL ORNATE MUSHAF PAGE CANVAS FRAME */}
          <div className="bg-[#FFFDF8] dark:bg-[#0D1512] rounded-3xl p-6 md:p-10 border-4 border-[#D4AF37] shadow-2xl space-y-6 relative overflow-hidden">
            {/* Tezhip Corner Ornament Accents */}
            <div className="absolute top-2 left-2 text-[#D4AF37] font-quran text-lg opacity-40">❖</div>
            <div className="absolute top-2 right-2 text-[#D4AF37] font-quran text-lg opacity-40">❖</div>
            <div className="absolute bottom-2 left-2 text-[#D4AF37] font-quran text-lg opacity-40">❖</div>
            <div className="absolute bottom-2 right-2 text-[#D4AF37] font-quran text-lg opacity-40">❖</div>

            {/* Top Page Header Banner */}
            <div className="flex justify-between items-center text-xs font-bold text-[#044B35] dark:text-[#D4AF37] border-b-2 border-[#D4AF37]/30 pb-3">
              <span>الجزء {Math.ceil(mushafPage / 20)} • Cüz {Math.ceil(mushafPage / 20)}</span>
              <span className="font-serif-title text-base font-bold text-[#044B35] dark:text-[#D4AF37]">
                القرآن الكريم — Sayfa {mushafPage}
              </span>
              <span>الحزب {Math.ceil(mushafPage / 10)} • Hizb {Math.ceil(mushafPage / 10)}</span>
            </div>

            {isLoadingPage ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Mushaf sayfası hazırlanıyor...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Full 15-Line Arabic Mushaf Page Block */}
                <div className="p-6 bg-[#F4EFE6]/40 dark:bg-black/20 rounded-2xl border border-[#D4AF37]/20">
                  <p 
                    className="font-quran text-[#044B35] dark:text-[#D4AF37] text-right leading-[2.6] selection:bg-[#D4AF37] selection:text-slate-900"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {mushafPageVerses.map(v => `${v.textArabic} ﴿${v.number}﴾ `).join('')}
                  </p>
                </div>

                {/* Diyanet Turkish Translation (Meal) per verse */}
                {showMealInMushaf && (
                  <div className="pt-4 border-t-2 border-[#D4AF37]/30 space-y-4">
                    <h4 className="font-serif-title font-bold text-lg text-[#044B35] dark:text-[#D4AF37] flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                      <span>Diyanet Kur'an Yolu Sayfa Meali (Sayfa {mushafPage}):</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mushafPageVerses.map((v, idx) => (
                        <div key={idx} className="p-3.5 bg-white dark:bg-[#141414] rounded-2xl border border-black/5 shadow-sm space-y-1">
                          <div className="flex justify-between items-center text-[11px] font-bold text-[#044B35] dark:text-[#D4AF37]">
                            <span>{v.surahName} Sûresi, {v.number}. Âyet</span>
                            <button
                              onClick={() => handlePlayAyah(idx, true)}
                              className="px-2 py-0.5 rounded bg-[#044B35] text-white text-[10px] hover:bg-[#033626]"
                            >
                              ▶ Dinle
                            </button>
                          </div>
                          <p className="text-xs font-serif-title text-slate-800 dark:text-slate-200 leading-relaxed">
                            {v.translationTurkish}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CÜZLER (30 JUZ CARDS) */}
      {activeTab === 'juz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {JUZ_LIST.map(juz => {
            const isCompleted = quranProgress.completedJuzs?.includes(juz.juzNumber);
            return (
              <div 
                key={juz.juzNumber}
                className="bg-white dark:bg-[#141414] p-5 rounded-3xl border border-black/5 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#044B35] text-[#D4AF37] font-bold text-lg flex items-center justify-center shadow-md">
                      {juz.juzNumber}
                    </div>
                    <div>
                      <h4 className="font-serif-title font-bold text-base text-[#044B35] dark:text-[#D4AF37]">
                        {juz.juzNumber}. Cüz
                      </h4>
                      <p className="text-xs text-slate-500">Sayfa {juz.startPage} - {juz.endPage} (20 Sayfa)</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const updated = isCompleted 
                        ? (quranProgress.completedJuzs || []).filter(j => j !== juz.juzNumber)
                        : [...(quranProgress.completedJuzs || []), juz.juzNumber];
                      updateQuranProgress({ completedJuzs: updated });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isCompleted ? 'bg-emerald-500 text-white shadow-md' : 'bg-black/5 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleted ? 'Tamamlandı' : 'Tamamla'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-black/5 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Başlangıç: {juz.startSurahName} Sûresi</span>
                  <button
                    onClick={() => {
                      setMushafPage(juz.startPage);
                      setActiveTab('mushaf');
                    }}
                    className="px-3 py-1 rounded-lg bg-[#044B35]/10 text-[#044B35] font-semibold text-xs hover:bg-[#044B35] hover:text-white"
                  >
                    Cüzü Oku →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: FAVORILER & NOTLAR */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <h3 className="font-serif-title font-bold text-xl text-[#044B35] dark:text-[#D4AF37]">
            Kaydedilen Favori Âyetler ({quranProgress.favoriteAyahs?.length || 0})
          </h3>

          {(!quranProgress.favoriteAyahs || quranProgress.favoriteAyahs.length === 0) ? (
            <div className="p-12 text-center bg-white dark:bg-[#141414] rounded-3xl space-y-2">
              <Star className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">Henüz favori âyet eklenmedi.</p>
              <p className="text-xs text-slate-400">Âyet okurken yıldız ikonuna tıklayarak favorilerinize kaydedebilirsiniz.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quranProgress.favoriteAyahs.map((fav, idx) => (
                <div key={idx} className="bg-white dark:bg-[#141414] p-5 rounded-3xl border border-black/5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="font-bold text-[#044B35] dark:text-[#D4AF37]">
                      {ALL_SURAHS.find(s => s.number === fav.surahNumber)?.nameTurkish} Sûresi, {fav.ayahNumber}. Âyet
                    </span>
                    <button
                      onClick={() => toggleFavoriteAyah({
                        surahNumber: fav.surahNumber,
                        ayahNumber: fav.ayahNumber,
                        textArabic: fav.textArabic,
                        translationTurkish: fav.translationTurkish,
                        createdAt: fav.createdAt
                      })}
                      className="text-rose-500 text-xs font-semibold hover:underline"
                    >
                      Kaldır
                    </button>
                  </div>
                  <p className="font-quran text-xl text-[#044B35] dark:text-[#D4AF37] text-right">{fav.textArabic}</p>
                  <p className="text-sm font-serif-title text-slate-800 dark:text-slate-200">{fav.translationTurkish}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HATİM İLERLEMESİ */}
      {activeTab === 'hatim' && (
        <div className="bg-white dark:bg-[#141414] p-6 md:p-8 rounded-3xl border border-black/5 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-[#044B35]/10 text-[#044B35] dark:text-[#D4AF37] font-bold text-xs">
                Ömür Boyu Hatim & Kur'an İlerlemesi
              </span>
              <h3 className="font-serif-title font-bold text-2xl text-slate-900 dark:text-slate-100">
                Hatim Takip Dashboard
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                Tamamladığınız cüzleri işaretleyin, günlük okunan âyet ve sayfaları takip edin.
              </p>
            </div>

            <div className="relative w-36 h-36 rounded-full bg-[#044B35]/10 flex items-center justify-center border-4 border-[#D4AF37] shadow-xl shrink-0">
              <div className="text-center space-y-0.5">
                <span className="text-2xl font-bold font-serif-title text-[#044B35] dark:text-[#D4AF37]">
                  %{Math.round(((quranProgress.completedJuzs?.length || 0) / 30) * 100)}
                </span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hatim İlerlemesi</p>
                <p className="text-[11px] font-semibold text-[#044B35] dark:text-[#D4AF37]">{quranProgress.completedJuzs?.length || 0} / 30 Cüz</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLLAPSIBLE SLEEK AUDIO PLAYER BADGE / BAR */}
      <div className="fixed bottom-20 right-4 z-40">
        {isAudioMinimized ? (
          /* Minimized Badge - NEVER blocks the screen! */
          <button
            onClick={() => setIsAudioMinimized(false)}
            className="px-4 py-2.5 rounded-full bg-[#044B35] text-white shadow-2xl border-2 border-[#D4AF37] flex items-center gap-2 hover:scale-105 transition-all text-xs font-bold"
          >
            <Volume2 className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span>Karî: {selectedReciter.name.split(' ')[0]} {isPlaying ? '▶ (Çalıyor)' : ''}</span>
            <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
          </button>
        ) : (
          /* Expanded Full Player */
          <div className="bg-[#044B35] text-white p-4 rounded-3xl shadow-2xl border-2 border-[#D4AF37] w-80 md:w-96 space-y-3 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-bold text-xs">Kur'an Dinleme Oyuncusu</span>
              </div>
              <button
                onClick={() => setIsAudioMinimized(true)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80"
                title="Küçült"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (playingAyahIndex !== null) {
                    handlePlayAyah(playingAyahIndex);
                  } else {
                    handlePlayAyah(0);
                  }
                }}
                className="w-10 h-10 rounded-full bg-[#D4AF37] text-slate-900 flex items-center justify-center font-bold shadow-lg hover:scale-105 transition-transform shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-slate-900 ml-0.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <select
                  value={selectedReciter.id}
                  onChange={e => {
                    const r = RECITERS.find(x => x.id === e.target.value);
                    if (r) setSelectedReciter(r);
                  }}
                  className="w-full px-2 py-1 rounded-xl bg-white/10 text-white text-[11px] font-semibold border border-white/20"
                >
                  {RECITERS.map(r => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-center gap-1 w-full sm:w-auto">
                <label className="text-[9px] font-bold text-white/70">Hız: {playbackSpeed}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={playbackSpeed}
                  onChange={e => {
                    const newSpeed = parseFloat(e.target.value);
                    setPlaybackSpeed(newSpeed);
                    if (audioRef.current) {
                      audioRef.current.playbackRate = newSpeed;
                    }
                  }}
                  className="w-full sm:w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TEFSİR MODAL */}
      {activeTefsirAyah && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-2xl p-6 rounded-3xl shadow-2xl space-y-4 border border-[#D4AF37]/40 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#044B35] dark:text-[#D4AF37]" />
                <h3 className="font-serif-title font-bold text-lg text-[#044B35] dark:text-[#D4AF37]">
                  Diyanet Kur'an Yolu Tefsiri ({activeTefsirAyah.surahName} Sûresi, {activeTefsirAyah.number}. Âyet)
                </h3>
              </div>
              <button onClick={() => setActiveTefsirAyah(null)} className="p-1 rounded-full hover:bg-black/5">
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-4 bg-[#F8F6F0] dark:bg-[#141414] rounded-2xl border space-y-2">
                <p className="font-quran text-xl text-[#044B35] text-right">{activeTefsirAyah.textArabic}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{activeTefsirAyah.translationTurkish}</p>
              </div>

              <div className="p-4 bg-[#044B35]/5 rounded-2xl space-y-2">
                <h4 className="font-bold text-xs text-[#044B35] dark:text-[#D4AF37] uppercase tracking-wider">
                  Diyanet Kur'an Yolu Tefsiri Açıklaması:
                </h4>
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif-title">
                  {activeTefsirAyah.tafsirTurkish}
                </p>
              </div>

              <div className="pt-2 text-center">
                <a
                  href={`https://kuran.diyanet.gov.tr/tefsir/${activeTefsirAyah.surahNumber}-surah/${activeTefsirAyah.number}-ayet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#044B35] dark:text-[#D4AF37] font-bold hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Diyanet Kur'an Portalında Tam Tefsiri İncele</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTE MODAL */}
      {noteModalAyah && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4 border border-[#D4AF37]/40">
            <h3 className="font-serif-title font-bold text-lg text-[#044B35] dark:text-[#D4AF37]">
              Âyete Özel Not Ekle: {noteModalAyah.surahName} {noteModalAyah.number}. Âyet
            </h3>

            <textarea
              rows={4}
              value={tempNoteText}
              onChange={e => setTempNoteText(e.target.value)}
              placeholder="Bu âyet hakkındaki tefekkür ve kişisel notlarınızı yazın..."
              className="w-full p-3 rounded-xl bg-[#F8F6F0] dark:bg-[#141414] border border-black/10 text-xs"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNoteModalAyah(null)}
                className="px-4 py-2 rounded-xl bg-black/5 text-xs font-semibold"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  saveAyahNote(noteModalAyah.surahNumber, noteModalAyah.number, tempNoteText);
                  setNoteModalAyah(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#044B35] text-white text-xs font-semibold"
              >
                Notu Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
