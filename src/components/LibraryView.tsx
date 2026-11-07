import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, Grid, List, Plus, Star, BookCheck, Clock, 
  PauseCircle, BookmarkPlus, Play, Trash2, Edit3, FileUp, Paperclip, ChevronRight, X, AlertTriangle, Eye, Image as ImageIcon, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookStatus, UserBook } from '../types';
import { MAIN_CATEGORIES, DEFAULT_BOOK_COVERS } from '../data/catalogData';
import { CoverManagerModal } from './CoverManagerModal';
import { BookCoverImage } from './BookCoverImage';

export const LibraryView: React.FC = () => {
  const { 
    userBooks, 
    addBookToLibrary, 
    deleteBookFromLibrary, 
    deduplicateBooks,
    updateBookStatus,
    updateBookCover,
    updateBookTags,
    setActiveBookForReader,
    attachBookFile,
    reviews,
    quotations,
    addQuotation,
    selectedBookForDetail,
    setSelectedBookForDetail
  } = useApp();

  const [bookToDelete, setBookToDelete] = useState<UserBook | null>(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  const [activeStatusTab, setActiveStatusTab] = useState<BookStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'shelf' | 'list'>('shelf');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'author' | 'progress'>('recent');

  const popularGenreTags = ['Roman', 'Felsefe', 'Tarih', 'Şiir', 'Tasavvuf', 'Deneme', 'İslam Tarihi', 'Hikaye', 'Siyaset', 'Bilim', 'Psikoloji'];

  const allAvailableTags = React.useMemo(() => {
    const set = new Set<string>(popularGenreTags);
    userBooks.forEach(b => {
      (b.tags || []).forEach(t => set.add(t));
    });
    return Array.from(set).sort();
  }, [userBooks]);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCoverManager, setShowCoverManager] = useState<boolean>(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');

  // Add Book Form state
  const [newBook, setNewBook] = useState<{
    title: string;
    author: string;
    category: string;
    subCategory: string;
    publisher: string;
    publishYear: string;
    isbn: string;
    totalPages: number;
    currentPage: number;
    coverUrl: string;
    description: string;
    status: BookStatus;
    isMultiVolume: boolean;
    seriesTitle: string;
    volumeNumber: number;
    totalVolumes: number;
  }>({
    title: '',
    author: '',
    category: MAIN_CATEGORIES[0],
    subCategory: '',
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

  // Filtering Logic
  const filteredBooks = userBooks.filter(book => {
    if (activeStatusTab !== 'all' && book.status !== activeStatusTab) {
      return false;
    }
    if (selectedCategory !== 'all') {
      const catNorm = selectedCategory.toLowerCase().trim();
      const bookCatNorm = (book.category || '').toLowerCase().trim();
      const bookSubNorm = (book.subCategory || '').toLowerCase().trim();
      const bookTagsNorm = (book.tags || []).map(t => t.toLowerCase().trim());
      
      const matches = bookCatNorm === catNorm || 
                      bookCatNorm.includes(catNorm) || 
                      catNorm.includes(bookCatNorm) ||
                      bookSubNorm.includes(catNorm) ||
                      bookTagsNorm.includes(catNorm);
      if (!matches) {
        return false;
      }
    }
    if (selectedTag !== 'all') {
      const tagNorm = selectedTag.toLowerCase().trim();
      const bookTagsNorm = (book.tags || []).map(t => t.toLowerCase().trim());
      const bookCatNorm = (book.category || '').toLowerCase().trim();
      if (!bookTagsNorm.includes(tagNorm) && !bookCatNorm.includes(tagNorm)) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q);
      const matchCategory = book.category.toLowerCase().includes(q);
      const matchTags = book.tags?.some(t => t.toLowerCase().includes(q));
      const matchISBN = book.isbn?.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchCategory || matchTags || matchISBN;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'tr');
    if (sortBy === 'author') return a.author.localeCompare(b.author, 'tr');
    if (sortBy === 'progress') {
      const progA = a.currentPage / Math.max(1, a.totalPages);
      const progB = b.currentPage / Math.max(1, b.totalPages);
      return progB - progA;
    }
    // sortBy === 'recent'
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (isNaN(timeA) || isNaN(timeB) || timeA === timeB) {
      return b.id.localeCompare(a.id);
    }
    return timeB - timeA;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    // Check duplicate
    const exists = userBooks.some(b => b.title.toLowerCase() === newBook.title.toLowerCase());
    if (exists) {
      setDuplicateWarning(`"${newBook.title}" kitabı zaten kütüphanenizde mevcut!`);
    } else {
      setDuplicateWarning('');
    }

    addBookToLibrary({
      title: newBook.title,
      author: newBook.author,
      category: newBook.category,
      subCategory: newBook.subCategory || 'Genel',
      publisher: newBook.publisher,
      publishYear: newBook.publishYear,
      isbn: newBook.isbn,
      totalPages: Number(newBook.totalPages) || 200,
      currentPage: Number(newBook.currentPage) || 0,
      coverUrl: newBook.coverUrl || DEFAULT_BOOK_COVERS[newBook.category] || DEFAULT_BOOK_COVERS["Edebiyat"],
      description: newBook.description,
      status: newBook.status,
      isMultiVolume: newBook.isMultiVolume,
      seriesTitle: newBook.seriesTitle,
      volumeNumber: Number(newBook.volumeNumber) || 1,
      totalVolumes: Number(newBook.totalVolumes) || 1
    });

    setSortBy('recent');
    setActiveStatusTab('all');
    setShowAddModal(false);

    // Reset form
    setNewBook({
      title: '',
      author: '',
      category: MAIN_CATEGORIES[0],
      subCategory: '',
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

  const handleIsbnLookup = () => {
    if (!newBook.isbn) return;
    setNewBook(prev => ({
      ...prev,
      title: prev.isbn === '9789759955748' ? 'Saatleri Ayarlama Enstitüsü' : 'Örnek Klasik Eser',
      author: prev.isbn === '9789759955748' ? 'Ahmet Hamdi Tanpınar' : 'Mütefekkir Yazar',
      category: 'Edebiyat',
      publisher: 'Klasik Yayınları',
      totalPages: 380,
      description: 'ISBN aramasıyla doğrulanmış kitap açıklaması.'
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bookId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileType = file.name.endsWith('.epub') ? 'epub' : 'pdf';
        const objectUrl = await attachBookFile(bookId, file);
        
        if (selectedBookForDetail && selectedBookForDetail.id === bookId) {
          setSelectedBookForDetail({
            ...selectedBookForDetail,
            fileStorageUrl: objectUrl,
            fileType: fileType as 'pdf' | 'epub',
            fileName: file.name
          });
        }
      } catch (err) {
        console.error('File attach error:', err);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-indigo-500/10 p-5 rounded-3xl border border-amber-500/20 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif-title font-bold text-[#742C3C] dark:text-[#B79A63]">
            Kişisel Kütüphanem ({userBooks.length} Eser)
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Sahip olduğunuz, okuduğunuz veya planladığınız tüm kişisel dijital eser arşiviniz.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setShowCoverManager(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all active:scale-95 shrink-0 whitespace-nowrap"
          >
            <ImageIcon className="w-4 h-4 text-slate-950" />
            <span>Kapak Paneli</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-800 to-[#4B1E2B] text-white text-xs font-bold shadow-lg shadow-rose-900/30 hover:shadow-rose-900/40 transition-all active:scale-95 shrink-0 whitespace-nowrap border border-rose-500/30"
          >
            <Plus className="w-4 h-4 text-[#B79A63]" />
            <span>Yeni Kitap Ekle</span>
          </button>
        </div>
      </div>

      {deleteSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 dark:bg-emerald-950/40 border border-emerald-500/35 flex items-center justify-between gap-3 text-xs font-bold text-emerald-900 dark:text-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{deleteSuccessMessage}</span>
          </div>
          <button onClick={() => setDeleteSuccessMessage(null)} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-5 shadow-md border border-black/5 dark:border-white/5 space-y-4">
        {/* Colorful Status Tabs with smooth horizontal scroll and non-truncating pills */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3.5 gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0 py-0.5">
            <button
              onClick={() => setActiveStatusTab('all')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 shadow-sm ${
                activeStatusTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-indigo-500/30 ring-2 ring-indigo-400/50'
                  : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
            >
              <span>Tüm Eserler ({userBooks.length})</span>
            </button>

            <button
              onClick={() => setActiveStatusTab('reading')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all shadow-sm ${
                activeStatusTab === 'reading'
                  ? 'bg-[#742C3C] text-white shadow-rose-900/30 ring-2 ring-rose-400/50'
                  : 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span>Okunmakta ({userBooks.filter(b => b.status === 'reading').length})</span>
            </button>

            <button
              onClick={() => setActiveStatusTab('completed')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all shadow-sm ${
                activeStatusTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                  : 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
              }`}
            >
              <BookCheck className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>Okunmuş ({userBooks.filter(b => b.status === 'completed').length})</span>
            </button>

            <button
              onClick={() => setActiveStatusTab('paused')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all shadow-sm ${
                activeStatusTab === 'paused'
                  ? 'bg-amber-600 text-white shadow-amber-500/30 ring-2 ring-amber-400/50'
                  : 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              }`}
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span>Yarıda ({userBooks.filter(b => b.status === 'paused').length})</span>
            </button>

            <button
              onClick={() => setActiveStatusTab('want_to_read')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all shadow-sm ${
                activeStatusTab === 'want_to_read'
                  ? 'bg-blue-600 text-white shadow-blue-500/30 ring-2 ring-blue-400/50'
                  : 'text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              <span>Okunacaklar ({userBooks.filter(b => b.status === 'want_to_read').length})</span>
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl shrink-0 border border-black/5 dark:border-white/5">
            <button
              onClick={() => setViewMode('shelf')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'shelf' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              title="Dijital Raf Görünümü"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              title="Liste Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Categories Filter Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar text-xs font-semibold border-b border-black/5 dark:border-white/5">
          <span className="text-[11px] font-bold text-[#742C3C] dark:text-[#B79A63] uppercase tracking-wider shrink-0 flex items-center gap-1">
            📚 Kategoriler:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#742C3C] text-white font-bold shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10'
            }`}
          >
            Tüm Kategoriler
          </button>
          {MAIN_CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#742C3C] text-white font-bold shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Genre Tags Filter Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-semibold">

          <span className="text-[11px] font-bold text-[#742C3C] dark:text-[#B79A63] uppercase tracking-wider shrink-0 flex items-center gap-1">
            🏷️ Tür Etiketleri:
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
              selectedTag === 'all'
                ? 'bg-[#742C3C] text-white font-bold shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10'
            }`}
          >
            Tüm Etiketler
          </button>
          {allAvailableTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedTag === tag
                  ? 'bg-[#742C3C] text-white font-bold shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Search Input & Select Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Kitap adı, yazar, kategori veya ISBN ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 text-xs focus:outline-none focus:ring-1 focus:ring-[#742C3C]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                Temizle
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 text-xs font-medium focus:outline-none"
            >
              <option value="all">Tüm Kategoriler</option>
              {MAIN_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 text-xs font-medium focus:outline-none"
            >
              <option value="recent">Son Eklenen</option>
              <option value="title">A - Z (Başlık)</option>
              <option value="author">Yazar Adı</option>
              <option value="progress">İlerleme Yüzdesi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Books Content Display */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-12 text-center text-slate-500 border border-black/5">
          <BookOpen className="w-12 h-12 stroke-1 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-serif-title font-bold text-lg text-slate-800 dark:text-slate-200">
            Kütüphanenizde Eser Bulunamadı
          </h3>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            Arama kriterlerinizi değiştirebilir veya yeni eserler ekleyebilirsiniz.
          </p>
        </div>
      ) : viewMode === 'shelf' ? (
        /* DIGITAL SHELF VIEW */
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-md border border-black/5 dark:border-white/5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredBooks.map(book => {
                const bookProg = Math.round((book.currentPage / book.totalPages) * 100);
                return (
                  <div 
                    key={book.id}
                    onClick={() => setSelectedBookForDetail(book)}
                    className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-1.5"
                  >
                    {/* Visual 3D Book Cover */}
                    <div className="w-full aspect-[2/3] rounded-xl overflow-hidden book-shadow book-spine-effect relative">
                      <BookCoverImage 
                        src={book.coverUrl} 
                        alt={book.title}
                        loading="lazy"
                        title={book.title}
                        author={book.author}
                        category={book.category}
                        isMultiVolume={book.isMultiVolume}
                        volumeNumber={book.volumeNumber}
                        progressPercent={bookProg}
                        isCompleted={book.status === 'completed' || bookProg >= 100}
                      />

                      {/* Status indicator badge */}
                      <span className={`absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold rounded shadow-md z-10 ${
                        book.status === 'completed' ? 'bg-emerald-600 text-white' :
                        book.status === 'reading' ? 'bg-[#742C3C] text-white' :
                        book.status === 'paused' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {book.status === 'completed' ? 'Tamamlandı' : book.status === 'reading' ? 'Okunuyor' : book.status === 'paused' ? 'Yarıda' : 'Okunacak'}
                      </span>

                      {/* Aesthetic Quick Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookToDelete(book);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-rose-600/90 text-white/90 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-xs flex items-center justify-center shadow-xs z-20 cursor-pointer active:scale-90"
                        title="Kitabı Kaldır"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Wooden Shelf Baseline */}
                    <div className="w-full h-2 bg-gradient-to-r from-[#5C3D2E] via-[#8B5E3C] to-[#5C3D2E] rounded-sm my-2 shadow-inner" />

                    {/* Book Metadata Below Shelf */}
                    <div className="w-full text-center space-y-0.5">
                      <h4 className="font-serif-title font-bold text-xs line-clamp-1 group-hover:text-[#742C3C] dark:group-hover:text-[#B79A63] transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{book.author}</p>

                      {book.tags && book.tags.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mt-1">
                          {book.tags.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-800 h-1 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-[#742C3C] dark:bg-[#B79A63] h-full" 
                          style={{ width: `${bookProg}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* DETAILED LIST VIEW */
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-md border border-black/5 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] dark:bg-[#141414] border-b border-black/5 dark:border-white/5 font-serif-title text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Eser & Yazar</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Sayfa / İlerleme</th>
                  <th className="px-4 py-3">Dosya</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredBooks.map(book => {
                  const bookProg = Math.round((book.currentPage / book.totalPages) * 100);
                  return (
                    <tr key={book.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div 
                          onClick={() => setSelectedBookForDetail(book)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img 
                            src={book.coverUrl} 
                            alt={book.title} 
                            loading="lazy"
                            decoding="async"
                            className="w-9 h-12 rounded object-cover book-shadow shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-serif-title font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#742C3C] dark:group-hover:text-[#B79A63]">
                              {book.title}
                            </p>
                            <p className="text-[11px] text-slate-500">{book.author} {book.isMultiVolume && `(Cilt ${book.volumeNumber})`}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">
                        {book.category}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          book.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          book.status === 'reading' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          book.status === 'paused' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {book.status === 'completed' ? 'Tamamlandı' : book.status === 'reading' ? 'Okunuyor' : book.status === 'paused' ? 'Yarıda' : 'Okunacak'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold">
                            <span>{book.currentPage}/{book.totalPages}</span>
                            <span>%{bookProg}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#742C3C] dark:bg-[#B79A63] h-full" style={{ width: `${bookProg}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {book.fileStorageUrl ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Paperclip className="w-3.5 h-3.5" />
                            {book.fileType?.toUpperCase()}
                          </span>
                        ) : (
                          <label className="cursor-pointer text-[11px] text-[#742C3C] dark:text-[#B79A63] hover:underline flex items-center gap-1">
                            <FileUp className="w-3.5 h-3.5" />
                            <span>Dosya Bağla</span>
                            <input 
                              type="file" 
                              accept=".pdf,.epub" 
                              onChange={e => handleFileUpload(e, book.id)} 
                              className="hidden" 
                            />
                          </label>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => setActiveBookForReader(book)}
                          className="p-1.5 rounded bg-[#742C3C] text-white hover:bg-[#4B1E2B]"
                          title="Okuyucuda Aç"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => setSelectedBookForDetail(book)}
                          className="p-1.5 rounded border border-gray-300 dark:border-gray-700 hover:bg-black/5"
                          title="Detaylar"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBookToDelete(book)}
                          className="p-1.5 rounded-lg text-rose-600/80 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD BOOK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/10 dark:border-white/10 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif-title font-bold text-xl text-[#742C3C] dark:text-[#B79A63]">
                Kütüphaneye Manuel Kitap Ekle
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 mb-4 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block font-medium mb-1">ISBN ile Otomatik Ara (İsteğe bağlı)</label>
                  <input 
                    type="text"
                    placeholder="Örn: 9789759955748"
                    value={newBook.isbn}
                    onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleIsbnLookup}
                  className="px-3 py-2 rounded-xl bg-[#B79A63] text-slate-900 font-semibold"
                >
                  Ara
                </button>
              </div>

              <div>
                <label className="block font-medium mb-1">Kitap Adı *</label>
                <input 
                  type="text"
                  required
                  placeholder="Eser adı..."
                  value={newBook.title}
                  onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Yazar *</label>
                <input 
                  type="text"
                  required
                  placeholder="Yazar adı..."
                  value={newBook.author}
                  onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Ana Kategori</label>
                  <select
                    value={newBook.category}
                    onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  >
                    {MAIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Toplam Sayfa</label>
                  <input 
                    type="number"
                    min={1}
                    value={newBook.totalPages}
                    onChange={e => setNewBook({ ...newBook, totalPages: parseInt(e.target.value, 10) || 100 })}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Yayınevi</label>
                  <input 
                    type="text"
                    placeholder="Yayınevi..."
                    value={newBook.publisher}
                    onChange={e => setNewBook({ ...newBook, publisher: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Okuma Durumu</label>
                  <select
                    value={newBook.status}
                    onChange={e => setNewBook({ ...newBook, status: e.target.value as BookStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  >
                    <option value="reading">Okunmakta</option>
                    <option value="completed">Okunmuş / Tamamlandı</option>
                    <option value="paused">Yarıda</option>
                    <option value="want_to_read">Okunacaklar Listesi</option>
                  </select>
                </div>
              </div>

              {/* Multi-volume checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="isMultiVolume"
                  checked={newBook.isMultiVolume}
                  onChange={e => setNewBook({ ...newBook, isMultiVolume: e.target.checked })}
                  className="rounded border-gray-300 text-[#742C3C] focus:ring-[#742C3C]"
                />
                <label htmlFor="isMultiVolume" className="font-medium">Bu eser çok ciltli bir külliyattır</label>
              </div>

              {newBook.isMultiVolume && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F8F5EF] dark:bg-[#141414]">
                  <div>
                    <label className="block font-medium mb-1">Cilt Numarası</label>
                    <input 
                      type="number"
                      min={1}
                      value={newBook.volumeNumber}
                      onChange={e => setNewBook({ ...newBook, volumeNumber: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Toplam Cilt Sayısı</label>
                    <input 
                      type="number"
                      min={1}
                      value={newBook.totalVolumes}
                      onChange={e => setNewBook({ ...newBook, totalVolumes: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-gray-200 dark:bg-gray-800 hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-[#742C3C] text-white hover:bg-[#4B1E2B]"
                >
                  Kütüphaneye Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COVER MANAGER MODAL */}
      <CoverManagerModal 
        isOpen={showCoverManager} 
        onClose={() => setShowCoverManager(false)} 
      />

      {/* DELETE CONFIRMATION MODAL */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] dark:bg-[#1C1C1C] rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-rose-500/20 space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-700/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif-title font-bold text-lg text-slate-900 dark:text-slate-100">
                Eseri Kütüphaneden Kaldır
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-900 dark:text-slate-200">"{bookToDelete.title}"</strong> adlı eser kütüphanenizden kalıcı olarak silinecektir.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-black/10 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBookFromLibrary(bookToDelete.id);
                  setDeleteSuccessMessage(`"${bookToDelete.title}" kütüphaneden başarıyla silindi.`);
                  setBookToDelete(null);
                  setSelectedBookForDetail(null);
                  setTimeout(() => setDeleteSuccessMessage(null), 4000);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-md shadow-rose-900/20 transition-all active:scale-95"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK TOAST NOTIFICATIONS */}
      {deleteSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{deleteSuccessMessage}</span>
        </div>
      )}
    </div>
  );
};
