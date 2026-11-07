// Yerel okuma notları ve Gemini kullanılamadığında sunulan sınırlı yanıtlar.

interface RobiContextInput {
  message: string;
  userSummary?: unknown;
}

// Bilgi Hazinesi ve Ansiklopedik Kütüphane
interface TopicArticle {
  keywords: string[];
  title: string;
  etymology?: string;
  summary: string;
  philosophicalDepth: string;
  curriculumLink?: string;
  discussionQuestion: string;
}

const KNOWLEDGE_BASE: TopicArticle[] = [
  // 1. Gazali & Epistemoloji / Şüphe / İhya / Munkız
  {
    keywords: ['gazali', 'gazzali', 'munkız', 'ihya', 'ihyau', 'kimya-yı saadet', 'tehafüt', 'tahafut'],
    title: 'Hüccetü’l-İslâm İmâm-ı Gazâlî ve Hakikat Metodolojisi',
    etymology: 'Arapça "Yakîn" (يقين): Şüphenin zıddı, kalpte hiçbir tereddüdün kalmadığı berrak ve kesin bilgi seviyesi.',
    summary: 'İmâm-ı Gazâlî (1058-1111), Nizamiye Medresesi’nin başmüderrisiyken derin bir epistemolojik buhran yaşamış; duyuların ve saf aklın insanı yanıltabileceğini fark ederek şüpheyi bir metod olarak kullanmıştır.',
    philosophicalDepth: `Gazâlî, *el-Munkızu mine’d-Dalâl* (Delaletten Kurtuluş) adlı otobiyografik eserinde dört temel hakikat arayıcısını tartar:
1. **Kelamcılar:** İnancı cedel ve mantıkla savunanlar.
2. **Bâtınîler:** Masum bir imamın otoritesine sığınanlar.
3. **Felsefeciler (Meşşâîler):** Akla mutlak güvenen Aristocu filozoflar.
4. **Sûfîler:** Bilgiyi sadece kavram olarak değil, bizzat zevk (doğrudan tecrübe) ve ahlaki tezkiye ile yaşayanlar.

Gazâlî, şüphe denizinden Descartes’tan tam 500 yıl önce geçmiş, aklın kendi sınırlarını kabul ettiği noktada "kalbe ilka edilen bir nur" ile kurtuluşa ermiştir. Bu nur, aklı inkar etmek değil; aklı kibirden arındırıp vahiyle ahenk içine koymaktır.`,
    curriculumLink: '40 Yıllık Müfredatımızın 1. Yılında (Temel İslami İlimler) ve 40. Yılında (Zirve Vefa Okumaları) Gazali’nin İhya ve Munkız’ı temel mihenk taşıdır.',
    discussionQuestion: 'Gazâlî’nin şüpheyi bir yıkım değil, hakiki yakîne ulaşmak için bir vasıta kılması sence bugünün zihin bulanıklığına nasıl bir çare sunar?'
  },

  // 2. Immanuel Kant & Saf Aklın Eleştirisi
  {
    keywords: ['kant', 'immanuel kant', 'saf akıl', 'kategorik buyruk', 'numen', 'fenomen', 'a priori', 'a posteriori', 'sentetik'],
    title: 'Immanuel Kant ve Aklın Mahkemesi',
    etymology: 'Almanca "Kritik" (Grekçe krinein): Yargılamak, sınırlarını tayin etmek, elekten geçirmek. "A priori": Deneyimden önce var olan saf zihinsel formlar.',
    summary: 'Kant (1724-1804), David Hume’un şüpheciliğiyle dogmatik uykusundan uyanmış ve aklın dış dünyayı olduğu gibi değil, kendi kategorileri süzgecinden geçirerek bildiğini ortaya koymuştur.',
    philosophicalDepth: `Kant düşüncesinde üç devasa sütun vardır:
1. **Kopernik Devrimi:** Bilgimiz nesnelere değil, nesneler zihnimizin algı mekanizmalarına (uzay-zaman duyarlığı ve 12 anlama yetisi kategorisi) uyar.
2. **Fenomen ve Numen Ayrımı:** İnsan zihni ancak görünüşleri (fenomen) bilebilir; şeyin kendisini (numen / Das Ding an sich) saf akılla kuşatamaz.
3. **Kategorik Buyruk (Ödev Ahlakı):** "Öyle hareket et ki, eyleminin ilkesi aynı zamanda genel bir yasa olabilsin." Ahlak çıkar, korku veya haz üzerine değil; saf vazife bilinci üzerine kurulmalıdır.`,
    curriculumLink: '40 Yıllık Müfredatın 9. Yılı (Aydınlanma ve Rasyonalizm) tamamen Descartes, Spinoza ve Kant’ın bu epistemolojik hamlesine tahsis edilmiştir.',
    discussionQuestion: 'Kant’ın ahlakı sonuca (menfaate) değil de niyete ve vazifeye bağlaması, sence modern pragmatizme karşı ne kadar güçlü bir kalkan?'
  },

  // 3. Gazali ve Kant Karşılaştırması (Kritik Sentez)
  {
    keywords: ['gazali ve kant', 'kant ve gazali', 'karşılaştır', 'mukayese'],
    title: 'Doğu ve Batı’da Aklın Sınırları: Gazâlî ve Kant Mukayesesi',
    etymology: 'Arapça "Haddu’l-Akl" (Aklın sınırı) ile Almanca "Grenzen der Vernunft" (Aklın sınırları) kavramsal olarak birbirini selamlar.',
    summary: 'İki mütefekkir de çağlarının dogmatik akılcılığına karşı aklın kendi sınırlarını tayin etmiş ve metafiziğin rasyonel delillerle mutlaklaştırılamayacağını ispatlamıştır.',
    philosophicalDepth: `Bu iki dev zihin arasındaki paralellikler felsefe tarihinin en büyüleyici kesişimlerindendir:
- **Aklın Haddini Bilmesi:** Gazali *Tehâfütü’l-Felâsife*de Meşşâî filozofların metafizik iddialarının (âlemin ezeliyeti, ruhun haşri vb.) mantıksal bürhan şartlarını karşılamadığını gösterir. Kant da *Saf Aklın Eleştirisi*nin "Transandantal Diyalektik" bölümünde saf aklın antinomilere (çelişkilere) düştüğünü ispat eder.
- **Ahlak ve İrade:** Kant ahlak için Tanrı ve ruhun ölümsüzlüğünü pratik aklın postulatı sayarken; Gazâlî ahlakı doğrudan kalbî tezkiye ve peygamberî rehberliğin meyvesi kabul eder.
- **Temel Fark:** Kant bilinemez numen alanının kapısını metafiziğe kapatırken, Gazâlî bu kapıyı tasavvufi tecrübe, basiret ve vahyî müşahedeye ardına kadar açmıştır.`,
    curriculumLink: 'Müfredatımızın 2. Yılındaki İslam felsefesi ile 9. Yılındaki Aydınlanma felsefesini karşılaştırmalı okumak bu bilinci kazandırır.',
    discussionQuestion: 'Aklın metafizik konulardaki acziyetini teslim etmek bir yenilgi midir, yoksa hakiki idrake atılan ilk adım mı?'
  },

  // 4. Ahmet Hamdi Tanpınar, Huzur & Zaman Mefhumu
  {
    keywords: ['tanpınar', 'ahmet hamdi', 'saatleri ayarlama', 'huzur', 'mümtaz', 'nur hayata', 'zaman'],
    title: 'Ahmet Hamdi Tanpınar: Yekpare Geniş Zaman ve Şark-Garp Buhranı',
    etymology: 'Fransızca "Durée" (Bergsoncu kesintisiz içsel süre) ile kadim tasavvuftaki "İbnü’l-vakt" ve "Ebü’l-vakt" hallerinin sentezi.',
    summary: 'Tanpınar (1901-1962), Türk edebiyatının estetik, musiki, mimari ve zaman idrakini en derin felsefi zeminle yoğuran kutup yıldızıdır.',
    philosophicalDepth: `Tanpınar’ın poetikasının temel direkleri:
1. **Ne İçindeyim Zamanın:** "Ne içindeyim zamanın / Ne de büsbütün dışında / Yekpare geniş bir anın / Parçalanmaz akışında." Zaman mekanik saat tıkırtısı değil, ruhun kesintisiz nehridir.
2. **Saatleri Ayarlama Enstitüsü’ndeki İroni:** Hayri İrdal ve Halit Ayarcı üzerinden sahte modernleşmenin, biçimsel kurumsallaşmanın ve kimlik bunalımının trajikomik bir hicvidir.
3. **Huzur Romanı:** Doğu musikisi (Dede Efendi’nin Ferahfeza Ayini), İstanbul mekanları ve Mümtaz ile Nuran aşkı etrafında İkinci Dünya Savaşı eşiğinde bir medeniyet ve ruh arayışıdır.`,
    curriculumLink: 'Kütüphanendeki *Saatleri Ayarlama Enstitüsü* ve müfredatımızın 35. Yılındaki (Şiir Teorisi ve Poetik) Tanpınar dersleri doğrudan bu zihni besler.',
    discussionQuestion: 'Mekanik saatlerin esiri olduğumuz günümüzde, Tanpınar’ın "yekpare geniş anı" ruhumuzu nasıl sükunete kavuşturabilir?'
  },

  // 5. Cemil Meriç, Dil, Kamus ve Kültür Tahlili
  {
    keywords: ['cemil meriç', 'meriç', 'bu ülke', 'kamus', 'umrandan uygarlığa', 'mağaradakiler', 'jurnal'],
    title: 'Cemil Meriç: Fildişi Kuleden Hakikat Meydanına',
    etymology: 'Arapça "Kâmus" (قاموس): Okyanus, engin deniz. Dil, bir milletin hafızasının ve varlığının taşıyıcısı olan uçsuz bucaksız ummandır.',
    summary: 'Cemil Meriç (1916-1987), gözlerini kaybettikten sonra zihninin meşalesi katbekat parlayan, Doğu’nun ve Batı’nın bütün kütüphanelerini hafızasında harmanlayan bir düşünce dâhisidir.',
    philosophicalDepth: `Cemil Meriç’in temel tezleri:
1. **Kamus Namustur:** "Kamus bir milletin hafızasıdır, kamusa uzanan el namusa uzanmıştır." Kelimeleri katledilen bir millet düşünme kabiliyetini yitirir.
2. **İzmler İdraklere Giydirilen Deli Gömlekleridir:** Batı menşeli ideolojilerin Doğu insanının hakikatine uymadığını, hazır reçetelerin zihni köleleştirdiğini haykırır.
3. **Doğu ve Hint İrfanı:** *Bir Dünyanın Eşiğinde* eserinde Hint düşüncesini Batı’ya karşı değil, insanlığın ortak manevi cevheri olarak tahlil eder.`,
    curriculumLink: 'Müfredatımızın 3. Yılı (Medeniyet, Doğu-Batı Tahlili ve Sosyoloji) Cemil Meriç ve Sezai Karakoç okumalarıyla başlar.',
    discussionQuestion: 'Kelimelerin hızla tüketildiği ve kısaltıldığı sosyal medya çağında, kamusumuzu ve dil hassasiyetimizi nasıl koruyabiliriz?'
  },

  // 6. Dostoyevski, Suç ve Ceza, Vicdan ve Karamazov Kardeşler
  {
    keywords: ['dostoyevski', 'suç ve ceza', 'karamazov', 'raskolnikov', 'ivan karamazov', 'alioşa', 'yeraltından notlar'],
    title: 'Fyodor Dostoyevski: İnsan Ruhunun Karanlık ve Aydınlık Uçurumları',
    etymology: 'Rusça "Sovest" (Совесть): Birlikte bilmek, iç ses, ilahi adaletin kalpteki yankısı olan vicdan.',
    summary: 'Dostoyevski (1821-1881), insan psikolojisinin en dipsiz kuyularına inmiş; akılcılık adına ahlakı inkar eden teorilerin insanı cinnete götürdüğünü teşhir etmiştir.',
    philosophicalDepth: `Dostoyevski başyapıtlarında şu metafizik kavgaları verir:
1. **Raskolnikov’un Trajedisi:** "Napolyon gibi üstün insanlar adi kanunların üstünde midir?" sorusuyla cinayet işleyen Raskolnikov, teoride kendini haklı çıkarsa da ruhunun ontolojik dengesini kaybetmiş ve ancak Sonya’nın saf merhameti ve İncil okumalarıyla dirilmiştir.
2. **Büyük Engizisyoncu (Karamazov Kardeşler):** İvan Karamazov’un "Tanrı yoksa her şey mübahtır" iddiası ve insanın hürriyet yükünü taşıyamayacağı tezi.
3. **Güzellik Dünyayı Kurtaracak:** İnsanı kurtaracak olan teknik ilerleme değil; ıstıraptan süzülmüş fedakarane sevgi ve manevi güzelliktir.`,
    curriculumLink: '40 Yıllık Müfredatın 11. Yılı (19. Yüzyıl Dünya Romanı Şaheserleri) Dostoyevski ve Tolstoy tahlillerine odaklanır.',
    discussionQuestion: 'Raskolnikov’un vicdan azabı, ahlakın salt toplumsal bir sözleşme değil de insanın fıtratına nakşedilmiş bir yasa olduğunu kanıtlamaz mı?'
  },

  // 7. Sezai Karakoç & Diriliş Düşüncesi
  {
    keywords: ['sezai karakoç', 'karakoç', 'diriliş', 'mona rosa', 'hızırla kırk saat', 'yitik cennet'],
    title: 'Sezai Karakoç: Diriliş Nesli ve Medeniyet Ufku',
    etymology: 'Diriliş (Ba’s / İhyâ): Maddi ve ruhi bir ölümden sonra hakikatin ve medeniyetin yeniden canlanması.',
    summary: 'Sezai Karakoç (1933-2021), modern Türk şiirinin ikinci yeni damarını İslam medeniyetinin diriliş davasıyla birleştiren abidevi bir şair ve mütefekkirdir.',
    philosophicalDepth: `Karakoç’un tefekkür nizamı:
1. **Diriliş Felsefesi:** Ruhun dirilişi, inancın dirilişi, edebiyatın ve nihayetinde medeniyetin dirilişi.
2. **Kaderin Üstünde Bir Kader:** "Yenilgi yenilgi büyüyen bir zafer vardır / Sırların sırrına ermek için sende yabancı bir ay vardır."
3. **Millet-i İbrahim Şuuru:** Coğrafi sınırları aşan, Mekke, Kudüs, Şam, Bağdat ve İstanbul ekseninde atan bir ümmet ve insanlık idraki.`,
    curriculumLink: 'Müfredatımızın 3. ve 4. Yıllarında Sezai Karakoç’un şiirleri ve medeniyet kitapları zorunlu omurgadır.',
    discussionQuestion: 'Modern dünyada bir "diriliş eri" gibi yaşamak, gündelik alışkanlıklarımıza ve okuma disiplinimize nasıl yansımalıdır?'
  },

  // 8. İbn Haldun & Umran / Sosyoloji / Mukaddime
  {
    keywords: ['ibn haldun', 'haldun', 'mukaddime', 'umran', 'asabiyet', 'bedevilik', 'hadarilik'],
    title: 'İbn Haldun: Tarihin Felsefesi ve Umran İliminin Doğuşu',
    etymology: 'Arapça "Umran" (عمران): İmar etmek, bayındır kılmak, toplumsal hayat ve medeniyet nizamı.',
    summary: 'İbn Haldun (1332-1406), Batı sosyolojisinden yüzyıllar önce tarihi masal olmaktan çıkarıp toplumsal kanunlara bağlayan bir ilim inşa etmiştir.',
    philosophicalDepth: `*Mukaddime*nin çığır açan keşifleri:
1. **Asabiyet Nazariyesi:** Göçebe topluluklardaki dayanışma ve ortak şuur (asabiyet), devleti kurar; rehavet ve lüks geliştikçe bu bağ zayıflar ve devlet çöker.
2. **Coğrafya Kaderdir:** İklim ve coğrafi şartlar insanların mizaçlarını, ahlaklarını ve geçim tarzlarını belirler.
3. **İlim Melekesi:** İlim biriktirilen malumat değil, tedricen kazanılan kalıcı bir melekedir.`,
    curriculumLink: '40 Yıllık Müfredatın 13. Yılında (İslam İktisadı ve Sosyal Adalet) İbn Haldun baş müelliftir.',
    discussionQuestion: 'İbn Haldun’un "Lüks ve rehavet asabiyeti yok eder" tespiti, bugünün tüketim toplumu için nasıl bir uyarı niteliğindedir?'
  },

  // 9. Spinoza, Töz, Monizm & Etika
  {
    keywords: ['spinoza', 'baruch spinoza', 'etika', 'töz', 'monizm', 'panteizm', 'deus sive natura'],
    title: 'Baruch Spinoza ve Geometrik Yöntemle İnşa Edilen Hakikat',
    etymology: 'Latince "Substantia" (Töz / Kendi başına var olan ve kendi başına kavranan şey).',
    summary: 'Spinoza (1632-1677), Amsterdam cemaatinden aforoz edilmesine rağmen felsefeyi bir ibadet gibi yaşamış, optik cam silerek rızkını temin etmiş yalnız bir dâhidir.',
    philosophicalDepth: `Spinoza’nın *Ethica*sındaki temel omurga:
1. **Tek Töz (Deus sive Natura):** Tanrı veya Doğa birdir. Evrendeki her varlık, bu tek sonsuz tözün birer tavrı (modusu)dur.
2. **Geometrik Usul:** Felsefeyi Öklid geometrisi gibi tanımlar, aksiyomlar ve önermelerle ispatlar.
3. **Duyguların Esareti ve Hürriyet:** İnsan tutkularının kölesi oldukça özgür değildir; ancak doğanın zorunluluklarını akılla idrak ettiğinde (amor fati / intellektüel Tanrı sevgisi) hürriyetine kavuşur.`,
    curriculumLink: 'Müfredatımızın 9. Yılında Aydınlanma ve Rasyonalizm safhasında incelenir.',
    discussionQuestion: 'Spinoza’nın tutkuların esaretinden aklın kılavuzluğundaki anlama yetisiyle kurtulma reçetesi, bugünün kaygılı insanına nasıl yardım edebilir?'
  },

  // 10. Farabi ve İbn Sina & Meşşaî İslam Felsefesi
  {
    keywords: ['farabi', 'ibn sina', 'avicenna', 'alpharabius', 'meşşai', 'el-kanun', 'medinetü’l-fazıla', 'sudûr'],
    title: 'Muallim-i Sânî Fârâbî ve Şeyhü’r-Reîs İbn Sînâ',
    etymology: 'Arapça "Meşşâiyye" (مشائية): Aristoteles’in yürüyerek ders verme geleneğini takip eden İslam peripatetik felsefesi.',
    summary: 'Fârâbî mantık ve siyaset felsefesini, İbn Sînâ ise metafizik ve tıp ilmini Doğu’nun zirvesine taşımış, Batı Skolastiğini derinden etkilemiştir.',
    philosophicalDepth: `Meşşâî geleneğin ana arterleri:
1. **Vacibü’l-Vücud ve Mümkinü’l-Vücud:** İbn Sina varlığı zorunlu (Tanrı) ve mümkün (yaratılmışlar) olarak ikiye ayırır. Mümkünün var olabilmesi için dışsal bir sebebe ihtiyacı vardır.
2. **Uçan Adam Argümanı:** İbn Sina, tüm duyulardan soyutlanmış bir boşlukta asılı duran insanın yine de kendi "ben"inin ve varlığının bilincinde olacağını ispatlayarak ruhun maddeden bağımsızlığını savunur.
3. **Medinetü’l-Fazıla (Erdemli Şehir):** Farabi, ideal bir toplumun ancak erdemli bir yönetici (filozof-peygamber) idaresinde adalete kavuşacağını gösterir.`,
    curriculumLink: '40 Yıllık Müfredatın 2. Yılı (İslam Felsefesi ve Meşşaî Gelenek) tamamen bu iki dâhiye ayrılmıştır.',
    discussionQuestion: 'İbn Sina’nın "Uçan Adam" tefekkür deneyini gözlerini kapatıp düşündüğünde, ruhunun bedenden ayrı müstakil cevherini nasıl hissediyorsun?'
  }
];

export function askRobiBrain(params: RobiContextInput): string {
  const rawMsg = (params.message || '').trim();
  const msg = rawMsg.toLowerCase();
  
  const summary = params.userSummary as { displayName?: unknown; dailyTargetPages?: unknown } | undefined;
  const userName = typeof summary?.displayName === 'string' ? summary.displayName : 'Kıymetli okur';

  // 12 Ana Kategori Rehberi
  const CATEGORIES_DATA: Record<string, { desc: string; coreAuthors: string; classics: string }> = {
    'Din ve İlahiyat': { desc: 'Akaid, tefsir, hadis, fıkıh ve tasavvuf ilimlerinin kaynağı.', coreAuthors: 'İmâm-ı Gazâlî, İbn Hişam, İmam Nevevî, Fahrüddin Râzî', classics: 'İhyâu Ulûmi’d-Dîn, Siyer-i Nebî, Riyâzü’s-Sâlihîn' },
    'Felsefe': { desc: 'Varlığın, bilginin ve ahlakın rasyonel ve metafizik tahlili.', coreAuthors: 'Platon, Aristoteles, İbn Sînâ, Fârâbî, Descartes, Kant, Spinoza', classics: 'Devlet, el-İşârât ve’t-Tenbîhât, Saf Aklın Eleştirisi, Ethica' },
    'Tarih': { desc: 'Geçmişin hadiselerini nedensellik ve medeniyet şuuruyla anlama.', coreAuthors: 'Halil İnalcık, İbn Haldun, Fernand Braudel, Fuad Köprülü', classics: 'Devlet-i Aliyye, Mukaddime, Osmanlı Tarihi' },
    'Edebiyat': { desc: 'İnsan ruhunun, toplumun ve zamanın estetik kurguyla ifadesi.', coreAuthors: 'Ahmet Hamdi Tanpınar, Dostoyevski, Tolstoy, Cemil Meriç, Balzac', classics: 'Huzur, Suç ve Ceza, Savaş ve Barış, Saatleri Ayarlama Enstitüsü' },
    'Şiir': { desc: 'Kelimelerin ve ahengin en saf metafizik ve lirizmle buluşması.', coreAuthors: 'Yunus Emre, Fuzûlî, Mevlânâ, Necip Fazıl, Sezai Karakoç, Yahya Kemal, Rilke', classics: 'Yunus Divanı, Mesnevî, Çile, Hızırla Kırk Saat, Kendi Gök Kubbemiz' },
    'Psikoloji': { desc: 'İnsanın iç dünyası, bilinçdışı ve anlam arayışı.', coreAuthors: 'Viktor Frankl, Carl Jung, Erich Fromm, İbn Hazm', classics: 'İnsanın Anlam Arayışı, Sevme Sanatı, Güvercin Gerdanlığı' },
    'Sosyoloji': { desc: 'Toplumsal yapılar, değişimler, kurumlar ve medeniyet tahlili.', coreAuthors: 'İbn Haldun, Max Weber, Zygmunt Bauman, Şerif Mardin', classics: 'Mukaddime, Protestan Ahlakı, Akışkan Modernite' },
    'Eğitim ve Pedagoji': { desc: 'Karakter inşası, irade terbiyesi ve maarif felsefesi.', coreAuthors: 'Nurettin Topçu, J.J. Rousseau, John Dewey', classics: 'Türkiye’nin Maarif Davası, Emile' },
    'Matematik ve Mantık': { desc: 'Doğru düşünmenin formel yasaları, kıyas ve sembolik akıl yürütme.', coreAuthors: 'Aristoteles, İbn Sînâ, Hârizmî, Frege', classics: 'Organon, Necât (Mantık Bölümü)' },
    'Fen ve Doğa Bilimleri': { desc: 'Kâinat kitabı, tabiat kanunları ve bilim tarihi.', coreAuthors: 'Bîrûnî, İbnü’l-Heysem, Fuat Sezgin, Galileo', classics: 'el-Âsârü’l-Bâkıye, İslam’da Bilim ve Teknik' },
    'Biyografi ve Hatırat': { desc: 'Örnek şahsiyetlerin hayat serencamı ve çağlarının şahitliği.', coreAuthors: 'İbn Hallikân, Şevket Süreyya Aydemir, Aliya İzzetbegoviç', classics: 'Vefeyâtü’l-A’yân, Tek Adam, Tarihe Tanıklığım' },
    'Kültür, Sanat ve Medeniyet': { desc: 'Şehir, mimari, musiki, hat ve medeniyet tefekkürü.', coreAuthors: 'Turgut Cansever, Ekrem Hakkı Ayverdi, Titus Burckhardt', classics: 'İslam’da Şehir ve Mimari, Kubbeyi Yere Koymamak' }
  };

  const greeting = `${userName}, yerel okuma notlarından yararlanıyorum.`;

  if (/gutenberg|internet archive|internette|webde|tercüme|çevir/u.test(msg)) {
    return 'Yerel modda bir web arşivini tarayamıyorum veya özgün metni doğrulayamıyorum. Gemini erişimi olduğunda Kaynak incele seçeneğiyle açık bir bağlantıyı inceleyebilirsin.';
  }

  // 1.5. 12 KATEGORİ VE KÜTÜPHANE VERİTABANI HAKİMİYETİ
  if (msg.includes('12 kategori') || msg.includes('kategori') || msg.includes('tüm bölümler') || msg.includes('veritaban') || msg.includes('veritabanı')) {
    const categoriesList = Object.entries(CATEGORIES_DATA).map(([catName, info], idx) => 
      `${idx + 1}. **${catName}**: ${info.desc}\n   - *Temel İsimler:* ${info.coreAuthors}\n   - *Başyapıtlar:* ${info.classics}`
    ).join('\n\n');

    return `${greeting}

Kütüphanemizin mimarisi, insan idrakinin tüm ufkunu kuşatan **12 temel kategori**, 256 şiirlik antoloji ve 1920 eserlik 40 yıllık ilim müfredatı üzerine inşa edilmiştir:

${categoriesList}

---

Bu 12 disiplin arasından bugün zihnini özellikle hangi sahada derinleştirmek veya yeni bir eser önerisi almak istersin?`;
  }

  if (/müfredat|40 yıl|okuma plan|ilk yıl|yıl klasik/u.test(msg)) {
    return '40 yıllık öneri planını Keşfet bölümündeki İlim Yolculuğum sekmesinden açabilirsin. Yeni eser atanmış aylar önerileri gösterir. Diğer ayları tekrar veya kişisel seçim için kullanabilirsin. Yerel modda tek tek aylara ilişkin derin tahlil yapamıyorum.';
  }

  // 3. OKUMA KOÇLUĞU, DİSİPLİN, STREAK VE HEDEF ANALİZİ
  if (msg.includes('koç') || msg.includes('disiplin') || msg.includes('değerlendir') || msg.includes('hedef') || msg.includes('tempo') || msg.includes('sayfa')) {
    const configuredTarget = summary?.dailyTargetPages;
    const target = typeof configuredTarget === 'number' && configuredTarget > 0 ? configuredTarget : 40;

    return `${greeting}

Bir okuma koçu ve yol arkadaşın olarak seninle hasbihal etmek benim için en büyük zevktir! Zihnini bir ağacın kökleri, okuduğun sayfaları ise o kökleri besleyen pınarlar gibi düşünelim.

📊 **Okuma Disiplininin Üç Altın Prensibi:**
1. **Devamlılık (Az da Olsa Sürekli):** Kadim hikmette ifade edildiği üzere *"Amellerin en hayırlısı, az da olsa devamlı olanıdır."* Günde ${target} sayfa, her gün okursan yılda ${(target * 365).toLocaleString('tr-TR')} sayfa eder.
2. **Derinleşme (Teennî ile Okuma):** Sayfaları hızlıca bitirmek değil, her cümlenin kalbinde bir palamut gizliymişçesine tefekkür etmek esastır. Satırların altını çizmek ve zihnine takılanları nota dökmek bilgiyi mülk edinmektir.
3. **Zamanı Bereketlendirme:** Sabahın seherinde veya günün hengamesinden arınmış gece vakitlerinde okunan 20 sayfa, gündüzün dağınık saatlerindeki 50 sayfadan daha derin iz bırakır.

Bugün kendine sakin bir çay veya kahve hazırlayıp hedefine doğru kaç sayfa yol almak istersin?`;
  }

  // 4. KAPSAMLI BİLGİ HAZİNESİNDEN EŞLEŞME (Topic Articles)
  for (const topic of KNOWLEDGE_BASE) {
    const isMatched = topic.keywords.some(k => msg.includes(k));
    if (isMatched) {
      return `${greeting}

### 📖 ${topic.title}

${topic.etymology ? `🔍 **Etimolojik Kök:** *${topic.etymology}*\n` : ''}
${topic.summary}

---

#### 💡 **Felsefi ve Entelektüel Derinlik:**
${topic.philosophicalDepth}

${topic.curriculumLink ? `\n📌 **Müfredat İrtibatı:** ${topic.curriculumLink}\n` : ''}
🤔 **Tefekkür Sorusu:** ${topic.discussionQuestion}`;
    }
  }

  // 5. ŞİİR VE EDEBİYAT TEFEKKÜRÜ
  if (msg.includes('şiir') || msg.includes('şair') || msg.includes('mısra') || msg.includes('gazel') || msg.includes('beyit')) {
    return `${greeting}

Şiir, nesrin ve kuru mantığın tıkandığı yerde ruhun kanatlanıp hakikati sembollerle terennüm etmesidir.

Fuzûlî *“İlimsiz şiir temelsiz duvara benzer”* derken şiirin bir irfan üzerine oturması gerektiğini ihtar eder. Yahya Kemal için şiir *“derunî bir ahenk ve Türkçe’nin ses bayrağıdır”*; Sezai Karakoç içinse *“göklerden gelen bir diriliş soluğudur”*.

Kütüphanemizin 256 şiirlik seçkin koleksiyonunda Yunus Emre’nin cezbesinden Necip Fazıl’ın metafizik sancılarına, Rilke’nin yalnızlığından Karakoç’un Diriliş çağıltısına kadar muazzam bir vaha mevcuttur.

Şu an zihninde yankılanan veya şerh etmemi istediğin bir mısra var mı dostum?`;
  }

  // 6. GECE VE TEFEKKÜR
  if (msg.includes('gece') || msg.includes('uyku') || msg.includes('karanlık') || msg.includes('sükut') || msg.includes('seher')) {
    return `${greeting}

Gece, kâinatın gündüzün hengamesinden el çekip kendi hakikatiyle baş başa kaldığı muazzam bir tefekkür vaktidir.

Erzurumlu İbrahim Hakkı Hazretleri *Mârifetnâme*de seher ve gece vaktini marifetullahın kapısı sayar. Ahmet Hamdi Tanpınar ise geceyi zihnin derin musikisi olarak niteler; çünkü eşya susunca kelimelerin ruhu konuşmaya başlar.

Bu sükûnet dolu saatlerde sayfalarını açıp zihnini aydınlatacak hangi satırlar üzerine tefekkür etmek istersin?`;
  }

  return 'Bu soruya yerel notlarımla güvenilir bir yanıt veremiyorum. Gemini erişimi yeniden geldiğinde soruyu tekrar deneyebilirsin.';
}
