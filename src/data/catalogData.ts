import { CatalogBook, CurriculumYear, CurriculumMonthData, CurriculumWeeklyBook, UserBook } from '../types';

export type { CurriculumMonthData, CurriculumWeeklyBook };

export const MAIN_CATEGORIES = [
  "Din ve İlahiyat",
  "Felsefe",
  "Tarih",
  "Edebiyat",
  "Şiir",
  "Psikoloji",
  "Sosyoloji",
  "Eğitim ve Pedagoji",
  "Matematik ve Mantık",
  "Fen ve Doğa Bilimleri",
  "Biyografi ve Hatırat",
  "Kültür, Sanat ve Medeniyet"
] as const;

export const DEFAULT_BOOK_COVERS: Record<string, string> = {
  "Din ve İlahiyat": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
  "Felsefe": "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop",
  "Tarih": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=600&auto=format&fit=crop",
  "Edebiyat": "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
  "Şiir": "https://images.unsplash.com/photo-1474939557548-f842486be195?q=80&w=600&auto=format&fit=crop",
  "Psikoloji": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop",
  "Sosyoloji": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600&auto=format&fit=crop",
  "Eğitim ve Pedagoji": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop",
  "Matematik ve Mantık": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop",
  "Fen ve Doğa Bilimleri": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop",
  "Biyografi ve Hatırat": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop",
  "Kültür, Sanat ve Medeniyet": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop"
};

export const DEFAULT_USER_BOOKS: UserBook[] = [
  {
    id: "ub-1",
    title: "Saatleri Ayarlama Enstitüsü",
    author: "Ahmet Hamdi Tanpınar",
    category: "Edebiyat",
    subCategory: "Modern Türk Romanı",
    publisher: "Dergah Yayınları",
    publishYear: "1961",
    isbn: "9789759955748",
    totalPages: 382,
    currentPage: 215,
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
    description: "Doğu ve Batı arasında bocalayan Türk toplumunun mizahi ve felsefi şaheseri.",
    status: "reading",
    isMultiVolume: false,
    startDate: "2026-10-15",
    userRating: 5,
    userNotes: "Doğu-Batı sentezi harika işlenmiş.",
    createdAt: "2026-10-15T10:00:00.000Z",
    updatedAt: "2026-11-03T05:00:00.000Z"
  },
  {
    id: "ub-2",
    title: "İhyâu 'Ulûmi'd-Dîn (1. Cilt)",
    author: "İmâm-ı Gazâlî",
    category: "Din ve İlahiyat",
    subCategory: "Tasavvuf ve Fıkıh",
    publisher: "Klasik Yayınları",
    publishYear: "2018",
    isbn: "9789758740121",
    totalPages: 480,
    currentPage: 180,
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
    description: "Kalp temizliği, ibadetlerin hikmeti ve ahlak prensipleri.",
    status: "reading",
    isMultiVolume: true,
    seriesTitle: "İhyâu 'Ulûmi'd-Dîn Külliyatı",
    volumeNumber: 1,
    totalVolumes: 4,
    startDate: "2026-10-01",
    userRating: 5,
    userNotes: "Çok derinlikli bir ahlak klasiği.",
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-11-02T18:00:00.000Z"
  },
  {
    id: "ub-3",
    title: "Bu Ülke",
    author: "Cemil Meriç",
    category: "Kültür, Sanat ve Medeniyet",
    subCategory: "Deneme & Düşünce",
    publisher: "İletişim Yayınları",
    publishYear: "1974",
    isbn: "9789754700077",
    totalPages: 340,
    currentPage: 340,
    coverUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop",
    description: "Bir mütefekkirin iç dünyası ve fikir çileleri.",
    status: "completed",
    isMultiVolume: false,
    startDate: "2026-09-01",
    endDate: "2026-09-20",
    userRating: 5,
    userNotes: "Kelimeleri üslup harikası.",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-20T10:00:00.000Z"
  }
];

export function inferCategoryForBook(title: string = '', subCategory: string = '', author: string = ''): (typeof MAIN_CATEGORIES)[number] {
  const text = `${title} ${subCategory} ${author}`.toLowerCase();
  if (text.includes('hadis') || text.includes('tefsir') || text.includes('fıkıh') || text.includes('kelam') || text.includes('tasavvuf') || text.includes('islam') || text.includes('kuran') || text.includes('siyer') || text.includes('akait') || text.includes('ilahiyat') || text.includes('gazali') || text.includes('said nursi') || text.includes('meal')) {
    return 'Din ve İlahiyat';
  }
  if (text.includes('felsefe') || text.includes('mantık') || text.includes('varoluş') || text.includes('etik') || text.includes('düşünce')) {
    return 'Felsefe';
  }
  if (text.includes('tarih') || text.includes('osmanlı') || text.includes('selçuklu') || text.includes('harb') || text.includes('savaş') || text.includes('asır')) {
    return 'Tarih';
  }
  if (text.includes('şiir') || text.includes('divan') || text.includes('mısra') || text.includes('gazel') || text.includes('kaside') || text.includes('nazım')) {
    return 'Şiir';
  }
  if (text.includes('roman') || text.includes('hikaye') || text.includes('öykü') || text.includes('edebiyat') || text.includes('romanı') || text.includes('klasik')) {
    return 'Edebiyat';
  }
  if (text.includes('psikoloji') || text.includes('ruh') || text.includes('zihin') || text.includes('terapi')) {
    return 'Psikoloji';
  }
  if (text.includes('sosyoloji') || text.includes('toplum') || text.includes('medeniyet') || text.includes('kültür')) {
    return 'Kültür, Sanat ve Medeniyet';
  }
  return 'Din ve İlahiyat';
}

