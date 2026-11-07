import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, BookOpen, Compass, Archive, User, Moon, Sun, Download, ShieldCheck, Sparkles, Plus, Quote as QuoteIcon, FileText, Star, TrendingUp, MessageSquare, X 
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { TodayView } from './components/TodayView';
import { LibraryView } from './components/LibraryView';
import { ExploreView } from './components/ExploreView';
import { ArchiveView } from './components/ArchiveView';
import { StatsView } from './components/StatsView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { ReaderModal } from './components/ReaderModal';
import { GlobalAddModals } from './components/GlobalAddModals';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BookDetailModal } from './components/BookDetailModal';
import { StandaloneWidgetView } from './components/StandaloneWidgetView';
import { MainTab } from './types';


function MainAppContent() {
  const isWidgetMode = window.location.search.includes('widget') || 
                       window.location.hash.includes('widget') || 
                       window.location.pathname.endsWith('/widget');

  if (isWidgetMode) {
    return <StandaloneWidgetView />;
  }
  const { 
    activeTab, 
    setActiveTab, 
    activeBookForReader, 
    setActiveBookForReader,
    selectedBookForDetail,
    setSelectedBookForDetail,
    updateBookProgress,
    addQuotation,
    theme,
    toggleTheme,
    notifications,
    newBadgeNotification,
    clearBadgeNotification,
    userProfile,
    setIsAddBookModalOpen,
    setIsAddQuoteModalOpen,
    setIsAddReviewModalOpen,
    setIsAddPoemModalOpen
  } = useApp();

  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#F8F5EF] dark:bg-[#141414] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-[#742C3C] selection:text-white pb-24">
      
      {/* Non-overlapping Badge Toast (Positioned safely below header, never covering buttons) */}
      <AnimatePresence>
        {newBadgeNotification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -15 }}
            className="fixed top-16 right-3 sm:right-6 z-30 flex items-center gap-2.5 bg-gradient-to-r from-[#742C3C] to-[#501e29] text-white pl-2.5 pr-2 py-1.5 rounded-full shadow-2xl border-2 border-[#B79A63] backdrop-blur-md cursor-pointer active:scale-95 transition-transform"
            title="Rozetlerinizi görmek için tıklayın"
            onClick={() => setActiveTab('profile')}
          >
            <span className="text-xl shrink-0 w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center animate-bounce">
              {newBadgeNotification.icon}
            </span>
            <div className="text-left leading-tight">
              <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wider">Rozet Kazanıldı!</span>
              <span className="text-xs font-bold text-white truncate block max-w-[140px]">{newBadgeNotification.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearBadgeNotification();
              }}
              className="p-1 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors ml-0.5"
              title="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Header Contract */}
      <header className="sticky top-0 z-40 bg-[#F8F5EF]/95 dark:bg-[#141414]/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Brand Title */}
          <div 
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <span className="font-serif-title font-bold text-base md:text-xl tracking-tight text-[#742C3C] dark:text-[#B79A63] whitespace-nowrap">
              Dijital Kütüphanem
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button 
              onClick={() => setActiveTab('today')}
              className={`hover:text-[#742C3C] dark:hover:text-[#B79A63] transition-colors whitespace-nowrap ${activeTab === 'today' ? 'text-[#742C3C] dark:text-[#B79A63] font-bold border-b-2 border-[#742C3C] dark:border-[#B79A63] pb-1' : ''}`}
            >
              Bugün
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`hover:text-[#742C3C] dark:hover:text-[#B79A63] transition-colors whitespace-nowrap ${activeTab === 'library' ? 'text-[#742C3C] dark:text-[#B79A63] font-bold border-b-2 border-[#742C3C] dark:border-[#B79A63] pb-1' : ''}`}
            >
              Kütüphanem
            </button>
            <button 
              onClick={() => setActiveTab('explore')}
              className={`hover:text-[#742C3C] dark:hover:text-[#B79A63] transition-colors whitespace-nowrap ${activeTab === 'explore' ? 'text-[#742C3C] dark:text-[#B79A63] font-bold border-b-2 border-[#742C3C] dark:border-[#B79A63] pb-1' : ''}`}
            >
              Keşfet
            </button>
            <button 
              onClick={() => setActiveTab('archive')}
              className={`hover:text-[#742C3C] dark:hover:text-[#B79A63] transition-colors whitespace-nowrap ${activeTab === 'archive' ? 'text-[#742C3C] dark:text-[#B79A63] font-bold border-b-2 border-[#742C3C] dark:border-[#B79A63] pb-1' : ''}`}
            >
              Arşiv
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`hover:text-[#742C3C] dark:hover:text-[#B79A63] transition-colors whitespace-nowrap ${activeTab === 'stats' ? 'text-[#742C3C] dark:text-[#B79A63] font-bold border-b-2 border-[#742C3C] dark:border-[#B79A63] pb-1' : ''}`}
            >
              İstatistikler
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`hover:text-[#742C3C] dark:hover:text-[#B79A63] transition-colors whitespace-nowrap ${activeTab === 'chat' ? 'text-[#742C3C] dark:text-[#B79A63] font-bold border-b-2 border-[#742C3C] dark:border-[#B79A63] pb-1' : ''}`}
            >
              Okuma Arkadaşı 🤖
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`hover:text-[#742C3C] dark:hover:text-[#B79A63] transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'text-[#742C3C] dark:text-[#B79A63] font-bold border-b-2 border-[#742C3C] dark:border-[#B79A63] pb-1' : ''}`}
            >
              Profil
            </button>
          </nav>

          {/* Right Header Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Prominent Gece / Gündüz Modu Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 shrink-0 ${
                theme === 'dark'
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 ring-2 ring-amber-300/50'
                  : 'bg-[#742C3C] text-white hover:bg-[#5a222f] ring-2 ring-rose-900/30'
              }`}
              title="Gece / Gündüz Görünüm Modunu Değiştir"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 fill-current text-slate-950 shrink-0" />
                  <span className="hidden xs:inline">Gündüz Modu ☀️</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 fill-current text-[#B79A63] shrink-0" />
                  <span className="hidden xs:inline">Gece Modu 🌙</span>
                </>
              )}
            </button>


            {/* Unified Master "+ Ekle" Dropdown Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#742C3C] via-rose-800 to-[#4B1E2B] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 border border-[#B79A63]/30"
                title="İçerik Ekle Menüsü"
              >
                <Plus className="w-4 h-4 text-[#B79A63] shrink-0" />
                <span>+ Ekle</span>
              </button>

              {isAddMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsAddMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1E1E1E] shadow-2xl border border-black/10 dark:border-white/10 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => { setIsAddBookModalOpen(true); setIsAddMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#742C3C]/10 hover:text-[#742C3C] dark:hover:text-[#B79A63] transition-colors flex items-center gap-2 text-slate-800 dark:text-slate-200"
                    >
                      <BookOpen className="w-4 h-4 text-[#742C3C] dark:text-[#B79A63] shrink-0" />
                      <span>📖 Yeni Kitap Ekle</span>
                    </button>

                    <button
                      onClick={() => { setIsAddQuoteModalOpen(true); setIsAddMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-600 transition-colors flex items-center gap-2 text-slate-800 dark:text-slate-200"
                    >
                      <QuoteIcon className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>💬 Yeni Alıntı Ekle</span>
                    </button>

                    <button
                      onClick={() => { setIsAddPoemModalOpen(true); setIsAddMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-purple-500/10 hover:text-purple-600 transition-colors flex items-center gap-2 text-slate-800 dark:text-slate-200"
                    >
                      <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>✍️ Yeni Şiir Ekle</span>
                    </button>

                    <button
                      onClick={() => { setIsAddReviewModalOpen(true); setIsAddMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors flex items-center gap-2 text-slate-800 dark:text-slate-200"
                    >
                      <Star className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>⭐ Yeni İnceleme Ekle</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4">
        {activeTab === 'today' && <TodayView />}
        {activeTab === 'library' && <LibraryView />}
        {activeTab === 'explore' && <ExploreView />}
        {activeTab === 'archive' && <ArchiveView />}
        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Global Creation Modals Overlay */}
      <GlobalAddModals />


      {/* Reader Modal Overlay when active */}
      {activeBookForReader && (
        <ReaderModal 
          book={activeBookForReader}
          onClose={() => setActiveBookForReader(null)}
          onUpdatePage={(bookId, page) => updateBookProgress(bookId, page)}
          onAddQuote={(quoteText, pageNum, note) => {
            addQuotation(quoteText, pageNum, note, activeBookForReader.id, activeBookForReader.title, activeBookForReader.author);
          }}
        />
      )}

      {/* Book Detail Modal */}
      <BookDetailModal 
        book={selectedBookForDetail}
        onClose={() => setSelectedBookForDetail(null)}
        onOpenCoverManager={() => {}}
      />

      {/* Offline Status Notice */}
      <OfflineIndicator />

      {/* Fixed Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-lg border-t border-black/10 dark:border-white/10 px-2 py-2 safe-area-bottom shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'today' 
                ? 'text-[#742C3C] dark:text-[#B79A63] font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Flame className={`w-5 h-5 ${activeTab === 'today' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">Bugün</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'library' 
                ? 'text-[#742C3C] dark:text-[#B79A63] font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'library' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">Kütüphanem</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'explore' 
                ? 'text-[#742C3C] dark:text-[#B79A63] font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">Keşfet</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'archive' 
                ? 'text-[#742C3C] dark:text-[#B79A63] font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Archive className={`w-5 h-5 ${activeTab === 'archive' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">Arşiv</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'stats' 
                ? 'text-[#742C3C] dark:text-[#B79A63] font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${activeTab === 'stats' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">İstatistik</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'chat' 
                ? 'text-[#742C3C] dark:text-[#B79A63] font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MessageSquare className={`w-5 h-5 ${activeTab === 'chat' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">Yapay Zeka</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'profile' 
                ? 'text-[#742C3C] dark:text-[#B79A63] font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

import { WidgetView } from './components/WidgetView';

export default function App() {
  const isWidget = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/widget') || 
    new URLSearchParams(window.location.search).get('view') === 'widget'
  );

  if (isWidget) {
    return <WidgetView />;
  }

  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
