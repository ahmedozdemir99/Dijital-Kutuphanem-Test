import React, { useState } from 'react';
import { 
  BookOpen, Search, Clock, BookCheck, BookmarkPlus, PauseCircle, Play, 
  Trash2, Edit3, FileUp, Paperclip, ChevronRight, X, AlertTriangle, Eye, Image as ImageIcon, Sparkles, CheckCircle2, Plus 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookStatus, UserBook } from '../types';
import { BookCoverImage } from './BookCoverImage';

interface BookDetailModalProps {
  book: UserBook | null;
  onClose: () => void;
  onOpenCoverManager: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose, onOpenCoverManager }) => {
  const { 
    userBooks,
    updateBookStatus,
    updateBookCover,
    setActiveBookForReader,
    attachBookFile,
    updateBookTags,
    quotations,
    addQuotation,
    deleteBookFromLibrary
  } = useApp();

  const [customCoverUrl, setCustomCoverUrl] = useState<string>('');
  const [showCoverInput, setShowCoverInput] = useState<boolean>(false);
  const [showAddQuoteForm, setShowAddQuoteForm] = useState<boolean>(false);
  const [inlineQuoteText, setInlineQuoteText] = useState<string>('');
  const [inlineQuotePage, setInlineQuotePage] = useState<string>('');
  const [inlineQuoteNote, setInlineQuoteNote] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  if (!book) return null;

  // Always fetch latest book object from userBooks for instant reactive preview & status updates
  const currentBook = userBooks.find(b => b.id === book.id) || book;

  const popularGenreTags = ['Roman', 'Felsefe', 'Tarih', 'Şiir', 'Tasavvuf', 'Deneme', 'İslam Tarihi', 'Hikaye', 'Siyaset', 'Bilim', 'Psikoloji'];

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>, bookId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          updateBookCover(bookId, dataUrl, 'custom', 1.0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomCoverUrlSubmit = (bookId: string) => {
    if (!customCoverUrl.trim()) return;
    updateBookCover(bookId, customCoverUrl.trim(), 'custom', 1.0);
    setCustomCoverUrl('');
    setShowCoverInput(false);
  };

  const handleStatusChange = (newStatus: BookStatus) => {
    updateBookStatus(currentBook.id, newStatus);
  };

  const handleAddInlineQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineQuoteText.trim()) return;
    addQuotation(
      inlineQuoteText.trim(),
      inlineQuotePage ? parseInt(inlineQuotePage, 10) : undefined,
      inlineQuoteNote.trim() || undefined,
      currentBook.id,
      currentBook.title,
      currentBook.author
    );
    setInlineQuoteText('');
    setInlineQuotePage('');
    setInlineQuoteNote('');
    setShowAddQuoteForm(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await attachBookFile(currentBook.id, file);
      } catch (err) {
        console.error('File attach error:', err);
      }
    }
  };

  const bookProg = Math.round((currentBook.currentPage / Math.max(1, currentBook.totalPages)) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/10 dark:border-white/10 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#B79A63]">
            <span>{currentBook.category}</span>
            {currentBook.subCategory && <span>· {currentBook.subCategory}</span>}
            {currentBook.isMultiVolume && <span>· Cilt {currentBook.volumeNumber || 1}</span>}
          </div>
          <div className="flex items-center gap-2">
            {/* Highly Aesthetic, Elegant 'Eseri Sil' Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="group px-3.5 py-1.5 rounded-full bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
              title="Bu Eseri Kütüphaneden Sil"
            >
              <div className="w-5 h-5 rounded-full bg-rose-200/60 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300 group-hover:scale-110 transition-transform">
                <Trash2 className="w-3 h-3" />
              </div>
              <span className="tracking-tight">Eseri Sil</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Cover Column */}
          <div className="flex flex-col items-center gap-2 shrink-0 mx-auto md:mx-0">
            <div className="relative group w-36 h-52 rounded-xl overflow-hidden book-shadow book-spine-effect">
              <BookCoverImage 
                key={currentBook.coverUrl}
                src={currentBook.coverUrl} 
                alt={currentBook.title}
                title={currentBook.title}
                author={currentBook.author}
                category={currentBook.category}
                isMultiVolume={currentBook.isMultiVolume}
                volumeNumber={currentBook.volumeNumber}
              />
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-white text-[11px] font-bold p-2 text-center">
                <ImageIcon className="w-6 h-6 text-[#D4AF37]" />
                <span>Resim Yükle</span>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={e => handleCoverImageUpload(e, currentBook.id)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-col gap-1.5 w-full pt-1">
              <button
                onClick={() => {
                  const searchQ = encodeURIComponent(`${currentBook.title} ${currentBook.author} kitap kapağı`);
                  window.open(`https://www.google.com/search?tbm=isch&q=${searchQ}`, '_blank');
                }}
                className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-[11px] font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Google Görseller'de Kitap Kapağı Ara"
              >
                <Search className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                <span>Google Görseller'de Kapak Ara 🔍</span>
              </button>

              <div className="flex items-center gap-1.5 w-full">
                <label className="flex-1 cursor-pointer py-1.5 px-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[11px] font-semibold text-center flex items-center justify-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#B79A63]" />
                  <span>Fotoğraf Yükle</span>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={e => handleCoverImageUpload(e, currentBook.id)}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowCoverInput(!showCoverInput)}
                  className="py-1.5 px-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  title="URL Yapıştırarak Kapak Ekle"
                >
                  <span>URL</span>
                </button>
              </div>
            </div>

            {showCoverInput && (
              <div className="w-full space-y-1.5 pt-1">
                <input
                  type="url"
                  placeholder="Kapak URL yapıştır..."
                  value={customCoverUrl}
                  onChange={e => setCustomCoverUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
                />
                <button
                  onClick={() => handleCustomCoverUrlSubmit(currentBook.id)}
                  className="w-full py-1.5 rounded-lg bg-[#742C3C] text-white text-[10px] font-bold hover:bg-[#5a222f] transition-colors cursor-pointer"
                >
                  Kapağı Güncelle
                </button>
              </div>
            )}
          </div>

          {/* Detail Info Column */}
          <div className="flex-1 space-y-3">
            <h2 className="font-serif-title font-bold text-2xl text-[#742C3C] dark:text-[#B79A63]">
              {currentBook.title}
            </h2>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentBook.author}
            </p>

            <div className="flex flex-wrap gap-2 text-xs opacity-80 pt-1">
              {currentBook.publisher && <span>Yayınevi: <strong>{currentBook.publisher}</strong></span>}
              {currentBook.publishYear && <span>· Yıl: <strong>{currentBook.publishYear}</strong></span>}
              {currentBook.isbn && <span>· ISBN: <strong>{currentBook.isbn}</strong></span>}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              {currentBook.description || 'Bu eser için henüz açıklama girilmemiş.'}
            </p>

            {/* Genre Tag Management Section */}
            <div className="pt-2 pb-1 space-y-2 border-t border-black/5 dark:border-white/5">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tür Etiketleri (Roman, Felsefe, Tarih vb.):
              </span>
              
              <div className="flex flex-wrap gap-1.5">
                {(currentBook.tags || []).map((t, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63] border border-[#742C3C]/20 text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>🏷️ #{t}</span>
                    <button
                      onClick={() => {
                        const newTags = (currentBook.tags || []).filter(item => item !== t);
                        updateBookTags(currentBook.id, newTags);
                      }}
                      className="hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(!currentBook.tags || currentBook.tags.length === 0) && (
                  <span className="text-xs text-slate-400 italic">Henüz etiket eklenmemiş. Aşağıdan seçebilirsiniz:</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {popularGenreTags.filter(pt => !(currentBook.tags || []).includes(pt)).map((pt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const newTags = [...(currentBook.tags || []), pt];
                      updateBookTags(currentBook.id, newTags);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-[#742C3C] hover:text-white text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    + #{pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Okuma Sayfası: {currentBook.currentPage} / {currentBook.totalPages} Sayfa</span>
                <span>%{bookProg}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#742C3C] dark:bg-[#B79A63] h-full" 
                  style={{ width: `${bookProg}%` }}
                />
              </div>
            </div>

            {/* Status Selector Pills with instant active glow state */}
            <div className="pt-3 space-y-2">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Okuma Durumu Değiştir (Bugün ve Kütüphane İçin Senkronize):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('reading')}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-sm cursor-pointer ${
                    currentBook.status === 'reading'
                      ? 'bg-[#742C3C] text-white border-[#742C3C] shadow-rose-900/40 ring-2 ring-rose-400 scale-102'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100'
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0 text-rose-300" />
                  <span className="whitespace-nowrap">Okuyorum</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('completed')}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-sm cursor-pointer ${
                    currentBook.status === 'completed'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-900/40 ring-2 ring-emerald-400 scale-102'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <BookCheck className="w-4 h-4 shrink-0 text-emerald-300" />
                  <span className="whitespace-nowrap">Okudum</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('want_to_read')}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-sm cursor-pointer ${
                    currentBook.status === 'want_to_read'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-blue-900/40 ring-2 ring-blue-400 scale-102'
                      : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4 shrink-0 text-blue-300" />
                  <span className="whitespace-nowrap">Okuyacağım</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('paused')}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-sm cursor-pointer ${
                    currentBook.status === 'paused'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-amber-900/40 ring-2 ring-amber-400 scale-102'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <PauseCircle className="w-4 h-4 shrink-0 text-amber-300" />
                  <span className="whitespace-nowrap">Yarıda</span>
                </button>
              </div>
            </div>

            {/* Main Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
              <button
                onClick={() => {
                  setActiveBookForReader(currentBook);
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-800 to-[#4B1E2B] text-white text-xs font-bold hover:shadow-lg hover:shadow-rose-900/30 transition-all flex items-center justify-center gap-2 shadow-md border border-rose-500/30 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">Okuyucuda Aç</span>
              </button>

              <label className="cursor-pointer w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold hover:shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 shadow-md border border-emerald-400/30">
                <Paperclip className="w-4 h-4 text-emerald-200 shrink-0" />
                <span className="whitespace-nowrap">{currentBook.fileStorageUrl ? 'Dosya Bağlı (Yenile)' : 'PDF/EPUB Yükle'}</span>
                <input 
                  type="file"
                  accept=".pdf,.epub"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  onOpenCoverManager();
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 text-xs font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 shadow-md border border-amber-400/40 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-slate-950 shrink-0" />
                <span className="whitespace-nowrap">Kapak Paneli</span>
              </button>
            </div>
          </div>
        </div>

        {/* Linked Quotes Section */}
        <div className="border-t border-black/5 dark:border-white/5 pt-4 mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-title font-bold text-base text-[#742C3C] dark:text-[#B79A63]">
              Bu Eserle İlgili Not ve Alıntılarınız ({quotations.filter(q => q.bookId === currentBook.id || q.bookTitle === currentBook.title).length})
            </h4>
            <button
              onClick={() => setShowAddQuoteForm(!showAddQuoteForm)}
              className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold hover:bg-[#742C3C] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddQuoteForm ? 'Kapat' : 'Alıntı Ekle'}</span>
            </button>
          </div>

          {showAddQuoteForm && (
            <form onSubmit={handleAddInlineQuoteSubmit} className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Alıntı / Metin *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Kitaptan unutulmaz bir cümle veya not yazın..."
                  value={inlineQuoteText}
                  onChange={e => setInlineQuoteText(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10 dark:border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Sayfa No</label>
                  <input
                    type="number"
                    placeholder="Örn: 42"
                    value={inlineQuotePage}
                    onChange={e => setInlineQuotePage(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Kişisel Not</label>
                  <input
                    type="text"
                    placeholder="Düşünceniz..."
                    value={inlineQuoteNote}
                    onChange={e => setInlineQuoteNote(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10 dark:border-white/10"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuoteForm(false)}
                  className="px-3 py-1.5 text-xs rounded-xl font-semibold bg-gray-200 dark:bg-gray-800 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-xl font-bold bg-[#742C3C] text-white shadow-sm cursor-pointer"
                >
                  Alıntıyı Kaydet
                </button>
              </div>
            </form>
          )}

          {quotations.filter(q => q.bookId === currentBook.id || q.bookTitle === currentBook.title).length === 0 ? (
            <p className="text-xs text-slate-500 italic">Henüz bu kitaba ait bir alıntı kaydedilmemiş.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {quotations.filter(q => q.bookId === currentBook.id || q.bookTitle === currentBook.title).map(q => (
                <div key={q.id} className="p-3 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] text-xs border-l-4 border-[#742C3C] space-y-1">
                  <p className="font-serif-title italic text-slate-800 dark:text-slate-200">
                    "{q.quoteText}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    {q.pageNumber ? <span>Sayfa {q.pageNumber}</span> : <span />}
                    {q.userNote && <span className="font-semibold text-[#742C3C] dark:text-[#B79A63]">{q.userNote}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal inside Detail Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#FAF8F5] dark:bg-[#1C1C1C] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-500/20 text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-700/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-xs">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif-title font-bold text-lg text-slate-900 dark:text-slate-100">
                  Eseri Kütüphaneden Kaldır
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">"{currentBook.title}"</span> adlı eser ve okuma geçmişi listenizden kaldırılacaktır.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteBookFromLibrary(currentBook.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-md shadow-rose-900/20 transition-all cursor-pointer active:scale-95"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
