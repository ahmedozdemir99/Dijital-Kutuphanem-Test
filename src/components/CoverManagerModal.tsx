import React, { useState } from 'react';
import { 
  X, Image as ImageIcon, Sparkles, RefreshCw, CheckCircle2, 
  AlertCircle, Upload, Search, Link as LinkIcon, ShieldCheck, Download, Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { findSmartCoverForBook, isBookMissingCover } from '../lib/coverFetcher';
import { UserBook } from '../types';

interface CoverManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoverManagerModal: React.FC<CoverManagerModalProps> = ({ isOpen, onClose }) => {
  const { userBooks, updateBookCover } = useApp();
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'missing' | 'embedded' | 'external'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auto-completion state
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [autoReport, setAutoReport] = useState<{ found: number; missing: number } | null>(null);

  // Single book edit state
  const [editingBook, setEditingBook] = useState<UserBook | null>(null);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiResults, setApiResults] = useState<any[]>([]);

  if (!isOpen) return null;

  // Stats calculation using isBookMissingCover
  const totalBooks = userBooks.length;
  const missingCount = userBooks.filter(b => isBookMissingCover(b)).length;
  const embeddedCount = userBooks.filter(b => b.coverSource === 'embedded' || (b.coverUrl && b.coverUrl.startsWith('data:'))).length;
  const externalCount = userBooks.filter(b => b.coverSource === 'google_books' || b.coverSource === 'open_library' || b.coverSource === 'user').length;
  const withCoverCount = totalBooks - missingCount;

  // Filter books
  const filteredBooks = userBooks.filter(b => {
    const isMissing = isBookMissingCover(b);
    const isEmbedded = b.coverSource === 'embedded' || (b.coverUrl && b.coverUrl.startsWith('data:'));
    const isExternal = b.coverSource === 'google_books' || b.coverSource === 'open_library' || b.coverSource === 'user';

    if (activeFilter === 'missing' && !isMissing) return false;
    if (activeFilter === 'embedded' && !isEmbedded) return false;
    if (activeFilter === 'external' && !isExternal) return false;
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.isbn && b.isbn.includes(q));
    }

    return true;
  });

  const handleRunAutoCompletion = async () => {
    setIsAutoRunning(true);
    setProgressPercent(0);
    setAutoReport(null);

    const booksMissing = userBooks.filter(b => isBookMissingCover(b));
    
    if (booksMissing.length === 0) {
      setIsAutoRunning(false);
      setAutoReport({ found: 0, missing: 0 });
      return;
    }

    let foundCounter = 0;
    let missingCounter = 0;

    for (let i = 0; i < booksMissing.length; i++) {
      const book = booksMissing[i];
      // Force refetch from Google Books & Open Library
      const res = await findSmartCoverForBook(book, true);
      
      if (res && res.coverUrl) {
        updateBookCover(book.id, res.coverUrl, res.source, res.confidence);
        foundCounter++;
      } else {
        missingCounter++;
      }

      setProgressPercent(Math.round(((i + 1) / booksMissing.length) * 100));
    }

    setIsAutoRunning(false);
    setAutoReport({ found: foundCounter, missing: missingCounter });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, bookId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          updateBookCover(bookId, dataUrl, 'user', 100);
          setEditingBook(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSearchApi = async () => {
    if (!editingBook) return;
    setIsSearchingApi(true);
    setApiResults([]);
    
    const res = await findSmartCoverForBook(editingBook, true);
    if (res) {
      setApiResults([res]);
    }
    setIsSearchingApi(false);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Kapak yönetimi" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#F8F5EF] dark:bg-[#1E1E1E] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-[#B79A63]/30 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#742C3C] text-white p-6 flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#B79A63]/20 text-[#B79A63] border border-[#B79A63]/30">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-white flex items-center gap-2">
                <span>Akıllı Kitap Kapağı Yönetim Paneli</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#B79A63] text-slate-900 font-sans font-bold">
                  AI & Google/Open Library API
                </span>
              </h2>
              <p className="text-xs text-white/80">
                Gömülü kapaklar, Google Books, Galeri yükleme ve kalıcı depolama.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Kapak yönetimini kapat"
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-1 text-center shadow-sm">
              <p className="text-[11px] text-slate-500 font-semibold">Toplam Kitap</p>
              <p className="text-2xl font-bold font-serif-title text-[#742C3C] dark:text-[#B79A63]">{totalBooks}</p>
            </div>

            <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-1 text-center shadow-sm">
              <p className="text-[11px] text-slate-500 font-semibold">Kapağı Var</p>
              <p className="text-2xl font-bold font-serif-title text-emerald-600 dark:text-emerald-400">{withCoverCount}</p>
            </div>

            <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-1 text-center shadow-sm">
              <p className="text-[11px] text-slate-500 font-semibold">Gömülü Kapak</p>
              <p className="text-2xl font-bold font-serif-title text-amber-600 dark:text-amber-400">{embeddedCount}</p>
            </div>

            <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-1 text-center shadow-sm">
              <p className="text-[11px] text-slate-500 font-semibold">API Bağlantılı</p>
              <p className="text-2xl font-bold font-serif-title text-blue-600 dark:text-blue-400">{externalCount}</p>
            </div>

            <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-1 text-center shadow-sm col-span-2 md:col-span-1">
              <p className="text-[11px] text-slate-500 font-semibold">Eksik Kapak</p>
              <p className="text-2xl font-bold font-serif-title text-rose-600 dark:text-rose-400">{missingCount}</p>
            </div>
          </div>

          {/* Auto Cover Fetcher Action Banner */}
          <div className="bg-gradient-to-r from-[#742C3C] to-[#4B1E2B] text-white p-5 rounded-2xl shadow-md border border-[#B79A63]/30 space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="font-serif-title font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#B79A63]" />
                  <span>Otomatik Kapak Bulma ve Tamamlama</span>
                </h3>
                <p className="text-xs text-white/80">
                  Google Books & Open Library servislerini tarayarak <strong>{missingCount} adet eksik kapaklı kitabı</strong> otomatik olarak arayıp tamamlayın.
                </p>
              </div>

              <button
                onClick={handleRunAutoCompletion}
                disabled={isAutoRunning}
                className="px-5 py-3 rounded-xl bg-[#B79A63] text-slate-900 font-bold text-xs hover:bg-[#a38752] transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${isAutoRunning ? 'animate-spin' : ''}`} />
                <span>{isAutoRunning ? 'Kapaklar Taranıyor...' : 'Otomatik Kapak Aramasını Başlat'}</span>
              </button>
            </div>

            {/* Progress Bar */}
            {isAutoRunning && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Google Books & Open Library Taranıyor...</span>
                  <span>%{progressPercent}</span>
                </div>
                <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#B79A63] h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Report Output */}
            {autoReport && (
              <div className="p-3 bg-white/10 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#B79A63]" />
                <span>
                  Kapak taraması tamamlandı! <strong>{autoReport.found}</strong> adet kapak bulundu ve IndexedDB hafızasına aktarıldı. ({autoReport.missing} kapak için manuel arama seçeneğini kullanabilirsiniz)
                </span>
              </div>
            )}
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl w-full md:w-auto text-xs font-semibold">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === 'all' ? 'bg-[#742C3C] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Tümü ({totalBooks})
              </button>
              <button
                onClick={() => setActiveFilter('missing')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === 'missing' ? 'bg-[#742C3C] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Eksik Kapak ({missingCount})
              </button>
              <button
                onClick={() => setActiveFilter('embedded')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === 'embedded' ? 'bg-[#742C3C] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Gömülü ({embeddedCount})
              </button>
              <button
                onClick={() => setActiveFilter('external')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === 'external' ? 'bg-[#742C3C] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                API Eşleşen ({externalCount})
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Kitap veya ISBN ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 text-xs"
              />
            </div>
          </div>

          {/* Book Covers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBooks.map(book => {
              const isMissing = isBookMissingCover(book);
              return (
                <div 
                  key={book.id} 
                  className="bg-white dark:bg-[#141414] p-3 rounded-2xl border border-black/5 dark:border-white/5 flex items-center gap-3 shadow-sm hover:border-[#B79A63]/40 transition-all"
                >
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 book-shadow book-spine-effect relative shrink-0">
                    {book.coverUrl && !isMissing ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63]">
                        <ImageIcon className="w-5 h-5 opacity-40 mb-1" />
                        <span className="text-[8px] font-bold leading-tight line-clamp-2">{book.title}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-serif-title font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{book.author}</p>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isMissing ? 'bg-rose-500/10 text-rose-600' :
                        book.coverSource === 'embedded' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-blue-500/10 text-blue-600'
                      }`}>
                        {isMissing ? 'Eksik Kapak' : book.coverSource === 'embedded' ? 'Gömülü' : 'API Eşleşti'}
                      </span>
                      {book.isbn && (
                        <span className="text-[10px] text-slate-400 font-mono">ISBN: {book.isbn}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingBook(book)}
                    className="px-3 py-1.5 rounded-xl bg-[#742C3C] text-white text-xs font-semibold hover:bg-[#4B1E2B] transition-colors shrink-0"
                  >
                    Manuel Yükle
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Cover Sub-Modal */}
        {editingBook && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-lg p-6 rounded-3xl shadow-2xl space-y-5 border border-[#B79A63]/40 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63]">
                  Manuel Kapak Yükle: {editingBook.title}
                </h3>
                <button onClick={() => setEditingBook(null)} className="p-1 rounded-full hover:bg-black/5">
                  <X className="w-5 h-5 opacity-60" />
                </button>
              </div>

              {/* Cover options */}
              <div className="space-y-4 text-xs">
                {/* Google Images Direct Search Button */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/10 to-indigo-900/10 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Google Görseller'de Kitap Kapağı Ara</span>
                      </span>
                      <p className="text-[11px] text-slate-500 pt-0.5">
                        Tek tıkla Google Görseller araması açılır. Resmi kopyalayıp URL kutusuna yapıştırabilirsiniz.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const searchQ = encodeURIComponent(`${editingBook.title} ${editingBook.author} kitap kapağı`);
                        window.open(`https://www.google.com/search?tbm=isch&q=${searchQ}`, '_blank');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
                    >
                      <span>Google'da Ara 🔍</span>
                    </button>
                  </div>
                </div>

                {/* File Upload from Gallery / Device */}

                <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 space-y-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#742C3C] dark:text-[#B79A63]" />
                    <span>Galeriden veya Cihazdan Görsel Yükle</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUpload(e, editingBook.id)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#742C3C] file:text-white hover:file:bg-[#4B1E2B]"
                  />
                </div>

                {/* API Search */}
                <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#B79A63]" />
                      <span>Google Books / Open Library Otomatik Arama</span>
                    </span>
                    <button
                      onClick={handleManualSearchApi}
                      disabled={isSearchingApi}
                      className="px-3 py-1.5 rounded-lg bg-[#742C3C] text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isSearchingApi ? 'Aranıyor...' : 'Ara'}</span>
                    </button>
                  </div>

                  {apiResults.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {apiResults.map((item, idx) => (
                        <div key={idx} className="p-2 bg-white dark:bg-[#1E1E1E] rounded-xl flex items-center justify-between border">
                          <img src={item.coverUrl} alt="Cover" className="w-10 h-14 object-cover rounded" />
                          <div className="flex-1 px-3 text-[11px]">
                            <p className="font-bold">{item.matchedTitle || editingBook.title}</p>
                            <p className="text-slate-400">Eşleşme Oranı: %{item.confidence}</p>
                          </div>
                          <button
                            onClick={() => {
                              updateBookCover(editingBook.id, item.coverUrl, item.source, item.confidence);
                              setEditingBook(null);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                          >
                            Seç
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* URL Paste */}
                <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 space-y-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-blue-600" />
                    <span>Google Görsellerden Resim Bağlantısı / URL Yapıştır</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={customCoverUrl}
                      onChange={e => setCustomCoverUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10"
                    />
                    <button
                      onClick={() => {
                        if (customCoverUrl) {
                          updateBookCover(editingBook.id, customCoverUrl, 'user', 100);
                          setEditingBook(null);
                        }
                      }}
                      className="px-4 py-2 bg-[#742C3C] text-white font-semibold rounded-xl"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
