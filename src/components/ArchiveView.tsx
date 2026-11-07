import React, { useState, useRef, useEffect } from 'react';
import { 
  Archive, FileText, Quote as QuoteIcon, BookMarked, Plus, Star, Search, 
  Trash2, Share2, Sparkles, Check, Download, RotateCw, X, Palette, Square, Circle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Quotation } from '../types';

type PosterTheme = 'gold' | 'burgundy' | 'midnight' | 'parchment';
type CornerStyle = 'rounded' | 'square';

export const ArchiveView: React.FC = () => {
  const { 
    userBooks, 
    reviews, 
    addReview, 
    deleteReview, 
    quotations, 
    addQuotation, 
    deleteQuotation, 
    vocabulary, 
    addVocabularyItem, 
    toggleVocabularyLearned, 
    deleteVocabularyItem 
  } = useApp();

  const [archiveSubTab, setArchiveSubTab] = useState<'reviews' | 'quotes' | 'vocabulary'>('quotes');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showAddReviewModal, setShowAddReviewModal] = useState<boolean>(false);
  const [showAddQuoteModal, setShowAddQuoteModal] = useState<boolean>(false);
  const [showAddWordModal, setShowAddWordModal] = useState<boolean>(false);
  const [selectedQuoteForCard, setSelectedQuoteForCard] = useState<Quotation | null>(null);
  
  // Quote Poster Canvas States
  const [quoteTheme, setQuoteTheme] = useState<PosterTheme>('burgundy');
  const [quoteCornerStyle, setQuoteCornerStyle] = useState<CornerStyle>('rounded');
  const [downloadingQuote, setDownloadingQuote] = useState<boolean>(false);
  const quoteCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [showFlashcardMeaning, setShowFlashcardMeaning] = useState<boolean>(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState<boolean>(false);

  // New Review Form
  const [newReview, setNewReview] = useState({
    bookId: userBooks[0]?.id || '',
    rating: 5,
    content: ''
  });

  // New Quote Form
  const [newQuote, setNewQuote] = useState({
    bookId: userBooks[0]?.id || '',
    quoteText: '',
    pageNumber: 1,
    userNote: '',
    tags: ''
  });

  // New Word Form
  const [newWord, setNewWord] = useState({
    word: '',
    meaning: '',
    exampleSentence: '',
    sourceBookTitle: userBooks[0]?.title || ''
  });

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBook = userBooks.find(b => b.id === newReview.bookId) || userBooks[0];
    if (!targetBook || !newReview.content) return;

    addReview({
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      author: targetBook.author,
      rating: newReview.rating,
      content: newReview.content
    });

    setShowAddReviewModal(false);
    setNewReview({ bookId: userBooks[0]?.id || '', rating: 5, content: '' });
  };

  const handleAddQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBook = userBooks.find(b => b.id === newQuote.bookId) || userBooks[0];
    if (!newQuote.quoteText) return;

    addQuotation(
      newQuote.quoteText,
      newQuote.pageNumber,
      newQuote.userNote,
      targetBook?.id,
      targetBook?.title,
      targetBook?.author
    );

    setShowAddQuoteModal(false);
    setNewQuote({ bookId: userBooks[0]?.id || '', quoteText: '', pageNumber: 1, userNote: '', tags: '' });
  };

  const handleAddWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word || !newWord.meaning) return;

    addVocabularyItem(
      newWord.word,
      newWord.meaning,
      newWord.exampleSentence,
      newWord.sourceBookTitle
    );

    setShowAddWordModal(false);
    setNewWord({ word: '', meaning: '', exampleSentence: '', sourceBookTitle: userBooks[0]?.title || '' });
  };

  // Helper function to draw rounded rect path on canvas
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    w: number, 
    h: number, 
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Render Quote Poster on Canvas
  const renderQuotePoster = () => {
    if (!selectedQuoteForCard) return;
    const canvas = quoteCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // Backgrounds
    if (quoteTheme === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0F3223');
      grad.addColorStop(0.5, '#044B35');
      grad.addColorStop(1, '#02281C');
      ctx.fillStyle = grad;
    } else if (quoteTheme === 'burgundy') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#4B1E2B');
      grad.addColorStop(0.5, '#742C3C');
      grad.addColorStop(1, '#2E1019');
      ctx.fillStyle = grad;
    } else if (quoteTheme === 'midnight') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#141414');
      grad.addColorStop(1, '#050505');
      ctx.fillStyle = grad;
    } else { // parchment
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#FDFBF7');
      grad.addColorStop(1, '#F3ECE0');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    const isDark = quoteTheme !== 'parchment';
    const primaryColor = isDark ? '#D4AF37' : '#742C3C';
    const textColor = isDark ? '#FFFFFF' : '#2C2523';
    const subTextColor = isDark ? '#E2C068' : '#B79A63';

    // Borders
    ctx.strokeStyle = primaryColor;
    if (quoteCornerStyle === 'rounded') {
      ctx.lineWidth = 6;
      drawRoundedRect(ctx, 45, 45, width - 90, height - 90, 36);
      ctx.stroke();

      ctx.lineWidth = 2;
      drawRoundedRect(ctx, 60, 60, width - 120, height - 120, 24);
      ctx.stroke();
    } else {
      ctx.lineWidth = 6;
      ctx.strokeRect(45, 45, width - 90, height - 90);

      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, width - 120, height - 120);
    }

    // Header
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('D İ J İ T A L   K Ü T Ü P H A N E M', width / 2, 140);

    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText('Kişisel Alıntı ve İlham Kartı', width / 2, 175);

    // Quote Mark
    ctx.font = 'bold 160px Georgia, serif';
    ctx.fillStyle = isDark ? 'rgba(212, 175, 55, 0.18)' : 'rgba(116, 44, 60, 0.15)';
    ctx.fillText('“', width / 2, 340);

    // Quote Text Body
    ctx.fillStyle = textColor;
    ctx.font = 'italic 34px Georgia, serif';

    const words = selectedQuoteForCard.quoteText.split(' ');
    let line = '';
    const lines: string[] = [];
    const maxW = 860;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxW && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    let currentY = 440;
    const maxL = Math.min(12, lines.length);
    for (let i = 0; i < maxL; i++) {
      ctx.fillText(`"${lines[i].trim()}"`, width / 2, currentY);
      currentY += 52;
    }

    // Author & Book Info
    currentY += 40;
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillStyle = primaryColor;
    ctx.fillText(`— ${selectedQuoteForCard.author}`, width / 2, currentY);

    currentY += 36;
    ctx.font = '18px Georgia, serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText(`${selectedQuoteForCard.bookTitle}${selectedQuoteForCard.pageNumber ? ` · Sayfa ${selectedQuoteForCard.pageNumber}` : ''}`, width / 2, currentY);

    // Footer
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText('DİJİTAL KÜTÜPHANEM · 40 YILLIK OKUMA MÜFREDATI', width / 2, height - 120);
  };

  useEffect(() => {
    renderQuotePoster();
  }, [selectedQuoteForCard, quoteTheme, quoteCornerStyle]);

  const handleDownloadQuotePNG = () => {
    const canvas = quoteCanvasRef.current;
    if (!canvas) return;
    setDownloadingQuote(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeAuthor = (selectedQuoteForCard?.author || 'Alinti').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Alinti_Karti_${safeAuthor}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setDownloadingQuote(false), 800);
    }
  };

  // Filtered Lists
  const filteredReviews = reviews.filter(r => 
    r.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuotes = quotations.filter(q => 
    q.quoteText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.userNote && q.userNote.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredWords = vocabulary.filter(v => 
    v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.sourceBookTitle && v.sourceBookTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner - Responsive Layout Fix */}
      <div className="bg-gradient-to-r from-[#742C3C] via-[#4B1E2B] to-[#141414] text-white rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B79A63] mb-1">
              <Archive className="w-4 h-4 text-[#B79A63]" />
              <span>Kişisel Bilgi Hazinesi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif-title font-bold">
              Arşiv: İnceleme, Alıntı ve Kelimeler
            </h1>
            <p className="text-xs md:text-sm opacity-80 mt-1 max-w-xl">
              Okuduğunuz eserlerden süzülen fikirler, altı çizilen ilham verici mısralar ve öğrendiğiniz yeni kelimeler.
            </p>
          </div>

          {/* Sub Navigation Segmented Control - Fixed Mobile Grid Layout */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl w-full sm:w-auto shrink-0">
            <button
              onClick={() => setArchiveSubTab('quotes')}
              className={`px-2 py-2 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                archiveSubTab === 'quotes'
                  ? 'bg-[#B79A63] text-slate-900 shadow-md scale-102'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <QuoteIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Alıntılar ({quotations.length})</span>
            </button>

            <button
              onClick={() => setArchiveSubTab('reviews')}
              className={`px-2 py-2 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                archiveSubTab === 'reviews'
                  ? 'bg-[#B79A63] text-slate-900 shadow-md scale-102'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">İnceleme ({reviews.length})</span>
            </button>

            <button
              onClick={() => setArchiveSubTab('vocabulary')}
              className={`px-2 py-2 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                archiveSubTab === 'vocabulary'
                  ? 'bg-[#B79A63] text-slate-900 shadow-md scale-102'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Kelime ({vocabulary.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control & Search Bar - Responsive Fix */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 shadow-sm border border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={
              archiveSubTab === 'quotes' ? 'Alıntılarda metin veya kitap ara...' :
              archiveSubTab === 'reviews' ? 'İncelemelerde ara...' : 'Kelimelerde ara...'
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 dark:border-white/5 text-xs focus:outline-none focus:ring-1 focus:ring-[#742C3C]"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
          {archiveSubTab === 'quotes' && (
            <button
              onClick={() => setShowAddQuoteModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-800 to-[#4B1E2B] text-white text-xs font-bold hover:shadow-lg hover:shadow-rose-900/30 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 border border-rose-500/30"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Yeni Alıntı Ekle</span>
            </button>
          )}

          {archiveSubTab === 'reviews' && (
            <button
              onClick={() => setShowAddReviewModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white text-xs font-bold hover:shadow-lg hover:shadow-indigo-900/30 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 border border-indigo-400/30"
            >
              <Plus className="w-4 h-4 text-indigo-200" />
              <span>İnceleme Yaz</span>
            </button>
          )}

          {archiveSubTab === 'vocabulary' && (
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFlashcardModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 text-xs font-bold hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 border border-amber-400/40"
              >
                <RotateCw className="w-4 h-4 shrink-0" />
                <span>Kartlarla Tekrar</span>
              </button>

              <button
                onClick={() => setShowAddWordModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white text-xs font-bold hover:shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 border border-emerald-400/30"
              >
                <Plus className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>Kelime Ekle</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1. QUOTATIONS SECTION */}
      {archiveSubTab === 'quotes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuotes.length === 0 ? (
            <div className="col-span-2 bg-white dark:bg-[#1E1E1E] rounded-3xl p-12 text-center text-slate-500 border border-black/5">
              <QuoteIcon className="w-12 h-12 stroke-1 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm">Henüz kaydedilmiş bir alıntı bulunmuyor.</p>
            </div>
          ) : (
            filteredQuotes.map(q => (
              <div 
                key={q.id}
                className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-5 md:p-6 shadow-md border border-black/5 dark:border-white/5 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif-title font-bold text-sm text-[#742C3C] dark:text-[#B79A63]">
                        {q.bookTitle}
                      </h4>
                      <p className="text-xs text-slate-500">{q.author} {q.pageNumber && `· Sayfa ${q.pageNumber}`}</p>
                    </div>

                    <button
                      onClick={() => deleteQuotation(q.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <blockquote className="font-serif-title italic text-base leading-relaxed text-slate-800 dark:text-slate-200 border-l-4 border-[#742C3C] dark:border-[#B79A63] pl-4 py-1">
                    "{q.quoteText}"
                  </blockquote>

                  {q.userNote && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-[#F8F5EF] dark:bg-[#141414] p-2.5 rounded-xl border border-black/5">
                      <strong>Notunuz:</strong> {q.userNote}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/5">
                  <span className="text-[10px] text-slate-400">
                    {new Date(q.createdAt).toLocaleDateString('tr-TR')}
                  </span>

                  <button
                    onClick={() => setSelectedQuoteForCard(q)}
                    className="px-3 py-1.5 rounded-xl bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63] text-xs font-semibold hover:bg-[#742C3C]/20 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Görsel Poster Oluştur (PNG)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. REVIEWS SECTION */}
      {archiveSubTab === 'reviews' && (
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-12 text-center text-slate-500 border border-black/5">
              <FileText className="w-12 h-12 stroke-1 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm">Henüz bir kitap incelemesi yazılmamış.</p>
            </div>
          ) : (
            filteredReviews.map(r => (
              <div 
                key={r.id}
                className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-md border border-black/5 dark:border-white/5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63]">
                      {r.bookTitle}
                    </h3>
                    <p className="text-xs text-slate-500">{r.author}</p>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{r.rating} / 5</span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {r.content}
                </p>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-black/5">
                  <span>Tarih: {new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                  <button onClick={() => deleteReview(r.id)} className="text-rose-500 hover:underline">
                    İncelemeyi Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. VOCABULARY SECTION */}
      {archiveSubTab === 'vocabulary' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredWords.length === 0 ? (
            <div className="col-span-3 bg-white dark:bg-[#1E1E1E] rounded-3xl p-12 text-center text-slate-500 border border-black/5">
              <BookMarked className="w-12 h-12 stroke-1 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm">Henüz kelime defterinize eklenmiş kelime yok.</p>
            </div>
          ) : (
            filteredWords.map(v => (
              <div 
                key={v.id}
                className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-5 shadow-sm border border-black/5 dark:border-white/5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63]">
                      {v.word}
                    </h4>
                    <button
                      onClick={() => toggleVocabularyLearned(v.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        v.isLearned ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {v.isLearned ? 'Öğrenildi' : 'Öğrenilecek'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {v.meaning}
                  </p>

                  {v.exampleSentence && (
                    <p className="text-xs text-slate-500 italic mt-2 bg-[#F8F5EF] dark:bg-[#141414] p-2 rounded-lg">
                      "{v.exampleSentence}"
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-black/5">
                  <span>{v.sourceBookTitle || 'Genel Okuma'}</span>
                  <button onClick={() => deleteVocabularyItem(v.id)} className="text-rose-500 hover:underline">
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SHAREABLE QUOTE POSTER GENERATOR MODAL (With Theme & Corner Selection) */}
      {selectedQuoteForCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-black/10 dark:border-white/10 my-8">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B79A63]" />
                <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63]">
                  Görsel Alıntı Posteri (PNG)
                </h3>
              </div>
              <button onClick={() => setSelectedQuoteForCard(null)} className="p-1 rounded hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Controls */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-[#B79A63]" />
                  <span>Poster Teması:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setQuoteTheme('burgundy')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${quoteTheme === 'burgundy' ? 'bg-[#742C3C] text-white ring-2 ring-[#742C3C]' : 'bg-slate-100 dark:bg-slate-800'}`}
                  >
                    Bordo Büyü
                  </button>
                  <button
                    onClick={() => setQuoteTheme('gold')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${quoteTheme === 'gold' ? 'bg-[#0F3223] text-[#D4AF37] ring-2 ring-[#D4AF37]' : 'bg-slate-100 dark:bg-slate-800'}`}
                  >
                    Zümrüt & Altın
                  </button>
                  <button
                    onClick={() => setQuoteTheme('midnight')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${quoteTheme === 'midnight' ? 'bg-[#141414] text-white ring-2 ring-slate-400' : 'bg-slate-100 dark:bg-slate-800'}`}
                  >
                    Gece Zifir
                  </button>
                  <button
                    onClick={() => setQuoteTheme('parchment')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${quoteTheme === 'parchment' ? 'bg-[#FDFBF7] text-[#2C2523] ring-2 ring-[#742C3C]' : 'bg-slate-100 dark:bg-slate-800'}`}
                  >
                    Parşömen
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Square className="w-3.5 h-3.5 text-[#B79A63]" />
                  <span>Köşe Şekli:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQuoteCornerStyle('rounded')}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${quoteCornerStyle === 'rounded' ? 'bg-[#742C3C]/10 text-[#742C3C] border border-[#742C3C]' : 'bg-slate-100 dark:bg-slate-800'}`}
                  >
                    <Circle className="w-3.5 h-3.5 fill-current opacity-60" />
                    <span>Yuvarlak Köşeli</span>
                  </button>
                  <button
                    onClick={() => setQuoteCornerStyle('square')}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${quoteCornerStyle === 'square' ? 'bg-[#742C3C]/10 text-[#742C3C] border border-[#742C3C]' : 'bg-slate-100 dark:bg-slate-800'}`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Keskin / Dik Köşeli</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Canvas Preview */}
            <div className="flex justify-center bg-slate-900 p-3 rounded-2xl mb-4 max-h-[360px] overflow-y-auto">
              <canvas 
                ref={quoteCanvasRef}
                className={`max-w-full h-auto shadow-2xl border border-white/10 ${quoteCornerStyle === 'rounded' ? 'rounded-2xl' : 'rounded-none'}`}
                style={{ maxHeight: '320px' }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedQuoteForCard(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Kapat
              </button>
              <button
                onClick={handleDownloadQuotePNG}
                disabled={downloadingQuote}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#742C3C] hover:bg-[#4B1E2B] text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <Download className="w-4 h-4 text-[#B79A63]" />
                <span>{downloadingQuote ? 'Hazırlanıyor...' : 'PNG Olarak İndir (HD)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLASHCARD REVIEW MODAL */}
      {showFlashcardModal && vocabulary.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-black/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63]">
                Kelime Kartları ile Tekrar ({flashcardIndex + 1} / {vocabulary.length})
              </h3>
              <button onClick={() => setShowFlashcardModal(false)} className="p-1 rounded hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Card view */}
            <div 
              onClick={() => setShowFlashcardMeaning(!showFlashcardMeaning)}
              className="bg-[#F8F5EF] dark:bg-[#141414] rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center cursor-pointer border-2 border-[#742C3C]/20 hover:border-[#742C3C] transition-all shadow-md my-4"
            >
              <span className="text-xs text-slate-400 mb-2">Dokunarak Anlamı Göster/Gizle</span>
              <h3 className="font-serif-title font-bold text-2xl text-[#742C3C] dark:text-[#B79A63] mb-3">
                {vocabulary[flashcardIndex].word}
              </h3>

              {showFlashcardMeaning ? (
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium animate-in fade-in">
                  {vocabulary[flashcardIndex].meaning}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">Anlamı görmek için tıklayın</p>
              )}
            </div>

            <div className="flex justify-between items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setShowFlashcardMeaning(false);
                  setFlashcardIndex(prev => (prev > 0 ? prev - 1 : vocabulary.length - 1));
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
              >
                Önceki
              </button>

              <button
                onClick={() => {
                  toggleVocabularyLearned(vocabulary[flashcardIndex].id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
              >
                {vocabulary[flashcardIndex].isLearned ? 'Öğrenildi' : 'Öğrenildi İşaretle'}
              </button>

              <button
                onClick={() => {
                  setShowFlashcardMeaning(false);
                  setFlashcardIndex(prev => (prev < vocabulary.length - 1 ? prev + 1 : 0));
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#742C3C] text-white"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD REVIEW MODAL */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63] mb-4">
              Kitap İncelemesi Yaz
            </h3>
            <form onSubmit={handleAddReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Kitap Seçin</label>
                <select
                  value={newReview.bookId}
                  onChange={e => setNewReview({ ...newReview, bookId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10"
                >
                  {userBooks.map(b => (
                    <option key={b.id} value={b.id}>{b.title} - {b.author}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Değerlendirmeniz (1 - 5 Puan)</label>
                <select
                  value={newReview.rating}
                  onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 font-bold"
                >
                  <option value={5}>5 Yıldız (Mükemmel)</option>
                  <option value={4}>4 Yıldız (Çok İyi)</option>
                  <option value={3}>3 Yıldız (İyi)</option>
                  <option value={2}>2 Yıldız (Orta)</option>
                  <option value={1}>1 Yıldız (Zayıf)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">İnceleme Metni</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Eserle ilgili tahlil ve görüşleriniz..."
                  value={newReview.content}
                  onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddReviewModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-200">İptal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#742C3C] text-white font-semibold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD QUOTE MODAL */}
      {showAddQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63] mb-4">
              Yeni Alıntı Kaydet
            </h3>
            <form onSubmit={handleAddQuoteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Kaynak Kitap</label>
                <select
                  value={newQuote.bookId}
                  onChange={e => setNewQuote({ ...newQuote, bookId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10"
                >
                  {userBooks.map(b => (
                    <option key={b.id} value={b.id}>{b.title} - {b.author}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Alıntı Metni *</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Alıntıladığınız metin..."
                  value={newQuote.quoteText}
                  onChange={e => setNewQuote({ ...newQuote, quoteText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Sayfa Numarası</label>
                  <input 
                    type="number"
                    value={newQuote.pageNumber}
                    onChange={e => setNewQuote({ ...newQuote, pageNumber: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Notunuz</label>
                  <input 
                    type="text"
                    placeholder="İsteğe bağlı not..."
                    value={newQuote.userNote}
                    onChange={e => setNewQuote({ ...newQuote, userNote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddQuoteModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-200">İptal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#742C3C] text-white font-semibold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD WORD MODAL */}
      {showAddWordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-serif-title font-bold text-lg text-[#742C3C] dark:text-[#B79A63] mb-4">
              Kelime Defterine Ekle
            </h3>
            <form onSubmit={handleAddWordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Kelime *</label>
                <input 
                  type="text"
                  required
                  placeholder="Kelime..."
                  value={newWord.word}
                  onChange={e => setNewWord({ ...newWord, word: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 font-bold"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Anlamı / Tanımı *</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Kelimenin anlamı..."
                  value={newWord.meaning}
                  onChange={e => setNewWord({ ...newWord, meaning: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Örnek Cümle</label>
                <input 
                  type="text"
                  placeholder="Kullanım örneği..."
                  value={newWord.exampleSentence}
                  onChange={e => setNewWord({ ...newWord, exampleSentence: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10"
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddWordModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-200">İptal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#742C3C] text-white font-semibold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
