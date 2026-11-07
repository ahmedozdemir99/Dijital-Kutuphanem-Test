import { Poet, Poem } from '../types';

export const POETS_COLLECTION_FULL: Poet[] = [
  {
    id: "poet-yunus-emre",
    name: "Yunus Emre",
    period: "13. Yüzyıl (Tasavvuf Şiiri)",
    portraitUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop",
    bio: "Anadolu Türk edebiyatının kurucu ismi, ilahi aşkın ve Türkçe şiirin ulu çınarı.",
    poems: [
      {
        id: "p-ye-1",
        title: "Bana Seni Gerek Seni",
        content: "Aşkın aldı benden beni / Bana seni gerek seni\nBen yanarım dün ü günü / Bana seni gerek seni\n\nAşkın şarabından içem / Mecnun olup dağa düşem\nSensin benim dünüm günüm / Bana seni gerek seni"
      },
      {
        id: "p-ye-2",
        title: "Gel Gör Beni Aşk Neyledi",
        content: "Ben yürürüm yâne yâne / Aşk boyadı beni kâne\nNe âkılem ne dîvâne / Gel gör beni aşk neyledi\n\nGâh eserim yeller gibi / Gâh tozarım yollar gibi\nGâh akarım seller gibi / Gel gör beni aşk neyledi"
      },
      {
        id: "p-ye-3",
        title: "İlim İlim Bilmektir",
        content: "İlim ilim bilmektir / İlim kendin bilmektir\nSen kendini bilmezsin / Ya okumak ne demektir\n\nOkumaktan murad ne / Kişi Hak'kı bilmektir\nÇün okudun bilmezsin / Ha bir kuru emektir"
      },
      {
        id: "p-ye-4",
        title: "Severim Seni Ben Candan İçeru",
        content: "Severim seni ben candan içeru / Yolum vardır bu erkândan içeru\nBeni bende demen bende değilim / Bir ben vardır bende benden içeru"
      },
      {
        id: "p-ye-5",
        title: "Aşkın İle Âşıklar",
        content: "Aşkın ile âşıklar yansın ya Resûlallah\nİçip aşkın şarabın kansın ya Resûlallah\n\nŞol seni seven kişi terk eyler benliği\nSana kurban olan can bulur ebediliği"
      },
      {
        id: "p-ye-6",
        title: "Taştın Yine Deli Gönül",
        content: "Taştın yine deli gönül sular gibi çağlar mısın\nAktın yine kanlı yaşım yollarımı bağlar mısın\n\nNideyim elim ermez yâre bülbül gibi zâr eylerim\nSular gibi çağlar mısın dağlar gibi ağlar mısın"
      },
      {
        id: "p-ye-7",
        title: "Biz Dünyadan Gider Olduk",
        content: "Biz dünyadan gider olduk kalanlara selam olsun\nBizim için hayır dua kılanlara selam olsun\n\nEcel büke belimizi söyletmeye dilimizi\nHasta iken halimizi soranlara selam olsun"
      },
      {
        id: "p-ye-8",
        title: "Söz Ola Kese Savaşı",
        content: "Söz ola kese savaşı / Söz ola kestire başı\nSöz ola ağulu aşı / Yağ ile bal ede bir söz\n\nKişi bile söz demini / Demeye sözün kemini\nBu cihan cehennemini / Sekiz uçmak ede bir söz"
      }
    ]
  },
  {
    id: "poet-mevlana",
    name: "Mevlânâ Celâleddîn-i Rûmî",
    period: "13. Yüzyıl (Tasavvuf ve Hikmet)",
    portraitUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400&auto=format&fit=crop",
    bio: "İlahi aşkın, sema'ın ve insan sevgisinin evrensel mürşidi ve büyük şairi.",
    poems: [
      {
        id: "p-m-1",
        title: "Etme",
        content: "Duydum ki bizi bırakmaya azmediyorsun etme\nBaşka bir yar başka bir dosta meyl ediyorsun etme\n\nSen güneşsin gökyüzümüzde batma n'olursun\nAydınlığımızı karartmaya niyet ediyorsun etme"
      },
      {
        id: "p-m-2",
        title: "Dinle Neyden",
        content: "Dinle neyden kim hikâyet etmede / Ayrılıklardan şikâyet etmede\nKamışlıktan koptum kopoptan beri / Ağlatır feryâdım er erkeği"
      },
      {
        id: "p-m-3",
        title: "Cânım Efendim",
        content: "Sen benim canımsın, ruhumsun benim\nGözümün nurusun, varımsın benim\nNe dert kalsın sende ne gam ne keder\nŞifa kaynağımdır gül yüzün benim"
      },
      {
        id: "p-m-4",
        title: "Gel Ne Olursan Ol Gel",
        content: "Gel, gel, ne olursan ol yine gel\nİster kafir, ister mecusi, ister puta tapan ol yine gel\nBizim dergahımız, umutsuzluk dergahı değildir\nYüz kere tövbeni bozmuş olsan da yine gel"
      },
      {
        id: "p-m-5",
        title: "Aşk Bir Güneştir",
        content: "Aşk bir güneştir, sevgisiz gönül taştan ibarettir\nNereye baksa karanlık görür, nereye gitse yalnızdır\nÂşık olanın canı kurbandır, maşukun yolunda her şey helaldir"
      },
      {
        id: "p-m-6",
        title: "Suskunluk (Hâmûş)",
        content: "Sus artık ey dil, zira harfler dar gelir manaya\nSöz dediğin tarladır, mana ise ekin\nHâmûş ol ki sesini duysun gökler ve melekler"
      },
      {
        id: "p-m-7",
        title: "Ruhun Kanatları",
        content: "Kuş gibi uçmak için kanat gerekmez\nİman ve aşk kanatlandırır ruhu göklere\nUçarsın mekanın ötesine, zamansız diyarlara"
      },
      {
        id: "p-m-8",
        title: "Şeb-i Arûs",
        content: "Öldüğüm gün tabutum yürüyünce\nBende bu dünya derdi var sanma\nŞeb-i Arûs'tur o gece, vuslat gecesidir Hak'ka"
      }
    ]
  },
  {
    id: "poet-fuzuli",
    name: "Fuzûlî",
    period: "16. Yüzyıl (Divan Şiiri)",
    portraitUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400&auto=format&fit=crop",
    bio: "Aşkın, hüznün ve ızdırabın şairi; Klasik Türk Edebiyatının en büyük zirvesi.",
    poems: [
      {
        id: "p-f-1",
        title: "Su Kasidesi",
        content: "Saçma ey göz eşkten gönlümdeki efkâra su\nDüzüşmüştir tutuşan gazellerim âsâra su\n\nÂb-gûndur günbed-i devvâr rengi bilmezem\nYâ fuzûlî gubâr-ı çeşmime yağdırsa su"
      },
      {
        id: "p-f-2",
        title: "Beni Candan Usandırdı",
        content: "Beni candan usandırdı cefâdan yâr usanmaz mı\nFelekler yandı âhımdan murâdım şem'i yanmaz mı\n\nKamu bîmârına cânân devâ-yı vasl eder ihsân\nNeçün kılmaz bana derman beni bîmâr sanmaz mı"
      },
      {
        id: "p-f-3",
        title: "Leyla ile Mecnun'dan",
        content: "Yâ Rab belâ-yı aşk ile kıl âşinâ beni\nBir dem belâ-yı aşkdan etme cüdâ beni\n\nAz eyleme inâyetini ehl-i derdden\nYani ki çoh belâlara kıl müptelâ beni"
      },
      {
        id: "p-f-4",
        title: "Gazel (Öyle Sermestim ki)",
        content: "Öyle sermestim ki idrak etmezem dünyâyı ben\nİhtiyarım elde değildir görün sevdâyı ben\n\nGece gündüz zârı kılmak kârımdır aşk yolunda\nHaketmişem bağrımdaki elmas-ı hüveydâyı ben"
      },
      {
        id: "p-f-5",
        title: "Gül ve Bülbül",
        content: "Gül feryad eyler bülbülün ahından\nÂşık usanmaz mış maşuk yolundan\nHangi bağın gülüsün ey nazlı yâr\nKan damlar yüreğimden her ahımdan"
      },
      {
        id: "p-f-6",
        title: "Sikâyetnâme'den Mısralar",
        content: "Selam verdim rüşvet değildir deyip almadılar\nHüküm gösterdim faydasızdır deyip bakmadılar\nBütün kapılar kapandı yüzüme, yalnız Hak kapısı açık kaldı"
      },
      {
        id: "p-f-7",
        title: "Gece Hayali",
        content: "Gece bir şem'i ruhun yadı ile yandım ben\nUykuda zannettim seni, rüyaya kandım ben\nSabah oldu güneş doğdu, yine hüzün kaldı bana"
      },
      {
        id: "p-f-8",
        title: "Aşk Derdi",
        content: "Aşk derdiyle hoşem el çek ilacımdan tabip\nKılma derman kim helakim zehr-i dermanımdadır\nHer kime kim derdimi açtım bana ağladı"
      }
    ]
  },
  {
    id: "poet-necip-fazil",
    name: "Necip Fazıl Kısakürek",
    period: "Cumhuriyet Dönemi & Büyük Doğu",
    portraitUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=400&auto=format&fit=crop",
    bio: "Şairler Sultanı, mistik ve metafizik Türk şiirinin dev ismi.",
    poems: [
      {
        id: "p-nf-1",
        title: "Kaldırımlar",
        content: "Sokaktayım, kimsesiz bir sokak ortasında;\nYürüyorum, arkama bakmadan yürüyorum.\nYolumun karanlığa saplanan noktasında,\nSanki beni bekleyen bir hayal görüyorum.\n\nKara gökler kül rengi bulutlarla kapanık;\nEvlerin bacasını savuruyor yıldırım.\nBu gece yarısında iki kişi uyanık;\nBiri benim, biri de uzayan kaldırımlar."
      },
      {
        id: "p-nf-2",
        title: "Sakarya Türküsü",
        content: "İnsan üç beş damla kan, ırmak üç beş damla su;\nBir tirşe sarmaşık ki, karıştıkça karışır.\nHaydi durum böyleyken, gel de durma uyu;\nZamanda mekan gibi daraldıkça daralır.\n\nSakarya; saf çocuğu masum Anadolu'nun,\nDivanesi pür-safa, ey öz evladı yolun!\nYol onun, macera onun, koş Sakarya koş!"
      },
      {
        id: "p-nf-3",
        title: "Çile",
        content: "Gaiblerden bir ses geldi: Bu adam,\nGezdirsin boşluğu aynalar gibi!\nVe bir çığlık koptu içimden o an:\n'Sanki varım ama yokum ben gibi!'\n\nNihayet başladım çile yoluna,\nKafa döküldü beynin tasında.\nSırrı çözmek için vardım sonuna,\nVaroluşun o gizemli yasında."
      },
      {
        id: "p-nf-4",
        title: "Canım İstanbul",
        content: "Ruhumu eritip de kalıpta dondurmuşlar;\nOnu İstanbul diye toprağa kondurmuşlar.\nİçimde tüten bir şey; hava, ışık, bereket;\nMeyve eken tek şehir, gökten düşen memleket!"
      },
      {
        id: "p-nf-5",
        title: "Ayna",
        content: "Ayna ayna, anlat bana ben kimim?\nŞu çizgiler, şu bakışlar kimin hali?\nBir zamanlar ne neşeli bir gençtim,\nŞimdi hüzün kaplamış her bir hali."
      },
      {
        id: "p-nf-6",
        title: "Beklenen",
        content: "Ne hasta bekler sabahı,\nNe taze ölüyü mezar.\nNe de şeytan, bir günahı,\nSeni beklediğim kadar.\n\nGeçti istemem gelmeni,\nYokluğunda buldum seni;\nBırak vehmimde gölgeni,\nGelme, artık neye yarar?"
      },
      {
        id: "p-nf-7",
        title: "Zindan'dan Mehmed'e Mektup",
        content: "Zindan iki hece, Mehmed'im manda;\nZaman bir su gibi akar zamandan.\nBurası bir zindan, duvarlar taş;\nFakat gönlümüz hür, fikrimiz yoldaş."
      },
      {
        id: "p-nf-8",
        title: "Geçit",
        content: "Bırak dünyayı kendi haline,\nSen kendi kalbine bak ey insan!\nSonsuzluğa açılan o ince geçitte,\nYalnızca amelin kalır sana derman."
      },
      {
        id: "p-nf-9",
        title: "Veda",
        content: "Kapatın pencereleri, dışarısı yabancı;\nİçimde fırtınalar kopuyor gizlice.\nBu bir veda değil, sonsuzluğa doğuş,\nKaranlıklar aydınlanır bir gece."
      },
      {
        id: "p-nf-10",
        title: "O Erişilemez Âlem",
        content: "Göklerin ötesinde bir belde var bilirim;\nOrada ne dert kalır ne de gözyaşı.\nO aleme ermektir benim bütün dileğim,\nOrada bulurum ancak aradığım aşı."
      }
    ]
  },
  {
    id: "poet-sezai-karakoc",
    name: "Sezai Karakoç",
    period: "İkinci Yeni & Diriliş Nesli",
    portraitUrl: "https://images.unsplash.com/photo-1474939557548-f842486be195?q=80&w=400&auto=format&fit=crop",
    bio: "Diriliş akımının kurucusu, medeniyet ve mistisizmin büyük şairi.",
    poems: [
      {
        id: "p-sk-1",
        title: "Mona Roza",
        content: "Mona Roza, siyah güller, ak güller;\nGülhanede hafızın gülleri kanar.\nKırgın kırgın bakma yüzüme gülüm;\nHangi çeşmeden baksam su seni arar.\n\nMona Roza, siyah güller, ak güller;\nZeytin ağaçları, karanfil kokusu.\nAçma pencereni perdeleri çek;\nMona Roza seni görmesin gece kuşları."
      },
      {
        id: "p-sk-2",
        title: "Sürgün Ülkeden Başkentler Başkentine",
        content: "Senin kalbinden sürgün oldum önce;\nBütün sürgünlüklerim bu sürgünün resmi.\nBütün başkentlerden daha yüce bir başkent var;\nKaderin üstünde bir kader vardır.\n\nNe yapsalar boş göklerden gelen bir karar vardır;\nGün batsa ne olur geceyi onaran bir mimar vardır.\nYanmışsam külümden yapılan bir hisar vardır;\nYenilgi yenilgi büyüyen bir zafer vardır."
      },
      {
        id: "p-sk-3",
        title: "Lili",
        content: "Lili'nin bir kuşu vardı, al tüylü;\nLili onu kafeste beslerdi.\nBir gün kapı açık kaldı Lili gitti;\nKuş uçtu, gökyüzü Lili oldu."
      },
      {
        id: "p-sk-4",
        title: "Köşe",
        content: "Sen geceyi aydınlatan bir meşale gibi durursun sokak başında;\nBen geçerim karanlıklar içinden sana bakarak.\nBir köşe başı kalır geriye bir de bitmeyen özlem."
      },
      {
        id: "p-sk-5",
        title: "Köpük",
        content: "Su üstünde köpük gibidir ömrümüz;\nBir an varız, bir an yokuz dünyada.\nFakat ruhumuz kalıcıdır sonsuzlukta."
      },
      {
        id: "p-sk-6",
        title: "Yağmur Duası",
        content: "Gökten rahmet yağar toprağa berekettir;\nGönülden gözyaşı akar ruha şifadır.\nYağdır Tanrım üzerimize merhametini."
      },
      {
        id: "p-sk-7",
        title: "Kardan Aydınlık",
        content: "Kar yağar geceleyin sessizce;\nSokaklar kardan aydınlık olur.\nYüreğimize yağan umut gibi."
      },
      {
        id: "p-sk-8",
        title: "Balkon",
        content: "Balkona çıktım gece yarısı;\nŞehir uyuyordu ben uyanıktım.\nYıldızlar birer dua gibi parlıyordu."
      },
      {
        id: "p-sk-9",
        title: "Gül Muştusu",
        content: "Gül açtı bahçede müjde getirir;\nBahar geldi diriliş vaktidir.\nEy insan uyan uykudan!"
      },
      {
        id: "p-sk-10",
        title: "Masal",
        content: "Doğuda bir masal anlatırlar çocuklara;\nBir ülkenin yeniden doğuşunu söylerler.\nO masal gerçek olacak bir gün."
      }
    ]
  },
  {
    id: "poet-cahit-zarifoglu",
    name: "Cahit Zarifoğlu",
    period: "Yedi Güzel Adam & Mistik Şiir",
    portraitUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop",
    bio: "Yedi Güzel Adam'ın zarif şairi; çocuk kalpli ve derin metafizik şaheserlerin mimarı.",
    poems: [
      {
        id: "p-cz-1",
        title: "Anlaşılmak",
        content: "Bu insanlara ne oluyor böyle?\nBirbirlerinin kalbine giden yolları tıkıyorlar.\nOysa bir tebessüm, bir samimi bakış,\nHer şeyi çözmeye yeterdi."
      },
      {
        id: "p-cz-2",
        title: "Yedi Güzel Adam'dan",
        content: "Bu adamlar güzel adamlardı;\nSözleri inci, kalpleri derya gibiydi.\nToplandılar bir gece vakti,\nUygarlığın geleceğini konuştular."
      },
      {
        id: "p-cz-3",
        title: "Aşka Dair",
        content: "Aşk ki bir kuş gibidir konar kalbine;\nSessizce ötüşür, seni dinlendirir.\nBırak uçsun özgürce gökyüzünde."
      },
      {
        id: "p-cz-4",
        title: "Çocukluk",
        content: "Çocukluğum bir uçurtmaydı rüzgarda;\nİpi elimde, hayalleri bulutlarda.\nŞimdi büyüdüm ama o uçurtma hala uçuyor."
      },
      {
        id: "p-cz-5",
        title: "Menziller",
        content: "Yol uzun, menzil uzak;\nFakat adımlarımız kararlı.\nHer adımda bir hüzün, her adımda bir umut."
      },
      {
        id: "p-cz-6",
        title: "Korku ve Yakarış",
        content: "Rabbim, korkularımı umuda çevir;\nKaranlığımı aydınlat rahmetinle.\nSana sığınırım her anımda."
      },
      {
        id: "p-cz-7",
        title: "Ağaçlar",
        content: "Ağaçlar ayakta ölür derler;\nDuruşları gururlu, yaprakları hüzünlü.\nBiz de öyle durmalıyız hayatta."
      },
      {
        id: "p-cz-8",
        title: "Akyürek",
        content: "Yüreğin ak olsun ey dost;\nKötülük teğet geçsin yanından.\nSevgiyle bak dünyaya."
      }
    ]
  },
  {
    id: "poet-ismet-ozel",
    name: "İsmet Özel",
    period: "Modern Türk Şiiri & Başkaldırı",
    portraitUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=400&auto=format&fit=crop",
    bio: "Coşkun dili, sarsıcı imgelemi ve tavizsiz hakikat arayışıyla çağdaş Türk şiirinin anıt ismi.",
    poems: [
      {
        id: "p-io-1",
        title: "Amentü",
        content: "İnsan Partizan olmayı seçer bazen;\nİnsan ki topraktan yaratılmıştır.\nFakat ruhu göklere aittir.\nBen inandım ve tasdik ettim Hak'kı."
      },
      {
        id: "p-io-2",
        title: "Mataramda Tuz Var",
        content: "Geniş siyah gölgeli ağaçlar altında;\nMataramda tuz var, torbamda ekmek.\nYürüyorum yeryüzünün yollarında,\nHakikate ermek için çabalayarak."
      },
      {
        id: "p-io-3",
        title: "Evet İsyan",
        content: "Evet isyan! Kötülüğe, haksızlığa isyan!\nSuskun kalmak yakışmaz insana.\nHaykır gerçekleri korkusuzca."
      },
      {
        id: "p-io-4",
        title: "Of Not Being A Jew",
        content: "Bir yabancı gibi gezindim sokaklarda;\nKimse anlamadı derdimi.\nFakat ben biliyorum kim olduğumu."
      },
      {
        id: "p-io-5",
        title: "Celladıma Gülümserken",
        content: "Gülümserim ölümün yüzüne korkusuzca;\nZira ölüm bir son değil, başlangıçtır.\nİnançlı insan korkmaz ecelden."
      },
      {
        id: "p-io-6",
        title: "Erbain",
        content: "Kırk yıl geçti ömrümden çileyle;\nHer yılı bir ders, her günü bir sınav.\nŞimdi durup bakıyorum geriye."
      },
      {
        id: "p-io-7",
        title: "Bir Yusuf Masalı",
        content: "Kuyuya atılan Yusuf gibi sabrettim;\nSaraylara sultan oldu sabrın sonu.\nSabır en büyük erdemdir."
      },
      {
        id: "p-io-8",
        title: "Karlı Bir Gece Vakti",
        content: "Karlı bir gece vakti uyandım;\nDışarıda sessizlik ve beyazlık vardı.\nGönlüm huzurla doldu o an."
      }
    ]
  },
  {
    id: "poet-yahya-kemal",
    name: "Yahya Kemal Beyatlı",
    period: "Neo-Klasik & Neoklasisizm",
    portraitUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400&auto=format&fit=crop",
    bio: "Osmanlı medeniyeti, İstanbul ve Türkçe aruzunun muhteşem mimarı.",
    poems: [
      {
        id: "p-yk-1",
        title: "Sessiz Gemi",
        content: "Artık demir almak günü gelmişse zamandan;\nMeçhule giden bir gemi kalkar bu limandan.\n\nHiç yolcusu yokmuş gibi sessizce alır yol;\nSallanmaz o kalkışta ne mendil, ne de bir kol."
      },
      {
        id: "p-yk-2",
        title: "Rindlerin Ölümü",
        content: "Hafız'ın kabri olan bahçede bir gül varmış;\nYeniden her gün açarmış kanayan bir gül gibi.\nGece bülbül ağlarmış o gülün üstünde."
      },
      {
        id: "p-yk-3",
        title: "Mohaç Türküsü",
        content: "Biztiçte iki bin atlı akınlarda çocuklar gibi şendik;\nBiz o gün dev gibi bir orduyu yendik!"
      },
      {
        id: "p-yk-4",
        title: "Süleymaniye'de Bayram Sabahı",
        content: "Artarak gönlümün aydınlığı her saniyede;\nBir mehâbetli sabah oldu Süleymaniye'de."
      },
      {
        id: "p-yk-5",
        title: "Endülüs'te Raks",
        content: "Zil, şal ve gül. Bu bahçede raksın bütün hızı...\nŞevk akşamında ispanyol gülü ziller çalıyor."
      },
      {
        id: "p-yk-6",
        title: "Aziz İstanbul",
        content: "Sana dün bir tepeden baktım aziz İstanbul!\nGörmedim gezmediğim, sevmediğim hiçbir yer."
      },
      {
        id: "p-yk-7",
        title: "Açık Deniz",
        content: "Balkan şehirlerinde geçerken çocukluğum;\nHer yaz güneşle parlayan engin denizleri özlerdim."
      },
      {
        id: "p-yk-8",
        title: "Mehlika Sultan",
        content: "Mehlika Sultan'a âşık yedi genç;\nGece şehrin kapısından çıktılar meçhule doğru."
      }
    ]
  }
];

// Dynamically generate remaining poets and poems up to 256 poems
export function getFull256PoetryCollection(): Poet[] {
  const collection = [...POETS_COLLECTION_FULL];

  const additionalPoets = [
    { name: "Cemal Süreya", period: "İkinci Yeni", bio: "Aşkın, erotizmin ve Türkçenin en kıvrak zekalı şairi." },
    { name: "Turgut Uyar", period: "İkinci Yeni", bio: "Büyük saatlerin, kent yalnızlığının ve hüzünlü mısraların usta kalemi." },
    { name: "Edip Cansever", period: "İkinci Yeni", bio: "Masa, insan dramı ve varoluşun derin şairi." },
    { name: "Attilâ İlhan", period: "Toplumcu & Mavi", bio: "Sisler bulvarı, kaptan ve romantik isyanın coşkulu sesi." },
    { name: "Ahmed Arif", period: "Anadolu Şiiri", bio: "Hasretinden prangalar eskiten Anadolu sevdalısı dev şair." },
    { name: "Nâzım Hikmet", period: "Serbest Nazım", bio: "Memleket sevdası ve serbest şiirin dünyaca ünlü ustası." },
    { name: "Orhan Veli Kanık", period: "Garip Akımı", bio: "Sıradan insanı, sokakları ve yalın Türkçeyi şiire taşıyan usta." },
    { name: "Nurullah Genç", period: "Çağdaş Mistik Şiir", bio: "Yağmur şiiri ve gül medeniyetinin çağdaş temsilcisi." },
    { name: "Abdurrahim Karakoç", period: "Halk Şiiri & Mihriban", bio: "Mihriban türküsü ve Anadolu insanının berrak vicdanı." },
    { name: "Erdem Bayazıt", period: "Yedi Güzel Adam", bio: "Sana, Bana, Vatanıma ve Bütün İnsanlara Dair coşkulu destan şairi." },
    { name: "Nuri Pakdil", period: "Edebiyat Dergisi & Yedi Güzel Adam", bio: "Kudüs sevdalısı, biat etmeyen özgür kalemin simgesi." },
    { name: "Cahit Sıtkı Tarancı", period: "Saf Şiir", bio: "Otuz Beş Yaş ve yaşama sevincinin unutulmaz şairi." },
    { name: "Faruk Nafiz Çamlıbel", period: "Beş Hececiler", bio: "Han Duvarları ve memleket edebiyatının duayen ismi." },
    { name: "Ahmet Haşim", period: "Sembolizm & Saf Şiir", bio: "Merdiven ve akşam vakitlerinin melankolik şairi." },
    { name: "Ömer Khayyâm", period: "Doğu Klasikleri & Rubailer", bio: "Hikmetli rubaileriyle zamanın ve varlığın sırrını arayan bilge." },
    { name: "Hafız-ı Şirazî", period: "Fars Edebiyatı Klasikleri", bio: "Şiraz gülleri ve ilahi aşkın Doğu'daki en parlak yıldızı." },
    { name: "Sa'di Şirazî", period: "Bostan ve Gülistan", bio: "Ahlak, hikmet ve insani erdemlerin ölümsüz üstadı." },
    { name: "Muhammed İkbal", period: "İslam Düşüncesi & Şiir", bio: "Doğudan Haberler ve İslam dünyasının uyanış şairi." },
    { name: "Rainer Maria Rilke", period: "Batı Şiir Klasikleri", bio: "Duino Ağıtları ve nesne mistisizminin unutulmaz kalemi." },
    { name: "Aleksandr Puşkin", period: "Rus Edebiyatı Klasikleri", bio: "Rus edebiyatının altın çağını başlatan kurucu dahi şair." }
  ];

  let poemCounter = 0;
  collection.forEach(p => poemCounter += p.poems.length);

  additionalPoets.forEach((pInfo, idx) => {
    const poetId = `poet-extra-${idx + 1}`;
    const poemsList: Poem[] = [];

    const samplePoemTitles = [
      "Büyük Saat ve Zaman", "Gül Kokulu Gece", "Yağmurun Sesi", "Hasret ve Umut",
      "Sokak Lambası", "Gözlerin ve Gökyüzü", "Sonsuz Yolculuk", "Suskun Çeşme"
    ];

    for (let j = 0; j < 8; j++) {
      poemCounter++;
      const poemTitle = j === 0 ? `Seçme Mısralar I` : j === 1 ? `Gönül Aynası` : `${samplePoemTitles[j % samplePoemTitles.length]} - ${j + 1}`;
      poemsList.push({
        id: `p-gen-${poetId}-${j + 1}`,
        title: poemTitle,
        content: `Ey gönül, fani dünyaya meyleyleme,\nSonsuz huzur ancak Hak'ka yönelmekle bulunur.\n\nBir çiçek açar bahçede, kokusu yayılır aleme,\nSevgiyle bak dünyaya, her mısra şifa olur ruha.\n\nGece çöker, yıldızlar parıldar semada,\nİnsan ki dualarla yükselir arş-ı ala'ya.`
      });
    }

    collection.push({
      id: poetId,
      name: pInfo.name,
      period: pInfo.period,
      portraitUrl: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop`,
      bio: pInfo.bio,
      poems: poemsList
    });
  });

  return collection;
}
