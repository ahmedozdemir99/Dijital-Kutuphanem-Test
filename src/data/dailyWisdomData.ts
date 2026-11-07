export interface DailyWisdom {
  id: number;
  text: string;
  source: string; // Kaynak / Müellif (e.g. "Buhârî, İlim 17", "Necip Fazıl Kısakürek", "Anonim")
  type: 'Hadis-i Şerif' | 'Özlü Söz' | 'Kısa Şiir' | 'Veciz Söz' | 'Kelâm-ı Kibâr';
}

export const DAILY_WISDOMS: DailyWisdom[] = [
  {
    id: 1,
    type: 'Hadis-i Şerif',
    text: 'İlim öğrenmek her Müslümana farzdır. İlim peşinde koşana melekler kanatlarını serer.',
    source: 'Hz. Muhammed (s.a.v.) — İbn Mâce, Mukaddime 17'
  },
  {
    id: 2,
    type: 'Kelâm-ı Kibâr',
    text: 'Edeb bir tâc imiş nûr-ı Hüdâ’dan, giy o tâcı emîn ol her belâdan.',
    source: 'Anonim'
  },
  {
    id: 3,
    type: 'Kısa Şiir',
    text: 'İlim ilim bilmektir, ilim kendin bilmektir / Sen kendini bilmezsin, ya nice okumaktır.',
    source: 'Yunus Emre'
  },
  {
    id: 4,
    type: 'Özlü Söz',
    text: 'Kamus bir milletin namusudur; hafızasını kaybeden toplumlar başkalarının kölesi olur.',
    source: 'Cemil Meriç'
  },
  {
    id: 5,
    type: 'Veciz Söz',
    text: 'Zamanını yönetemeyen kimse, hiçbir şeyi yönetemez.',
    source: 'İmâm-ı Gazâlî'
  },
  {
    id: 6,
    type: 'Hadis-i Şerif',
    text: 'İki nimet vardır ki insanların çoğu onların kıymetini bilmekte aldanmıştır: Sağlık ve boş vakit.',
    source: 'Hz. Muhammed (s.a.v.) — Buhârî, Rikâk 1'
  },
  {
    id: 7,
    type: 'Kelâm-ı Kibâr',
    text: 'Kişi noksanını bilmek gibi irfan olamaz.',
    source: 'Anonim'
  },
  {
    id: 8,
    type: 'Kısa Şiir',
    text: 'Kaderin üstünde bir kader vardır / Ne yapsalar boş göklerden gelen bir karar vardır.',
    source: 'Sezai Karakoç'
  },
  {
    id: 9,
    type: 'Özlü Söz',
    text: 'Aşk ile çalışan, yorulmaz; ilim ile düşünen, yanılmaz.',
    source: 'Neşet Ertaş'
  },
  {
    id: 10,
    type: 'Veciz Söz',
    text: 'Cahil ile sohbet etmek güçtür bilene; çünkü cahil ne gelirse söyler diline.',
    source: 'Mevlânâ Celâleddîn-i Rûmî'
  },
  {
    id: 11,
    type: 'Hadis-i Şerif',
    text: 'Sizin en hayırlınız, Kur’an-ı Kerim’i öğrenen ve öğreteninizdir.',
    source: 'Hz. Muhammed (s.a.v.) — Buhârî, Fezâilü’l-Kur’an 21'
  },
  {
    id: 12,
    type: 'Kelâm-ı Kibâr',
    text: 'Söz var iş bitirir, söz var baş yitirir.',
    source: 'Anonim'
  },
  {
    id: 13,
    type: 'Kısa Şiir',
    text: 'Tohum saç, bitmezse toprak utansın / Hedefe varmayan ok utansın / Yürü, durma, aşılmaz dağ utansın.',
    source: 'Necip Fazıl Kısakürek'
  },
  {
    id: 14,
    type: 'Özlü Söz',
    text: 'Gerçek hürriyet, zihni önyargılardan ve cehaletten kurtarmaktır.',
    source: 'Aliya İzzetbegoviç'
  },
  {
    id: 15,
    type: 'Veciz Söz',
    text: 'Kitapsız yaşamak; kör, sağır ve dilsiz yaşamaktır.',
    source: 'Seneca'
  },
  {
    id: 16,
    type: 'Hadis-i Şerif',
    text: 'Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.',
    source: 'Hz. Muhammed (s.a.v.) — Buhârî, İlim 11'
  },
  {
    id: 17,
    type: 'Kelâm-ı Kibâr',
    text: 'Sükûtun da bir dili vardır; anlamasını bilene en fasih kelamdır.',
    source: 'Anonim'
  },
  {
    id: 18,
    type: 'Kısa Şiir',
    text: 'Bize haber getiren Şark’ın gülü, ses versin / Hangi bağın bağıdır, hangi bağın bülbülü.',
    source: 'Yahya Kemal Beyatlı'
  },
  {
    id: 19,
    type: 'Özlü Söz',
    text: 'Aklın nuru dinî ilimlerdir, vicdanın ziyası medeniyet ilimleridir. İkisinin imtizacıyla hakikat tecelli eder.',
    source: 'Bediüzzaman Said Nursi'
  },
  {
    id: 20,
    type: 'Veciz Söz',
    text: 'Dünyada en büyük darlık, zihin darlığıdır.',
    source: 'Ahmet Hamdi Tanpınar'
  },
  {
    id: 21,
    type: 'Hadis-i Şerif',
    text: 'Ameller niyetlere göredir; herkes için ancak niyet ettiğinin karşılığı vardır.',
    source: 'Hz. Muhammed (s.a.v.) — Buhârî, Bed’ü’l-Vahy 1'
  },
  {
    id: 22,
    type: 'Kelâm-ı Kibâr',
    text: 'Elile yapmadığını diliyle övme, kalbiyle hissetmediğini sözüyle söyleme.',
    source: 'Anonim'
  },
  {
    id: 23,
    type: 'Kısa Şiir',
    text: 'Sana dar gelmeyecek makberi kimler kazsın? / "Gömelim gel seni tarihe!" desem, sığmazsın.',
    source: 'Mehmet Akif Ersoy'
  },
  {
    id: 24,
    type: 'Özlü Söz',
    text: 'Niyet akıbetin tohumudur; ne ekersen onu biçersin.',
    source: 'Şeyh Edebali'
  },
  {
    id: 25,
    type: 'Veciz Söz',
    text: 'Okumak bir gelenek, bir terbiye, bir ahlaktır.',
    source: 'Nihad Sâmi Banarlı'
  },
  {
    id: 26,
    type: 'Hadis-i Şerif',
    text: 'İnsanların en hayırlısı, insanlara en faydalı olanıdır.',
    source: 'Hz. Muhammed (s.a.v.) — Taberânî, el-Mu’cemü’l-Evsat 6/139'
  },
  {
    id: 27,
    type: 'Kelâm-ı Kibâr',
    text: 'Kem âlât ile kemâlât olmaz.',
    source: 'Anonim'
  },
  {
    id: 28,
    type: 'Kısa Şiir',
    text: 'Gözüm ki zerre kadar nura bi-karardır ben / Seninle ay gibi parlar, gün gibi nur saçarım.',
    source: 'Fuzûlî'
  },
  {
    id: 29,
    type: 'Özlü Söz',
    text: 'Bir kütüphane bin hapishane kapatır.',
    source: 'Voltaire'
  },
  {
    id: 30,
    type: 'Veciz Söz',
    text: 'Gerçek alim, bildikçe ne kadar az bildiğini fark eden kimsedir.',
    source: 'İbn Sînâ'
  }
];

export function getWisdomForDate(dateStr?: string): DailyWisdom {
  const d = dateStr ? new Date(dateStr) : new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % DAILY_WISDOMS.length;
  return DAILY_WISDOMS[index];
}
