import { BookReview, Quotation, QuranProgress, ReadingSession, UserBook, UserProfile, VocabularyItem } from '../types';

export interface BackupPayload {
  version?: string;
  exportedAt?: string;
  userProfile?: UserProfile;
  userBooks: UserBook[];
  readingSessions?: ReadingSession[];
  reviews?: BookReview[];
  quotations?: Quotation[];
  vocabulary?: VocabularyItem[];
  quranProgress?: QuranProgress;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    booksCount: number;
    sessionsCount: number;
    reviewsCount: number;
    quotesCount: number;
    wordsCount: number;
  };
}

export function validateBackupJSON(jsonString: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let summary = {
    booksCount: 0,
    sessionsCount: 0,
    reviewsCount: 0,
    quotesCount: 0,
    wordsCount: 0
  };

  try {
    const data = JSON.parse(jsonString);

    if (typeof data !== 'object' || data === null) {
      return {
        isValid: false,
        errors: ['Geçersiz JSON formatı: Kök nesne bir JSON objesi olmalıdır.'],
        warnings: [],
        summary
      };
    }

    // Check userBooks
    if (!data.userBooks || !Array.isArray(data.userBooks)) {
      errors.push('Eksik Alan: "userBooks" dizisi bulunamadı.');
    } else {
      summary.booksCount = data.userBooks.length;
      data.userBooks.forEach((b: any, index: number) => {
        if (!b || typeof b.title !== 'string' || !b.title.trim()) {
          errors.push(`Kitap #${index + 1}: Geçersiz veya eksik "title" başlığı.`);
        }
        if (!b || typeof b.author !== 'string' || !b.author.trim()) {
          errors.push(`Kitap #${index + 1}: Geçersiz veya eksik "author" yazarı.`);
        }
        if (b && (!Number.isFinite(Number(b.totalPages)) || Number(b.totalPages) <= 0)) {
          warnings.push(`Kitap #${index + 1} (${b.title || 'İsimsiz'}): Sayfa sayısı içe aktarımda düzenlenecek.`);
        }
      });
    }

    const archiveFields = [
      ['readingSessions', 'sessionsCount', 'date'],
      ['reviews', 'reviewsCount', 'content'],
      ['quotations', 'quotesCount', 'quoteText'],
      ['vocabulary', 'wordsCount', 'word'],
    ] as const;
    for (const [field, count, requiredText] of archiveFields) {
      const items = data[field];
      if (items == null) continue;
      if (!Array.isArray(items) || items.some(item => !item || typeof item[requiredText] !== 'string')) {
        errors.push(`Geçersiz arşiv kayıtları: ${field}.`);
      } else {
        summary[count] = items.length;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary
    };
  } catch (err) {
    return {
      isValid: false,
      errors: ['JSON Ayrıştırma Hatası: Dosya içeriği geçerli bir JSON formatında değil.'],
      warnings: [],
      summary
    };
  }
}
