import { UserBook, CoverFetchResult } from '../types';

export function cleanTitleForSearch(title: string): string {
  return title
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateMatchConfidence(
  bookTitle: string,
  bookAuthor: string,
  matchedTitle?: string,
  matchedAuthor?: string,
  isIsbnMatch?: boolean
): number {
  if (isIsbnMatch) return 100;
  if (!matchedTitle) return 0;

  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\sğüşıöç]/gi, '').trim();
  const targetTitle = normalize(cleanTitleForSearch(bookTitle));
  const targetAuthor = normalize(bookAuthor);
  const candidateTitle = normalize(matchedTitle);
  const candidateAuthor = matchedAuthor ? normalize(matchedAuthor) : '';

  let score = 0;

  if (targetTitle === candidateTitle) {
    score += 60;
  } else if (candidateTitle.includes(targetTitle) || targetTitle.includes(candidateTitle)) {
    score += 40;
  }

  if (targetAuthor && candidateAuthor) {
    if (targetAuthor === candidateAuthor) {
      score += 40;
    } else if (candidateAuthor.includes(targetAuthor) || targetAuthor.includes(candidateAuthor)) {
      score += 25;
    }
  } else {
    score += 20;
  }

  return Math.min(100, score);
}

export async function fetchCoverFromGoogleBooks(book: UserBook): Promise<CoverFetchResult | null> {
  try {
    const cleanTitle = cleanTitleForSearch(book.title);
    const cleanAuthor = book.author && book.author !== 'Bilinmiyor' ? book.author : '';

    const queries: string[] = [];
    if (book.isbn && book.isbn.trim().length >= 10) {
      queries.push(`isbn:${book.isbn.trim()}`);
    }
    if (cleanTitle) {
      queries.push(encodeURIComponent(`${cleanTitle} ${cleanAuthor}`.trim()));
      queries.push(encodeURIComponent(cleanTitle));
    }

    for (const q of queries) {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5`);
      if (!res.ok) continue;

      const data = await res.json();
      if (!data.items || data.items.length === 0) continue;

      for (const item of data.items) {
        const volumeInfo = item.volumeInfo;
        const imageLinks = volumeInfo?.imageLinks;
        if (imageLinks && (imageLinks.thumbnail || imageLinks.smallThumbnail || imageLinks.medium || imageLinks.large)) {
          let imageUrl = imageLinks.thumbnail || imageLinks.smallThumbnail || imageLinks.medium || imageLinks.large;
          imageUrl = imageUrl.replace('http://', 'https://');

          const isIsbnMatch = !!(book.isbn && volumeInfo.industryIdentifiers?.some((id: any) => id.identifier === book.isbn));
          const confidence = calculateMatchConfidence(
            book.title,
            book.author,
            volumeInfo.title,
            volumeInfo.authors ? volumeInfo.authors.join(', ') : '',
            isIsbnMatch
          );

          if (confidence >= 15 || isIsbnMatch) {
            return {
              bookId: book.id,
              coverUrl: imageUrl,
              source: 'google_books',
              confidence: Math.max(confidence, 60),
              matchedTitle: volumeInfo.title,
              matchedAuthor: volumeInfo.authors?.join(', '),
              matchedIsbn: volumeInfo.industryIdentifiers?.[0]?.identifier
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn("Google Books API fetch error:", err);
  }
  return null;
}

export async function fetchCoverFromOpenLibrary(book: UserBook): Promise<CoverFetchResult | null> {
  try {
    const cleanTitle = cleanTitleForSearch(book.title);
    const cleanAuthor = book.author && book.author !== 'Bilinmiyor' ? book.author : '';

    if (book.isbn && book.isbn.trim().length >= 10) {
      const cleanIsbn = book.isbn.trim().replace(/-/g, '');
      const coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
      
      const testRes = await fetch(coverUrl, { method: 'HEAD' });
      if (testRes.ok) {
        return {
          bookId: book.id,
          coverUrl,
          source: 'open_library',
          confidence: 100,
          matchedIsbn: cleanIsbn
        };
      }
    }

    const query = encodeURIComponent(`${cleanTitle} ${cleanAuthor}`.trim());
    const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=5`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      for (const docItem of data.docs) {
        if (docItem.cover_i) {
          const coverUrl = `https://covers.openlibrary.org/b/id/${docItem.cover_i}-L.jpg`;
          const confidence = calculateMatchConfidence(
            book.title,
            book.author,
            docItem.title,
            docItem.author_name ? docItem.author_name.join(', ') : ''
          );

          if (confidence >= 15) {
            return {
              bookId: book.id,
              coverUrl,
              source: 'open_library',
              confidence: Math.max(confidence, 50),
              matchedTitle: docItem.title,
              matchedAuthor: docItem.author_name?.join(', ')
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn("Open Library fetch error:", err);
  }
  return null;
}

export function isBookMissingCover(book: UserBook): boolean {
  if (!book.coverUrl || book.coverUrl.trim() === '') return true;
  if (book.coverSource === 'missing') return true;
  if (book.coverUrl.includes('placeholder') || book.coverUrl.includes('default')) return true;
  if (book.coverUrl.includes('unsplash.com')) return true;
  return false;
}

export async function findSmartCoverForBook(book: UserBook, forceRefetch: boolean = false): Promise<CoverFetchResult | null> {
  // If book has verified custom cover and not forcing refetch
  if (!forceRefetch && book.coverUrl && !isBookMissingCover(book) && book.coverSource === 'user') {
    return {
      bookId: book.id,
      coverUrl: book.coverUrl,
      source: 'user',
      confidence: 100
    };
  }

  // 1. Query Google Books API with multi-pass search
  const googleRes = await fetchCoverFromGoogleBooks(book);
  if (googleRes && googleRes.confidence >= 40) {
    return googleRes;
  }

  // 2. Query Open Library
  const openLibRes = await fetchCoverFromOpenLibrary(book);
  if (openLibRes && openLibRes.confidence >= 40) {
    return openLibRes;
  }

  return googleRes || openLibRes || null;
}
