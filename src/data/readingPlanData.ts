import type { CatalogBook, CurriculumMonthData, CurriculumYear, UserBook } from '../types';
import type { MAIN_CATEGORIES } from './catalogData';
import readingPlan from './readingPlan.json';

const PLAN_CATEGORIES: Record<string, typeof MAIN_CATEGORIES[number]> = {
  'Tefsir ve Kur’an İlimleri': 'Din ve İlahiyat',
  'Hadis ve Sünnet': 'Din ve İlahiyat',
  'Fıkıh ve İslam Hukuku': 'Din ve İlahiyat',
  'Siyer ve İslam Tarihi': 'Din ve İlahiyat',
  'Tasavvuf ve Ahlak': 'Din ve İlahiyat',
  'Dünya Edebiyatı': 'Edebiyat',
  'Türk Edebiyatı': 'Edebiyat',
  'Felsefe ve Mantık': 'Felsefe',
  'Şiir ve Düşünce': 'Şiir',
  'Tarih ve Medeniyet': 'Tarih',
  'Psikoloji ve Eğitim': 'Psikoloji',
  'Bilim ve Matematik': 'Matematik ve Mantık',
};

const planMonths = readingPlan.map(rows => rows.map(([title, author, subCategory]): CatalogBook => ({
  id: '',
  title,
  author,
  category: PLAN_CATEGORIES[subCategory] || 'Edebiyat',
  subCategory,
  description: subCategory,
  coverUrl: '',
})));

const planBooks = planMonths.flat();
planBooks.forEach((book, index) => { book.id = `okuma-${String(index + 1).padStart(4, '0')}`; });

export function generateFull1024Catalog(): CatalogBook[] {
  return planBooks;
}

export const FULL_FOUR_YEAR_CURRICULUM: CurriculumYear[] = Array.from({ length: 40 }, (_, index) => {
  const yearNumber = index + 1;
  const yearMonths = planMonths.slice(index * 12, index * 12 + 12);
  const categories = [...new Set(yearMonths.flat().map(book => book.subCategory))];
  return {
    yearNumber,
    title: `${yearNumber}. Yıl: ${categories[0] || 'Tekrar ve kişisel seçim'}`,
    theme: categories.join(' · '),
    description: categories.length ? categories.join(', ') : 'Önceki eserleri tekrar oku veya kütüphanenden bir eser seç.',
    months: yearMonths.map((books, monthIndex): CurriculumMonthData => {
      const monthNumber = monthIndex + 1;
      const authorName = [...new Set(books.map(book => book.author))].join(', ');
      return {
        monthNumber,
        monthTitle: `${monthNumber}. Ay: ${authorName || 'Tekrar ve kişisel seçim'}`,
        authorName,
        authorBio: books.length ? books[0].subCategory : 'Bu ay için yeni eser atanmadı.',
        weeklyBooks: books.map((book, weekIndex) => ({
          ...book,
          weekNumber: weekIndex + 1,
          totalPages: book.totalPages || 0,
          plannedDate: `${weekIndex + 1}. Hafta`,
        })),
      };
    }),
  };
});

export function bookIdentity(book: { title: string; author: string }): string {
  const normalize = (text: string) => text.toLocaleLowerCase('tr').normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return `${normalize(book.title)}::${normalize(book.author)}`;
}

const planBookKeys = new Set(planBooks.map(bookIdentity));
export function getCurriculumProgress(userBooks: UserBook[]) {
  const completed = new Set(userBooks.filter(book => book.status === 'completed').map(bookIdentity));
  const completedBooks = [...completed].filter(key => planBookKeys.has(key)).length;
  const totalBooks = planBookKeys.size;
  return { completedBooks, totalBooks, percent: totalBooks ? completedBooks / totalBooks * 100 : 0 };
}
