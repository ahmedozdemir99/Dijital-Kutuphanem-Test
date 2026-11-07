import { Surah, Reciter, Ayah } from '../types';

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    subtext: 'Kuveytli Karî (Net & Berrak Kıraat)',
    cdnPrefix: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy'
  },
  {
    id: 'maher',
    name: 'Maher Al-Muaiqly',
    subtext: 'Mescid-i Haram İmamı',
    cdnPrefix: 'https://everyayah.com/data/MaherAlMuaiqly128kbps'
  },
  {
    id: 'abdulbasit',
    name: 'Abdulbasit Abdussamed',
    subtext: 'Mısır Geleneksel Tecvidî Kıraat',
    cdnPrefix: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps'
  },
  {
    id: 'minshawi',
    name: 'Sıddık el-Minşâvî',
    subtext: 'Duygusal & Tertil Üslubu',
    cdnPrefix: 'https://everyayah.com/data/Minshawy_Murattal_128kbps'
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    subtext: 'Eğitici Akademik Tecvid',
    cdnPrefix: 'https://everyayah.com/data/Husary_128kbps'
  },
  {
    id: 'aloosi',
    name: 'Abdurrahman el Ussi',
    subtext: 'Yumuşak ve Akıcı Kıraat',
    cdnPrefix: 'https://server6.mp3quran.net/aloosi'
  },
  {
    id: 'ghamdi',
    name: 'Saad Al-Ghamdi',
    subtext: 'Akıcı ve Derin Tilavet',
    cdnPrefix: 'https://everyayah.com/data/Ghamadi_40kbps'
  },
  {
    id: 'shatri',
    name: 'Abu Bakr Al-Shatri',
    subtext: 'Etkileyici ve Modern Kıraat',
    cdnPrefix: 'https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps'
  }
];

export const ALL_SURAHS: Surah[] = [
  { number: 1, nameArabic: 'الفاتحة', nameTurkish: 'Fâtiha', translationName: 'Açılış', verseCount: 7, revelationType: 'Mekke', startPage: 1, juzNumber: 1 },
  { number: 2, nameArabic: 'البقرة', nameTurkish: 'Bakara', translationName: 'Boğa / İnek', verseCount: 286, revelationType: 'Medine', startPage: 2, juzNumber: 1 },
  { number: 3, nameArabic: 'آل عمران', nameTurkish: 'Âl-i İmrân', translationName: 'İmran Ailesi', verseCount: 200, revelationType: 'Medine', startPage: 50, juzNumber: 3 },
  { number: 4, nameArabic: 'النساء', nameTurkish: 'Nisâ', translationName: 'Kadınlar', verseCount: 176, revelationType: 'Medine', startPage: 77, juzNumber: 4 },
  { number: 5, nameArabic: 'المائدة', nameTurkish: 'Mâide', translationName: 'Sofra', verseCount: 120, revelationType: 'Medine', startPage: 106, juzNumber: 6 },
  { number: 6, nameArabic: 'الأنعام', nameTurkish: 'En\'âm', translationName: 'Evcil Hayvanlar', verseCount: 165, revelationType: 'Mekke', startPage: 128, juzNumber: 7 },
  { number: 7, nameArabic: 'الأعراف', nameTurkish: 'A\'râf', translationName: 'Yüksek Yerler', verseCount: 206, revelationType: 'Mekke', startPage: 151, juzNumber: 8 },
  { number: 8, nameArabic: 'الأنفال', nameTurkish: 'Enfâl', translationName: 'Ganimetler', verseCount: 75, revelationType: 'Medine', startPage: 177, juzNumber: 9 },
  { number: 9, nameArabic: 'التوبة', nameTurkish: 'Tevbe', translationName: 'Tövbe', verseCount: 129, revelationType: 'Medine', startPage: 187, juzNumber: 10 },
  { number: 10, nameArabic: 'يونس', nameTurkish: 'Yûnus', translationName: 'Yunus Peygamber', verseCount: 109, revelationType: 'Mekke', startPage: 208, juzNumber: 11 },
  { number: 11, nameArabic: 'هود', nameTurkish: 'Hûd', translationName: 'Hud Peygamber', verseCount: 123, revelationType: 'Mekke', startPage: 221, juzNumber: 11 },
  { number: 12, nameArabic: 'يوسف', nameTurkish: 'Yûsuf', translationName: 'Yusuf Peygamber', verseCount: 111, revelationType: 'Mekke', startPage: 235, juzNumber: 12 },
  { number: 13, nameArabic: 'الرعد', nameTurkish: 'Ra\'d', translationName: 'Gökgürültüsü', verseCount: 43, revelationType: 'Medine', startPage: 249, juzNumber: 13 },
  { number: 14, nameArabic: 'إبراهيم', nameTurkish: 'İbrâhîm', translationName: 'İbrahim Peygamber', verseCount: 52, revelationType: 'Mekke', startPage: 255, juzNumber: 13 },
  { number: 15, nameArabic: 'الحجر', nameTurkish: 'Hicr', translationName: 'Kaya Bölgesi', verseCount: 99, revelationType: 'Mekke', startPage: 262, juzNumber: 14 },
  { number: 16, nameArabic: 'النحل', nameTurkish: 'Nahl', translationName: 'Bal Arısı', verseCount: 128, revelationType: 'Mekke', startPage: 267, juzNumber: 14 },
  { number: 17, nameArabic: 'الإسراء', nameTurkish: 'İsrâ', translationName: 'Gece Yürüyüşü', verseCount: 111, revelationType: 'Mekke', startPage: 282, juzNumber: 15 },
  { number: 18, nameArabic: 'الكهف', nameTurkish: 'Kehf', translationName: 'Mağara', verseCount: 110, revelationType: 'Mekke', startPage: 293, juzNumber: 15 },
  { number: 19, nameArabic: 'مريم', nameTurkish: 'Meryem', translationName: 'Meryem', verseCount: 98, revelationType: 'Mekke', startPage: 305, juzNumber: 16 },
  { number: 20, nameArabic: 'طه', nameTurkish: 'Tâhâ', translationName: 'Tâhâ', verseCount: 135, revelationType: 'Mekke', startPage: 312, juzNumber: 16 },
  { number: 21, nameArabic: 'الأنبياء', nameTurkish: 'Enbiyâ', translationName: 'Peygamberler', verseCount: 112, revelationType: 'Mekke', startPage: 322, juzNumber: 17 },
  { number: 22, nameArabic: 'الحج', nameTurkish: 'Hacc', translationName: 'Hac İbadeti', verseCount: 78, revelationType: 'Medine', startPage: 332, juzNumber: 17 },
  { number: 23, nameArabic: 'المؤمنون', nameTurkish: 'Mü\'minûn', translationName: 'Müminler', verseCount: 118, revelationType: 'Mekke', startPage: 342, juzNumber: 18 },
  { number: 24, nameArabic: 'النور', nameTurkish: 'Nûr', translationName: 'Işık / Nur', verseCount: 64, revelationType: 'Medine', startPage: 350, juzNumber: 18 },
  { number: 25, nameArabic: 'الفرقان', nameTurkish: 'Furkân', translationName: 'Hak ile Batılı Ayıran', verseCount: 77, revelationType: 'Mekke', startPage: 359, juzNumber: 18 },
  { number: 26, nameArabic: 'الشعراء', nameTurkish: 'Şu\'arâ', translationName: 'Şairler', verseCount: 227, revelationType: 'Mekke', startPage: 367, juzNumber: 19 },
  { number: 27, nameArabic: 'النمل', nameTurkish: 'Neml', translationName: 'Karınca', verseCount: 93, revelationType: 'Mekke', startPage: 377, juzNumber: 19 },
  { number: 28, nameArabic: 'القصص', nameTurkish: 'Kasas', translationName: 'Kıssalar', verseCount: 88, revelationType: 'Mekke', startPage: 385, juzNumber: 20 },
  { number: 29, nameArabic: 'العنكبوت', nameTurkish: 'Ankebût', translationName: 'Örümcek', verseCount: 69, revelationType: 'Mekke', startPage: 396, juzNumber: 20 },
  { number: 30, nameArabic: 'الروم', nameTurkish: 'Rûm', translationName: 'Romalılar', verseCount: 60, revelationType: 'Mekke', startPage: 404, juzNumber: 21 },
  { number: 31, nameArabic: 'لقمان', nameTurkish: 'Lokmân', translationName: 'Lokman Hekim', verseCount: 34, revelationType: 'Mekke', startPage: 411, juzNumber: 21 },
  { number: 32, nameArabic: 'السجدة', nameTurkish: 'Secde', translationName: 'Secde Etme', verseCount: 30, revelationType: 'Mekke', startPage: 415, juzNumber: 21 },
  { number: 33, nameArabic: 'الأحزاب', nameTurkish: 'Ahzâb', translationName: 'Müttefik Gruplar', verseCount: 73, revelationType: 'Medine', startPage: 418, juzNumber: 21 },
  { number: 34, nameArabic: 'سبإ', nameTurkish: 'Sebe\'', translationName: 'Sebe Kavmi', verseCount: 54, revelationType: 'Mekke', startPage: 428, juzNumber: 22 },
  { number: 35, nameArabic: 'فاطر', nameTurkish: 'Fâtır', translationName: 'Yaratan', verseCount: 45, revelationType: 'Mekke', startPage: 434, juzNumber: 22 },
  { number: 36, nameArabic: 'يس', nameTurkish: 'Yâsîn', translationName: 'Yâsîn', verseCount: 83, revelationType: 'Mekke', startPage: 440, juzNumber: 22 },
  { number: 37, nameArabic: 'الصافات', nameTurkish: 'Sâffât', translationName: 'Sıra Sıra Dizilenler', verseCount: 182, revelationType: 'Mekke', startPage: 446, juzNumber: 23 },
  { number: 38, nameArabic: 'ص', nameTurkish: 'Sâd', translationName: 'Sad Harfi', verseCount: 88, revelationType: 'Mekke', startPage: 453, juzNumber: 23 },
  { number: 39, nameArabic: 'الزمر', nameTurkish: 'Zümer', translationName: 'Zümreler / Gruplar', verseCount: 75, revelationType: 'Mekke', startPage: 458, juzNumber: 23 },
  { number: 40, nameArabic: 'غافر', nameTurkish: 'Mü\'min (Gâfir)', translationName: 'Bağışlayan', verseCount: 85, revelationType: 'Mekke', startPage: 467, juzNumber: 24 },
  { number: 41, nameArabic: 'فصلت', nameTurkish: 'Fussilet', translationName: 'Ayrıntılı Açıklanan', verseCount: 54, revelationType: 'Mekke', startPage: 477, juzNumber: 24 },
  { number: 42, nameArabic: 'الشورى', nameTurkish: 'Şûrâ', translationName: 'Danışma / Şura', verseCount: 53, revelationType: 'Mekke', startPage: 483, juzNumber: 25 },
  { number: 43, nameArabic: 'الزخرف', nameTurkish: 'Zuhruf', translationName: 'Süs ve Ziynet', verseCount: 89, revelationType: 'Mekke', startPage: 489, juzNumber: 25 },
  { number: 44, nameArabic: 'الدخان', nameTurkish: 'Duhân', translationName: 'Duman', verseCount: 59, revelationType: 'Mekke', startPage: 496, juzNumber: 25 },
  { number: 45, nameArabic: 'الجاثية', nameTurkish: 'Câsiye', translationName: 'Diz Üstü Çökenler', verseCount: 37, revelationType: 'Mekke', startPage: 499, juzNumber: 25 },
  { number: 46, nameArabic: 'الأحقاف', nameTurkish: 'Ahkâf', translationName: 'Kum Tepeleri', verseCount: 35, revelationType: 'Mekke', startPage: 502, juzNumber: 26 },
  { number: 47, nameArabic: 'محمد', nameTurkish: 'Muhammed', translationName: 'Muhammed Peygamber', verseCount: 38, revelationType: 'Medine', startPage: 507, juzNumber: 26 },
  { number: 48, nameArabic: 'الفتح', nameTurkish: 'Fetih', translationName: 'Zafer / Açılış', verseCount: 29, revelationType: 'Medine', startPage: 511, juzNumber: 26 },
  { number: 49, nameArabic: 'الحجرات', nameTurkish: 'Hucurât', translationName: 'Odalar', verseCount: 18, revelationType: 'Medine', startPage: 515, juzNumber: 26 },
  { number: 50, nameArabic: 'ق', nameTurkish: 'Kâf', translationName: 'Kaf Harfi', verseCount: 45, revelationType: 'Mekke', startPage: 518, juzNumber: 26 },
  { number: 51, nameArabic: 'الذاريات', nameTurkish: 'Zâriyât', translationName: 'Esip Savuran Rüzgarlar', verseCount: 60, revelationType: 'Mekke', startPage: 520, juzNumber: 26 },
  { number: 52, nameArabic: 'الطور', nameTurkish: 'Tûr', translationName: 'Tur Dağı', verseCount: 49, revelationType: 'Mekke', startPage: 523, juzNumber: 27 },
  { number: 53, nameArabic: 'النجم', nameTurkish: 'Necm', translationName: 'Yıldız', verseCount: 62, revelationType: 'Mekke', startPage: 526, juzNumber: 27 },
  { number: 54, nameArabic: 'القمر', nameTurkish: 'Kamer', translationName: 'Ay', verseCount: 55, revelationType: 'Mekke', startPage: 528, juzNumber: 27 },
  { number: 55, nameArabic: 'الرحمن', nameTurkish: 'Rahmân', translationName: 'Sonsuz Merhametli', verseCount: 78, revelationType: 'Medine', startPage: 531, juzNumber: 27 },
  { number: 56, nameArabic: 'الواقعة', nameTurkish: 'Vâkıa', translationName: 'Kıyamet Olayı', verseCount: 96, revelationType: 'Mekke', startPage: 534, juzNumber: 27 },
  { number: 57, nameArabic: 'الحديد', nameTurkish: 'Hadîd', translationName: 'Demir', verseCount: 29, revelationType: 'Medine', startPage: 537, juzNumber: 27 },
  { number: 58, nameArabic: 'المجادلة', nameTurkish: 'Mücâdele', translationName: 'Tartışan Kadın', verseCount: 22, revelationType: 'Medine', startPage: 542, juzNumber: 28 },
  { number: 59, nameArabic: 'الحشر', nameTurkish: 'Haşr', translationName: 'Sürgün / Toplanma', verseCount: 24, revelationType: 'Medine', startPage: 545, juzNumber: 28 },
  { number: 60, nameArabic: 'الممتحنة', nameTurkish: 'Mümtehine', translationName: 'Sınanan Kadın', verseCount: 13, revelationType: 'Medine', startPage: 549, juzNumber: 28 },
  { number: 61, nameArabic: 'الصف', nameTurkish: 'Saff', translationName: 'Saf Tutmak', verseCount: 14, revelationType: 'Medine', startPage: 551, juzNumber: 28 },
  { number: 62, nameArabic: 'الجمعة', nameTurkish: 'Cuma', translationName: 'Cuma Günü', verseCount: 11, revelationType: 'Medine', startPage: 553, juzNumber: 28 },
  { number: 63, nameArabic: 'المنافقون', nameTurkish: 'Münâfikûn', translationName: 'İkiyüzlüler', verseCount: 11, revelationType: 'Medine', startPage: 554, juzNumber: 28 },
  { number: 64, nameArabic: 'التغابن', nameTurkish: 'Tegâbün', translationName: 'Aldanma ve Zarar', verseCount: 18, revelationType: 'Medine', startPage: 556, juzNumber: 28 },
  { number: 65, nameArabic: 'الطلاق', nameTurkish: 'Talâk', translationName: 'Boşanma', verseCount: 12, revelationType: 'Medine', startPage: 558, juzNumber: 28 },
  { number: 66, nameArabic: 'التحريم', nameTurkish: 'Tahrîm', translationName: 'Yasaklama', verseCount: 12, revelationType: 'Medine', startPage: 560, juzNumber: 28 },
  { number: 67, nameArabic: 'الملك', nameTurkish: 'Mülk', translationName: 'Hükümranlık', verseCount: 30, revelationType: 'Mekke', startPage: 562, juzNumber: 29 },
  { number: 68, nameArabic: 'القلم', nameTurkish: 'Kalem', translationName: 'Kalem', verseCount: 52, revelationType: 'Mekke', startPage: 564, juzNumber: 29 },
  { number: 69, nameArabic: 'الحاقة', nameTurkish: 'Hâkka', translationName: 'Gerçekleşecek Olan', verseCount: 52, revelationType: 'Mekke', startPage: 566, juzNumber: 29 },
  { number: 70, nameArabic: 'المعارج', nameTurkish: 'Meâric', translationName: 'Yükseliş Yolları', verseCount: 44, revelationType: 'Mekke', startPage: 568, juzNumber: 29 },
  { number: 71, nameArabic: 'نوح', nameTurkish: 'Nûh', translationName: 'Nuh Peygamber', verseCount: 28, revelationType: 'Mekke', startPage: 570, juzNumber: 29 },
  { number: 72, nameArabic: 'الجن', nameTurkish: 'Cin', translationName: 'Cinler', verseCount: 28, revelationType: 'Mekke', startPage: 572, juzNumber: 29 },
  { number: 73, nameArabic: 'المزمل', nameTurkish: 'Müzzemmil', translationName: 'Örtüsüne Bürünen', verseCount: 20, revelationType: 'Mekke', startPage: 574, juzNumber: 29 },
  { number: 74, nameArabic: 'المدثر', nameTurkish: 'Müddessir', translationName: 'Elbisesine Sarınan', verseCount: 56, revelationType: 'Mekke', startPage: 575, juzNumber: 29 },
  { number: 75, nameArabic: 'القيامة', nameTurkish: 'Kıyâme', translationName: 'Kıyamet Günü', verseCount: 40, revelationType: 'Mekke', startPage: 577, juzNumber: 29 },
  { number: 76, nameArabic: 'الإنسان', nameTurkish: 'İnsân', translationName: 'İnsan', verseCount: 31, revelationType: 'Medine', startPage: 578, juzNumber: 29 },
  { number: 77, nameArabic: 'المرسلات', nameTurkish: 'Mürselât', translationName: 'Gönderilen Rüzgarlar', verseCount: 50, revelationType: 'Mekke', startPage: 580, juzNumber: 29 },
  { number: 78, nameArabic: 'النبإ', nameTurkish: 'Nebe\'', translationName: 'Büyük Haber', verseCount: 40, revelationType: 'Mekke', startPage: 582, juzNumber: 30 },
  { number: 79, nameArabic: 'النازعات', nameTurkish: 'Nâziât', translationName: 'Söküp Çıkaranlar', verseCount: 46, revelationType: 'Mekke', startPage: 583, juzNumber: 30 },
  { number: 80, nameArabic: 'عبس', nameTurkish: 'Abese', translationName: 'Yüzünü Ekşitti', verseCount: 42, revelationType: 'Mekke', startPage: 585, juzNumber: 30 },
  { number: 81, nameArabic: 'التكوير', nameTurkish: 'Tekvîr', translationName: 'Dürülme', verseCount: 29, revelationType: 'Mekke', startPage: 586, juzNumber: 30 },
  { number: 82, nameArabic: 'الإنفطار', nameTurkish: 'İnfıtâr', translationName: 'Yarılma', verseCount: 19, revelationType: 'Mekke', startPage: 587, juzNumber: 30 },
  { number: 83, nameArabic: 'المطففين', nameTurkish: 'Mutaffifîn', translationName: 'Ölçüde Hile Yapanlar', verseCount: 36, revelationType: 'Mekke', startPage: 587, juzNumber: 30 },
  { number: 84, nameArabic: 'الإنشقاق', nameTurkish: 'İnşikâk', translationName: 'Parçalanma', verseCount: 25, revelationType: 'Mekke', startPage: 589, juzNumber: 30 },
  { number: 85, nameArabic: 'البروج', nameTurkish: 'Bürûc', translationName: 'Burçlar', verseCount: 22, revelationType: 'Mekke', startPage: 590, juzNumber: 30 },
  { number: 86, nameArabic: 'الطارق', nameTurkish: 'Târık', translationName: 'Gece Gezen Yıldız', verseCount: 17, revelationType: 'Mekke', startPage: 591, juzNumber: 30 },
  { number: 87, nameArabic: 'الأعلى', nameTurkish: 'A\'lâ', translationName: 'En Yüce', verseCount: 19, revelationType: 'Mekke', startPage: 591, juzNumber: 30 },
  { number: 88, nameArabic: 'الغاشية', nameTurkish: 'Gâşiye', translationName: 'Bürüyen Kıyamet', verseCount: 26, revelationType: 'Mekke', startPage: 592, juzNumber: 30 },
  { number: 89, nameArabic: 'الفجر', nameTurkish: 'Fecr', translationName: 'Tan Vakti', verseCount: 30, revelationType: 'Mekke', startPage: 593, juzNumber: 30 },
  { number: 90, nameArabic: 'البلد', nameTurkish: 'Beled', translationName: 'Şehir / Belde', verseCount: 20, revelationType: 'Mekke', startPage: 594, juzNumber: 30 },
  { number: 91, nameArabic: 'الشمس', nameTurkish: 'Şems', translationName: 'Güneş', verseCount: 15, revelationType: 'Mekke', startPage: 595, juzNumber: 30 },
  { number: 92, nameArabic: 'الليل', nameTurkish: 'Leyl', translationName: 'Gece', verseCount: 21, revelationType: 'Mekke', startPage: 595, juzNumber: 30 },
  { number: 93, nameArabic: 'الضحى', nameTurkish: 'Duhâ', translationName: 'Kuşluk Vakti', verseCount: 11, revelationType: 'Mekke', startPage: 596, juzNumber: 30 },
  { number: 94, nameArabic: 'الشرح', nameTurkish: 'İnşirâh', translationName: 'Gönül Ferahlığı', verseCount: 8, revelationType: 'Mekke', startPage: 596, juzNumber: 30 },
  { number: 95, nameArabic: 'التين', nameTurkish: 'Tîn', translationName: 'Incir', verseCount: 8, revelationType: 'Mekke', startPage: 597, juzNumber: 30 },
  { number: 96, nameArabic: 'العلق', nameTurkish: 'Alak', translationName: 'Aşılanmış Yumurta', verseCount: 19, revelationType: 'Mekke', startPage: 597, juzNumber: 30 },
  { number: 97, nameArabic: 'القدر', nameTurkish: 'Kadir', translationName: 'Kadir Gecesi', verseCount: 5, revelationType: 'Mekke', startPage: 598, juzNumber: 30 },
  { number: 98, nameArabic: 'البينة', nameTurkish: 'Beyyine', translationName: 'Açık Delil', verseCount: 8, revelationType: 'Medine', startPage: 598, juzNumber: 30 },
  { number: 99, nameArabic: 'Zilzâl', nameTurkish: 'Zilzâl', translationName: 'Deprem / Sarsıntı', verseCount: 8, revelationType: 'Medine', startPage: 599, juzNumber: 30 },
  { number: 100, nameArabic: 'العاديات', nameTurkish: 'Âdiyât', translationName: 'Koşan Atlar', verseCount: 11, revelationType: 'Mekke', startPage: 599, juzNumber: 30 },
  { number: 101, nameArabic: 'القارعة', nameTurkish: 'Kâri\'a', translationName: 'Çarpan Felaket', verseCount: 11, revelationType: 'Mekke', startPage: 600, juzNumber: 30 },
  { number: 102, nameArabic: 'التكاثر', nameTurkish: 'Tekâsür', translationName: 'Çokluk Yarışı', verseCount: 8, revelationType: 'Mekke', startPage: 600, juzNumber: 30 },
  { number: 103, nameArabic: 'العصر', nameTurkish: 'Asr', translationName: 'Zaman / İkindi', verseCount: 3, revelationType: 'Mekke', startPage: 601, juzNumber: 30 },
  { number: 104, nameArabic: 'الهمزة', nameTurkish: 'Hümeze', translationName: 'Gıybet Eden', verseCount: 9, revelationType: 'Mekke', startPage: 601, juzNumber: 30 },
  { number: 105, nameArabic: 'الفيل', nameTurkish: 'Fîl', translationName: 'Fil', verseCount: 5, revelationType: 'Mekke', startPage: 601, juzNumber: 30 },
  { number: 106, nameArabic: 'قريش', nameTurkish: 'Kureyş', translationName: 'Kureyş Kabilesi', verseCount: 4, revelationType: 'Mekke', startPage: 602, juzNumber: 30 },
  { number: 107, nameArabic: 'المواعون', nameTurkish: 'Mâûn', translationName: 'Yardım / İyilik', verseCount: 7, revelationType: 'Mekke', startPage: 602, juzNumber: 30 },
  { number: 108, nameArabic: 'الكوثر', nameTurkish: 'Kevser', translationName: 'Bitmez Tükenmez Nimet', verseCount: 3, revelationType: 'Mekke', startPage: 602, juzNumber: 30 },
  { number: 109, nameArabic: 'الكافرون', nameTurkish: 'Kâfirûn', translationName: 'İnkârcılar', verseCount: 6, revelationType: 'Mekke', startPage: 603, juzNumber: 30 },
  { number: 110, nameArabic: 'النصر', nameTurkish: 'Nasr', translationName: 'Yardım ve Zafer', verseCount: 3, revelationType: 'Medine', startPage: 603, juzNumber: 30 },
  { number: 111, nameArabic: 'المسد', nameTurkish: 'Tebbet (Mesed)', translationName: 'Alev / Bükülmüş Lif', verseCount: 5, revelationType: 'Mekke', startPage: 603, juzNumber: 30 },
  { number: 112, nameArabic: 'الإخلاص', nameTurkish: 'İhlâs', translationName: 'Samimiyet / Samimi İnanç', verseCount: 4, revelationType: 'Mekke', startPage: 604, juzNumber: 30 },
  { number: 113, nameArabic: 'الفلق', nameTurkish: 'Felak', translationName: 'Sabah Vakti / Şafak', verseCount: 5, revelationType: 'Mekke', startPage: 604, juzNumber: 30 },
  { number: 114, nameArabic: 'الناس', nameTurkish: 'Nâs', translationName: 'İnsanlar', verseCount: 6, revelationType: 'Mekke', startPage: 604, juzNumber: 30 }
];

export interface JuzInfo {
  juzNumber: number;
  startSurahName: string;
  startSurahNumber: number;
  startAyah: number;
  startPage: number;
  endPage: number;
}

export const SURAH_GLOBAL_START_OFFSET: { [surahNum: number]: number } = (() => {
  const map: { [surahNum: number]: number } = {};
  let currentOffset = 1;
  for (const s of ALL_SURAHS) {
    map[s.number] = currentOffset;
    currentOffset += s.verseCount;
  }
  return map;
})();

export const getGlobalAyahNumber = (surahNum: number, ayahNum: number): number => {
  const start = SURAH_GLOBAL_START_OFFSET[surahNum] || 1;
  return start + (ayahNum - 1);
};

export const JUZ_LIST: JuzInfo[] = Array.from({ length: 30 }, (_, i) => {
  const juzNum = i + 1;
  const startPage = (juzNum - 1) * 20 + 2;
  const endPage = Math.min(604, juzNum * 20 + 1);
  const surah = ALL_SURAHS.find(s => s.juzNumber <= juzNum) || ALL_SURAHS[0];
  return {
    juzNumber: juzNum,
    startSurahName: surah.nameTurkish,
    startSurahNumber: surah.number,
    startAyah: 1,
    startPage: i === 0 ? 1 : startPage,
    endPage: endPage
  };
});

// Offline dataset for instant initial render

// Match translations by the API's global verse number, not by array position.
async function fetchVerses(path: string, signal?: AbortSignal): Promise<Ayah[]> {
  const response = await fetch(`https://api.alquran.cloud/v1/${path}/editions/quran-uthmani,tr.diyanet`, { signal });
  if (!response.ok) throw new Error('Ayet servisine erişilemedi.');
  const result = await response.json();
  const arabic = result.data?.find((item: { edition?: { identifier?: string } }) => item.edition?.identifier === 'quran-uthmani');
  const translation = result.data?.find((item: { edition?: { identifier?: string } }) => item.edition?.identifier === 'tr.diyanet');
  if (!Array.isArray(arabic?.ayahs) || arabic.ayahs.length === 0) throw new Error('Ayet servisi geçerli bir metin göndermedi.');
  const translatedVerses = new Map<number, string>((translation?.ayahs ?? []).map((verse: { number: number; text: string }) => [verse.number, verse.text]));

  return arabic.ayahs.map((verse: {
    number: number; numberInSurah: number; text: string; page: number; juz: number; hizbQuarter?: number; surah?: { number: number };
  }): Ayah => {
    const surahNumber = verse.surah?.number || arabic.number;
    const metadata = ALL_SURAHS.find(surah => surah.number === surahNumber);
    if (!metadata || typeof verse.text !== 'string' || !verse.text.trim() || !Number.isInteger(verse.numberInSurah)) {
      throw new Error('Ayet servisi eksik metin veya sûre bilgisi gönderdi.');
    }
    return {
      number: verse.numberInSurah,
      globalNumber: verse.number,
      textArabic: verse.text,
      translationTurkish: translatedVerses.get(verse.number) || '',
      pageNumber: verse.page,
      juzNumber: verse.juz,
      hizbNumber: verse.hizbQuarter ? Math.ceil(verse.hizbQuarter / 4) : undefined,
      surahNumber,
      surahName: metadata.nameTurkish,
    };
  });
}

export function fetchSurahVerses(surahNumber: number, signal?: AbortSignal): Promise<Ayah[]> {
  return fetchVerses(`surah/${surahNumber}`, signal);
}

export function fetchPageVerses(pageNumber: number, signal?: AbortSignal): Promise<Ayah[]> {
  return fetchVerses(`page/${pageNumber}`, signal);
}
