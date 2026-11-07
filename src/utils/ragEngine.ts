import { UserBook, ReadingSession, Quotation, BookReview, VocabularyItem, CurriculumYear, Poet } from '../types';

export interface RAGSearchInput {
  query: string;
  userBooks: UserBook[];
  readingSessions: ReadingSession[];
  quotations: Quotation[];
  reviews: BookReview[];
  vocabulary: VocabularyItem[];
  curriculum: CurriculumYear[];
  poetry: Poet[];
  displayName: string;
  dailyTargetPages: number;
}

export interface RAGSearchResult {
  summary: {
    displayName: string;
    dailyTargetPages: number;
    totalBooks: number;
    completedBooks: number;
    readingBooks: number;
    totalQuotesCount: number;
    totalSessionsCount: number;
    activeBooksInfo: string[];
  };
  retrievedBooks: string[];
  retrievedQuotes: string[];
  retrievedReviews: string[];
  retrievedCurriculum: string[];
  retrievedPoetry: string[];
  retrievedVocab: string[];
  densePromptContext: string;
}

function normalizeSearchText(text: string): string {
  return text.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i');
}

const TURKISH_STOPWORDS = new Set([
  'bir', 'bu', 'şu', 'o', 've', 'ile', 'de', 'da', 'ki', 'mi', 'mu', 'mü', 'mı',
  'için', 'gibi', 'kadar', 'daha', 'çok', 'en', 'ne', 'nasıl', 'neden', 'niçin',
  'ben', 'sen', 'biz', 'siz', 'onlar', 'var', 'yok', 'ama', 'fakat', 'ancak', 'ise',
  'her', 'tüm', 'bütün', 'bana', 'sana', 'bunu', 'şunu', 'olan', 'olarak', 'şey',
  'bölüm', 'sayfa', 'kitap', 'eder', 'ediyor', 'yapar', 'yapıyor', 'hakkında', 'şimdi',
  'sürekli', 'tekrar'
].map(normalizeSearchText));

// Fold Turkish spelling variants while keeping non-Latin letters, such as Arabic.
function tokenize(text: string): string[] {
  return normalizeSearchText(text)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !TURKISH_STOPWORDS.has(w));
}

function calculateSimilarity(queryTokens: string[], textTokens: string[]): number {
  if (queryTokens.length === 0 || textTokens.length === 0) return 0;
  const textSet = new Set(textTokens);
  let matchCount = 0;
  for (const qt of queryTokens) {
    if (textSet.has(qt)) matchCount++;
  }
  return matchCount / Math.max(1, queryTokens.length);
}

export function buildVectorRAGContext(input: RAGSearchInput): RAGSearchResult {
  const {
    query,
    userBooks,
    readingSessions,
    quotations,
    reviews,
    vocabulary,
    curriculum,
    poetry,
    displayName,
    dailyTargetPages
  } = input;

  const queryTokens = [...new Set(tokenize(query))];

  // 1. High-level Summary & 12 Categories Breakdown
  const completedBooks = userBooks.filter(b => b.status === 'completed');
  const readingBooks = userBooks.filter(b => b.status === 'reading');
  const wantToReadBooks = userBooks.filter(b => b.status === 'want_to_read');
  const pausedBooks = userBooks.filter(b => b.status === 'paused');

  const categoryStats: Record<string, number> = Object.create(null);
  userBooks.forEach(b => {
    const cat = b.category || 'Genel';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  const activeBooksInfo = readingBooks.slice(0, 8).map(
    b => `"${b.title}" (${b.author}) - Sayfa: ${b.currentPage}/${b.totalPages} (%${Math.round((b.currentPage / Math.max(1, b.totalPages)) * 100)})`
  );

  const completedBooksInfo = completedBooks.slice(0, 5).map(
    b => `"${b.title}" (${b.author}) - Kategori: ${b.category}`
  );

  const wantToReadInfo = wantToReadBooks.slice(0, 5).map(
    b => `"${b.title}" (${b.author}) - Kategori: ${b.category}`
  );

  const summary = {
    displayName,
    dailyTargetPages,
    totalBooks: userBooks.length,
    completedBooks: completedBooks.length,
    readingBooks: readingBooks.length,
    wantToReadBooks: wantToReadBooks.length,
    totalQuotesCount: quotations.length,
    totalSessionsCount: readingSessions.length,
    activeBooksInfo,
    completedBooksInfo,
    wantToReadInfo,
    categoryStats
  };

  // 2. Vector Search / Scoring across User Books
  const scoredBooks = userBooks.map(b => {
    const textContent = `${b.title} ${b.author} ${b.category} ${b.subCategory || ''} ${b.userNotes || ''} ${(b.tags || []).join(' ')} ${b.description || ''}`;
    const score = calculateSimilarity(queryTokens, tokenize(textContent));
    return { book: b, score };
  }).sort((a, b) => b.score - a.score);

  // 3. Vector Search across Quotations
  const scoredQuotes = quotations.map(q => {
    const textContent = `${q.quoteText} ${q.userNote || ''} ${q.bookTitle} ${q.author} ${(q.tags || []).join(' ')}`;
    const score = calculateSimilarity(queryTokens, tokenize(textContent));
    return { quote: q, score };
  }).sort((a, b) => b.score - a.score);

  // 4. Vector Search across Reviews
  const scoredReviews = reviews.map(r => {
    const textContent = `${r.bookTitle} ${r.author} ${r.content} ${r.rating} yıldız`;
    const score = calculateSimilarity(queryTokens, tokenize(textContent));
    return { review: r, score };
  }).sort((a, b) => b.score - a.score);

  // 5. Vector Search across Vocabulary
  const scoredVocab = vocabulary.map(v => {
    const textContent = `${v.word} ${v.meaning} ${v.exampleSentence || ''} ${v.sourceBookTitle || ''}`;
    const score = calculateSimilarity(queryTokens, tokenize(textContent));
    return { vocab: v, score };
  }).sort((a, b) => b.score - a.score);

  // 6. Vector Search across 40-Year Curriculum
  const curriculumItems: { yearNum: number; monthNum: number; bookTitle: string; author: string; category: string; description: string; score: number }[] = [];
  curriculum.forEach(y => {
    y.months.forEach(m => {
      m.weeklyBooks.forEach(wb => {
        const textContent = `${y.title} ${y.theme || ''} ${m.monthTitle} ${m.authorName} ${m.authorBio} ${wb.title} ${wb.author} ${wb.category} ${wb.description}`;
        const score = calculateSimilarity(queryTokens, tokenize(textContent));
        curriculumItems.push({
          yearNum: y.yearNumber,
          monthNum: m.monthNumber,
          bookTitle: wb.title,
          author: wb.author,
          category: wb.category,
          description: wb.description,
          score
        });
      });
    });
  });
  curriculumItems.sort((a, b) => b.score - a.score);

  // 7. Vector Search across Poetry
  const poetryItems: { poetName: string; poemTitle: string; contentSnippet: string; score: number }[] = [];
  poetry.forEach(poet => {
    poet.poems.forEach(p => {
      const textContent = `${poet.name} ${poet.period} ${poet.bio} ${p.title} ${p.content}`;
      const score = calculateSimilarity(queryTokens, tokenize(textContent));
      poetryItems.push({
        poetName: poet.name,
        poemTitle: p.title,
        contentSnippet: p.content.slice(0, 150),
        score
      });
    });
  });
  poetryItems.sort((a, b) => b.score - a.score);

  // Only retrieve items that actually match the user query with significant token relevance
  const matchingBooks = queryTokens.length > 0 ? scoredBooks.filter(item => item.score >= 0.25) : [];
  const matchingQuotes = queryTokens.length > 0 ? scoredQuotes.filter(item => item.score >= 0.25) : [];
  const matchingReviews = queryTokens.length > 0 ? scoredReviews.filter(item => item.score >= 0.25) : [];
  const matchingCurriculum = queryTokens.length > 0 ? curriculumItems.filter(item => item.score >= 0.25) : [];
  const matchingPoetry = queryTokens.length > 0 ? poetryItems.filter(item => item.score >= 0.25) : [];
  const matchingVocab = queryTokens.length > 0 ? scoredVocab.filter(item => item.score >= 0.25) : [];

  const topBooks = matchingBooks.slice(0, 5).map(item => 
    `• [${item.book.status.toUpperCase()}] "${item.book.title}" (${item.book.author}) - Kategori: ${item.book.category}, İlerleme: Sayfa ${item.book.currentPage}/${item.book.totalPages}${item.book.userNotes ? `, Not: "${item.book.userNotes.slice(0, 600)}"` : ''}`
  );

  const topQuotes = matchingQuotes.slice(0, 4).map(item => 
    `• "${(item.quote.quoteText || '').slice(0, 1000)}" (${item.quote.bookTitle} - ${item.quote.author}${item.quote.pageNumber ? `, syf. ${item.quote.pageNumber}` : ''})${item.quote.userNote ? ` | Not: "${item.quote.userNote.slice(0, 400)}"` : ''}`
  );

  const topReviews = matchingReviews.slice(0, 2).map(item => 
    `• "${item.review.bookTitle}" İncelemesi (${item.review.rating}/5 yıldız): "${(item.review.content || '').slice(0, 800)}"`
  );

  const topCurriculum = matchingCurriculum.slice(0, 4).map(item => 
    `• ${item.yearNum}. Yıl ${item.monthNum}. Ay Müfredatı: "${item.bookTitle}" (${item.author}) - ${item.category} [${item.description?.slice(0, 400) || ''}]`
  );

  const topPoetry = matchingPoetry.slice(0, 3).map(item => 
    `• ${item.poetName} - "${item.poemTitle}": "${item.contentSnippet.replace(/\n/g, ' ')}..."`
  );

  const topVocab = matchingVocab.slice(0, 3).map(item => 
    `• ${item.vocab.word}: ${item.vocab.meaning}${item.vocab.exampleSentence ? ` (Örnek: ${item.vocab.exampleSentence})` : ''}`
  );

  const categoryBreakdownText = Object.entries(categoryStats)
    .map(([cat, count]) => `${cat} (${count})`)
    .join(', ');

  // Construct Dense RAG Prompt Context
  const densePromptContext = `
=== OKUR ARŞİVİ VE SORUYLA EŞLEŞEN KAYITLAR ===
Okur Adı: ${displayName}
Günlük Hedef: ${dailyTargetPages} sayfa
Toplam Kütüphane: ${userBooks.length} eser | Okunmuş: ${completedBooks.length} | Halen Okunan: ${readingBooks.length} | Okunacak: ${wantToReadBooks.length} | Yarıda: ${pausedBooks.length}
12 Kategori Dağılımı: ${categoryBreakdownText || 'Henüz kategori verisi yok'}
Şu An Okunan Eserlerden Örnekler: ${activeBooksInfo.length > 0 ? activeBooksInfo.join('; ') : 'Henüz aktif kitap seçilmedi'}
Tamamlanan Eserlerden Bazıları: ${completedBooksInfo.length > 0 ? completedBooksInfo.join('; ') : 'Henüz tamamlanan eser yok'}
Okuma Listesindeki Eserler (Okunacak): ${wantToReadInfo.length > 0 ? wantToReadInfo.join('; ') : 'Henüz okunacak listesi boş'}

--- SORGUYLA EN İLGİLİ KÜTÜPHANE ESERLERİ ---
${topBooks.length > 0 ? topBooks.join('\n') : 'İlgili eser bulunamadı.'}

--- EN İLGİLİ ALINTI VE NOTLARINIZ ---
${topQuotes.length > 0 ? topQuotes.join('\n') : 'İlgili alıntı bulunamadı.'}

--- EN İLGİLİ İNCELEME VE YORUMLAR ---
${topReviews.length > 0 ? topReviews.join('\n') : 'İlgili inceleme bulunamadı.'}

--- 40 YILLIK İLİM MÜFREDATINDAN EN İLGİLİ ESERLER ---
${topCurriculum.length > 0 ? topCurriculum.join('\n') : 'İlgili müfredat adımı bulunamadı.'}

--- İLGİLİ ŞİİR VE ŞAİR ARŞİVİ ---
${topPoetry.length > 0 ? topPoetry.join('\n') : 'İlgili şiir bulunamadı.'}

--- İLGİLİ SÖZLÜK / TEFEKKÜR KAVRAMLARI ---
${topVocab.length > 0 ? topVocab.join('\n') : 'İlgili kelime bulunamadı.'}
==============================================
`;

  return {
    summary,
    retrievedBooks: topBooks,
    retrievedQuotes: topQuotes,
    retrievedReviews: topReviews,
    retrievedCurriculum: topCurriculum,
    retrievedPoetry: topPoetry,
    retrievedVocab: topVocab,
    densePromptContext
  };
}
