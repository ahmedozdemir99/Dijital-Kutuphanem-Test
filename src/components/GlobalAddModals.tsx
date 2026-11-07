import React, { useState } from 'react';
import { X, Plus, BookOpen, Quote as QuoteIcon, FileText, Feather, ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookStatus } from '../types';
import { MAIN_CATEGORIES, DEFAULT_BOOK_COVERS } from '../data/catalogData';

export const GlobalAddModals: React.FC = () => {
  const { 
    userBooks, 
    addBookToLibrary, 
    addQuotation, 
    addReview,
    isAddBookModalOpen, 
    setIsAddBookModalOpen,
    isAddQuoteModalOpen, 
    setIsAddQuoteModalOpen,
    isAddReviewModalOpen, 
    setIsAddReviewModalOpen,
    isAddPoemModalOpen,
    setIsAddPoemModalOpen
  } = useApp();

  // 1. ADD BOOK STATE
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: MAIN_CATEGORIES[0] as string,
    subCategory: 'Genel',
    publisher: '',
    publishYear: '',
    isbn: '',
    totalPages: 300,
    currentPage: 0,
    coverUrl: '',
    description: '',
    status: 'reading' as BookStatus,
    isMultiVolume: false,
    seriesTitle: '',
    volumeNumber: 1,
    totalVolumes: 1
  });

  // 2. ADD QUOTE STATE
  const [newQuote, setNewQuote] = useState({
    bookId: userBooks[0]?.id || '',
    quoteText: '',
    pageNumber: 1,
    userNote: ''
  });

  // 3. ADD REVIEW STATE
  const [newReview, setNewReview] = useState({
    bookId: userBooks[0]?.id || '',
    rating: 5,
    content: ''
  });

  // 4. ADD POEM STATE
  const [newPoem, setNewPoem] = useState({
    title: '',
    poetName: '',
    stanzas: '',
    userNote: ''
  });

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title.trim() || !newBook.author.trim()) return;

    addBookToLibrary({
      title: newBook.title.trim(),
      author: newBook.author.trim(),
      category: newBook.category,
      subCategory: newBook.subCategory || 'Genel',
      publisher: newBook.publisher,
      publishYear: newBook.publishYear,
      isbn: newBook.isbn,
      totalPages: Number(newBook.totalPages) || 200,
      currentPage: Number(newBook.currentPage) || 0,
      coverUrl: newBook.coverUrl || (DEFAULT_BOOK_COVERS as Record<string, string>)[newBook.category] || DEFAULT_BOOK_COVERS["Edebiyat"],
      description: newBook.description,
      status: newBook.status,
      isMultiVolume: newBook.isMultiVolume,
      seriesTitle: newBook.seriesTitle,
      volumeNumber: Number(newBook.volumeNumber) || 1,
      totalVolumes: Number(newBook.totalVolumes) || 1
    });

    setIsAddBookModalOpen(false);
    setNewBook({
      title: '',
      author: '',
      category: MAIN_CATEGORIES[0],
      subCategory: 'Genel',
      publisher: '',
      publishYear: '',
      isbn: '',
      totalPages: 300,
      currentPage: 0,
      coverUrl: '',
      description: '',
      status: 'reading',
      isMultiVolume: false,
      seriesTitle: '',
      volumeNumber: 1,
      totalVolumes: 1
    });
  };

  const handleAddQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.quoteText.trim()) return;
    const targetBook = userBooks.find(b => b.id === newQuote.bookId) || userBooks[0];

    addQuotation(
      newQuote.quoteText.trim(),
      newQuote.pageNumber,
      newQuote.userNote.trim() || undefined,
      targetBook?.id,
      targetBook?.title,
      targetBook?.author
    );

    setIsAddQuoteModalOpen(false);
    setNewQuote({ bookId: userBooks[0]?.id || '', quoteText: '', pageNumber: 1, userNote: '' });
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.content.trim()) return;
    const targetBook = userBooks.find(b => b.id === newReview.bookId) || userBooks[0];

    addReview({
      bookId: targetBook?.id || 'general',
      bookTitle: targetBook?.title || 'Genel Eser Tahlili',
      author: targetBook?.author || 'Yazar',
      rating: newReview.rating,
      content: newReview.content.trim()
    });

    setIsAddReviewModalOpen(false);
    setNewReview({ bookId: userBooks[0]?.id || '', rating: 5, content: '' });
  };

  const handleAddPoemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoem.stanzas.trim() || !newPoem.title.trim()) return;

    addQuotation(
      newPoem.stanzas.trim(),
      undefined,
      `[Şiir Kaydı] ${newPoem.poetName ? `Şair: ${newPoem.poetName}. ` : ''}${newPoem.userNote || ''}`,
      'poem-archive',
      `Şiir: ${newPoem.title}`,
      newPoem.poetName || 'Bilinmeyen Şair'
    );

    setIsAddPoemModalOpen(false);
    setNewPoem({ title: '', poetName: '', stanzas: '', userNote: '' });
  };

  return (
    <>
      {/* 1. ADD BOOK GLOBAL MODAL */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-black/10 dark:border-white/10 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-[#B79A63]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-serif-title font-bold text-xl text-[#742C3C] dark:text-[#B79A63]">
                  Kütüphaneye Yeni Kitap Ekle
                </h3>
              </div>
              <button onClick={() => setIsAddBookModalOpen(false)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kitap / Eser Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Saatleri Ayarlama Enstitüsü"
                    value={newBook.title}
                    onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Yazar Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Hamdi Tanpınar"
                    value={newBook.author}
                    onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={newBook.category}
                    onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-medium"
                  >
                    {MAIN_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Okuma Durumu</label>
                  <select
                    value={newBook.status}
                    onChange={e => setNewBook({ ...newBook, status: e.target.value as BookStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-medium"
                  >
                    <option value="reading">Okuyorum (Devam Ediyor)</option>
                    <option value="completed">Okudum (Tamamlandı)</option>
                    <option value="want_to_read">Okuyacağım (Plana Alındı)</option>
                    <option value="paused">Yarıda Bırakıldı</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Toplam Sayfa</label>
                  <input
                    type="number"
                    min={1}
                    value={newBook.totalPages}
                    onChange={e => setNewBook({ ...newBook, totalPages: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mevcut Sayfa</label>
                  <input
                    type="number"
                    min={0}
                    value={newBook.currentPage}
                    onChange={e => setNewBook({ ...newBook, currentPage: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kapak Görsel URL (Opsiyonel)</label>
                <input
                  type="url"
                  placeholder="https://... (Boş bırakılırsa kategori görseli verilir)"
                  value={newBook.coverUrl}
                  onChange={e => setNewBook({ ...newBook, coverUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Açıklama / Özet</label>
                <textarea
                  rows={2}
                  placeholder="Eser hakkında kısa bilgi..."
                  value={newBook.description}
                  onChange={e => setNewBook({ ...newBook, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-[#4B1E2B] text-white font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Kitabı Kütüphaneye Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD QUOTE GLOBAL MODAL */}
      {isAddQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-black/10 dark:border-white/10 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <QuoteIcon className="w-5 h-5" />
                </div>
                <h3 className="font-serif-title font-bold text-xl text-[#742C3C] dark:text-[#B79A63]">
                  Yeni Alıntı Kaydet
                </h3>
              </div>
              <button onClick={() => setIsAddQuoteModalOpen(false)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuoteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kaynak Eser / Kitap</label>
                <select
                  value={newQuote.bookId}
                  onChange={e => setNewQuote({ ...newQuote, bookId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-semibold"
                >
                  {userBooks.map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alıntı Metni *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Altını çizdiğiniz veya ilham veren sözü buraya yapıştırın..."
                  value={newQuote.quoteText}
                  onChange={e => setNewQuote({ ...newQuote, quoteText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sayfa No</label>
                  <input
                    type="number"
                    min={1}
                    value={newQuote.pageNumber}
                    onChange={e => setNewQuote({ ...newQuote, pageNumber: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kişisel Not</label>
                  <input
                    type="text"
                    placeholder="Kendi düşünceniz..."
                    value={newQuote.userNote}
                    onChange={e => setNewQuote({ ...newQuote, userNote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddQuoteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Alıntıyı Arşive Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD REVIEW GLOBAL MODAL */}
      {isAddReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-black/10 dark:border-white/10 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-serif-title font-bold text-xl text-[#742C3C] dark:text-[#B79A63]">
                  Kitap İncelemesi Ekle
                </h3>
              </div>
              <button onClick={() => setIsAddReviewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">İncelediğiniz Kitap / Eser</label>
                <select
                  value={newReview.bookId}
                  onChange={e => setNewReview({ ...newReview, bookId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-semibold"
                >
                  {userBooks.map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Değerlendirme Puanı</label>
                <select
                  value={newReview.rating}
                  onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-bold"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Yıldız (Eşsiz / Şaheser)</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Yıldız (Çok Başarılı)</option>
                  <option value={3}>⭐⭐⭐ 3 Yıldız (Güzel / Kayda Değer)</option>
                  <option value={2}>⭐⭐ 2 Yıldız (Orta Seviye)</option>
                  <option value={1}>⭐ 1 Yıldız (Geliştirilmeli)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Eleştirel İnceleme / Tahlil Metni *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Eserin üslubu, ana temaları ve entelektüel tahlilinizi kaleme alın..."
                  value={newReview.content}
                  onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-serif leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddReviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white font-bold shadow-md hover:shadow-lg transition-all"
                >
                  İncelemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD POEM STANDALONE GLOBAL MODAL */}
      {isAddPoemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-black/10 dark:border-white/10 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Feather className="w-5 h-5" />
                </div>
                <h3 className="font-serif-title font-bold text-xl text-[#742C3C] dark:text-[#B79A63]">
                  Yeni Şiir Kaydet
                </h3>
              </div>
              <button onClick={() => setIsAddPoemModalOpen(false)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPoemSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Şiir Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Monna Rosa, Kaldırımlar..."
                  value={newPoem.title}
                  onChange={e => setNewPoem({ ...newPoem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Şair Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Sezai Karakoç, Necip Fazıl..."
                  value={newPoem.poetName}
                  onChange={e => setNewPoem({ ...newPoem, poetName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Şiir Mısraları / Kıtaları *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Şiirin kıtalarını buraya yapıştırın..."
                  value={newPoem.stanzas}
                  onChange={e => setNewPoem({ ...newPoem, stanzas: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10 font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kişisel Not (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Şiirin sizdeki karşılığı..."
                  value={newPoem.userNote}
                  onChange={e => setNewPoem({ ...newPoem, userNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPoemModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Şiiri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
