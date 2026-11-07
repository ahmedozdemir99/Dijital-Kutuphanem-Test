import { readingDate } from '../utils/readingDate';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { BookReview, MainTab, Quotation, ReadingSession, UserBook, UserProfile, VocabularyItem, QuranProgress, AppNotification, Badge } from '../types';
import { DEFAULT_BOOK_COVERS, MAIN_CATEGORIES, inferCategoryForBook } from '../data/catalogData';
import { auth, cloudEnabled, db } from '../lib/firebase';
import { saveBookFileToIDB, deleteBookFileFromIDB, getBookFileFromIDB, saveCoverToIDB, getCoverFromIDB, saveAppDataToIDB, saveAppDataBatchToIDB, getAppDataFromIDB, deleteBookDataFromIDB } from '../lib/indexedDb';
import { validateBackupJSON, ValidationResult, BackupPayload } from '../lib/jsonValidator';
import { AVAILABLE_BADGES } from '../data/badgeData';

interface AppContextType {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  exploreSubTab: 'curriculum' | 'quran' | 'catalog' | 'poets';
  setExploreSubTab: (tab: 'curriculum' | 'quran' | 'catalog' | 'poets') => void;
  userBooks: UserBook[];
  setUserBooks: React.Dispatch<React.SetStateAction<UserBook[]>>;
  readingSessions: ReadingSession[];
  reviews: BookReview[];
  quotations: Quotation[];
  vocabulary: VocabularyItem[];
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  activeBookForReader: UserBook | null;
  setActiveBookForReader: (book: UserBook | null) => void;
  selectedBookForDetail: UserBook | null;
  setSelectedBookForDetail: (book: UserBook | null) => void;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  
  // Theme & Global Modals
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'time'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  theme: 'light' | 'dark';

  toggleTheme: () => void;
  isAddBookModalOpen: boolean;
  setIsAddBookModalOpen: (open: boolean) => void;
  isAddQuoteModalOpen: boolean;
  setIsAddQuoteModalOpen: (open: boolean) => void;
  isAddReviewModalOpen: boolean;
  setIsAddReviewModalOpen: (open: boolean) => void;
  isAddPoemModalOpen: boolean;
  setIsAddPoemModalOpen: (open: boolean) => void;

  // Quran Module State & Handlers
  quranProgress: QuranProgress;
  updateQuranProgress: (patch: Partial<QuranProgress>) => void;
  recordMushafPage: (page: number) => void;
  bookmarkAyah: (surahNumber: number, ayahNumber: number) => void;
  toggleFavoriteAyah: (fav: { surahNumber: number; ayahNumber: number; textArabic: string; translationTurkish: string; createdAt: string }) => void;
  saveAyahNote: (surahNumber: number, ayahNumber: number, noteText: string) => void;

  // Book Handlers & Cover Manager
  addBookToLibrary: (bookData: Omit<UserBook, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBookProgress: (bookId: string, newPage: number, fileLength?: number) => void;
  updateBookLength: (bookId: string, pageCount: number) => void;
  updateBookStatus: (bookId: string, status: UserBook['status']) => void;
  deleteBookFromLibrary: (bookId: string) => void;
  logReadingSession: (bookId: string, pagesRead: number) => void;
  attachBookFile: (bookId: string, fileBlob: File) => Promise<string>;
  detachBookFile: (bookId: string) => Promise<void>;
  updateBookCover: (bookId: string, newCoverUrl: string, source?: string, confidence?: number) => void;
  updateBookTags: (bookId: string, tags: string[]) => void;

  // Archive Handlers
  addReview: (review: Omit<BookReview, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteReview: (id: string) => void;
  addQuotation: (quoteText: string, pageNum?: number, note?: string, bookId?: string, bookTitle?: string, author?: string) => void;
  deleteQuotation: (id: string) => void;
  addVocabularyItem: (word: string, meaning: string, example?: string, sourceBook?: string) => void;
  toggleVocabularyLearned: (id: string) => void;
  deleteVocabularyItem: (id: string) => void;

  // Backup & Data Sync
  exportUserDataJSON: () => string;
  importUserDataJSON: (jsonString: string, onProgress?: (progress: number) => void) => Promise<{ success: boolean; validation?: ValidationResult; message: string }>;
  syncAllDataToCloud: (onProgress?: (progress: number) => void) => Promise<{ success: boolean; message: string }>;
  verifyDataIntegrity: () => { totalBooks: number; totalSessions: number; totalQuotes: number; totalWords: number; integrityOk: boolean };
  newBadgeNotification: Badge | null;
  setNewBadgeNotification: React.Dispatch<React.SetStateAction<Badge | null>>;
  clearBadgeNotification: () => void;
  deduplicateBooks: () => number;
}

function mergeCloudRecords<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  local: T[], incoming: T[], merge: (current: T, next: T) => T = (_, next) => next,
): T[] {
  const remote = new Map(incoming.map(item => [item.id, item]));
  let changed = false;
  const merged = local.map(item => {
    const next = remote.get(item.id);
    if (!next) return item;
    remote.delete(item.id);
    const currentTime = item.updatedAt || item.createdAt || '';
    const nextTime = next.updatedAt || next.createdAt || '';
    if (nextTime <= currentTime) return item;
    changed = true;
    return merge(item, next);
  });
  return changed || remote.size ? [...merged, ...remote.values()] : local;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam && ['today', 'library', 'explore', 'archive', 'stats', 'chat', 'profile'].includes(tabParam)) {
        return tabParam as MainTab;
      }
    }
    return 'today';
  });

  const [exploreSubTab, setExploreSubTab] = useState<'curriculum' | 'quran' | 'catalog' | 'poets'>(() => {
    if (typeof window !== 'undefined') {
      const subParam = new URLSearchParams(window.location.search).get('sub');
      if (subParam && ['curriculum', 'quran', 'catalog', 'poets'].includes(subParam)) {
        return subParam as 'curriculum' | 'quran' | 'catalog' | 'poets';
      }
    }
    return 'curriculum';
  });

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('offline');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const booksForStorage = (books: UserBook[]) => books.map(book => {
    const { fileData, fileStorageUrl, ...record } = book;
    return {
      ...record,
      ...(typeof fileStorageUrl === 'string' && !fileStorageUrl.startsWith('blob:') ? { fileStorageUrl } : {}),
      coverUrl: record.coverUrl?.startsWith('blob:') ? '' : record.coverUrl,
    };
  });

  const mirrorLocalStorage = (key: string, value: unknown) => {
    try {
      const payload = key === 'dk_user_books' && Array.isArray(value)
        ? value.map(book => typeof book.coverUrl === 'string' && book.coverUrl.startsWith('data:') && book.coverUrl.length > 10000
          ? { ...book, coverUrl: '' } : book)
        : value;
      localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // IndexedDB remains the primary copy if the local mirror reaches its quota.
    }
  };

  const safeLocalStorageSet = (key: string, value: unknown) => {
    const durable = key === 'dk_user_books' && Array.isArray(value) ? booksForStorage(value) : value;
    mirrorLocalStorage(key, durable);
    saveAppDataToIDB(key, durable).catch(error => console.warn('IndexedDB write failed:', error));
  };

  // Load state from localStorage on init with safe error fallback
  const [userBooks, setUserBooks] = useState<UserBook[]>(() => {
    try {
      const saved = localStorage.getItem('dk_user_books');
      const books = saved ? JSON.parse(saved) : [];
      return Array.isArray(books) ? books : [];
    } catch {
      return [];
    }
  });

  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>(() => {
    try {
      const saved = localStorage.getItem('dk_reading_sessions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [reviews, setReviews] = useState<BookReview[]>(() => {
    try {
      const saved = localStorage.getItem('dk_reviews');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem('dk_quotations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() => {
    try {
      const saved = localStorage.getItem('dk_vocabulary');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('dk_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      displayName: 'Kütüphane Okuru',
      email: '',
      dailyTargetPages: 40,
      singleVolumeTargetPages: 20,
      multiVolumeTargetPages: 20,
      autoBackupEnabled: true,
      theme: 'light',
      joinedDate: '2026-01-01',
      reminderEnabled: false,
      reminderTimes: ['08:30', '14:00', '21:30'],
      reminderSound: true,
      badges: []
    };
  });

  // Notifications State & Logic
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('dk_notifications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    if (isHydrated) {
      safeLocalStorageSet('dk_notifications', notifications);
    }
  }, [notifications, isHydrated]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'time'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      isRead: false,
      time: 'Az önce',
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Global Modals State

  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState<boolean>(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState<boolean>(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState<boolean>(false);
  const [isAddPoemModalOpen, setIsAddPoemModalOpen] = useState<boolean>(false);

  // Theme Sync & Handler
  const theme: 'light' | 'dark' = userProfile.theme === 'dark' ? 'dark' : 'light';
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setUserProfile(prev => ({ ...prev, theme: nextTheme }));
  };

  // Quran Progress State
  const [quranProgress, setQuranProgress] = useState<QuranProgress>(() => {
    try {
      const saved = localStorage.getItem('dk_quran_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      lastReadSurah: 1,
      lastReadAyah: 1,
      lastReadPage: 1,
      completedJuzs: [],
      pagesReadToday: 0,
      versesReadToday: 0,
      completedHatimCount: 0,
      dailyHizbGoal: 1,
      dailyPageGoal: 20,
      readingCalendar: {},
      bookmarkedAyahs: [],
      favoriteAyahs: [],
      ayahNotes: {}
    };
  });

  const [activeBookForReader, setActiveBookForReaderState] = useState<UserBook | null>(null);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<UserBook | null>(null);

  const readerRequest = useRef(0);
  const setActiveBookForReader = async (book: UserBook | null) => {
    const request = ++readerRequest.current;
    if (!book) {
      setActiveBookForReaderState(null);
      return;
    }
    // Always fetch the latest book object from userBooks to get the most recent progress
    const latestBook = userBooks.find(b => b.id === book.id) || book;
    
    // Check if there is an exact last page saved in localStorage
    let savedPage = latestBook.currentPage || 1;
    try {
      const localSaved = localStorage.getItem(`dk_last_page_${latestBook.id}`);
      if (localSaved) {
        const parsed = parseInt(localSaved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          savedPage = parsed;
        }
      }
    } catch {}

    const bookWithPage: UserBook = {
      ...latestBook,
      currentPage: Math.max(1, savedPage),
      totalPages: Math.max(latestBook.totalPages || 1, savedPage)
    };
    
    const idbFile = await getBookFileFromIDB(latestBook.id);
    if (readerRequest.current !== request) {
      if (idbFile) URL.revokeObjectURL(idbFile.objectUrl);
      return;
    }
    lastReadPages.current.set(book.id, bookWithPage.currentPage);
    setActiveBookForReaderState(idbFile ? {
      ...bookWithPage,
      fileStorageUrl: idbFile.objectUrl,
      fileName: idbFile.fileName,
      fileType: idbFile.fileType,
    } : bookWithPage);
  };

  // Persistence Guard: Only save to storage after initial hydration is complete
  useEffect(() => {
    if (!isHydrated) return;
    safeLocalStorageSet('dk_user_books', userBooks);
  }, [userBooks, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    safeLocalStorageSet('dk_reading_sessions', readingSessions);
  }, [readingSessions, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    safeLocalStorageSet('dk_reviews', reviews);
  }, [reviews, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    safeLocalStorageSet('dk_quotations', quotations);
  }, [quotations, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    safeLocalStorageSet('dk_vocabulary', vocabulary);
  }, [vocabulary, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    safeLocalStorageSet('dk_user_profile', userProfile);
  }, [userProfile, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    safeLocalStorageSet('dk_quran_progress', quranProgress);
  }, [quranProgress, isHydrated]);

  // Restore IndexedDB file, backup data & cover references on mount
  useEffect(() => {
    async function loadAllData() {
      try {
        // Priority 1: Load from IndexedDB (most reliable for persistent storage)
        // Priority 2: LocalStorage (already handled by initial state if available)
        
        const [
          savedBooks, 
          savedSessions, 
          savedReviews, 
          savedQuotes, 
          savedVocab, 
          savedQuran,
          savedNotifs,
          savedProfile
        ] = await Promise.all([
          getAppDataFromIDB('dk_user_books'),
          getAppDataFromIDB('dk_reading_sessions'),
          getAppDataFromIDB('dk_reviews'),
          getAppDataFromIDB('dk_quotations'),
          getAppDataFromIDB('dk_vocabulary'),
          getAppDataFromIDB('dk_quran_progress'),
          getAppDataFromIDB('dk_notifications'),
          getAppDataFromIDB('dk_user_profile')
        ]);

        if (Array.isArray(savedBooks)) setUserBooks(savedBooks);
        if (Array.isArray(savedSessions)) setReadingSessions(savedSessions);
        if (Array.isArray(savedReviews)) setReviews(savedReviews);
        if (Array.isArray(savedQuotes)) setQuotations(savedQuotes);
        if (Array.isArray(savedVocab)) setVocabulary(savedVocab);
        if (savedQuran && typeof savedQuran === 'object') setQuranProgress(savedQuran);
        if (Array.isArray(savedNotifs)) setNotifications(savedNotifs);
        if (savedProfile && typeof savedProfile === 'object') {
          setUserProfile(previous => ({ ...previous, ...savedProfile }));
        }

        // Mark as hydrated so future state changes trigger saves
        setIsHydrated(true);
      } catch (err) {
        console.warn('Persistence hydration warning:', err);
        setIsHydrated(true); // Proceed anyway to avoid locking the app
      }
    }
    loadAllData();
  }, []);

  // Cleanup/Restore missing covers and file URLs after hydration
  useEffect(() => {
    if (!isHydrated) return;
    
    userBooks.forEach(async (book) => {
      if (!book.fileStorageUrl) {
        const idbFile = await getBookFileFromIDB(book.id);
        if (idbFile) {
          setUserBooks(prev => prev.map(b => b.id === book.id ? {
            ...b,
            fileStorageUrl: idbFile.objectUrl,
            fileName: idbFile.fileName,
            fileType: idbFile.fileType
          } : b));
        }
      }
      
      const idbCover = await getCoverFromIDB(book.id);
      if (idbCover) {
        if (!book.coverUrl || book.coverUrl.trim() === '' || book.coverUrl.includes('placeholder')) {
          setUserBooks(prev => prev.map(b => b.id === book.id ? { ...b, coverUrl: idbCover } : b));
        }
      } else if (book.coverUrl && book.coverUrl.trim() !== '') {
        saveCoverToIDB(book.id, book.coverUrl).catch(() => {});
      } else {
        const fallback = DEFAULT_BOOK_COVERS[book.category] || DEFAULT_BOOK_COVERS["Edebiyat"];
        if (fallback) {
          setUserBooks(prev => prev.map(b => b.id === book.id ? { ...b, coverUrl: fallback } : b));
        }
      }
    });
  }, [isHydrated]);

  const [newBadgeNotification, setNewBadgeNotification] = useState<Badge | null>(null);

  useEffect(() => {
    if (!isHydrated) return;

    const completedBooks = userBooks.filter(b => b.status === 'completed').length;
    const totalPages = readingSessions.reduce((sum, s) => sum + s.pagesRead, 0);

    const earnedBadges = AVAILABLE_BADGES
      .filter(badge => {
        if (badge.requirementType === 'completedBooks') return completedBooks >= badge.requirement;
        if (badge.requirementType === 'totalPages') return totalPages >= badge.requirement;
        return false;
      });
      
    const earnedBadgeIds = earnedBadges.map(b => b.id);
    const prevBadgeIds = userProfile.badges || [];

    // Check for newly earned badges
    const newlyEarned = earnedBadges.find(b => !prevBadgeIds.includes(b.id));
    if (newlyEarned) {
        setNewBadgeNotification(newlyEarned);
        setTimeout(() => setNewBadgeNotification(null), 6000);
    }

    // Only update if badges actually changed to avoid infinite loop
    if (JSON.stringify(earnedBadgeIds.sort()) !== JSON.stringify(prevBadgeIds.sort())) {
      setUserProfile(prev => ({ ...prev, badges: earnedBadgeIds }));
    }
  }, [userBooks, readingSessions, isHydrated]);

  useEffect(() => {
    if (cloudEnabled) return onAuthStateChanged(auth, setCurrentUser);
  }, []);

  // Subscribe after local hydration and replace listeners when the account changes.
  useEffect(() => {
    if (!currentUser) {
      setCloudSyncStatus('offline');
      return;
    }
    if (!isHydrated) return;
    const uid = currentUser.uid;
    setCloudSyncStatus('syncing');
    setUserProfile(previous => ({
      ...previous,
      uid,
      displayName: currentUser.displayName || previous.displayName,
      email: currentUser.email || previous.email,
      photoURL: currentUser.photoURL || previous.photoURL,
    }));

    const watchCollection = <T,>(name: string, onRecords: (records: T[]) => void, onServerSnapshot?: () => void) =>
      onSnapshot(query(collection(db, name), where('userId', '==', uid)), { includeMetadataChanges: true }, snapshot => {
        if (auth.currentUser?.uid !== uid) return;
        onRecords(snapshot.docs.map(record => ({ ...record.data(), id: record.data().id || record.id }) as T));
        if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) onServerSnapshot?.();
      }, error => {
        console.warn('Firestore listener failed:', name, error.code);
        setCloudSyncStatus('error');
      });

    const unsubBooks = watchCollection<UserBook>('userBooks', books => setUserBooks(local => mergeCloudRecords(local, books, (current, next) => ({
      ...current,
      ...next,
      coverUrl: next.coverUrl || current.coverUrl,
      fileStorageUrl: current.fileStorageUrl || next.fileStorageUrl,
    }))), () => setCloudSyncStatus(status => status === 'error' ? status : 'synced'));
    const unsubSessions = watchCollection<ReadingSession>('readingSessions', items => setReadingSessions(local => mergeCloudRecords(local, items)));
    const unsubReviews = watchCollection<BookReview>('reviews', items => setReviews(local => mergeCloudRecords(local, items)));
    const unsubQuotes = watchCollection<Quotation>('quotations', items => setQuotations(local => mergeCloudRecords(local, items)));
    const unsubWords = watchCollection<VocabularyItem>('vocabulary', items => setVocabulary(local => mergeCloudRecords(local, items)));
    const unsubQuran = onSnapshot(doc(db, 'quranProgress', uid), snapshot => {
      if (auth.currentUser?.uid !== uid || !snapshot.exists()) return;
      const remote = snapshot.data() as QuranProgress;
      setQuranProgress(local => {
        if (remote.updatedAt && remote.updatedAt > (local.updatedAt || '')) return { ...local, ...remote };
        if (!remote.updatedAt && !local.updatedAt && !Object.keys(local.readingCalendar || {}).length) return { ...local, ...remote };
        return local;
      });
    }, error => {
      console.warn('Kur’an eşitlemesi başarısız:', error.code);
      setCloudSyncStatus('error');
    });

    return () => {
      unsubBooks();
      unsubSessions();
      unsubReviews();
      unsubQuotes();
      unsubWords();
      unsubQuran();
    };
  }, [currentUser, isHydrated]);

  // Helper function to sanitize any object for Firestore (removes undefined fields)
  const cleanForFirestore = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.filter(item => item !== undefined).map(cleanForFirestore);
    }
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        clean[key] = cleanForFirestore(val);
      }
    }
    return clean;
  };

  // Helper for resilient Firestore writes with quota limit handling
  const safeFirestoreSet = async (docRef: any, data: any) => {
    if (!auth.currentUser) return;
    try {
      const sanitized = cleanForFirestore(data);
      await setDoc(docRef, sanitized);
    } catch (err: any) {
      if (err?.code === 'resource-exhausted') {
        console.warn("Firestore kota limiti aşıldı; veriler yerel hafızada güvendedir.");
        setCloudSyncStatus('offline');
      } else {
        console.warn("Firestore yazma uyarısı:", err?.message || err);
      }
    }
  };

  const safeFirestoreDelete = async (docRef: any) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(docRef);
    } catch (err: any) {
      if (err?.code === 'resource-exhausted') {
        console.warn("Firestore kota limiti aşıldı.");
        setCloudSyncStatus('offline');
      } else {
        console.warn("Firestore silme uyarısı:", err?.message || err);
      }
    }
  };

  // Quran Handlers
  const updateQuranProgress = (patch: Partial<QuranProgress>) => {
    setQuranProgress(prev => {
      const updated = { ...prev, ...patch, updatedAt: new Date().toISOString() };
      if (typeof patch.pagesReadToday === 'number') {
        updated.readingCalendar = { ...prev.readingCalendar, ...patch.readingCalendar, [readingDate()]: patch.pagesReadToday };
      }
      if (auth.currentUser) {
        safeFirestoreSet(doc(db, 'quranProgress', auth.currentUser.uid), updated);
      }
      return updated;
    });
  };

  const recordMushafPage = (page: number) => {
    if (!Number.isInteger(page) || page < 1 || page > 604) return;
    const date = readingDate();
    setQuranProgress(previous => {
      const pages = previous.markedMushafPages?.date === date ? previous.markedMushafPages.pages : [];
      if (pages.includes(page)) return previous;
      const pagesReadToday = (previous.readingCalendar?.[date] || 0) + 1;
      const updated = {
        ...previous, lastReadPage: page, pagesReadToday,
        readingCalendar: { ...previous.readingCalendar, [date]: pagesReadToday },
        markedMushafPages: { date, pages: [...pages, page] },
        updatedAt: new Date().toISOString(),
      };
      if (auth.currentUser) safeFirestoreSet(doc(db, 'quranProgress', auth.currentUser.uid), updated);
      return updated;
    });
  };

  const bookmarkAyah = (surahNumber: number, ayahNumber: number) => {
    setQuranProgress(prev => {
      const bookmarked = prev.bookmarkedAyahs || [];
      const exists = bookmarked.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
      const updated = exists 
        ? bookmarked.filter(b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber))
        : [...bookmarked, { surahNumber, ayahNumber, createdAt: new Date().toISOString() }];

      const newProg = { ...prev, bookmarkedAyahs: updated, updatedAt: new Date().toISOString() };
      if (auth.currentUser) {
        safeFirestoreSet(doc(db, 'quranProgress', auth.currentUser.uid), newProg);
      }
      return newProg;
    });
  };

  const toggleFavoriteAyah = (fav: { surahNumber: number; ayahNumber: number; textArabic: string; translationTurkish: string; createdAt: string }) => {
    setQuranProgress(prev => {
      const favs = prev.favoriteAyahs || [];
      const exists = favs.some(f => f.surahNumber === fav.surahNumber && f.ayahNumber === fav.ayahNumber);
      const updated = exists 
        ? favs.filter(f => !(f.surahNumber === fav.surahNumber && f.ayahNumber === fav.ayahNumber))
        : [fav, ...favs];

      const newProg = { ...prev, favoriteAyahs: updated, updatedAt: new Date().toISOString() };
      if (auth.currentUser) {
        safeFirestoreSet(doc(db, 'quranProgress', auth.currentUser.uid), newProg);
      }
      return newProg;
    });
  };

  const saveAyahNote = (surahNumber: number, ayahNumber: number, noteText: string) => {
    setQuranProgress(prev => {
      const key = `${surahNumber}_${ayahNumber}`;
      const updatedNotes = { ...(prev.ayahNotes || {}), [key]: noteText };
      const newProg = { ...prev, ayahNotes: updatedNotes, updatedAt: new Date().toISOString() };
      if (auth.currentUser) {
        safeFirestoreSet(doc(db, 'quranProgress', auth.currentUser.uid), newProg);
      }
      return newProg;
    });
  };

  const saveBookToFirestore = async (book: UserBook) => {
    if (auth.currentUser && (!book.userId || book.userId === auth.currentUser.uid)) {
      const raw = { ...book, userId: auth.currentUser.uid };
      delete raw.fileStorageUrl;
      delete raw.fileData;
      if (typeof raw.coverUrl === 'string' && raw.coverUrl.startsWith('data:') && raw.coverUrl.length > 5000) {
        raw.coverUrl = '';
      }
      await safeFirestoreSet(doc(db, 'userBooks', book.id), raw);
    }
  };

  const updateBookCover = async (bookId: string, newCoverUrl: string, source: string = 'user', confidence: number = 100) => {
    setUserBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        const updated: UserBook = {
          ...b,
          coverUrl: newCoverUrl,
          coverSource: source as any,
          coverMatchScore: confidence,
          updatedAt: new Date().toISOString()
        };
        saveBookToFirestore(updated);
        saveCoverToIDB(bookId, newCoverUrl).catch(e => console.warn(e));
        return updated;
      }
      return b;
    }));
  };

  const attachBookFile = async (bookId: string, fileBlob: File): Promise<string> => {
    const extension = fileBlob.name.split('.').at(-1)?.toLowerCase();
    if (extension !== 'pdf' && extension !== 'epub') throw new Error('PDF veya EPUB dosyası seç.');
    const fileType = extension;
    const objectUrl = await saveBookFileToIDB(bookId, fileBlob, fileBlob.name, fileType);
    
    setUserBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        const updatedBook: UserBook = {
          ...b,
          fileStorageUrl: objectUrl,
          fileName: fileBlob.name,
          fileType: fileType,
          updatedAt: new Date().toISOString()
        };
        saveBookToFirestore(updatedBook);
        return updatedBook;
      }
      return b;
    }));

    return objectUrl;
  };

  const detachBookFile = async (bookId: string) => {
    await deleteBookFileFromIDB(bookId);
    const withoutFile = (book: UserBook) => {
      const { fileStorageUrl, fileData, fileName, fileType, ...remaining } = book;
      return { ...remaining, updatedAt: new Date().toISOString() };
    };
    setUserBooks(previous => previous.map(book => {
      if (book.id !== bookId) return book;
      const updated = withoutFile(book);
      saveBookToFirestore(updated);
      return updated;
    }));
    if (activeBookForReader?.id === bookId) setActiveBookForReader(null);
  };

  const updateBookTags = (bookId: string, tags: string[]) => {
    const now = new Date().toISOString();
    setUserBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        const updated = { ...b, tags, updatedAt: now };
        saveBookToFirestore(updated);
        return updated;
      }
      return b;
    }));
  };

  const addBookToLibrary = (bookData: Omit<UserBook, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    setUserBooks(prev => {
      // Robust check for existing book by case-insensitive title and author match
      const existingIndex = prev.findIndex(b => 
        b.title.trim().toLocaleLowerCase('tr') === bookData.title.trim().toLocaleLowerCase('tr') &&
        b.author.trim().toLocaleLowerCase('tr') === bookData.author.trim().toLocaleLowerCase('tr') &&
        (b.volumeNumber || 1) === (bookData.volumeNumber || 1)
      );

      if (existingIndex !== -1) {
        // Book exists: Update its createdAt to 'now' so it moves to top of 'recent' list, and merge any new metadata
        const existingBook = prev[existingIndex];
        const updatedBook: UserBook = {
          ...existingBook,
          updatedAt: now,
          createdAt: now
        };
        
        const rest = prev.filter((_, i) => i !== existingIndex);
        const newList = [updatedBook, ...rest];
        
        // Background sync to Firestore
        saveBookToFirestore(updatedBook);
        return newList;
      } else {
        // Brand new book
        const newBook: UserBook = {
          ...bookData,
          id: `ub-${crypto.randomUUID()}`,
          userId: auth.currentUser?.uid,
          createdAt: now,
          updatedAt: now
        };
        
        const newList = [newBook, ...prev];
        saveBookToFirestore(newBook);
        return newList;
      }
    });
  };

  const lastReadPages = useRef(new Map<string, number>());
  const updateBookProgress = (bookId: string, newPage: number, fileLength?: number) => {
    const book = userBooks.find(item => item.id === bookId);
    if (!book || !Number.isFinite(newPage)) return;
    const validPage = Math.max(1, Math.floor(newPage));
    const totalPages = Math.max(fileLength || book.totalPages || 1, validPage);
    const previousPage = lastReadPages.current.get(bookId) ?? book.currentPage;
    if (previousPage === validPage && book.totalPages === totalPages) return;

    lastReadPages.current.set(bookId, validPage);
    try { localStorage.setItem(`dk_last_page_${bookId}`, String(validPage)); } catch {}
    const now = new Date().toISOString();
    const update = (current: UserBook): UserBook => {
      const status = validPage >= totalPages ? 'completed' : current.status === 'want_to_read' ? 'reading' : current.status;
      return {
        ...current,
        currentPage: validPage,
        totalPages,
        status,
        endDate: status === 'completed' ? current.endDate || readingDate() : current.endDate,
        updatedAt: now,
      };
    };

    setUserBooks(previous => previous.map(item => item.id === bookId ? update(item) : item));
    setActiveBookForReaderState(current => current?.id === bookId ? update(current) : current);
    saveBookToFirestore(update(book));
    if (!fileLength && validPage > previousPage) logReadingSession(bookId, validPage - previousPage);
  };

  const updateBookStatus = (bookId: string, status: UserBook['status']) => {
    const now = new Date().toISOString();
    setUserBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        const updated = { ...b, status, endDate: status === 'completed' ? b.endDate || readingDate() : b.endDate, updatedAt: now };
        saveBookToFirestore(updated);
        return updated;
      }
      return b;
    }));
  };

  const updateBookLength = (bookId: string, pageCount: number) => {
    if (!Number.isSafeInteger(pageCount) || pageCount < 1) return;
    setUserBooks(previous => previous.map(book => {
      if (book.id !== bookId || pageCount < book.currentPage) return book;
      const updated = { ...book, totalPages: pageCount, updatedAt: new Date().toISOString() };
      saveBookToFirestore(updated);
      return updated;
    }));
  };

  const clearBadgeNotification = () => setNewBadgeNotification(null);

  const deduplicateBooks = (): number => {
    let removedCount = 0;
    const toDeleteIds: string[] = [];

    setUserBooks(prev => {
      const seen = new Map<string, UserBook>();

      for (const book of prev) {
        const cleanTitle = (book.title || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const cleanAuthor = (book.author || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const vol = book.isMultiVolume ? `_vol${book.volumeNumber || 1}` : '';
        const key = `${cleanTitle}:::${cleanAuthor}${vol}`;

        if (!seen.has(key)) {
          seen.set(key, book);
        } else {
          removedCount++;
          const existing = seen.get(key)!;
          const bookScore = (book.currentPage || 0) * 10 + (book.fileStorageUrl ? 100 : 0) + (book.userNotes ? 20 : 0);
          const existingScore = (existing.currentPage || 0) * 10 + (existing.fileStorageUrl ? 100 : 0) + (existing.userNotes ? 20 : 0);

          if (bookScore > existingScore) {
            toDeleteIds.push(existing.id);
            seen.set(key, book);
          } else {
            toDeleteIds.push(book.id);
          }
        }
      }

      return Array.from(seen.values());
    });

    if (toDeleteIds.length > 0 && auth.currentUser) {
      toDeleteIds.forEach(id => {
        deleteDoc(doc(db, 'userBooks', id)).catch(err => console.warn('dedup firestore delete notice:', err));
      });
    }

    return removedCount;
  };

  const deleteBookFromLibrary = async (bookId: string) => {
    setUserBooks(prev => prev.filter(b => b.id !== bookId));
    setActiveBookForReaderState(current => (current && current.id === bookId ? null : current));
    
    // Clean up local storage and IndexedDB file / cover stores
    try {
      localStorage.removeItem(`dk_last_page_${bookId}`);
      await deleteBookDataFromIDB(bookId);
    } catch (e) {
      console.warn('IDB delete cleanup warning:', e);
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'userBooks', bookId));
      } catch (err) {
        console.error('deleteBookFromLibrary firestore error:', err);
      }
    }
  };

  const logReadingSession = async (bookId: string, pagesRead: number) => {
    const targetBook = userBooks.find(b => b.id === bookId);
    if (!targetBook) return;

    const todayStr = readingDate();
    const newSession: ReadingSession = {
      id: `rs-${crypto.randomUUID()}`,
      userId: auth.currentUser?.uid,
      bookId,
      bookTitle: targetBook.title,
      date: todayStr,
      pagesRead,
      isMultiVolume: !!targetBook.isMultiVolume,
      createdAt: new Date().toISOString()
    };

    setReadingSessions(prev => [newSession, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'readingSessions', newSession.id), newSession);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addReview = async (reviewData: Omit<BookReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newReview: BookReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      userId: auth.currentUser?.uid,
      createdAt: now,
      updatedAt: now
    };
    setReviews(prev => [newReview, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'reviews', newReview.id), newReview);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteReview = async (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addQuotation = async (
    quoteText: string, 
    pageNum?: number, 
    note?: string, 
    bookId?: string, 
    bookTitle?: string, 
    authorName?: string
  ) => {
    const defaultBook = activeBookForReader || userBooks.find(b => b.status === 'reading') || userBooks[0];
    const newQuote: Quotation = {
      id: `q-${Date.now()}`,
      userId: auth.currentUser?.uid,
      bookId: bookId || defaultBook?.id || 'general',
      bookTitle: bookTitle || defaultBook?.title || 'Genel Okuma',
      author: authorName || defaultBook?.author || 'Bilinmiyor',
      pageNumber: pageNum,
      quoteText,
      userNote: note,
      createdAt: new Date().toISOString()
    };
    setQuotations(prev => [newQuote, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'quotations', newQuote.id), newQuote);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteQuotation = async (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'quotations', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addVocabularyItem = async (word: string, meaning: string, example?: string, sourceBook?: string) => {
    const newWord: VocabularyItem = {
      id: `v-${Date.now()}`,
      userId: auth.currentUser?.uid,
      word,
      meaning,
      exampleSentence: example,
      sourceBookTitle: sourceBook,
      isLearned: false,
      createdAt: new Date().toISOString()
    };
    setVocabulary(prev => [newWord, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'vocabulary', newWord.id), newWord);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleVocabularyLearned = async (id: string) => {
    setVocabulary(prev => prev.map(v => {
      if (v.id === id) {
        const updated = { ...v, isLearned: !v.isLearned };
        if (auth.currentUser) setDoc(doc(db, 'vocabulary', id), updated);
        return updated;
      }
      return v;
    }));
  };

  const deleteVocabularyItem = async (id: string) => {
    setVocabulary(prev => prev.filter(v => v.id !== id));
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'vocabulary', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Export User Data
  const exportUserDataJSON = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userProfile,
      userBooks: booksForStorage(userBooks),
      readingSessions,
      reviews,
      quotations,
      vocabulary,
      quranProgress
    };
    return JSON.stringify(backupData, null, 2);
  };

  // Commit the entire local restore before exposing it to the UI.
  const importUserDataJSON = async (jsonString: string, onProgress?: (progress: number) => void) => {
    if (!isHydrated) return { success: false, message: 'Yerel kütüphane yükleniyor. Biraz sonra yeniden dene.' };
    onProgress?.(10);
    const validation = validateBackupJSON(jsonString);
    if (!validation.isValid) {
      return { success: false, validation, message: validation.errors.join(' ') };
    }

    try {
      const data: BackupPayload = JSON.parse(jsonString);
      const now = new Date().toISOString();
      const bookIds = new Set<string>();
      const books = data.userBooks.map(book => {
        const category = MAIN_CATEGORIES.find(item => item.toLocaleLowerCase('tr') === String(book.category ?? '').toLocaleLowerCase('tr'))
          || inferCategoryForBook(book.title, book.subCategory, book.author);
        const pages = Number(book.totalPages);
        const progress = Number(book.currentPage);
        const currentPage = Number.isFinite(progress) ? Math.max(0, Math.floor(progress)) : 0;
        const totalPages = Number.isFinite(pages) && pages >= 0 ? Math.max(currentPage, Math.floor(pages)) : Math.max(300, currentPage);
        const id = typeof book.id === 'string' && book.id && !book.id.includes('/') && !bookIds.has(book.id) ? book.id : crypto.randomUUID();
        bookIds.add(id);
        const status = ['reading', 'completed', 'paused', 'want_to_read'].includes(book.status)
          ? book.status : currentPage >= totalPages ? 'completed' : 'reading';
        const subCategory = typeof book.subCategory === 'string' && book.subCategory.trim() ? book.subCategory : 'Genel';
        const tags = Array.isArray(book.tags) ? book.tags.filter(tag => typeof tag === 'string' && tag.trim()) : [];
        return {
          ...book, id, category, currentPage, totalPages, status, subCategory,
          tags: [...new Set(tags.length ? tags : [category, subCategory])],
          coverUrl: typeof book.coverUrl === 'string' ? book.coverUrl : '',
          createdAt: book.createdAt || now,
          updatedAt: book.updatedAt || now,
        } satisfies UserBook;
      });

      const sessions = data.readingSessions?.map(session => ({ ...session, pagesRead: Math.max(0, Number(session.pagesRead) || 0) }));
      const profile = data.userProfile && { ...userProfile, ...data.userProfile, uid: auth.currentUser?.uid || userProfile.uid };
      const quran = data.quranProgress && { ...quranProgress, ...data.quranProgress };
      const durableBooks = booksForStorage(books);
      const entries: [string, unknown][] = [['dk_user_books', durableBooks]];
      if (sessions) entries.push(['dk_reading_sessions', sessions]);
      if (data.reviews) entries.push(['dk_reviews', data.reviews]);
      if (data.quotations) entries.push(['dk_quotations', data.quotations]);
      if (data.vocabulary) entries.push(['dk_vocabulary', data.vocabulary]);
      if (profile) entries.push(['dk_user_profile', profile]);
      if (quran) entries.push(['dk_quran_progress', quran]);

      onProgress?.(60);
      await saveAppDataBatchToIDB(entries);
      entries.forEach(([key, value]) => mirrorLocalStorage(key, value));
      for (const book of [...userBooks, ...books]) {
        try { localStorage.removeItem(`dk_last_page_${book.id}`); } catch {}
      }
      lastReadPages.current.clear();
      setActiveBookForReader(null);
      setSelectedBookForDetail(null);
      setUserBooks(durableBooks);
      if (sessions) setReadingSessions(sessions);
      if (data.reviews) setReviews(data.reviews);
      if (data.quotations) setQuotations(data.quotations);
      if (data.vocabulary) setVocabulary(data.vocabulary);
      if (profile) setUserProfile(profile);
      if (quran) setQuranProgress(quran);
      onProgress?.(100);
      return { success: true, validation, message: `Yedek bu cihaza kaydedildi. ${books.length} eser ve dosyadaki diğer kayıtlar geri yüklendi.` };
    } catch (error) {
      console.warn('Backup restore failed:', error);
      return { success: false, validation, message: 'Yedek cihazın yerel depolamasına kaydedilemedi. Lütfen yeniden dene.' };
    }
  };

  const cloudUploadInProgress = useRef(false);
  const syncAllDataToCloud = async (onProgress?: (progress: number) => void): Promise<{ success: boolean; message: string }> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { success: false, message: 'Buluta eşitlemek için Google ile giriş yap.' };
    if (!isHydrated || cloudUploadInProgress.current) {
      return { success: false, message: 'Yerel kayıtların yüklenmesini veya devam eden eşitlemeyi bekle.' };
    }

    cloudUploadInProgress.current = true;
    setCloudSyncStatus('syncing');
    const entries: { collection: string; id: string; record: Record<string, unknown> }[] = [];
    const include = <T extends { id: string; userId?: string },>(collectionName: string, records: T[]) => {
      for (const item of records) {
        if (!item.id || (item.userId && item.userId !== uid)) continue;
        entries.push({ collection: collectionName, id: item.id, record: { ...item, userId: uid } });
      }
    };
    let confirmed = 0;
    try {
      include('userBooks', booksForStorage(userBooks).map(book => ({
        ...book,
        coverUrl: book.coverUrl?.startsWith('data:') && book.coverUrl.length > 5000 ? '' : book.coverUrl,
      })));
      include('readingSessions', readingSessions);
      include('reviews', reviews);
      include('quotations', quotations);
      include('vocabulary', vocabulary);
      if (quranProgress.updatedAt) entries.push({ collection: 'quranProgress', id: uid, record: { ...quranProgress } });

      for (let offset = 0; offset < entries.length; offset += 350) {
        if (auth.currentUser?.uid !== uid) throw new Error('Oturum değişti.');
        const batch = writeBatch(db);
        const chunk = entries.slice(offset, offset + 350);
        for (const entry of chunk) batch.set(doc(db, entry.collection, entry.id), cleanForFirestore(entry.record));
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            batch.commit(),
            new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('Sunucu onayı bekleniyor.')), 20000); }),
          ]);
        } finally {
          clearTimeout(timeout);
        }
        confirmed += chunk.length;
        onProgress?.(Math.round(confirmed / entries.length * 100));
      }

      setCloudSyncStatus('synced');
      onProgress?.(100);
      return { success: true, message: `Bulut eşitlemesi tamamlandı. ${confirmed} kayıt için sunucu onayı alındı.` };
    } catch (error) {
      console.warn('Firestore upload failed:', error);
      setCloudSyncStatus('error');
      return { success: false, message: `Bulut eşitlemesi tamamlanamadı. ${confirmed} kayıt onaylandı. Diğer kayıtlar cihazda duruyor.` };
    } finally {
      cloudUploadInProgress.current = false;
    }
  };

  const verifyDataIntegrity = () => {
    return {
      totalBooks: userBooks.length,
      totalSessions: readingSessions.length,
      totalQuotes: quotations.length,
      totalWords: vocabulary.length,
      integrityOk: userBooks.length > 0 && Array.isArray(readingSessions)
    };
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        exploreSubTab,
        setExploreSubTab,
        userBooks,
        setUserBooks,
        readingSessions,
        reviews,
        quotations,
        vocabulary,
        userProfile,
        setUserProfile,
        activeBookForReader,
        setActiveBookForReader,
        selectedBookForDetail,
        setSelectedBookForDetail,
        cloudSyncStatus,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        theme,

        toggleTheme,
        isAddBookModalOpen,
        setIsAddBookModalOpen,
        isAddQuoteModalOpen,
        setIsAddQuoteModalOpen,
        isAddReviewModalOpen,
        setIsAddReviewModalOpen,
        isAddPoemModalOpen,
        setIsAddPoemModalOpen,
        quranProgress,
        updateQuranProgress,
        recordMushafPage,
        bookmarkAyah,
        toggleFavoriteAyah,
        saveAyahNote,
        addBookToLibrary,
        updateBookProgress,
        updateBookLength,
        updateBookStatus,
        deleteBookFromLibrary,
        logReadingSession,
        attachBookFile,
        detachBookFile,
        updateBookCover,
        updateBookTags,
        addReview,
        deleteReview,
        addQuotation,
        deleteQuotation,
        addVocabularyItem,
        toggleVocabularyLearned,
        deleteVocabularyItem,
        exportUserDataJSON,
        importUserDataJSON,
        syncAllDataToCloud,
        verifyDataIntegrity,
        newBadgeNotification,
        setNewBadgeNotification,
        clearBadgeNotification,
        deduplicateBooks
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
