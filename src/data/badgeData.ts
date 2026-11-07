export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  requirementType: 'completedBooks' | 'totalPages';
}

export const AVAILABLE_BADGES: Badge[] = [
  { id: 'b1', name: 'Kitap Kurdu', description: '5 Kitap bitirdin!', icon: '🐛', requirement: 5, requirementType: 'completedBooks' },
  { id: 'b2', name: 'Kütüphane Efendisi', description: '10 Kitap bitirdin!', icon: '📚', requirement: 10, requirementType: 'completedBooks' },
  { id: 'b3', name: 'Sayfa Fatihi', description: '500 Sayfa okudun!', icon: '📜', requirement: 500, requirementType: 'totalPages' },
  { id: 'b4', name: 'Okuma Maratoncusu', description: '2000 Sayfa okudun!', icon: '🏃', requirement: 2000, requirementType: 'totalPages' },
  { id: 'b5', name: 'Bilge Okur', description: '25 Kitap bitirdin!', icon: '🧠', requirement: 25, requirementType: 'completedBooks' },
  { id: 'b6', name: 'Derin Tefekkür', description: '5000 Sayfa okudun!', icon: '✨', requirement: 5000, requirementType: 'totalPages' }
];
