import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  Bookmark, Copy, Sun, Moon, BookOpen, Quote, Sparkles, Check, 
  FileText, Paperclip, MoveHorizontal, RefreshCcw, Eye, EyeOff, Compass, UploadCloud,
  Maximize, Minimize, Smartphone
} from 'lucide-react';
import { UserBook } from '../types';
import { PdfViewer } from './PdfViewer';
import { EpubViewer } from './EpubViewer';
import { getBookFileFromIDB } from '../lib/indexedDb';
import { useApp } from '../context/AppContext';

interface ReaderModalProps {
  book: UserBook;
  onClose: () => void;
  onUpdatePage: (bookId: string, newPage: number) => void;
  onAddQuote: (quoteText: string, pageNum: number, note?: string) => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  book,
  onClose,
  onUpdatePage,
  onAddQuote
}) => {
  const { userProfile, attachBookFile } = useApp();
  const [activeBook, setActiveBook] = useState<UserBook>(book);

  // Auto-restore fresh blob object URL from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    async function restoreBookFile() {
      const idbFile = await getBookFileFromIDB(book.id);
      if (idbFile && isMounted) {
        setActiveBook(prev => ({
          ...prev,
          fileStorageUrl: idbFile.objectUrl,
          fileName: idbFile.fileName,
          fileType: idbFile.fileType
        }));
      }
    }
    restoreBookFile();
    return () => { isMounted = false; };
  }, [book.id]);

  // Initialize page to the saved page progress (restores exactly where user left off)
  const getInitialPage = () => {
    try {
      const stored = localStorage.getItem(`dk_last_page_${book.id}`);
      if (stored) {
        const p = parseInt(stored, 10);
        if (!isNaN(p) && p > 0) return p;
      }
    } catch {}
    return book.currentPage && book.currentPage > 0 ? book.currentPage : 1;
  };

  const [currentPage, setCurrentPage] = useState<number>(getInitialPage);
  
  // Sync page when switching to a different book
  useEffect(() => {
    setCurrentPage(getInitialPage());
  }, [book.id]);

  const [totalPages, setTotalPages] = useState<number>(() => Math.max(book.totalPages || 100, getInitialPage()));
  
  // PDF Zoom level & Dimensions
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [hasAutoFitted, setHasAutoFitted] = useState<boolean>(false);

  // Fullscreen & Dedicated Fullscreen Reading Mode
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Reader theme state (synced with app or localStorage)
  const [readerTheme, setReaderTheme] = useState<'ivory' | 'dark' | 'sepia'>(() => {
    try {
      const saved = localStorage.getItem('dk_reader_theme');
      if (saved === 'dark' || saved === 'sepia' || saved === 'ivory') {
        return saved;
      }
    } catch {}
    return userProfile?.theme === 'dark' ? 'dark' : 'ivory';
  });

  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight] = useState<number>(1.6);
  const [selectedText, setSelectedText] = useState<string>('');
  const [quoteNote, setQuoteNote] = useState<string>('');
  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fit calculation when PDF page dimensions are reported
  const handlePageDimensionsLoaded = useCallback((width: number, height: number) => {
    setPdfDimensions({ width, height });

    // On initial open: automatically fit the book to full screen dimensions
    if (!hasAutoFitted && width > 0 && height > 0) {
      const containerW = contentAreaRef.current?.clientWidth || window.innerWidth;
      const containerH = contentAreaRef.current?.clientHeight || window.innerHeight;

      let optimalZoom = 100;
      if (window.innerWidth < 768) {
        // Mobile portrait: fit to width for optimal text size
        optimalZoom = Math.floor(((containerW - 16) / width) * 100);
      } else {
        // Desktop / Tablet landscape: fit the full book page seamlessly
        const widthFit = ((containerW - 48) / width) * 100;
        const heightFit = ((containerH - 80) / height) * 100;
        optimalZoom = Math.floor(Math.min(widthFit, heightFit));
      }

      optimalZoom = Math.max(50, Math.min(250, optimalZoom));
      setZoomLevel(optimalZoom);
      setHasAutoFitted(true);
    }
  }, [hasAutoFitted]);

  // Persist theme changes
  const handleThemeChange = (newTheme: 'ivory' | 'dark' | 'sepia') => {
    setReaderTheme(newTheme);
    try {
      localStorage.setItem('dk_reader_theme', newTheme);
    } catch {}
    setShowThemeMenu(false);
  };

  // Sync page change back to parent and storage instantly
  useEffect(() => {
    try {
      localStorage.setItem(`dk_last_page_${activeBook.id}`, String(currentPage));
    } catch {}
    onUpdatePage(activeBook.id, currentPage);
  }, [currentPage, activeBook.id]);

  const handleClose = () => {
    try {
      localStorage.setItem(`dk_last_page_${activeBook.id}`, String(currentPage));
    } catch {}
    if (typeof document !== 'undefined' && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    onUpdatePage(activeBook.id, currentPage);
    onClose();
  };

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      try { localStorage.setItem(`dk_last_page_${activeBook.id}`, String(next)); } catch {}
      onUpdatePage(activeBook.id, next);
    }
  }, [currentPage, totalPages, activeBook.id, onUpdatePage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      try { localStorage.setItem(`dk_last_page_${activeBook.id}`, String(prev)); } catch {}
      onUpdatePage(activeBook.id, prev);
    }
  }, [currentPage, activeBook.id, onUpdatePage]);

  // Clean up any browser-level OS fullscreen on mount or close to prevent browser toast
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const toggleFullscreen = async () => {
    // If native OS fullscreen is active, exit it so browser popup doesn't appear
    if (typeof document !== 'undefined' && document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {}
    }
    setIsFullscreen(prev => !prev);
  };

  // Dedicated "Tam Ekran Okuma Modu" (Pure in-app immersive reading without browser OS toast popups)
  const toggleFullscreenReadingMode = async () => {
    // Exit native OS fullscreen if active so Chrome toast disappears immediately
    if (typeof document !== 'undefined' && document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {}
    }

    if (!isZenMode) {
      // Enter full screen reading mode
      setIsZenMode(true);
      setIsFullscreen(true);
      if (pdfDimensions) {
        handleFitPage();
      }
    } else {
      // Exit fullscreen reading mode
      setIsZenMode(false);
      setIsFullscreen(false);
    }
  };

  // Double-click/double-tap to exit full-screen reading mode
  const handleReaderDoubleClick = useCallback((e?: React.MouseEvent) => {
    // If clicking on interactive elements like buttons, inputs, links, ignore
    const target = e?.target as HTMLElement | undefined;
    if (target?.closest('button, a, input, select, textarea, [role="button"]')) {
      return;
    }
    // "Tam ekran okuma modu de olsun çift tıklayınca çıksın tam ekrandan"
    if (isFullscreen || isZenMode) {
      toggleFullscreenReadingMode();
    }
  }, [isFullscreen, isZenMode]);

  // Touch double-tap detection for mobile devices in full-screen reading mode
  const lastTouchTapRef = useRef<number>(0);
  const handleContentTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && (isFullscreen || isZenMode)) {
      const now = Date.now();
      if (now - lastTouchTapRef.current < 350) {
        lastTouchTapRef.current = 0;
        toggleFullscreenReadingMode();
      } else {
        lastTouchTapRef.current = now;
      }
    }
  }, [isFullscreen, isZenMode]);

  // Trackpad pinch-to-zoom / Ctrl + Mouse Wheel zoom for PDF
  useEffect(() => {
    const el = containerRef.current;
    if (!el || activeBook.fileType !== 'pdf') return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 15 : -15;
        setZoomLevel(prev => Math.max(50, Math.min(350, prev + delta)));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [activeBook.fileType]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'Escape') {
        if (isZenMode) {
          setIsZenMode(false);
        } else if (isFullscreen) {
          toggleFullscreen();
        } else {
          handleClose();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === '+' || e.key === '=') {
        if (activeBook.fileType === 'pdf') {
          e.preventDefault();
          setZoomLevel(prev => Math.min(350, prev + 15));
        }
      } else if (e.key === '-') {
        if (activeBook.fileType === 'pdf') {
          e.preventDefault();
          setZoomLevel(prev => Math.max(50, prev - 15));
        }
      } else if (e.key === '0') {
        if (activeBook.fileType === 'pdf') {
          e.preventDefault();
          handleFitPage();
        }
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreenReadingMode();
      } else if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setIsZenMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, activeBook.id, activeBook.fileType, isZenMode, isFullscreen, handleNextPage, handlePrevPage]);

  // Fit to Width calculation
  const handleFitWidth = () => {
    if (!contentAreaRef.current || !pdfDimensions || pdfDimensions.width === 0) {
      setZoomLevel(125);
      return;
    }
    const availableWidth = contentAreaRef.current.clientWidth - 32;
    const computedScale = Math.round((availableWidth / pdfDimensions.width) * 100);
    setZoomLevel(Math.max(50, Math.min(350, computedScale)));
  };

  // Fit to Page calculation
  const handleFitPage = () => {
    if (!contentAreaRef.current || !pdfDimensions || pdfDimensions.height === 0) {
      setZoomLevel(90);
      return;
    }
    const availableHeight = contentAreaRef.current.clientHeight - (isZenMode ? 32 : 80);
    const computedScale = Math.round((availableHeight / pdfDimensions.height) * 100);
    setZoomLevel(Math.max(50, Math.min(350, computedScale)));
  };

  const handleJumpToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('pageInput') as HTMLInputElement;
    const pageNum = parseInt(input.value, 10);
    if (!isNaN(pageNum) && pageNum >= 1) {
      const target = Math.min(pageNum, totalPages);
      setCurrentPage(target);
      try { localStorage.setItem(`dk_last_page_${activeBook.id}`, String(target)); } catch {}
      onUpdatePage(activeBook.id, target);
    }
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(p => p !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage].sort((a, b) => a - b));
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleCopySelectedText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
  };

  const handleSaveQuoteFromReader = () => {
    if (selectedText) {
      onAddQuote(selectedText, currentPage, quoteNote);
      setShowQuoteModal(false);
      setSelectedText('');
      setQuoteNote('');
    }
  };

  // Direct PDF/EPUB file attachment from reader
  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPdf(true);
      const objectUrl = await attachBookFile(activeBook.id, file);
      const fileType = file.name.endsWith('.epub') ? 'epub' : 'pdf';
      setActiveBook(prev => ({
        ...prev,
        fileStorageUrl: objectUrl,
        fileName: file.name,
        fileType: fileType as 'pdf' | 'epub'
      }));
    } catch (err) {
      console.error('File attach error:', err);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const mockChapters = Array.from({ length: Math.min(12, Math.ceil(totalPages / 25)) }).map((_, i) => ({
    title: `Bölüm ${i + 1}: ${i === 0 ? 'Giriş ve Başlangıç' : i === 1 ? 'Temel Kavramlar' : `Tefekkür ve İncelemeler ${i + 1}`}`,
    page: Math.min(totalPages, i * 25 + 1)
  }));

  const getThemeClasses = () => {
    switch (readerTheme) {
      case 'dark':
        return 'bg-[#0F1412] text-[#E0E7E5] border-slate-800';
      case 'sepia':
        return 'bg-[#F4ECD8] text-[#3D332A] border-[#E2D4B7]';
      case 'ivory':
      default:
        return 'bg-[#F8F5EF] text-[#2C2523] border-[#E8E2D5]';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${getThemeClasses()} transition-colors duration-200 select-text ${
        isFullscreen ? 'w-screen h-screen' : ''
      }`}
      onMouseUp={handleTextSelection}
      onTouchEnd={handleTextSelection}
    >
      {/* Hidden File Input for PDF Attachment */}
      <input 
        ref={fileInputRef}
        type="file"
        accept=".pdf,.epub"
        onChange={handleDirectFileUpload}
        className="hidden"
      />

      {/* Top Controls Bar (Hidden in Zen / Fullscreen Reading Mode) */}
      {!isZenMode && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-black/10 dark:border-white/10 shrink-0 bg-white/75 dark:bg-black/65 backdrop-blur-md z-30 transition-all">
          {/* Left: Close & Book Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Kapat ve Kaldığım Yeri Kaydet (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="hidden sm:block">
              <h3 className="font-serif-title font-bold text-sm md:text-base truncate max-w-[180px] md:max-w-[280px]">
                {activeBook.title}
              </h3>
              <p className="text-[11px] opacity-70 truncate">
                {activeBook.author} {activeBook.fileType && `· (${activeBook.fileType.toUpperCase()})`}
              </p>
            </div>
          </div>

          {/* Center: Page Navigator */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-opacity"
              title="Önceki Sayfa (Sol Ok)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <form onSubmit={handleJumpToPage} className="flex items-center gap-1">
              <input 
                name="pageInput"
                type="number"
                min={1}
                max={totalPages}
                defaultValue={currentPage}
                key={currentPage}
                className="w-12 sm:w-14 text-center py-1 px-1 text-xs sm:text-sm font-bold rounded-lg border border-black/20 dark:border-white/20 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#742C3C]"
              />
              <span className="text-xs opacity-70">/ {totalPages}</span>
            </form>

            <button 
              onClick={handleNextPage} 
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-opacity"
              title="Sonraki Sayfa (Sağ Ok)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* PDF Zoom Controls */}
            {activeBook.fileType === 'pdf' && (
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-1.5 py-1 rounded-xl">
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
                  className="p-1 hover:bg-black/10 dark:hover:bg-white/20 rounded transition-colors"
                  title="Küçült (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    const presets = [75, 100, 125, 150, 200];
                    const next = presets.find(p => p > zoomLevel) || 75;
                    setZoomLevel(next);
                  }}
                  className="text-xs font-bold px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/20 min-w-[46px] text-center"
                  title="Yakınlaştırma Oranı (İki parmakla da büyütebilirsiniz)"
                >
                  %{zoomLevel}
                </button>

                <button 
                  onClick={() => setZoomLevel(prev => Math.min(350, prev + 15))}
                  className="p-1 hover:bg-black/10 dark:hover:bg-white/20 rounded transition-colors"
                  title="Büyüt (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <div className="hidden lg:flex items-center gap-0.5 border-l border-black/10 dark:border-white/10 pl-1 ml-0.5">
                  <button
                    onClick={handleFitWidth}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/20 rounded text-[11px] font-semibold flex items-center gap-0.5"
                    title="Genişliğe Tam Sığdır"
                  >
                    <MoveHorizontal className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleFitPage}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/20 rounded text-[11px] font-semibold"
                    title="Sayfaya Tam Sığdır"
                  >
                    <RefreshCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Gece / Fildişi / Sepya Modu Seçici */}
            <div className="relative">
              <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`p-2 rounded-xl transition-all flex items-center gap-1 ${
                  readerTheme === 'dark' 
                    ? 'bg-black/20 text-amber-400 border border-amber-400/30' 
                    : readerTheme === 'sepia'
                    ? 'bg-[#E2D4B7] text-[#4A3B32]'
                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                }`}
                title="Okuma Teması (Gece / Gündüz / Sepya)"
              >
                {readerTheme === 'dark' ? (
                  <Moon className="w-4 h-4 fill-current text-amber-400" />
                ) : readerTheme === 'sepia' ? (
                  <Compass className="w-4 h-4 text-[#8C6D46]" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-600" />
                )}
              </button>

              {/* Theme Dropdown Menu */}
              {showThemeMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#1E1E1E] shadow-2xl border border-black/10 dark:border-white/10 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => handleThemeChange('ivory')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                        readerTheme === 'ivory' ? 'bg-[#742C3C] text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">☀️ Gündüz (Fildişi)</span>
                      {readerTheme === 'ivory' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleThemeChange('sepia')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                        readerTheme === 'sepia' ? 'bg-[#8C6D46] text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">📜 Sepya (Kitap Kağıdı)</span>
                      {readerTheme === 'sepia' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                        readerTheme === 'dark' ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">🌙 Gece Modu (Karanlık)</span>
                      {readerTheme === 'dark' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Attach PDF File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={activeBook.fileStorageUrl ? 'PDF / EPUB Dosyasını Değiştir' : 'PDF veya EPUB Dosyası Yükle'}
            >
              <Paperclip className="w-4 h-4 text-[#742C3C] dark:text-[#B79A63]" />
            </button>

            {/* Bookmark Button */}
            <button 
              onClick={toggleBookmark}
              className={`p-2 rounded-xl transition-colors ${
                bookmarks.includes(currentPage) 
                  ? 'text-[#742C3C] dark:text-[#B79A63] bg-[#742C3C]/10' 
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
              title="Yer İmi Ekle / Kaldır"
            >
              <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentPage) ? 'fill-current' : ''}`} />
            </button>

            {/* Table of contents */}
            <button 
              onClick={() => setShowToc(!showToc)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="İçindekiler Bölümü"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Reading Mode: ONLY the clean close (X) button at the top-right */}
      {isZenMode && (
        <button
          onClick={toggleFullscreenReadingMode}
          className="absolute top-3.5 right-3.5 z-40 p-2.5 rounded-full bg-black/45 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md shadow-xl border border-white/20 transition-all active:scale-90 cursor-pointer"
          title="Tam Ekrandan Çık (Esc veya Çift Tıklama)"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Main Reading View Area */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* Table of Contents Drawer */}
        {showToc && (
          <div className="w-72 border-r border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-md p-4 overflow-y-auto z-30 animate-in slide-in-from-left duration-200">
            <h4 className="font-serif-title font-bold text-lg mb-3 flex items-center justify-between">
              <span>İçindekiler</span>
              <button onClick={() => setShowToc(false)} className="text-xs opacity-60 hover:opacity-100 font-bold">Kapat</button>
            </h4>
            <div className="space-y-1">
              {mockChapters.map((chap, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentPage(chap.page);
                    setShowToc(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    currentPage >= chap.page && (idx === mockChapters.length - 1 || currentPage < mockChapters[idx + 1].page)
                      ? 'bg-[#742C3C] text-white font-medium'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="truncate pr-2">{chap.title}</span>
                  <span className="text-xs opacity-70 shrink-0">s. {chap.page}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floating Side Page-Turn Buttons for Effortless Reading in Fullscreen */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/35 hover:bg-black/75 text-white backdrop-blur-sm opacity-20 hover:opacity-100 transition-opacity disabled:opacity-0"
          title="Önceki Sayfa"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/35 hover:bg-black/75 text-white backdrop-blur-sm opacity-20 hover:opacity-100 transition-opacity disabled:opacity-0"
          title="Sonraki Sayfa"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Reader Display Area */}
        <div 
          ref={contentAreaRef}
          onDoubleClick={handleReaderDoubleClick}
          onTouchStart={handleContentTouchStart}
          className="flex-1 overflow-hidden relative flex justify-center items-stretch w-full h-full"
        >
          {activeBook.fileStorageUrl && activeBook.fileType === 'pdf' ? (
            /* Upgraded Canvas PDF Viewer - Two-Finger Pinch Zoom + Auto-Fit */
            <div className="w-full h-full flex flex-col overflow-hidden">
              <PdfViewer 
                pdfUrl={activeBook.fileStorageUrl}
                pageNumber={currentPage}
                zoomScale={zoomLevel / 100}
                readerTheme={readerTheme}
                title={activeBook.title}
                onPageDimensionsLoaded={handlePageDimensionsLoaded}
                onZoomChange={(newPercent) => setZoomLevel(newPercent)}
                onDoubleClick={handleReaderDoubleClick}
                isFullScreenMode={isFullscreen || isZenMode}
                onToggleFullScreen={toggleFullscreenReadingMode}
                onTotalPagesLoaded={(total) => {
                  if (total && total !== totalPages) {
                    setTotalPages(total);
                  }
                }}
              />
            </div>
          ) : activeBook.fileStorageUrl && activeBook.fileType === 'epub' ? (
            /* Attached EPUB Reader */
            <div 
              onDoubleClick={handleReaderDoubleClick}
              className="w-full h-full overflow-y-auto p-4 md:p-8 flex justify-center items-start"
            >
              <EpubViewer 
                epubUrl={activeBook.fileStorageUrl}
                chapterIndex={currentPage}
                fontSize={fontSize}
                lineHeight={lineHeight}
                title={activeBook.title}
                onTotalChaptersLoaded={(total) => {
                  if (total && total !== totalPages) {
                    setTotalPages(total);
                  }
                }}
              />
            </div>
          ) : (
            /* Digital Reader Text Display with PDF Attachment Prompt */
            <div 
              onDoubleClick={handleReaderDoubleClick}
              className="w-full h-full overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-start cursor-default"
            >
              <div 
                className={`w-full max-w-3xl rounded-3xl shadow-2xl p-6 md:p-12 min-h-[680px] flex flex-col justify-between border transition-all ${
                  readerTheme === 'dark'
                    ? 'bg-[#181818] text-slate-100 border-white/10'
                    : readerTheme === 'sepia'
                    ? 'bg-[#F4ECD8] text-[#3D332A] border-[#E2D4B7]'
                    : 'bg-white text-slate-800 border-black/10'
                }`}
                style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
              >
                {/* Header page info */}
                <div className="flex justify-between items-center text-xs opacity-50 border-b border-black/10 dark:border-white/10 pb-3 mb-6 select-none font-serif-title">
                  <span>{activeBook.seriesTitle || activeBook.category}</span>
                  <span>Sayfa {currentPage} / {totalPages}</span>
                </div>

                {/* Book Body Text Content */}
                <div className="flex-1 text-justify font-sans tracking-normal space-y-4 leading-relaxed">
                  <h2 className="font-serif-title font-bold text-2xl md:text-3xl text-center mb-6 text-[#742C3C] dark:text-[#B79A63]">
                    {currentPage === 1 ? activeBook.title : `Bölüm ${Math.ceil(currentPage / 25)}: Hikmet ve Tefekkür`}
                  </h2>

                  <p className="first-letter:text-4xl first-letter:font-serif-title first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-[#742C3C] dark:first-letter:text-[#B79A63]">
                    İlim ve hakikat yolculuğu, zihnin derinliklerinde başlayan sessiz bir tefekkür ile tecellî eder. Her sahife, hakikate açılan mütevazı bir kapı ve insan ruhunu zenginleştiren kutlu bir adımdır. Yıllar boyunca biriken bu birikim, okuyucunun sadece bilgisini değil, ahlakını ve ufkunu da yükseltir.
                  </p>

                  <p>
                    Okuma eylemi pasif bir takip değildir; müellif ile okur arasında kurulan zamansız bir diyalogdur. Okuduğumuz her satırda kendi zihin dünyamızın aynasıyla karşılaşır, geçmişin birikimini geleceğin idrakine taşırız.
                  </p>

                  <div className="my-6 p-4 rounded-xl bg-black/5 dark:bg-white/5 border-l-4 border-[#742C3C] dark:border-[#B79A63] font-serif-title italic text-base">
                    "Bir kitabı okurken altını çizdiğin her cümle, aslında kendi ruhunun o andaki hizasını gösterir."
                  </div>

                  <p>
                    {currentPage % 2 === 0 
                      ? "İnsan hafızası unutmaya meyillidir; fakat kütüphaneler ve kayda geçirilen hikmetler zamanın yıpratıcı tesirine karşı direnir. Dijital Kütüphanem ile bu okuma hayatı kalıcı bir bilgi hazinesine dönüştürülür."
                      : "Derinlemesine okuma, yüzeysel bilgi turlarının aksine sabır ve dikkati gerektirir. Günde 40 sayfalık kararlı bir tempo, yılda onlarca cildin ve binlerce sayfanın fethini mümkün kılar."}
                  </p>

                  {/* One-Click Attach PDF Banner */}
                  <div className="mt-8 p-4 rounded-2xl bg-[#742C3C]/10 dark:bg-amber-400/10 border border-[#742C3C]/20 dark:border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#742C3C] dark:text-[#B79A63] shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">Bu esere ait orijinal PDF dosyanız var mı?</p>
                        <p className="opacity-70">PDF dosyanızı ekleyerek orijinal sayfaları tam ekran ve gece modunda okuyabilirsiniz.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPdf}
                      className="px-4 py-2 rounded-xl bg-[#742C3C] text-white hover:bg-[#5a222f] font-bold shrink-0 flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{isUploadingPdf ? 'Yükleniyor...' : 'PDF Dosyası Ekle'}</span>
                    </button>
                  </div>
                </div>

                {/* Footer reader toolbar & indicator */}
                <div className="flex justify-between items-center text-xs opacity-50 border-t border-black/10 dark:border-white/10 pt-3 mt-8 select-none">
                  <span>Dijital Kütüphanem Okuyucu</span>
                  <span>İlerleme: %{Math.round((currentPage / totalPages) * 100)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Selection Floating Action Menu */}
      {selectedText && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[#742C3C] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border border-[#B79A63]/30">
          <span className="text-xs max-w-[140px] truncate font-medium">"{selectedText}"</span>
          
          <button 
            onClick={handleCopySelectedText}
            className="flex items-center gap-1 text-xs font-semibold hover:text-[#B79A63] transition-colors"
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSuccess ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>

          <span className="opacity-40">|</span>

          <button 
            onClick={() => setShowQuoteModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-[#B79A63] hover:text-amber-200 transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Alıntıya Kaydet</span>
          </button>
        </div>
      )}

      {/* Save Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-black/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63]">Alıntı Arşivine Ekle</h3>
              <button onClick={() => setShowQuoteModal(false)} className="p-1 rounded hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#F8F5EF] dark:bg-[#141414] rounded-xl text-sm italic font-serif-title mb-4 max-h-36 overflow-y-auto">
              "{selectedText}"
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium mb-1 opacity-70">Sayfa Numarası</label>
                <input 
                  type="number"
                  value={currentPage}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 opacity-70">Kişisel Not veya Düşünceniz</label>
                <textarea 
                  rows={3}
                  value={quoteNote}
                  onChange={e => setQuoteNote(e.target.value)}
                  placeholder="Bu alıntıyla ilgili düşüncenizi yazabilirsiniz..."
                  className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#742C3C]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuoteFromReader}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#742C3C] text-white flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#B79A63]" />
                  <span>Arşive Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
