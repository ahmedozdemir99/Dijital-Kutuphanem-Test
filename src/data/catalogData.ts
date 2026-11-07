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

const SEED_CATALOG: Omit<CatalogBook, 'id'>[] = [
  {
    title: "İhyâu 'Ulûmi'd-Dîn",
    author: "İmâm-ı Gazâlî",
    category: "Din ve İlahiyat",
    subCategory: "Tasavvuf ve Ahlak",
    description: "İslam düşünce tarihinin en tesirli ve kapsamlı ahlak, tasavvuf ve fıkıh klasiği. 4 büyük ciltten oluşur.",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
    isMultiVolume: true,
    seriesTitle: "İhyâu 'Ulûmi'd-Dîn Külliyatı",
    totalVolumes: 4,
    turkishAvailable: true,
    publisher: "Klasik Yayınları",
    totalPages: 480
  },
  {
    title: "Siyer-i Nebî (Peygamberimizin Hayatı)",
    author: "İbn Hişam",
    category: "Din ve İlahiyat",
    subCategory: "Siyer",
    description: "İslam tarihinin en kadim ve güvenilir Hz. Muhammed (s.a.v.) biyografisi.",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
    isMultiVolume: true,
    seriesTitle: "Siyer Külliyatı",
    totalVolumes: 2,
    turkishAvailable: true,
    publisher: "Kahraman Yayınları",
    totalPages: 620
  },
  {
    title: "Mesnevî-i Şerîf",
    author: "Mevlânâ Celâleddîn-i Rûmî",
    category: "Din ve İlahiyat",
    subCategory: "Tasavvuf Edebiyatı",
    description: "İlahi aşk, hikmet ve insan ruhunun derinliklerini işleyen 6 ciltlik şaheser.",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
    isMultiVolume: true,
    seriesTitle: "Mesnevi Külliyatı",
    totalVolumes: 6,
    turkishAvailable: true,
    publisher: "Kültür Bakanlığı Yayınları",
    totalPages: 520
  },
  {
    title: "Bu Ülke",
    author: "Cemil Meriç",
    category: "Kültür, Sanat ve Medeniyet",
    subCategory: "Deneme & Düşünce",
    description: "Bir mütefekkirin iç dünyası ve Doğu-Batı kültür tahlilleri.",
    coverUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop",
    isMultiVolume: false,
    turkishAvailable: true,
    publisher: "İletişim Yayınları",
    totalPages: 340
  }
];

// Generate 1024 Books Catalog
export function generateFull1024Catalog(): CatalogBook[] {
  const books: CatalogBook[] = [];
  
  SEED_CATALOG.forEach((item, index) => {
    books.push({
      ...item,
      id: `cat-seed-${index + 1}`
    });
  });

  const authorsList = [
    { name: "İmâm-ı Gazâlî", cat: "Din ve İlahiyat", sub: "Tasavvuf & Ahlak" },
    { name: "İbn Sînâ", cat: "Felsefe", sub: "Meşşaî Felsefe" },
    { name: "İbn Haldun", cat: "Sosyoloji", sub: "Tarih & Umran" },
    { name: "Ahmet Hamdi Tanpınar", cat: "Edebiyat", sub: "Klasik Roman" },
    { name: "Cemil Meriç", cat: "Kültür, Sanat ve Medeniyet", sub: "Fikir & Tahlil" },
    { name: "Necip Fazıl Kısakürek", cat: "Şiir", sub: "Mistik Şiir" },
    { name: "Sezai Karakoç", cat: "Şiir", sub: "Diriliş Edebiyatı" },
    { name: "Halil İnalcık", cat: "Tarih", sub: "Osmanlı Tarihi" },
    { name: "Nizamülmülk", cat: "Siyaset", sub: "Siyasetname" },
    { name: "Fârâbî", cat: "Felsefe", sub: "Siyaset Felsefesi" },
    { name: "Fuad Köprülü", cat: "Tarih", sub: "Edebiyat Tarihi" },
    { name: "İbn Rüşd", cat: "Felsefe", sub: "Aristo Şerhleri" },
    { name: "Platon", cat: "Felsefe", sub: "Klasik Yunan" },
    { name: "Aristoteles", cat: "Felsefe", sub: "Mantık & Etik" },
    { name: "Dostoyevski", cat: "Edebiyat", sub: "Dünya Klasikleri" },
    { name: "Tolstoy", cat: "Edebiyat", sub: "Dünya Klasikleri" }
  ];

  const bookThemes = [
    "Hakikat Arayışı", "Tefekkür Dersleri", "Medeniyet Krizleri", "Zihin Haritası",
    "Hikmet Yaprakları", "Ahlak Esasları", "Mantık Kuralları", "Devlet ve Siyaset",
    "Ruhun Derinlikleri", "Doğu-Batı Sentezi", "İnsan ve Sanat", "Şehir ve Mimari"
  ];

  let currentId = SEED_CATALOG.length + 1;
  while (books.length < 1024) {
    const authorObj = authorsList[currentId % authorsList.length];
    const theme = bookThemes[currentId % bookThemes.length];
    const catName = authorObj.cat;
    
    books.push({
      id: `cat-gen-${currentId}`,
      title: `${authorObj.name} Külliyatından ${theme} (${Math.floor(currentId / authorsList.length) + 1}. Cilt)`,
      author: authorObj.name,
      category: catName,
      subCategory: authorObj.sub,
      description: `${authorObj.name} tarafından kaleme alınan ${theme} odaklı başyapıt eser.`,
      coverUrl: DEFAULT_BOOK_COVERS[catName] || DEFAULT_BOOK_COVERS["Edebiyat"],
      isMultiVolume: true,
      seriesTitle: `${authorObj.name} Bütün Eserleri`,
      totalVolumes: 6,
      turkishAvailable: true,
      publisher: "Klasik İlimler Yayınları",
      totalPages: 250 + (currentId % 300)
    });
    currentId++;
  }

  return books;
}

// 40-YEAR CURRICULUM GENERATOR (40 Years x 12 Months x 4 Weeks = 1920 / 1024 Books)
export function generateFull40YearCurriculum(): CurriculumYear[] {
  const yearTitles: { title: string; theme: string; desc: string; mainAuthor: string; bio: string }[] = [
    { title: "1. Yıl: Temel İslami İlimler ve Siyer Klasikleri", theme: "Temel İlimler ve İnşa", desc: "Akaid, siyer-i nebî, ahlak ve fıkıh usulü temel metinleri.", mainAuthor: "İmâm-ı Gazâlî & İbn Hişam", bio: "İslam ahlakı ve siyer geleneğinin temel sütunları." },
    { title: "2. Yıl: İslam Felsefesi ve Meşşaî Gelenek", theme: "Akıl, Hikmet ve İlahiyat", desc: "İbn Sînâ, Fârâbî ve İbn Rüşd ile Doğu metafizik metinleri.", mainAuthor: "İbn Sînâ & Fârâbî", bio: "Doğu felsefe dünyasının dahi üstatları." },
    { title: "3. Yıl: Medeniyet, Doğu-Batı Tahlili ve Sosyoloji", theme: "Kültür, Toplum ve İdeoloji", desc: "Cemil Meriç, Ziya Gökalp, Erol Güngör ve Sezai Karakoç.", mainAuthor: "Cemil Meriç & Sezai Karakoç", bio: "Doğu-Batı tahlillerinin ve Diriliş düşüncesinin zirveleri." },
    { title: "4. Yıl: Tasavvuf, Şiir ve İrfan Mısraları", theme: "Kalp ve Estetik İdraki", desc: "Yunus Emre, Mevlânâ, Fuzûlî, Necip Fazıl ve Yahya Kemal.", mainAuthor: "Yunus Emre & Necip Fazıl", bio: "Mistik ve tasavvufi Türk şiirinin dev isimleri." },
    { title: "5. Yıl: Osmanlı Tarihi ve Şehir Medeniyeti", theme: "Tarih Şuuru ve Mekan Estetiği", desc: "Halil İnalcık, Ekrem Hakkı Ayverdi ve Turgut Cansever.", mainAuthor: "Halil İnalcık & Turgut Cansever", bio: "Şeyhü'l-Müerrihîn ve bilge mimar." },
    { title: "6. Yıl: Antik Yunan ve İlkçağ Felsefesi Klasikleri", theme: "Batı Düşüncesinin Kökleri", desc: "Sokrates, Platon ve Aristoteles okumaları.", mainAuthor: "Platon & Aristoteles", bio: "Klasik felsefe düşüncesinin kurucuları." },
    { title: "7. Yıl: Kelam, Akaid ve Felsefi İlahiyat", theme: "İnanç Esasları ve Kelami Tahlil", desc: "İmâm Mâtürîdî, Eş'arî, Nesefî ve Taftâzânî.", mainAuthor: "İmâm Mâtürîdî & Taftâzânî", bio: "Ehl-i Sünnet akaid ve kelam önderleri." },
    { title: "8. Yıl: Ortaçağ ve Rönesans Düşüncesi", theme: "Geçiş Çağları ve Zihniyet", desc: "Augustinus, Thomas Aquinas, Erasmus ve Machiavelli.", mainAuthor: "Erasmus & Machiavelli", bio: "Rönesans ve siyaset felsefesinin mimarları." },
    { title: "9. Yıl: Aydınlanma Düşüncesi ve Rasyonalizm", theme: "Akıl Çağı ve Eleştirel Felsefe", desc: "Descartes, Spinoza, Leibniz, Kant ve Hegel.", mainAuthor: "Descartes & Immanuel Kant", bio: "Modern felsefe ve aklın kurucuları." },
    { title: "10. Yıl: Doğu Klasikleri (Fars, Hint ve Çin)", theme: "Doğu Hikmeti ve Asya İrfanı", desc: "Sâdî, Hâfız, Konfüçyüs ve Laotzu metinleri.", mainAuthor: "Sâdî-i Şîrâzî & Hâfız", bio: "Fars ve Doğu hikmetinin şairleri." },
    { title: "11. Yıl: 19. Yüzyıl Dünya Romanı Şaheserleri", theme: "Karakter, İnsan ve Roman", desc: "Dostoyevski, Tolstoy, Balzac ve Victor Hugo.", mainAuthor: "Dostoyevski & Tolstoy", bio: "Dünya edebiyatının psikolojik roman üstatları." },
    { title: "12. Yıl: 20. Yüzyıl Modernizm ve Varoluşçuluk", theme: "Modern İnsan ve Bunalım", desc: "Kafka, Camus, Sartre, Joyce ve Virginia Woolf.", mainAuthor: "Franz Kafka & Albert Camus", bio: "Modernizmin ve varoluşçu edebiyatın devleri." },
    { title: "13. Yıl: İslam İktisadı ve Sosyal Adalet", theme: "Toplum, Mülk ve Adalet", desc: "İbn Haldun, Sezai Karakoç ve Ali Şeriati.", mainAuthor: "İbn Haldun & Ali Şeriati", bio: "Sosyoloji ve sosyal düşünce öncüleri." },
    { title: "14. Yıl: Mantık Tarihi ve Sembolik Mantık", theme: "Aklın Formel Kuralları", desc: "Aristo Organon, İbn Sina ve Frege okumaları.", mainAuthor: "Aristoteles & İbn Sînâ", bio: "Klasik mantık abideleri." },
    { title: "15. Yıl: Bilim Felsefesi ve Bilim Tarihi", theme: "Deney, Kuram ve Paradigma", desc: "Fuat Sezgin, Karl Popper ve Thomas Kuhn.", mainAuthor: "Fuat Sezgin & Thomas Kuhn", bio: "İslam bilim tarihi ve paradigma kuramcıları." },
    { title: "16. Yıl: Psikoloji ve Psikanaliz Kuramları", theme: "İnsan Ruhunun Derinlikleri", desc: "Freud, Jung, Erich Fromm ve Viktor Frankl.", mainAuthor: "Erich Fromm & Viktor Frankl", bio: "Anlam arayışı ve insancıl psikoloji." },
    { title: "17. Yıl: Sosyolojik Teoriler ve Çağdaş Toplum", theme: "Toplumsal Yapı ve Değişim", desc: "Max Weber, Durkheim, Bourdieu ve Zygmunt Bauman.", mainAuthor: "Max Weber & Zygmunt Bauman", bio: "Modernite ve akışkan toplum kuramcıları." },
    { title: "18. Yıl: Eğitim Felsefesi ve Pedagoji", theme: "İnsan Yetiştirme Sanatı", desc: "Rousseau, John Dewey, Nurettin Topçu ve Paulo Freire.", mainAuthor: "Nurettin Topçu & J.J. Rousseau", bio: "Ahlak nizamı ve maarif davası önderleri." },
    { title: "19. Yıl: Siyaset Felsefesi ve Devlet Kuramları", theme: "Adalet, İktidar ve Hürriyet", desc: "Platon, Farabi, Hobbes, Locke ve Rawls.", mainAuthor: "Fârâbî & John Locke", bio: "Siyaset ve hürriyet filozofu." },
    { title: "20. Yıl: Karşılaştırmalı Dinler Tarihi", theme: "İnanç Sistemleri ve Kutsal", desc: "Mircea Eliade, Annemarie Schimmel ve Izutsu.", mainAuthor: "Mircea Eliade & Toshihiko Izutsu", bio: "Kutsalın tarihi ve Kur'an semantiği ilim adamları." },
    { title: "21. Yıl: İslam Hukuku (Fıkıh) Metodolojisi", theme: "Usûl ve İçtihat Felsefesi", desc: "İmâm Şâfiî, Şâtıbî ve İbn Âbidîn okumaları.", mainAuthor: "İmâm Şâfiî & Şâtıbî", bio: "Fıkıh usulü ve makâsıdü'ş-şerîa kurucuları." },
    { title: "22. Yıl: Hadis Usulü ve Eleştirel Metodoloji", theme: "Sünnet ve Rivayet İlimleri", desc: "Kâtib Çelebi, İbn Hacer ve Sehâvî.", mainAuthor: "İbn Hacer el-Askalânî", bio: "Hadis ilimlerinin mütehassıs otoritesi." },
    { title: "23. Yıl: Tefsir Tarihi ve Hermenötik", theme: "Metin İdraki ve Anlam", desc: "Taberî, Râzî, Elmalılı ve Paul Ricoeur.", mainAuthor: "Fahruddîn er-Râzî & Elmalılı", bio: "Büyük tefsir ve dirayet abideleri." },
    { title: "24. Yıl: Estetik, Sanat Felsefesi ve Hüsn-i Hat", theme: "Güzellik ve Form Tefekkürü", desc: "Turgut Cansever, Celal Esad Arseven ve Burckhardt.", mainAuthor: "Titus Burckhardt & Cansever", bio: "Geleneksel sanat ve estetik üstatları." },
    { title: "25. Yıl: Musikî Tarihi ve Makam İdraki", theme: "Ses, Ahenk ve Mistik Sesler", desc: "Itrî, Dede Efendi, Tanburi Cemil Bey ve Rauf Yekta.", mainAuthor: "Itrî & Tanburi Cemil Bey", bio: "Klasik Türk musikisinin abideleri." },
    { title: "26. Yıl: Türk Düşünce Tarihi ve Tanzimat", theme: "Modernleşme Sancısı", desc: "Namık Kemal, Şinasi, Ali Suavi ve Ahmed Cevdet Paşa.", mainAuthor: "Ahmed Cevdet Paşa", bio: "Mecelle ve Osmanlı tarihinin dahi yazarı." },
    { title: "27. Yıl: Meşrutiyet Dönemi Fikir Akımları", theme: "İslamcılık, Türkçülük ve Garpçılık", desc: "Mehmet Akif, Ziya Gökalp, Prens Sabahaddin.", mainAuthor: "Mehmet Âkif Ersoy & Gökalp", bio: "Safahat şairi ve sosyolog." },
    { title: "28. Yıl: Cumhuriyet Dönemi Hikaye ve Tiyatro", theme: "Sahnede ve Kurguda İnsan", desc: "Sait Faik, Tarık Buğra, Haldun Taner ve Mustafa Kutlu.", mainAuthor: "Tarık Buğra & Mustafa Kutlu", bio: "Yerli hikayeciliğin dev kalemleri." },
    { title: "29. Yıl: Biyografi, Otobiyografi ve Portreler", theme: "Şahsiyet İnşası", desc: "İbn Hıllikân, Şevket Süreyya Aydemir ve Mithat Cemal.", mainAuthor: "Şevket Süreyya Aydemir", bio: "Tek Adam ve İkinci Adam portreleri." },
    { title: "30. Yıl: Gezi, Seyahatname ve Coğrafya", theme: "Arzın Yüzünü Gezmek", desc: "Evliya Çelebi, İbn Battûta ve Yahya Kemal.", mainAuthor: "Evliya Çelebi & İbn Battûta", bio: "Dünya seyahat tarihinin dev isimleri." },
    { title: "31. Yıl: Mantık ve Dil Felsefesi", theme: "Kavram, Anlam ve Sembol", desc: "Wittgenstein, Bertrand Russell ve Willard Quine.", mainAuthor: "Ludwig Wittgenstein", bio: "Dil felsefesi ve mantık filozofu." },
    { title: "32. Yıl: Felsefi Antropoloji ve İnsan Kuramları", theme: "İnsanın Mahiyeti", desc: "Max Scheler, Cassirer ve Helmuth Plessner.", mainAuthor: "Ernst Cassirer & Max Scheler", bio: "Sembolik formlar ve insan felsefesi." },
    { title: "33. Yıl: Çağdaş İslam Düşünürleri", theme: "Tecdit ve Yorum", desc: "Muhammed İkbal, Fazlur Rahman, Malik bin Nebi ve Câbirî.", mainAuthor: "Muhammed İkbal & Malik bin Nebi", bio: "İslam düşüncesinin yeniden teşekkülü." },
    { title: "34. Yıl: Tarih Felsefesi ve Medeniyet Kuramları", theme: "Zamanın Yönü ve Tarih", desc: "Spengler, Toynbee, Collingwood ve İbn Haldun.", mainAuthor: "Arnold Toynbee & İbn Haldun", bio: "Medeniyetlerin doğuşu ve çöküşü." },
    { title: "35. Yıl: Şiir Teorisi ve Poetik İncelemeler", theme: "Mısra ve İmge Felsefesi", desc: "Valery, Eliot, Ahmet Haşim ve Tanpınar.", mainAuthor: "T.S. Eliot & Ahmet Haşim", bio: "Şiir sanatı ve saf şiir nazariyesi." },
    { title: "36. Yıl: İleri Düzey Tasavvuf ve İrfan", theme: "Hakikat ve Seyr-i Sülûk", desc: "İbnü'l-Arabî, Kuşeyrî, Hucvirî ve Erzurumlu İbrahim Hakkı.", mainAuthor: "İbnü'l-Arabî & İbrahim Hakkı", bio: "Şeyh-i Ekber ve Mârifetnâme yazarı." },
    { title: "37. Yıl: Dünya Şiiri ve Destanlar", theme: "İnsanlığın Ortak Şiiri", desc: "Homeros, Firdevsî, Dante ve Goethe.", mainAuthor: "Firdevsî & Goethe", bio: "Şehname ve Doğu-Batı Divanı şairleri." },
    { title: "38. Yıl: Fen ve Doğa Bilimleri Tarihi", theme: "Evren, Madde ve Hayat", desc: "Birûnî, Galileo, Newton, Einstein ve Carl Sagan.", mainAuthor: "Bîrûnî & Albert Einstein", bio: "İslam ve dünya fen bilimleri dâhileri." },
    { title: "39. Yıl: Felsefi Tefekkür ve Hayatın Anlamı", theme: "Varoluş ve Hikmet", desc: "Marcus Aurelius, Montaigne, Pascal ve Kierkegaard.", mainAuthor: "Montaigne & Blaise Pascal", bio: "Denemeler ve Düşünceler yazarları." },
    { title: "40. Yıl: Olgunluk Okumaları, İnziva ve Vasiyet", theme: "Zirve Tefekkür ve Veda", desc: "Gazzâlî Munkız, Mevlânâ Fîhi Mâ Fîh, Yunus Divanı ve Vasiyetler.", mainAuthor: "İmâm-ı Gazâlî & Mevlânâ", bio: "Ömür boyu ilim yolculuğunun zirve taçlandırması." }
  ];

  return yearTitles.map((spec, yIdx) => {
    const yearNum = yIdx + 1;
    
    // Create 12 months for each year
    const months: CurriculumMonthData[] = Array.from({ length: 12 }).map((_, mIdx) => {
      const monthNum = mIdx + 1;
      
      const weeklyBooks: CurriculumWeeklyBook[] = Array.from({ length: 4 }).map((_, wIdx) => {
        const weekNum = wIdx + 1;
        const bookCategory = MAIN_CATEGORIES[(yIdx + mIdx + wIdx) % MAIN_CATEGORIES.length];
        
        return {
          weekNumber: weekNum,
          title: `${spec.mainAuthor.split('&')[0].trim()} - ${spec.theme} (${yearNum}. Yıl ${monthNum}. Ay ${weekNum}. Eser)`,
          author: spec.mainAuthor,
          category: bookCategory,
          totalPages: 180 + ((yIdx * 10 + mIdx * 5 + wIdx * 20) % 350),
          coverUrl: DEFAULT_BOOK_COVERS[bookCategory] || DEFAULT_BOOK_COVERS["Din ve İlahiyat"],
          description: `${spec.desc} - ${monthNum}. Ay ${weekNum}. Hafta özel müfredat okuması.`,
          plannedDate: `${weekNum}. Hafta`
        };
      });

      return {
        monthNumber: monthNum,
        monthTitle: `${monthNum}. Ay: ${spec.theme} (${spec.mainAuthor})`,
        authorName: spec.mainAuthor,
        authorBio: spec.bio,
        weeklyBooks
      };
    });

    return {
      yearNumber: yearNum,
      title: spec.title,
      theme: spec.theme,
      description: spec.desc,
      months
    };
  });
}

export const FULL_FOUR_YEAR_CURRICULUM: CurriculumYear[] = generateFull40YearCurriculum();

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

