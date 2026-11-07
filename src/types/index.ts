export type BookStatus = 'reading' | 'completed' | 'paused' | 'want_to_read';

export interface UserBook {
  id: string;
  userId?: string;
  title: string;
  author: string;
  category: string;
  subCategory?: string;
  tags?: string[];
  publisher?: string;
  publishYear?: string;
  isbn?: string;
  totalPages: number;
  currentPage: number;
  volumeInfo?: string;
  coverUrl: string;
  coverSource?: 'embedded' | 'user' | 'google_books' | 'open_library' | 'publisher' | 'missing';
  coverMatchScore?: number;
  description?: string;
  status: BookStatus;
  isMultiVolume?: boolean;
  seriesTitle?: string;
  volumeNumber?: number;
  totalVolumes?: number;
  startDate?: string;
  endDate?: string;
  userRating?: number; // 1-5
  userNotes?: string;
  fileStorageUrl?: string;
  fileType?: 'pdf' | 'epub' | 'text';
  fileName?: string;
  fileData?: string; // Base64 or local cached blob string
  createdAt: string;
  updatedAt: string;
}

export interface CatalogBook {
  id: string;
  title: string;
  author: string;
  category: string;
  subCategory: string;
  description: string;
  coverUrl: string;
  volumeInfo?: string;
  digitalSourceUrl?: string;
  isMultiVolume?: boolean;
  seriesTitle?: string;
  volumeNumber?: number;
  totalVolumes?: number;
  turkishAvailable?: boolean;
  isbn?: string;
  publisher?: string;
  totalPages?: number;
}

export interface Poem {
  id: string;
  title: string;
  content: string;
  notes?: string;
}

export interface Poet {
  id: string;
  name: string;
  period: string;
  portraitUrl: string;
  bio: string;
  poems: Poem[];
}

export interface CurriculumWeeklyBook {
  weekNumber: number;
  title: string;
  author: string;
  category: string;
  totalPages: number;
  isMultiVolume?: boolean;
  volumeNumber?: number;
  coverUrl: string;
  description: string;
  plannedDate?: string;
}

export interface CurriculumMonthData {
  monthNumber: number;
  monthTitle: string;
  authorName: string;
  authorBio: string;
  weeklyBooks: CurriculumWeeklyBook[];
}

export interface CurriculumMonthAuthor {
  month: number;
  authorName: string;
  authorBio: string;
  books: {
    title: string;
    category: string;
    totalPages: number;
    isMultiVolume?: boolean;
    coverUrl?: string;
    description?: string;
    weekNumber?: number;
  }[];
}

export interface CurriculumYear {
  yearNumber: number; // 1..40
  title: string;
  theme?: string;
  description: string;
  monthlyAuthors?: CurriculumMonthAuthor[];
  months: CurriculumMonthData[];
}

export interface ReadingSession {
  id: string;
  userId?: string;
  bookId: string;
  bookTitle: string;
  date: string; // YYYY-MM-DD
  pagesRead: number;
  isMultiVolume: boolean;
  createdAt: string;
}

export interface BookReview {
  id: string;
  userId?: string;
  bookId: string;
  bookTitle: string;
  author: string;
  rating: number; // 1-5
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  userId?: string;
  bookId: string;
  bookTitle: string;
  author: string;
  pageNumber?: number;
  quoteText: string;
  userNote?: string;
  tags?: string[];
  createdAt: string;
}

export interface VocabularyItem {
  id: string;
  userId?: string;
  word: string;
  meaning: string;
  sourceBookTitle?: string;
  exampleSentence?: string;
  isLearned: boolean;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  requirementType: 'completedBooks' | 'totalPages';
}

export interface UserProfile {
  uid?: string;
  displayName: string;
  email: string;
  photoURL?: string;
  dailyTargetPages: number; // Default 40
  singleVolumeTargetPages: number; // Default 20
  multiVolumeTargetPages: number; // Default 20
  autoBackupEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  joinedDate: string;
  reminderEnabled?: boolean;
  reminderTimes?: string[];
  reminderSound?: boolean;
  badges?: string[];
}

export type MainTab = 'today' | 'library' | 'explore' | 'archive' | 'stats' | 'chat' | 'profile';

// ==================== QURAN MODULE TYPES ====================

export interface Surah {
  number: number;
  nameArabic: string;
  nameTurkish: string;
  translationName: string;
  verseCount: number;
  revelationType: 'Mekke' | 'Medine';
  startPage: number;
  juzNumber: number;
}

export interface Ayah {
  number: number; // 1..N in surah
  globalNumber?: number;
  textArabic: string;
  translationTurkish: string;
  tafsirTurkish?: string;
  pageNumber: number;
  juzNumber: number;
  hizbNumber?: number;
  surahNumber: number;
  surahName?: string;
}

export interface QuranProgress {
  lastReadSurah: number; // 1..114
  lastReadAyah: number;
  lastReadPage: number; // 1..604
  lastAudioPosition?: number; // Current playback position in seconds
  completedJuzs: number[]; // Array of juz numbers 1..30
  pagesReadToday: number;
  versesReadToday: number;
  completedHatimCount: number;
  dailyHizbGoal: number; // e.g. 1 (60 Hizbs total)
  dailyPageGoal: number; // e.g. 20 pages
  readingCalendar: { [dateStr: string]: number }; // date YYYY-MM-DD -> pages read
  bookmarkedAyahs: { surahNumber: number; ayahNumber: number; createdAt: string }[];
  favoriteAyahs: { surahNumber: number; ayahNumber: number; textArabic: string; translationTurkish: string; createdAt: string }[];
  ayahNotes: { [key: string]: string }; // key: `${surahNumber}_${ayahNumber}` -> note text
}

export interface Reciter {
  id: string;
  name: string;
  subtext: string;
  cdnPrefix: string;
}

export interface CoverFetchResult {
  bookId: string;
  coverUrl: string;
  source: 'google_books' | 'open_library' | 'embedded' | 'publisher' | 'user' | 'missing';
  confidence: number;
  matchedTitle?: string;
  matchedAuthor?: string;
  matchedIsbn?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'reminder' | 'system' | 'streak' | 'wisdom' | 'milestone';
  linkTab?: MainTab;
  createdAt: string;
}

