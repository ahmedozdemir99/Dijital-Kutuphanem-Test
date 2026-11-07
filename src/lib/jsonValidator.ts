import { BookReview, Quotation, ReadingSession, UserBook, UserProfile, VocabularyItem } from '../types';

export interface BackupPayload {
  version?: string;
  exportedAt?: string;
  userProfile?: UserProfile;
  userBooks: UserBook[];
  readingSessions?: ReadingSession[];
  reviews?: BookReview[];
  quotations?: Quotation[];
  vocabulary?: VocabularyItem[];
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
        if (!b.title || typeof b.title !== 'string') {
          errors.push(`Kitap #${index + 1}: Geçersiz veya eksik "title" başlığı.`);
        }
        if (!b.author || typeof b.author !== 'string') {
          errors.push(`Kitap #${index + 1}: Geçersiz veya eksik "author" yazarı.`);
        }
        if (typeof b.totalPages !== 'number' || b.totalPages <= 0) {
          warnings.push(`Kitap #${index + 1} (${b.title || 'İsimsiz'}): Sayfa sayısı varsayılan değere ayarlandı.`);
        }
      });
    }

    // Check optional arrays
    if (data.readingSessions && Array.isArray(data.readingSessions)) {
      summary.sessionsCount = data.readingSessions.length;
    }

    if (data.reviews && Array.isArray(data.reviews)) {
      summary.reviewsCount = data.reviews.length;
    }

    if (data.quotations && Array.isArray(data.quotations)) {
      summary.quotesCount = data.quotations.length;
    }

    if (data.vocabulary && Array.isArray(data.vocabulary)) {
      summary.wordsCount = data.vocabulary.length;
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
