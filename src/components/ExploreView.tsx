import React, { useState, useMemo } from 'react';
import { 
  Compass, Search, Filter, BookPlus, UserCheck, Feather, GraduationCap, 
  ChevronRight, ChevronDown, Check, Sparkles, BookOpen, User, Copy, Quote, Heart, ArrowRight, Library, Volume2, Calendar, Award, CheckCircle2, Play, Download, Image as ImageIcon, X, RefreshCw 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CatalogBook, Poet, Poem } from '../types';
import { 
  MAIN_CATEGORIES, 
  generateFull1024Catalog, 
  FULL_FOUR_YEAR_CURRICULUM, 
  CurriculumMonthData, 
  CurriculumWeeklyBook 
} from '../data/catalogData';

import { getFull256PoetryCollection } from '../data/poetryData';
import { QuranSection } from './QuranSection';
import { PoemPosterModal } from './PoemPosterModal';
import { BookCoverImage } from './BookCoverImage';

// Avatar component with graceful fallback to initials badge
const PoetAvatar: React.FC<{ name: string; portraitUrl?: string }> = ({ name, portraitUrl }) => {
  const [imgError, setImgError] = useState(false);

  if (!portraitUrl || imgError) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#742C3C] to-[#4B1E2B] text-[#B79A63] border-2 border-[#B79A63] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
        {initials}
      </div>
    );
  }

  return (
    <img 
      src={portraitUrl} 
      alt={name} 
      onError={() => setImgError(true)}
      className="w-12 h-12 rounded-full object-cover border-2 border-[#B79A63] shrink-0 shadow-sm"
      referrerPolicy="no-referrer"
    />
  );
};

export const ExploreView: React.FC = () => {
  const { userBooks, addBookToLibrary, deleteBookFromLibrary, addQuotation, setActiveBookForReader, exploreSubTab, setExploreSubTab } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const itemsPerPage = 24;

  // Selected Detail States
  const [selectedPoet, setSelectedPoet] = useState<Poet | null>(null);
  const [selectedPoem, setSelectedPoem] = useState<{ poem: Poem; poetName: string } | null>(null);
  const [showPosterModal, setShowPosterModal] = useState<{ poem: Poem; poetName: string } | null>(null);
  const [addedSuccessBookId, setAddedSuccessBookId] = useState<string | null>(null);

  // Accordion Expand/Collapse States for 4-Year Curriculum (Year -> Month -> Week)
  const [expandedYears, setExpandedYears] = useState<number[]>([1]); // Default Year 1 open
  const [expandedMonths, setExpandedMonths] = useState<string[]>(['1-1']); // Default Year 1 - Month 1 open
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>(['1-1-1']); // Default Year 1 - Month 1 - Week 1 open

  // Load 1024 works catalog lazily
  const fullCatalog = useMemo(() => generateFull1024Catalog(), []);

  // Load 256 poems collection
  const fullPoetryCollection = useMemo(() => getFull256PoetryCollection(), []);

  // Count total poems
  const totalPoemsCount = useMemo(() => {
    return fullPoetryCollection.reduce((acc, poet) => acc + poet.poems.length, 0);
  }, [fullPoetryCollection]);

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    return fullCatalog.filter(book => {
      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.description.toLowerCase().includes(q) ||
          book.subCategory.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [fullCatalog, selectedCategory, searchQuery]);

  // Paginated catalog slice
  const totalPagesCount = Math.ceil(filteredCatalog.length / itemsPerPage);
  const paginatedCatalog = useMemo(() => {
    const start = (currentPageNum - 1) * itemsPerPage;
    return filteredCatalog.slice(start, start + itemsPerPage);
  }, [filteredCatalog, currentPageNum]);

  // Accordion Toggles
  const toggleYearAccordion = (yearNum: number) => {
    if (expandedYears.includes(yearNum)) {
      setExpandedYears(expandedYears.filter(y => y !== yearNum));
    } else {
      setExpandedYears([...expandedYears, yearNum]);
    }
  };

  const toggleMonthAccordion = (monthKey: string) => {
    if (expandedMonths.includes(monthKey)) {
      setExpandedMonths(expandedMonths.filter(m => m !== monthKey));
    } else {
      setExpandedMonths([...expandedMonths, monthKey]);
    }
  };

  const toggleWeekAccordion = (weekKey: string) => {
    if (expandedWeeks.includes(weekKey)) {
      setExpandedWeeks(expandedWeeks.filter(w => w !== weekKey));
    } else {
      setExpandedWeeks([...expandedWeeks, weekKey]);
    }
  };

  const handleToggleCurriculumBook = (catBook: CatalogBook | CurriculumWeeklyBook) => {
    const existing = userBooks.find(b => b.title.toLowerCase() === catBook.title.toLowerCase());
    
    // The user wants "Add to Library" to always move the book to the top.
    // If it's already there, calling addBookToLibrary will refresh its timestamp and position.
    // We only remove if specifically toggling a book that IS already there in a way that implies removal.
    // However, to satisfy "move to top", we should call addBookToLibrary.
    
    addBookToLibrary({
      title: catBook.title,
      author: catBook.author,
      category: catBook.category,
      publisher: 'Klasik Yayınları',
      totalPages: catBook.totalPages || 280,
      currentPage: existing ? existing.currentPage : 0,
      coverUrl: catBook.coverUrl,
      description: catBook.description,
      status: existing ? existing.status : 'reading',
      isMultiVolume: catBook.isMultiVolume,
      volumeNumber: (catBook as CurriculumWeeklyBook).volumeNumber || 1
    });
    
    setAddedSuccessBookId(catBook.title);
    setTimeout(() => setAddedSuccessBookId(null), 2500);
  };

  const handleAddCatalogBookToLibrary = (catBook: CatalogBook | CurriculumWeeklyBook) => {
    // Standard addition that moves to top
    addBookToLibrary({
      title: catBook.title,
      author: catBook.author,
      category: catBook.category,
      publisher: 'Klasik Yayınları',
      totalPages: catBook.totalPages || 280,
      currentPage: 0,
      coverUrl: catBook.coverUrl,
      description: catBook.description,
      status: 'reading',
      isMultiVolume: catBook.isMultiVolume,
      volumeNumber: (catBook as CurriculumWeeklyBook).volumeNumber || 1
    });
    setAddedSuccessBookId(catBook.title);
    setTimeout(() => setAddedSuccessBookId(null), 2500);
  };

  const handleRemoveWholeYear = (yearNumber: number) => {
    const targetYear = FULL_FOUR_YEAR_CURRICULUM.find(y => y.yearNumber === yearNumber);
    if (!targetYear) return;
    const yearTitles = new Set(
      targetYear.months.flatMap(m => m.weeklyBooks.map(wb => wb.title.toLowerCase()))
    );
    const toRemove = userBooks.filter(b => yearTitles.has(b.title.toLowerCase()));
    toRemove.forEach(b => deleteBookFromLibrary(b.id));
  };

  // Calculate overall 4-year curriculum completion stats
  const totalCurriculumBooksCount = FULL_FOUR_YEAR_CURRICULUM.reduce((accYear, year) => {
    return accYear + year.months.reduce((accMonth, month) => accMonth + month.weeklyBooks.length, 0);
  }, 0);

  const completedCurriculumBooks = userBooks.filter(userBook => {
    if (userBook.status !== 'completed') return false;
    return FULL_FOUR_YEAR_CURRICULUM.some(year => 
      year.months.some(month => 
        month.weeklyBooks.some(wb => wb.title.toLowerCase() === userBook.title.toLowerCase())
      )
    );
  }).length;

  const curriculumCompletionPercent = Math.round((completedCurriculumBooks / Math.max(1, totalCurriculumBooksCount)) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Navigation Toggles */}
      <div className="bg-gradient-to-r from-[#742C3C] via-[#4B1E2B] to-[#141414] text-white rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B79A63] mb-1">
              <Compass className="w-4 h-4" />
              <span>Entelektüel Keşif & İlim Portalı</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif-title font-bold">
              Eser, Kur'an ve Şiir Keşfi
            </h1>
            <p className="text-xs md:text-sm opacity-80 mt-1 max-w-xl">
              Kur'an-ı Kerim okuma ve tefsir portalı, 1024 eserlik öneri kataloğu ve 4 yıllık ilim yolculuğu müfredatı.
            </p>
          </div>

          {/* Sub Navigation Segmented Control - Responsive Grid Layout */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl w-full sm:w-auto shrink-0">
            <button
              onClick={() => setExploreSubTab('curriculum')}
              className={`px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                exploreSubTab === 'curriculum'
                  ? 'bg-[#B79A63] text-slate-900 shadow-md scale-102'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">İlim Yolculuğum</span>
            </button>

            <button
              onClick={() => setExploreSubTab('quran')}
              className={`px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                exploreSubTab === 'quran'
                  ? 'bg-emerald-600 text-white shadow-md scale-102'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Kur'an-ı Kerim</span>
            </button>

            <button
              onClick={() => setExploreSubTab('catalog')}
              className={`px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                exploreSubTab === 'catalog'
                  ? 'bg-[#B79A63] text-slate-900 shadow-md scale-102'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Library className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">1024 Kataloğu</span>
            </button>

            <button
              onClick={() => setExploreSubTab('poets')}
              className={`px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                exploreSubTab === 'poets'
                  ? 'bg-[#B79A63] text-slate-900 shadow-md scale-102'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Feather className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{totalPoemsCount} Şiir</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. CURRICULUM VIEW (İlim Yolculuğum - Accordion) */}
      {exploreSubTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 shadow-sm border border-black/5 dark:border-white/5 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-6">
              <div>
                <h2 className="font-serif-title font-bold text-xl md:text-2xl text-[#742C3C] dark:text-[#B79A63] flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-[#B79A63]" />
                  <span>İlim Yolculuğum (40 Yıllık Okuma Müfredatı)</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Klasik ve modern ilim hayatının temel taşlarını kapsayan 40 Yıllık (1024 Eser) sistematik okuma müfredatı ve ilim rehberi.
                </p>
              </div>

              {/* Progress Summary Card */}
              <div className="bg-[#F8F5EF] dark:bg-[#141414] p-4 rounded-2xl border border-black/5 dark:border-white/5 flex items-center gap-4 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-[#742C3C] text-white flex items-center justify-center font-bold text-sm shadow-md">
                  %{curriculumCompletionPercent}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B79A63] tracking-wider block">Müfredat İlerlemesi</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {completedCurriculumBooks} / {totalCurriculumBooksCount} Eser Tamamlandı
                  </span>
                </div>
              </div>
            </div>

            {/* Hierarchical Accordion View */}
            <div className="space-y-4">
              {FULL_FOUR_YEAR_CURRICULUM.map(year => {
                const isYearOpen = expandedYears.includes(year.yearNumber);
                return (
                  <div 
                    key={year.yearNumber}
                    className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden bg-[#F8F5EF]/50 dark:bg-[#141414]/50 transition-all"
                  >
                    {/* Year Accordion Header */}
                    <div className="w-full p-4 md:p-5 flex items-center justify-between bg-white dark:bg-[#1E1E1E] hover:bg-[#F8F5EF] dark:hover:bg-[#181818] transition-colors">
                      <div 
                        onClick={() => toggleYearAccordion(year.yearNumber)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#742C3C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {year.yearNumber}. Yıl
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-serif-title font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 truncate">
                            {year.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{year.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* 1-Click Clear / Add Entire Year */}
                        {(() => {
                          const yearBooks = year.months.flatMap(m => m.weeklyBooks);
                          const addedCount = yearBooks.filter(wb => userBooks.some(b => b.title.toLowerCase() === wb.title.toLowerCase())).length;
                          const hasAny = addedCount > 0;

                          return (
                            <div className="flex items-center gap-2">
                              {hasAny && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`${year.yearNumber}. Yılın kütüphanenizdeki ${addedCount} eserini kütüphanenizden kaldırmak istiyor musunuz?`)) {
                                      handleRemoveWholeYear(year.yearNumber);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-500/20 transition-all flex items-center gap-1 cursor-pointer"
                                  title="Tüm Yılı Kütüphaneden Çıkar"
                                >
                                  <span>Kaldır ✕</span>
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  yearBooks.forEach(wb => {
                                    // Removed existence guard so even existing books get moved to top
                                    addBookToLibrary({
                                      title: wb.title,
                                      author: wb.author,
                                      category: wb.category,
                                      publisher: 'Klasik Yayınları',
                                      totalPages: wb.totalPages || 280,
                                      currentPage: 0,
                                      coverUrl: wb.coverUrl,
                                      description: wb.description,
                                      status: 'reading',
                                      isMultiVolume: wb.isMultiVolume,
                                      volumeNumber: wb.volumeNumber || 1
                                    });
                                  });
                                  alert(`${year.yearNumber}. Yılın tüm eserleri kütüphanenize eklendi/güncellendi ve en üste taşındı.`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#742C3C] hover:bg-[#5a222f] text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                title="Tüm Yılın Eserlerini Kütüphaneme Toplu Ekle / Güncelle"
                              >
                                <span>{hasAny ? 'Hepsini Güncelle ↑' : 'Yılı Toplu Ekle +'}</span>
                              </button>
                            </div>
                          );
                        })()}

                        <span className="text-xs font-semibold text-[#B79A63] hidden md:inline">
                          {year.months.length} Ay / {year.months.reduce((a, m) => a + m.weeklyBooks.length, 0)} Eser
                        </span>
                        <div 
                          onClick={() => toggleYearAccordion(year.yearNumber)}
                          className="cursor-pointer p-1"
                        >
                          {isYearOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Year Content (Months Accordion) */}
                    {isYearOpen && (
                      <div className="p-4 space-y-3 border-t border-black/5 dark:border-white/5">
                        {year.months.map(month => {
                          const monthKey = `${year.yearNumber}-${month.monthNumber}`;
                          const isMonthOpen = expandedMonths.includes(monthKey);
                          return (
                            <div 
                              key={monthKey}
                              className="border border-black/5 dark:border-white/5 rounded-xl bg-white dark:bg-[#1A1A1A] overflow-hidden"
                            >
                              {/* Month Accordion Header */}
                              <button
                                onClick={() => toggleMonthAccordion(monthKey)}
                                className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-[#F8F5EF] dark:hover:bg-[#222222] transition-colors text-left"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Calendar className="w-4 h-4 text-[#B79A63]" />
                                  <div>
                                    <h4 className="font-serif-title font-bold text-sm text-slate-800 dark:text-slate-200">
                                      {month.monthTitle}
                                    </h4>
                                    <p className="text-[11px] text-slate-500">Müellif: <strong>{month.authorName}</strong> · {month.authorBio}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {month.weeklyBooks.length} Hafta
                                  </span>
                                  {isMonthOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                </div>
                              </button>

                              {/* Month Content (Weekly Books List) */}
                              {isMonthOpen && (
                                <div className="p-3 md:p-4 bg-[#F8F5EF]/60 dark:bg-[#141414]/60 border-t border-black/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {month.weeklyBooks.map(wb => {
                                    const inUserLib = userBooks.some(b => b.title.toLowerCase() === wb.title.toLowerCase());
                                    const userBookObj = userBooks.find(b => b.title.toLowerCase() === wb.title.toLowerCase());
                                    const isCompleted = userBookObj?.status === 'completed';

                                    return (
                                      <div 
                                        key={wb.weekNumber}
                                        className="bg-white dark:bg-[#1E1E1E] p-3.5 rounded-xl border border-black/5 dark:border-white/5 flex gap-3 items-start justify-between shadow-xs"
                                      >
                                        <div className="flex gap-3 items-start min-w-0">
                                          <div className="w-12 h-16 rounded-md overflow-hidden bg-slate-200 shrink-0 book-shadow">
                                            <img 
                                              src={wb.coverUrl} 
                                              alt={wb.title}
                                              className="w-full h-full object-cover" 
                                              referrerPolicy="no-referrer"
                                            />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#B79A63]">
                                              <span>{wb.plannedDate}</span>
                                              <span>· {wb.category}</span>
                                            </div>
                                            <h5 className="font-serif-title font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                                              {wb.title}
                                            </h5>
                                            <p className="text-[11px] text-slate-500 truncate">{wb.author}</p>
                                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-1">{wb.description}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          {inUserLib && (
                                            <button
                                              onClick={() => deleteBookFromLibrary(userBookObj!.id)}
                                              className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all"
                                              title="Kütüphaneden Çıkar"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                          )}
                                          <button
                                            onClick={() => handleAddCatalogBookToLibrary(wb)}
                                            className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                                              isCompleted
                                                ? 'bg-emerald-500/10 text-emerald-600'
                                                : inUserLib
                                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25'
                                                : 'bg-[#742C3C] text-white hover:bg-[#4B1E2B]'
                                            }`}
                                            title={inUserLib ? 'Kütüphaneme ekle' : 'Kütüphaneye Ekle'}
                                          >
                                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : inUserLib ? <RefreshCw className="w-4 h-4" /> : <BookPlus className="w-4 h-4 text-[#B79A63]" />}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. QURAN SECTION (Kur'an-ı Kerim Portal & Meal) */}
      {exploreSubTab === 'quran' && (
        <QuranSection />
      )}

      {/* 3. CATALOG VIEW (1024 Eser) */}
      {exploreSubTab === 'catalog' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-4 md:p-6 shadow-sm border border-black/5 dark:border-white/5 space-y-4">
            {/* Search and Category Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="1024 eser içinde kitap adı, yazar veya konu ara..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPageNum(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 text-xs focus:outline-none focus:ring-1 focus:ring-[#742C3C]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setCurrentPageNum(1);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 text-xs font-semibold focus:outline-none"
              >
                <option value="all">Tüm Kategoriler ({fullCatalog.length} Eser)</option>
                {MAIN_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>Toplam <strong>{filteredCatalog.length}</strong> eser listeleniyor (Sayfa {currentPageNum} / {totalPagesCount || 1})</span>
              {selectedCategory !== 'all' && <span className="font-bold text-[#742C3C] dark:text-[#B79A63]">{selectedCategory}</span>}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {paginatedCatalog.map(catBook => {
                const inLib = userBooks.some(b => b.title.toLowerCase() === catBook.title.toLowerCase());
                return (
                  <div 
                    key={catBook.id}
                    className="bg-[#F8F5EF]/40 dark:bg-[#141414]/40 rounded-2xl p-4 border border-black/5 dark:border-white/5 flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="w-16 h-24 rounded-lg overflow-hidden book-shadow book-spine-effect shrink-0">
                          <BookCoverImage 
                            src={catBook.coverUrl} 
                            alt={catBook.title}
                            title={catBook.title}
                            author={catBook.author}
                            category={catBook.category}
                            isMultiVolume={catBook.isMultiVolume}
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="text-[10px] font-bold text-[#B79A63] uppercase tracking-wider block truncate">
                            {catBook.category}
                          </span>
                          <h4 className="font-serif-title font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                            {catBook.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{catBook.author}</p>
                          
                          {catBook.turkishAvailable && (
                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 rounded">
                              Türkçe Çevirisi Var
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {catBook.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {catBook.isMultiVolume ? `${catBook.totalVolumes} Cilt Külliyat` : `${catBook.totalPages || 280} Sayfa`}
                      </span>

                      <button
                        onClick={() => handleAddCatalogBookToLibrary(catBook)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                          addedSuccessBookId === catBook.title
                            ? 'bg-emerald-600 text-white'
                            : inLib
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            : 'bg-[#742C3C] text-white hover:bg-[#4B1E2B]'
                        }`}
                      >
                        {addedSuccessBookId === catBook.title ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Eklendi</span>
                          </>
                        ) : inLib ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Kütüphanenizde</span>
                          </>
                        ) : (
                          <>
                            <BookPlus className="w-3.5 h-3.5 text-[#B79A63]" />
                            <span>Kütüphaneme Ekle</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPagesCount > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                  disabled={currentPageNum <= 1}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1E1E1E] text-xs font-semibold border border-black/10 dark:border-white/10 disabled:opacity-40"
                >
                  Önceki
                </button>

                <span className="text-xs font-semibold px-3 py-1.5">
                  Sayfa {currentPageNum} / {totalPagesCount}
                </span>

                <button
                  onClick={() => setCurrentPageNum(prev => Math.min(totalPagesCount, prev + 1))}
                  disabled={currentPageNum >= totalPagesCount}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1E1E1E] text-xs font-semibold border border-black/10 dark:border-white/10 disabled:opacity-40"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. POETRY ARCHIVE (256 Şiir) */}
      {exploreSubTab === 'poets' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4">
              <div>
                <h2 className="font-serif-title font-bold text-xl md:text-2xl text-[#742C3C] dark:text-[#B79A63] flex items-center gap-2">
                  <Feather className="w-6 h-6 text-[#B79A63]" />
                  <span>Edebiyat ve Şiir Arşivi ({totalPoemsCount} Şiir & {fullPoetryCollection.length} Şair)</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Klasik Divan, Tasavvuf, Milli Edebiyat, İkinci Yeni ve Dünya edebiyatından 256 seçme şiir. Şiirleri okuyabilir, PNG poster olarak indirebilirsiniz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fullPoetryCollection.map(poet => (
                <div key={poet.id} className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <PoetAvatar name={poet.name} portraitUrl={poet.portraitUrl} />
                      <div>
                        <h4 className="font-serif-title font-bold text-sm text-slate-900 dark:text-slate-100">{poet.name}</h4>
                        <p className="text-[10px] font-semibold text-[#B79A63]">{poet.period}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {poet.bio}
                    </p>

                    <div className="space-y-1 pt-2 border-t border-black/5 dark:border-white/5 max-h-48 overflow-y-auto">
                      {poet.poems.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPoem({ poem: p, poetName: poet.name })}
                          className="w-full text-left p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-xs font-serif-title font-semibold flex items-center justify-between group"
                        >
                          <span className="truncate group-hover:text-[#742C3C] dark:group-hover:text-[#B79A63]">{p.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* POEM MODAL VIEW */}
      {selectedPoem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-black/10 dark:border-white/10 animate-in zoom-in-95 duration-150 my-auto">
            <div className="flex justify-between items-center mb-4 border-b border-black/5 dark:border-white/5 pb-3">
              <div>
                <h3 className="font-serif-title font-bold text-xl text-[#742C3C] dark:text-[#B79A63]">
                  {selectedPoem.poem.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500">— {selectedPoem.poetName}</p>
              </div>
              <button 
                onClick={() => setSelectedPoem(null)} 
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] font-serif-title text-sm whitespace-pre-line leading-relaxed text-slate-800 dark:text-slate-200 max-h-80 overflow-y-auto italic border border-black/5">
              {selectedPoem.poem.content}
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${selectedPoem.poem.title}\n\n${selectedPoem.poem.content}\n\n- ${selectedPoem.poetName}`);
                  alert('Şiir panoya kopyalandı!');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Kopyala</span>
              </button>

              <button
                onClick={() => {
                  setShowPosterModal(selectedPoem);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#B79A63] text-slate-900 hover:bg-[#a38752] flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>PNG Poster İndir</span>
              </button>

              <button
                onClick={() => {
                  addQuotation(selectedPoem.poem.content, 1, `Şiir: ${selectedPoem.poem.title}`, 'poet-archive', selectedPoem.poem.title, selectedPoem.poetName);
                  setSelectedPoem(null);
                  alert('Şiir alıntılarınıza eklendi!');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#742C3C] text-white hover:bg-[#4B1E2B] flex items-center justify-center gap-1.5"
              >
                <Quote className="w-3.5 h-3.5 text-[#B79A63]" />
                <span>Alıntıya Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POEM POSTER MODAL */}
      {showPosterModal && (
        <PoemPosterModal 
          poem={showPosterModal.poem}
          poetName={showPosterModal.poetName}
          onClose={() => setShowPosterModal(null)}
        />
      )}
    </div>
  );
};
