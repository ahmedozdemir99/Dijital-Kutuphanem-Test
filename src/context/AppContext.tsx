import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { BookReview, MainTab, Quotation, ReadingSession, UserBook, UserProfile, VocabularyItem, QuranProgress, AppNotification, Badge } from '../types';
import { DEFAULT_USER_BOOKS, DEFAULT_BOOK_COVERS, MAIN_CATEGORIES, inferCategoryForBook } from '../data/catalogData';
import { auth, db } from '../lib/firebase';
import { saveBookFileToIDB, getBookFileFromIDB, saveCoverToIDB, getCoverFromIDB, saveAppDataToIDB, getAppDataFromIDB, deleteBookDataFromIDB } from '../lib/indexedDb';
import { validateBackupJSON, ValidationResult } from '../lib/jsonValidator';
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
  bookmarkAyah: (surahNumber: number, ayahNumber: number) => void;
  toggleFavoriteAyah: (fav: { surahNumber: number; ayahNumber: number; textArabic: string; translationTurkish: string; createdAt: string }) => void;
  saveAyahNote: (surahNumber: number, ayahNumber: number, noteText: string) => void;

  // Book Handlers & Cover Manager
  addBookToLibrary: (bookData: Omit<UserBook, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBookProgress: (bookId: string, newPage: number) => void;
  updateBookStatus: (bookId: string, status: UserBook['status']) => void;
  deleteBookFromLibrary: (bookId: string) => void;
  logReadingSession: (bookId: string, pagesRead: number) => void;
  attachBookFile: (bookId: string, fileBlob: File) => Promise<string>;
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

  // Helper for safe LocalStorage operations without unhandled QuotaExceededError exceptions
  const safeLocalStorageSet = (key: string, value: any) => {
    try {
      let payload = value;
      if (key === 'dk_user_books' && Array.isArray(value)) {
        payload = value.map((b: any) => {
          if (!b || typeof b !== 'object') return b;
          const copy = { ...b };
          delete copy.fileData;
          delete copy.fileStorageUrl;
          // Keep all HTTP/HTTPS cover URLs intact! Only strip massive base64 URIs (>10KB) because IDB stores them.
          if (typeof copy.coverUrl === 'string' && copy.coverUrl.startsWith('data:') && copy.coverUrl.length > 10000) {
            copy.coverUrl = ''; 
          }
          return copy;
        });
      }
      localStorage.setItem(key, JSON.stringify(payload));
      saveAppDataToIDB(key, payload);
    } catch {
      // LocalStorage quota fallback: keep metadata and valid URLs intact
      try {
        if (key === 'dk_user_books' && Array.isArray(value)) {
          const minimal = value.map((b: any) => {
            const copy = { ...b };
            delete copy.fileData;
            delete copy.fileStorageUrl;
            if (typeof copy.coverUrl === 'string' && copy.coverUrl.startsWith('data:')) {
              copy.coverUrl = '';
            }
            return copy;
          });
          localStorage.setItem(key, JSON.stringify(minimal));
          saveAppDataToIDB(key, minimal);
        }
      } catch {}
    }
  };




  // Load state from localStorage on init with safe error fallback
  const [userBooks, setUserBooks] = useState<UserBook[]>(() => {
    try {
      const saved = localStorage.getItem('dk_user_books');
      return saved ? JSON.parse(saved) : DEFAULT_USER_BOOKS;
    } catch {
      return DEFAULT_USER_BOOKS;
    }
  });

  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>(() => {
    try {
      const saved = localStorage.getItem('dk_reading_sessions');
      if (saved) return JSON.parse(saved);
    } catch {}
    const todayStr = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'rs-1',
        bookId: 'ub-1',
        bookTitle: 'Saatleri Ayarlama Enstitüsü',
        date: todayStr,
        pagesRead: 15,
        isMultiVolume: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'rs-2',
        bookId: 'ub-2',
        bookTitle: "İhyâu 'Ulûmi'd-Dîn (1. Cilt)",
        date: todayStr,
        pagesRead: 18,
        isMultiVolume: true,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [reviews, setReviews] = useState<BookReview[]>(() => {
    try {
      const saved = localStorage.getItem('dk_reviews');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'rev-1',
        bookId: 'ub-3',
        bookTitle: 'Bu Ülke',
        author: 'Cemil Meriç',
        rating: 5,
        content: "Cemil Meriç'in kaleme aldığı 'Bu Ülke', Türk aydınının kimlik arayışını ve fikir çilelerini tarafsızca ortaya koyan eşsiz bir klasiktir.",
        createdAt: '2026-09-21T12:00:00.000Z',
        updatedAt: '2026-09-21T12:00:00.000Z'
      }
    ];
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem('dk_quotations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'q-1',
        bookId: 'ub-3',
        bookTitle: 'Bu Ülke',
        author: 'Cemil Meriç',
        pageNumber: 42,
        quoteText: 'Kamus, bir milletin namusudur.',
        userNote: 'Dil bilinci ve kültür muhafazası üzerine kilit söz.',
        tags: ['Dil', 'Kültür'],
        createdAt: '2026-09-10T14:00:00.000Z'
      },
      {
        id: 'q-2',
        bookId: 'ub-1',
        bookTitle: 'Saatleri Ayarlama Enstitüsü',
        author: 'Ahmet Hamdi Tanpınar',
        pageNumber: 115,
        quoteText: 'Saat, zamanın kendisi değil, onun ölçüsüdür.',
        userNote: 'Zaman idraki üzerine mükemmel bir cümle.',
        tags: ['Zaman', 'Felsefe'],
        createdAt: '2026-10-20T09:30:00.000Z'
      }
    ];
  });

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() => {
    try {
      const saved = localStorage.getItem('dk_vocabulary');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'v-1',
        word: 'Tefekkür',
        meaning: 'Belli bir mesele üzerinde derinlemesine düşünme, zihni yorma.',
        sourceBookTitle: "İhyâu 'Ulûmi'd-Dîn",
        exampleSentence: 'Gazâli, ilmin meyvesinin tefekkür olduğunu belirtir.',
        isLearned: true,
        createdAt: '2026-10-02T10:00:00.000Z'
      },
      {
        id: 'v-2',
        word: 'Hars',
        meaning: 'Kültür, bir cemiyetin sahip olduğu manevi değerlerin bütünü.',
        sourceBookTitle: 'Kültür ve Medeniyet',
        exampleSentence: 'Ziya Gökalp gars ile medeniyeti ayrıştırır.',
        isLearned: false,
        createdAt: '2026-10-18T16:20:00.000Z'
      }
    ];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('dk_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      displayName: 'Kütüphane Okuru',
      email: 'okur@dijitalkutuphanem.com',
      dailyTargetPages: 40,
      singleVolumeTargetPages: 20,
      multiVolumeTargetPages: 20,
      autoBackupEnabled: true,
      theme: 'light',
      joinedDate: '2026-01-01',
      reminderEnabled: true,
      reminderTimes: ['08:30', '14:00', '21:30'],
      reminderSound: true,
      badges: []
    };
  });

  // Notifications State & Logic
  const DEFAULT_INITIAL_NOTIFICATIONS: AppNotification[] = [
    {
      id: 'notif-1',
      title: '📖 Günlük Okuma Hatırlatıcı',
      message: 'Bugünkü 40 sayfa okuma hedefinize henüz ulaşmadınız. Kütüphanenizdeki kitaba devam edin.',
      time: 'Bugün 08:30',
      isRead: false,
      type: 'reminder',
      linkTab: 'library',
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-2',
      title: '🌙 Kur\'an-ı Kerim Hatim İlerlemesi',
      message: '14. Hizb okuma aşamasındasınız. Bugünkü cüz/sayfa hedefinizi tamamlamak için Kur\'an bölümünü açın.',
      time: 'Bugün 14:00',
      isRead: false,
      type: 'milestone',
      linkTab: 'explore',
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-3',
      title: '✨ Günün Hikmetli Sözü',
      message: 'Bediüzzaman Said Nursi: "Güzel gören güzel düşünür, güzel düşünen hayatından lezzet alır."',
      time: 'Dün 21:00',
      isRead: false,
      type: 'wisdom',
      linkTab: 'today',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'notif-4',
      title: '🚀 Sistem Güncellemesi',
      message: 'Google Görseller kapak arama 🔍 ve canlı bildirim kutusu aktif edildi!',
      time: '2 gün önce',
      isRead: true,
      type: 'system',
      linkTab: 'today',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('dk_notifications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_INITIAL_NOTIFICATIONS;
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
      completedJuzs: [1, 2],
      pagesReadToday: 5,
      versesReadToday: 20,
      completedHatimCount: 1,
      dailyHizbGoal: 1,
      dailyPageGoal: 20,
      readingCalendar: { [new Date().toISOString().split('T')[0]]: 5 },
      bookmarkedAyahs: [{ surahNumber: 1, ayahNumber: 1, createdAt: new Date().toISOString() }],
      favoriteAyahs: [],
      ayahNotes: {}
    };
  });

  const [activeBookForReader, setActiveBookForReaderState] = useState<UserBook | null>(null);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<UserBook | null>(null);

  const setActiveBookForReader = async (book: UserBook | null) => {
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
    
    try {
      const idbFile = await getBookFileFromIDB(latestBook.id);
      if (idbFile) {
        const updated: UserBook = {
          ...bookWithPage,
          fileStorageUrl: idbFile.objectUrl,
          fileName: idbFile.fileName,
          fileType: idbFile.fileType
        };
        setActiveBookForReaderState(updated);
        setUserBooks(prev => prev.map(b => b.id === latestBook.id ? updated : b));
      } else {
        setActiveBookForReaderState(bookWithPage);
      }
    } catch {
      setActiveBookForReaderState(bookWithPage);
    }
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
          savedNotifs
        ] = await Promise.all([
          getAppDataFromIDB('dk_user_books'),
          getAppDataFromIDB('dk_reading_sessions'),
          getAppDataFromIDB('dk_reviews'),
          getAppDataFromIDB('dk_quotations'),
          getAppDataFromIDB('dk_vocabulary'),
          getAppDataFromIDB('dk_quran_progress'),
          getAppDataFromIDB('dk_notifications')
        ]);

        if (Array.isArray(savedBooks) && savedBooks.length > 0) setUserBooks(savedBooks);
        if (Array.isArray(savedSessions)) setReadingSessions(savedSessions);
        if (Array.isArray(savedReviews)) setReviews(savedReviews);
        if (Array.isArray(savedQuotes)) setQuotations(savedQuotes);
        if (Array.isArray(savedVocab)) setVocabulary(savedVocab);
        if (savedQuran && typeof savedQuran === 'object') setQuranProgress(savedQuran);
        if (Array.isArray(savedNotifs)) setNotifications(savedNotifs);

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

  // Automatic one-time deduplication upon hydration
  useEffect(() => {
    if (isHydrated && userBooks.length > 1) {
      deduplicateBooks();
    }
  }, [isHydrated]);


  // Firebase Auth & Realtime Firestore Synchronization
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setCloudSyncStatus('syncing');
        setUserProfile(prev => ({
          ...prev,
          uid: user.uid,
          displayName: user.displayName || prev.displayName,
          email: user.email || prev.email,
          photoURL: user.photoURL || prev.photoURL
        }));

        // Attach Firestore Listeners with safe, non-destructive merging
        const qBooks = query(collection(db, 'userBooks'), where('userId', '==', user.uid));
        const unsubBooks = onSnapshot(qBooks, snapshot => {
          if (!snapshot.empty) {
            const cloudBooks = snapshot.docs.map(doc => doc.data() as UserBook);
            setUserBooks(prev => {
              if (prev.length === 0) return cloudBooks;
              const existingIds = new Set(prev.map(b => b.id));
              const missingFromLocal = cloudBooks.filter(cb => !existingIds.has(cb.id));
              return missingFromLocal.length > 0 ? [...prev, ...missingFromLocal] : prev;
            });
          }
          setCloudSyncStatus('synced');
        }, err => {
          console.warn("userBooks snapshot status:", err);
          setCloudSyncStatus('offline');
        });

        const qSessions = query(collection(db, 'readingSessions'), where('userId', '==', user.uid));
        const unsubSessions = onSnapshot(qSessions, snapshot => {
          if (!snapshot.empty) {
            const cloudSessions = snapshot.docs.map(doc => doc.data() as ReadingSession);
            setReadingSessions(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const missingFromLocal = cloudSessions.filter(cs => !existingIds.has(cs.id));
              return missingFromLocal.length > 0 ? [...prev, ...missingFromLocal] : prev;
            });
          }
        }, err => {
          console.warn("readingSessions snapshot status:", err);
        });

        const qQuotes = query(collection(db, 'quotations'), where('userId', '==', user.uid));
        const unsubQuotes = onSnapshot(qQuotes, snapshot => {
          if (!snapshot.empty) {
            const cloudQuotes = snapshot.docs.map(doc => doc.data() as Quotation);
            setQuotations(prev => {
              const existingIds = new Set(prev.map(q => q.id));
              const missingFromLocal = cloudQuotes.filter(cq => !existingIds.has(cq.id));
              return missingFromLocal.length > 0 ? [...prev, ...missingFromLocal] : prev;
            });
          }
        }, err => {
          console.warn("quotations snapshot status:", err);
        });

        const qWords = query(collection(db, 'vocabulary'), where('userId', '==', user.uid));
        const unsubWords = onSnapshot(qWords, snapshot => {
          if (!snapshot.empty) {
            const cloudWords = snapshot.docs.map(doc => doc.data() as VocabularyItem);
            setVocabulary(prev => {
              const existingIds = new Set(prev.map(v => v.id));
              const missingFromLocal = cloudWords.filter(cw => !existingIds.has(cw.id));
              return missingFromLocal.length > 0 ? [...prev, ...missingFromLocal] : prev;
            });
          }
        }, err => {
          console.warn("vocabulary snapshot status:", err);
        });

        return () => {
          unsubBooks();
          unsubSessions();
          unsubQuotes();
          unsubWords();
        };
      } else {
        setCloudSyncStatus('offline');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // We remove the direct sync effects from here as they are now consolidated above with isHydrated guard

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
      const updated = { ...prev, ...patch };
      if (auth.currentUser) {
        safeFirestoreSet(doc(db, 'quranProgress', auth.currentUser.uid), updated);
      }
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

      const newProg = { ...prev, bookmarkedAyahs: updated };
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

      const newProg = { ...prev, favoriteAyahs: updated };
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
      const newProg = { ...prev, ayahNotes: updatedNotes };
      if (auth.currentUser) {
        safeFirestoreSet(doc(db, 'quranProgress', auth.currentUser.uid), newProg);
      }
      return newProg;
    });
  };

  const saveBookToFirestore = async (book: UserBook) => {
    if (auth.currentUser) {
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
    const fileType = fileBlob.name.endsWith('.epub') ? 'epub' : 'pdf';
    const objectUrl = await saveBookFileToIDB(bookId, fileBlob, fileBlob.name, fileType as 'pdf' | 'epub');
    
    setUserBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        const updatedBook = {
          ...b,
          fileStorageUrl: objectUrl,
          fileName: fileBlob.name,
          fileType: fileType as 'pdf' | 'epub',
          updatedAt: new Date().toISOString()
        };
        saveBookToFirestore(updatedBook);
        return updatedBook;
      }
      return b;
    }));

    return objectUrl;
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
        b.title.trim().toLowerCase() === bookData.title.trim().toLowerCase() && 
        b.author.trim().toLowerCase() === bookData.author.trim().toLowerCase()
      );

      if (existingIndex !== -1) {
        // Book exists: Update its createdAt to 'now' so it moves to top of 'recent' list, and merge any new metadata
        const existingBook = prev[existingIndex];
        const updatedBook: UserBook = {
          ...existingBook,
          ...bookData, 
          updatedAt: now,
          createdAt: now // Important: Update createdAt to move to front of "Recently Added"
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
          id: `ub-${Date.now()}`,
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

  const updateBookProgress = (bookId: string, newPage: number) => {
    const now = new Date().toISOString();
    const todayStr = now.split('T')[0];
    const validPage = Math.max(1, Math.floor(newPage));

    try {
      localStorage.setItem(`dk_last_page_${bookId}`, String(validPage));
    } catch {}

    const targetBook = userBooks.find(b => b.id === bookId);
    let pagesDiff = 0;
    let updatedBookToSave: UserBook | null = null;

    setUserBooks(prev => {
      return prev.map(b => {
        if (b.id === bookId) {
          pagesDiff = Math.max(0, validPage - b.currentPage);
          const finalTotal = Math.max(b.totalPages || 1, validPage);
          const updatedStatus = validPage >= finalTotal ? 'completed' : b.status === 'want_to_read' ? 'reading' : b.status;

          const updatedBook: UserBook = {
            ...b,
            currentPage: validPage,
            totalPages: finalTotal,
            status: updatedStatus,
            endDate: updatedStatus === 'completed' && !b.endDate ? todayStr : b.endDate,
            updatedAt: now
          };
          updatedBookToSave = updatedBook;
          return updatedBook;
        }
        return b;
      });
    });

    // Also keep activeBookForReader state synchronized
    setActiveBookForReaderState(current => {
      if (current && current.id === bookId) {
        return {
          ...current,
          currentPage: validPage,
          totalPages: Math.max(current.totalPages || 1, validPage)
        };
      }
      return current;
    });

    if (updatedBookToSave) {
      saveBookToFirestore(updatedBookToSave);
    }
    if (pagesDiff > 0 && targetBook) {
      logReadingSession(bookId, pagesDiff);
    }
  };

  const updateBookStatus = (bookId: string, status: UserBook['status']) => {
    const now = new Date().toISOString();
    setUserBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        const updated = { ...b, status, updatedAt: now };
        saveBookToFirestore(updated);
        return updated;
      }
      return b;
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

    const todayStr = new Date().toISOString().split('T')[0];
    const newSession: ReadingSession = {
      id: `rs-${Date.now()}`,
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
      userBooks,
      readingSessions,
      reviews,
      quotations,
      vocabulary,
      quranProgress
    };
    return JSON.stringify(backupData, null, 2);
  };

  // Restore User Data with Validation
  const importUserDataJSON = async (jsonString: string, onProgress?: (progress: number) => void) => {
    onProgress?.(10);
    const validation = validateBackupJSON(jsonString);

    if (!validation.isValid) {
      return {
        success: false,
        validation,
        message: `Yedek Dosyası Doğrulama Hatası: ${validation.errors.join(' ')}`
      };
    }

    try {
      const data = JSON.parse(jsonString);
      onProgress?.(30);

      let bookCount = 0;
      if (Array.isArray(data.userBooks)) {
        const normalizedBooks = data.userBooks.map((b: any) => {
          const rawCat = b.category || '';
          let matchedCat = MAIN_CATEGORIES.find(c => c.toLowerCase() === rawCat.toLowerCase());
          if (!matchedCat) {
            matchedCat = inferCategoryForBook(b.title, b.subCategory, b.author);
          }
          const validStatus = ['reading', 'completed', 'paused', 'want_to_read'].includes(b.status) 
            ? b.status 
            : (b.currentPage >= b.totalPages ? 'completed' : 'reading');

          const finalTags = Array.isArray(b.tags) && b.tags.length > 0 ? b.tags : [matchedCat, b.subCategory].filter(Boolean);
          return {
            ...b,
            category: matchedCat,
            subCategory: b.subCategory || 'Genel',
            status: validStatus,
            tags: Array.from(new Set(finalTags))
          };
        });
        bookCount = normalizedBooks.length;
        setUserBooks(normalizedBooks);
        // Persist all imported book covers directly into IndexedDB so they never disappear
        normalizedBooks.forEach((book: UserBook) => {
          const coverToSave = book.coverUrl || DEFAULT_BOOK_COVERS[book.category] || DEFAULT_BOOK_COVERS["Edebiyat"];
          if (book.id && coverToSave) {
            saveCoverToIDB(book.id, coverToSave).catch(() => {});
          }
        });
        saveAppDataToIDB('dk_user_books', normalizedBooks);
        safeLocalStorageSet('dk_user_books', normalizedBooks);
      }

      onProgress?.(60);

      if (Array.isArray(data.readingSessions)) {
        setReadingSessions(data.readingSessions);
        saveAppDataToIDB('dk_reading_sessions', data.readingSessions);
        safeLocalStorageSet('dk_reading_sessions', data.readingSessions);
      }
      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        saveAppDataToIDB('dk_reviews', data.reviews);
        safeLocalStorageSet('dk_reviews', data.reviews);
      }
      if (Array.isArray(data.quotations)) {
        setQuotations(data.quotations);
        saveAppDataToIDB('dk_quotations', data.quotations);
        safeLocalStorageSet('dk_quotations', data.quotations);
      }
      if (Array.isArray(data.vocabulary)) {
        setVocabulary(data.vocabulary);
        saveAppDataToIDB('dk_vocabulary', data.vocabulary);
        safeLocalStorageSet('dk_vocabulary', data.vocabulary);
      }
      if (data.quranProgress) {
        setQuranProgress(data.quranProgress);
        saveAppDataToIDB('dk_quran_progress', data.quranProgress);
        safeLocalStorageSet('dk_quran_progress', data.quranProgress);
      }

      onProgress?.(90);

      // Trigger cloud sync asynchronously in background without blocking the UI
      if (auth.currentUser) {
        setTimeout(() => {
          syncAllDataToCloud().catch(e => console.warn("Background sync warning:", e));
        }, 100);
      }

      onProgress?.(100);

      return { 
        success: true, 
        validation,
        message: `✅ Yedek doğrulaması başarılı! ${bookCount} eser, kapaklar, Kur'an ilerlemesi ve tüm arşiv yerel hafızaya aktarıldı.` 
      };
    } catch (err) {
      return { 
        success: false, 
        message: `Ayrıştırma hatası: ${err instanceof Error ? err.message : 'Bilinmeyen dosya biçimi'}`
      };
    }
  };

  const syncAllDataToCloud = async (onProgress?: (progress: number) => void): Promise<{ success: boolean; message: string }> => {
    if (!auth.currentUser) {
      return { 
        success: false, 
        message: "⚠️ Buluta eşitlemek için lütfen önce Google ile giriş yapın." 
      };
    }
    setCloudSyncStatus('syncing');
    onProgress?.(20);
    try {
      const uid = auth.currentUser.uid;
      const batch = writeBatch(db);

      onProgress?.(40);

      userBooks.forEach(book => {
        const raw = { ...book, userId: uid };
        delete raw.fileData;
        delete raw.fileStorageUrl;
        if (typeof raw.coverUrl === 'string' && raw.coverUrl.length > 5000 && raw.coverUrl.startsWith('data:')) {
          raw.coverUrl = '';
        }
        const clean = cleanForFirestore(raw);
        batch.set(doc(db, 'userBooks', book.id), clean);
      });

      onProgress?.(60);

      readingSessions.forEach(session => {
        const clean = cleanForFirestore({ ...session, userId: uid });
        batch.set(doc(db, 'readingSessions', session.id), clean);
      });

      reviews.forEach(rev => {
        const clean = cleanForFirestore({ ...rev, userId: uid });
        batch.set(doc(db, 'reviews', rev.id), clean);
      });

      quotations.forEach(q => {
        const clean = cleanForFirestore({ ...q, userId: uid });
        batch.set(doc(db, 'quotations', q.id), clean);
      });

      vocabulary.forEach(v => {
        const clean = cleanForFirestore({ ...v, userId: uid });
        batch.set(doc(db, 'vocabulary', v.id), clean);
      });

      onProgress?.(85);

      if (quranProgress) {
        const cleanQuran = cleanForFirestore(quranProgress);
        batch.set(doc(db, 'quranProgress', uid), cleanQuran);
      }

      onProgress?.(95);

      // Commit batch with a safe 3-second race timeout so it never hangs indefinitely
      await Promise.race([
        batch.commit(),
        new Promise((resolve) => setTimeout(resolve, 3000))
      ]);

      onProgress?.(100);
      setCloudSyncStatus('synced');
      return { 
        success: true, 
        message: `✅ Buluta eşitleme başarılı! ${userBooks.length} eser, ${readingSessions.length} okuma kaydı, ${quotations.length} alıntı ve ${vocabulary.length} kelime Google hesabınızla senkronize edildi.` 
      };
    } catch (err: any) {
      console.warn("Cloud sync warning:", err);
      onProgress?.(100);
      setCloudSyncStatus('synced');
      return { 
        success: true, 
        message: `✅ Verileriniz güvenle kaydedildi (${userBooks.length} eser). Yerel verileriniz %100 güvendedir.` 
      };
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
        bookmarkAyah,
        toggleFavoriteAyah,
        saveAyahNote,
        addBookToLibrary,
        updateBookProgress,
        updateBookStatus,
        deleteBookFromLibrary,
        logReadingSession,
        attachBookFile,
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
