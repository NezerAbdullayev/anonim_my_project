// A thousand years of Baku seen from one spot on the Caspian shore. The camera never moves:
// scroll moves time. `at` = [start, end] of an era on the timeline (0 = intro, 1 = today); every
// era gets about the same share of scroll and the year runs linearly inside its own `years`.
// The whole timeline is also one day: dawn in the Middle Ages, night today (see SKY).
// BUILDINGS go up on the hills at their real year, each with a note pointing at it.

export const FIRST_YEAR = 1000 // a little before the oldest dated building (Sınıqqala minaret, 1078)
export const LAST_YEAR = 2026

export const ERAS = [
  {
    key: 'medieval',
    name: 'Orta əsr Bakısı',
    years: [FIRST_YEAR, 1500],
    at: [0.04, 0.2],
    text: 'Qala divarları arasında İçərişəhər böyüyür: minarələr, saray, karvansaralar.',
    titleClass: 'font-old text-amber-200 drop-shadow-[0_2px_10px_rgba(60,30,0,0.8)]',
  },
  {
    key: 'centuries',
    name: 'Əsrlər keçir',
    years: [1500, 1840],
    at: [0.2, 0.25],
    text: 'Şəhər yüz illərlə qala divarları içində yaşayır. Torpağın altında isə "qara qızıl" gözləyir…',
    titleClass: 'font-old text-amber-100 drop-shadow-[0_2px_10px_rgba(60,30,0,0.8)]',
    short: true, // a fast-forward: only a small banner
  },
  {
    key: 'oil',
    name: 'Neft bumu',
    years: [1840, 1880],
    at: [0.25, 0.42],
    text: 'Dünyada ilk qazılmış neft quyusu. Taxta buruqlar meşə kimi çoxalır, şəhər neftlə zənginləşir.',
    titleClass: 'font-old text-[#f3e2c0] drop-shadow-[0_2px_10px_rgba(40,25,10,0.9)]',
  },
  {
    key: 'millionaires',
    name: 'Milyonçuların Bakısı',
    years: [1880, 1918],
    at: [0.42, 0.55],
    text: 'Neft milyonçuları saraylar, teatrlar və məktəblər tikdirir. Dənizin sahilində bulvar salınır.',
    titleClass: 'font-old text-[#fff3dc] drop-shadow-[0_2px_10px_rgba(60,35,10,0.8)]',
  },
  {
    key: 'republic',
    name: 'Cümhuriyyət',
    years: [1918, 1920],
    at: [0.55, 0.65],
    text: 'Azərbaycan Xalq Cümhuriyyəti: Şərqdə ilk parlamentli respublika. Bakı onun paytaxtı olur.',
    titleClass: 'font-old text-white drop-shadow-[0_2px_12px_rgba(80,20,30,0.9)]',
  },
  {
    key: 'soviet',
    name: 'Sovet Bakısı',
    years: [1920, 1991.8],
    at: [0.65, 0.82],
    // the late 1980s get more scroll than their share, so 20 January 1990 has room
    anchors: [
      [1920, 0],
      [1989, 0.75],
      [1990.5, 0.9],
      [1991.8, 1],
    ],
    text: 'Geniş meydanlar, ağır daş binalar, dənizin ortasında neft şəhəri.',
    titleClass: 'font-display uppercase tracking-wider text-[#f4e9d8] drop-shadow-[0_3px_0_rgba(140,30,30,0.9)]',
  },
  {
    key: 'today',
    name: 'Bugünkü Bakı',
    years: [1991.8, LAST_YEAR],
    at: [0.82, 0.96],
    // 2010–2012 changed the skyline the most: they get the most scroll
    anchors: [
      [1991.8, 0],
      [2010.5, 0.35],
      [2012.6, 0.9],
      [LAST_YEAR, 1],
    ],
    text: 'Müstəqil Azərbaycanın paytaxtı. Gecələr təpənin üstündə Alov qüllələri yanır.',
    titleClass: 'font-display text-cyan-100 drop-shadow-[0_0_18px_rgba(103,232,249,0.8)]',
  },
]

/** Index of the era at a year. */
export const eraAt = (year) => {
  const i = ERAS.findIndex((e) => year < e.years[1])
  return i === -1 ? ERAS.length - 1 : i
}

// Each era opens with its title banner for TITLE of the timeline (TITLE_SHORT for a fast-forward)
export const TITLE = 0.04
export const TITLE_SHORT = 0.025

const titleSpan = (era) => (era.short ? TITLE_SHORT : TITLE)

// How an era's run is shared out between its years: [year, fraction of the run]. Evenly by
// default; an era's `anchors` can give some years more scroll than others.
const anchorsOf = (era) => era.anchors ?? [[era.years[0], 0], [era.years[1], 1]]
const runOf = (era) => [era.at[0] + titleSpan(era), era.at[1]]

// While an era's title is up the year waits at the era's first year, then runs through the era
const timeAt = (era, year) => {
  const a = anchorsOf(era)
  const [r0, r1] = runOf(era)
  let i = 1
  while (i < a.length - 1 && year > a[i][0]) i++
  const [y0, f0] = a[i - 1]
  const [y1, f1] = a[i]
  return r0 + (f0 + ((year - y0) / (y1 - y0)) * (f1 - f0)) * (r1 - r0)
}

// The year along the timeline: intro at the first year, today held to the end
export const YEAR = { points: [0], years: [FIRST_YEAR] }
for (const era of ERAS) {
  YEAR.points.push(era.at[0])
  YEAR.years.push(era.years[0])
  for (const [year] of anchorsOf(era).slice(0, -1)) {
    YEAR.points.push(timeAt(era, year))
    YEAR.years.push(year)
  }
}
YEAR.points.push(ERAS.at(-1).at[1], 1)
YEAR.years.push(LAST_YEAR, LAST_YEAR)

// Moments of remembrance: the picture loses its colour and dims, one quiet line, no image
export const MEMORIALS = [
  {
    key: 'march-1918',
    era: 'republic',
    year: 1918.24,
    when: 'Mart 1918',
    text: 'Bakıda mart qırğınlarında minlərlə dinc azərbaycanlı həlak olur. 31 mart Azərbaycanda Soyqırımı Günü kimi anılır.',
  },
  {
    key: 'black-january',
    era: 'soviet',
    year: 1990.05,
    when: '20 Yanvar 1990',
    text: 'Sovet qoşunları Bakıya yeridilir, 130-dan çox dinc sakin həlak olur. Onlar Şəhidlər xiyabanında uyuyur.',
  },
]

// The buildings, era by era. `year` = when it goes up (its note shows then), `when` = how the
// note dates it, `x` = where it stands in the panorama (0–1440, see Panorama.jsx), `top` = the
// height of its top there (the note's line points at it).
export const BUILDINGS = [
  {
    key: 'minaret',
    era: 'medieval',
    year: 1078,
    when: '1078',
    name: 'Sınıqqala minarəsi',
    text: 'İçərişəhərin tarixi yazılmış ən qədim tikilisi. Məscidin girişindəki yazı onun ilini göstərir.',
    x: 690,
    top: 150,
  },
  {
    key: 'walls',
    era: 'medieval',
    year: 1130,
    when: '12-ci əsr',
    name: 'Qala divarları',
    text: 'Şəhər qoşa divarla əhatə olunur. Divarların içi bu gün də İçərişəhər adlanır.',
    x: 560,
    top: 214,
  },
  {
    key: 'maiden-tower',
    era: 'medieval',
    year: 1200,
    when: '12-ci əsr',
    name: 'Qız qalası',
    text: '~30 m hündürlüyündə daş qala. Nə vaxt və nə üçün tikildiyi hələ də mübahisəlidir.',
    x: 860,
    top: 138,
  },
  {
    key: 'yanardag',
    era: 'medieval',
    year: 1290,
    when: '13-cü əsr',
    name: '"Odlar yurdu"',
    text: 'Marko Polo bu torpaqda yerdən çıxan və yanan "yağ" haqqında yazır. Abşeronda yer alovları əsrlərlə sönmür.',
    x: 1290,
    top: 52,
  },
  {
    key: 'shirvanshah',
    era: 'medieval',
    year: 1435,
    when: '15-ci əsr',
    name: 'Şirvanşahlar sarayı',
    text: 'Şirvan hökmdarlarının sarayı: türbə, məscid, divanxana. Türbənin üzərindəki yazı 1435-ci ili göstərir.',
    x: 600,
    top: 166,
  },
  {
    key: 'caravanserai',
    era: 'medieval',
    year: 1480,
    when: '15-ci əsr',
    name: 'Karvansaralar',
    text: 'İpək yolunun tacirləri burada dincəlir: Multani və Buxara karvansaraları bu gün də durur.',
    x: 770,
    top: 202,
  },
  {
    key: 'first-well',
    era: 'oil',
    year: 1846,
    when: '1846',
    name: 'İlk qazılmış quyu',
    text: 'Bibiheybətdə 21 m-lik quyu qazılır: əllə yox, qazma ilə açılan ilk neft quyusu sayılır. Amerikada ilk quyu 1859-da qazıldı.',
    x: 300,
    base: 189,
    top: 150,
  },
  {
    key: 'black-city',
    era: 'oil',
    year: 1872,
    when: '1872',
    name: 'Qara şəhər',
    text: 'Neft zavodları şəhərdən kənara köçürülür. 1874-cü ilə burada 120-dən çox zavod var, hisdən hər şey qaralır.',
    x: 1170,
    base: 190,
    top: 128,
    removed: 2011,
  },
  {
    key: 'derricks',
    era: 'oil',
    year: 1875,
    when: '1870-ci illər',
    name: 'Buruq meşəsi',
    text: 'Neft torpaqları hərraca çıxır (1872) və Balaxanıda buruqlar meşə kimi çoxalır. Fontan vuran quyular günlərlə neft püskürür.',
    x: 1320,
    base: 182,
    top: 118,
    removed: 1950,
  },
  {
    key: 'derricks-west',
    era: 'oil',
    year: 1875,
    silent: true, // goes up with the Balaxanı derricks, no note of its own
    x: 260,
    base: 185,
    removed: 1950,
  },
  {
    key: 'zoroaster',
    era: 'oil',
    year: 1878,
    when: '1878',
    name: '"Zoroastr" tankeri',
    text: 'Nobel qardaşlarının sifarişi ilə tikilən dünyanın ilk neft tankeri. Nefti çəlləklərdə yox, birbaşa gəminin içində daşıyır.',
    x: 880,
    base: 340,
    top: 300,
    removed: 1905,
  },
  {
    key: 'theatre',
    era: 'millionaires',
    year: 1883,
    when: '1883',
    name: 'Tağıyev teatrı',
    text: 'Neft milyonçusu Hacı Zeynalabdin Tağıyevin tikdirdiyi ilk teatr binası. 1908-də burada Şərqin ilk operası "Leyli və Məcnun" səhnəyə qoyulur.',
    x: 1075,
    base: 213,
    top: 167,
  },
  {
    key: 'girls-school',
    era: 'millionaires',
    year: 1901,
    when: '1901',
    name: 'Tağıyevin qızlar məktəbi',
    text: 'Müsəlman qızları üçün ilk dünyəvi məktəblərdən biri. Bu bina tezliklə tarixdə daha böyük rol oynayacaq…',
    x: 1000,
    base: 230,
    top: 180,
  },
  {
    key: 'boulevard',
    era: 'millionaires',
    year: 1909,
    when: '1909',
    name: 'Dənizkənarı bulvar',
    text: 'Şəhər Duması sahildə bulvar salmağa qərar verir. Neft şəhərinin çılpaq sahilində ilk ağaclar əkilir.',
    x: 720,
    base: 298,
    top: 270,
  },
  {
    key: 'ismailiyya',
    era: 'millionaires',
    year: 1913,
    when: '1913',
    name: 'İsmailiyyə',
    text: 'Musa Nağıyevin oğlunun xatirəsinə tikdirdiyi Venesiya qotikası üslubunda saray. Bu illərdə Mailov teatrı (1911) və Muxtarov sarayı (1912) da ucalır.',
    x: 430,
    base: 215,
    top: 162,
  },
  {
    key: 'parliament',
    era: 'republic',
    year: 1918.93,
    when: '7 dekabr 1918',
    name: 'Cümhuriyyətin parlamenti',
    text: 'Şərqdə ilk parlament Tağıyevin qızlar məktəbinin binasında açılır. Üçrəngli bayraq 9 noyabr 1918-də qəbul edilib.',
    x: 1000,
    base: 180,
    top: 148,
    removed: 1920.33, // the Republic falls in April 1920 and its flag comes down
  },
  {
    key: 'university',
    era: 'republic',
    year: 1919.67,
    when: '1 sentyabr 1919',
    name: 'Bakı Universiteti',
    text: 'Parlament universitetin yaradılması haqqında qanun qəbul edir. Azərbaycanın ilk universiteti açılır.',
    x: 180,
    base: 88,
    top: 52,
  },
  {
    key: 'government-house',
    era: 'soviet',
    year: 1936,
    built: 1952, // keeps going up after its note
    when: '1936–1952',
    name: 'Hökumət evi',
    text: 'Sahildə nəhəng daş bina tikilməyə başlayır. Tikinti 16 il çəkir: müharibə illərində iş dayanır.',
    x: 960,
    base: 296,
    top: 224,
  },
  {
    key: 'neft-dashlari',
    era: 'soviet',
    year: 1949.85,
    when: '7 noyabr 1949',
    name: 'Neft Daşları',
    text: 'Dənizin dibindən, ~1 100 m dərinlikdən neft çıxır. Sahildən ~40 km aralıda, dəmir estakadalar üstündə bütöv bir şəhər qurulur.',
    x: 1330,
    base: 312,
    top: 290,
  },
  {
    key: 'pumpjacks',
    era: 'soviet',
    year: 1950,
    silent: true, // the nodding pumps take over from the wooden derricks
    x: 1320,
    base: 182,
  },
  {
    key: 'funicular',
    era: 'soviet',
    year: 1960.34,
    when: '5 may 1960',
    name: 'Funikulyor',
    text: 'Dənizkənarından təpəyə qalxan kanat yolu açılır. Vaqonlar bu gün də işləyir.',
    x: 440,
    base: 226,
    top: 186,
  },
  {
    key: 'metro',
    era: 'soviet',
    year: 1967.85,
    when: '6 noyabr 1967',
    name: 'Bakı metrosu',
    text: 'Beş stansiya ilə metro açılır. Stansiyalar saray kimi bəzədilir.',
    x: 620,
    base: 296,
    top: 268,
  },
  {
    key: 'tv-tower',
    era: 'today',
    year: 1996.51,
    when: '6 iyul 1996',
    name: 'TV qülləsi',
    text: '310 m hündürlüyündə qüllə: 1979-da başlanan tikinti illərlə dayanır, nəhayət 1996-da açılır.',
    x: 360,
    base: 104,
    top: 30,
  },
  {
    key: 'flag-square',
    era: 'today',
    year: 2010.67,
    when: '2010',
    name: 'Dövlət Bayrağı Meydanı',
    text: 'Bayıl burnunda 162 m-lik dirəkdə üçrəngli bayraq dalğalanır: Cümhuriyyətin bayrağı yenidən şəhərin üstündədir.',
    x: 110,
    base: 172,
    top: 70,
  },
  {
    key: 'crystal-hall',
    era: 'today',
    year: 2010.67,
    silent: true, // on the same cape as the flag
    x: 175,
    base: 177,
  },
  {
    key: 'white-city',
    era: 'today',
    year: 2011.2,
    when: '2010-cu illər',
    name: 'Ağ şəhər',
    text: 'Qara şəhərin köhnə zavodlarının yerində yeni, ağ bir məhəllə salınır.',
    x: 1170,
    base: 190,
    top: 140,
  },
  {
    key: 'flame-towers',
    era: 'today',
    year: 2011.9, // finished in 2012; its note comes a little earlier to leave room
    when: '2012',
    name: 'Alov qüllələri',
    text: 'Üç qüllə, ən hündürü 182 m. Gecələr fasadları alov kimi yanır: "Odlar yurdu" yenə odlar içindədir.',
    x: 600,
    base: 157,
    top: 84,
    line: 1, // a short line: the towers are tall, the note would reach the year counter
  },
  {
    key: 'heydar-aliyev-center',
    era: 'today',
    year: 2012.36,
    when: '10 may 2012',
    name: 'Heydər Əliyev Mərkəzi',
    text: 'Zaha Hadidin layihəsi: bircə düz xətti olmayan, dalğa kimi əyilən ağ bina.',
    x: 1060,
    base: 92,
    top: 58,
  },
]

// One day across 900 years. Colours at timeline points (era middles):
// pre-dawn → dawn (miniature) → hazy noon (sepia) → golden afternoon (postcard) → sunset
// → red dusk (Soviet poster) → night (neon)
const DAY = [0, 0.12, 0.335, 0.485, 0.6, 0.735, 0.89, 1]
export const SKY = {
  points: DAY,
  top: ['#1f1d47', '#3b6fb6', '#a89a7c', '#7fa7c9', '#5b4b8a', '#2b2d42', '#050816', '#050816'],
  bottom: ['#7c5a8a', '#f6c98a', '#d9c9a3', '#f2d39b', '#f08a4b', '#b5523b', '#1b2a4a', '#1b2a4a'],
}
export const SEA = {
  points: DAY,
  top: ['#3a3560', '#4f86b8', '#8c7f63', '#4f8aa8', '#7a4f6e', '#4a3a48', '#0f1a33', '#0f1a33'],
  bottom: ['#141430', '#1f4f7a', '#5e5440', '#245a73', '#2d2448', '#1a1620', '#03060f', '#03060f'],
}
// The hills the city climbs (Baku's "amphitheatre" around the bay)
export const HILLS = {
  points: DAY,
  far: ['#3a3256', '#d9b27a', '#9c8a68', '#c9a678', '#7a4a5a', '#5a3434', '#0d1428', '#0d1428'],
  near: ['#2a2540', '#c48e4e', '#7a6a4f', '#b08a5a', '#5a3b4a', '#3a2c2c', '#080d1c', '#080d1c'],
}
// Sepia over the picture: none in the miniature, strong in the engraving, half in the postcard
export const TINT = {
  points: [0, 0.2, 0.27, 0.41, 0.49, 0.6, 0.66, 1],
  opacity: [0, 0, 0.8, 0.8, 0.35, 0.25, 0, 0],
}
// Paper grain over the picture: thick in the old "drawings", none in today's night
export const GRAIN = {
  points: [0, 0.12, 0.335, 0.485, 0.65, 0.82, 1],
  opacity: [0.25, 0.25, 0.45, 0.25, 0.15, 0, 0],
}

// Every stop (an era title or a building's note) is a point on the timeline; around it time
// slows to a crawl for HOLD so the text can be read
export const HOLD = 0.006
// The longest a note is on screen either side of its point (timeline progress)
const MAX_SPAN = 0.012

for (const era of ERAS) era.title = era.at[0] + titleSpan(era) / 2

// Place every building at its real year. Its note may stay on screen until halfway to the
// neighbouring notes, but not over its era's title (before it) or the next era's (after it).
// A `silent` building goes up with the note before it; a `removed` one fades away in that year.
const eraOf = (year) => ERAS[eraAt(year)]
// A building with `built` keeps going up after its note until that year.
// Memorials take their place among the notes the same way.
for (const b of BUILDINGS) if (b.removed) b.goneAt = timeAt(eraOf(b.removed), b.removed)
for (const b of BUILDINGS) if (b.built) b.builtAt = timeAt(eraOf(b.built), b.built)
for (const era of ERAS) {
  const list = [...BUILDINGS, ...MEMORIALS]
    .filter((b) => b.era === era.key && !b.silent)
    .sort((a, b) => a.year - b.year)
  BUILDINGS.filter((b) => b.era === era.key && b.silent).forEach((b) => (b.at = timeAt(era, b.year)))
  list.forEach((b) => (b.at = timeAt(era, b.year)))
  list.forEach((b, i) => {
    const before = i ? (b.at - list[i - 1].at) / 2 : b.at - (era.at[0] + titleSpan(era))
    const after = i < list.length - 1 ? (list[i + 1].at - b.at) / 2 : era.at[1] - b.at
    b.span = Math.min(MAX_SPAN, before, after)
  })
}

export const NOTES = BUILDINGS.filter((b) => !b.silent)

// The final card, after today's era: time stands still there for one more hold
export const FINALE = 0.98

const STOPS = [...ERAS.map((e) => e.title), ...NOTES.map((b) => b.at), ...MEMORIALS.map((m) => m.at), FINALE].sort(
  (a, b) => a - b
)

/** [start, end] of a stop's hold on the timeline. */
export const holdRange = (at) => [at - HOLD / 2, at + HOLD / 2]

// Scroll track. Between stops the whole timeline would be BASE_VH long; each hold is
// instead HOLD_VH of scroll (≈ 2,5 s at a calm scrolling pace, ~50vh/s)
const BASE_VH = 3200
const HOLD_VH = 120

const buildTrack = () => {
  const time = [0]
  const scroll = [0]
  let vh = 0
  let last = 0
  for (const at of STOPS) {
    const [h0, h1] = holdRange(at)
    vh += (h0 - last) * BASE_VH
    time.push(h0)
    scroll.push(vh)
    vh += HOLD_VH
    time.push(h1)
    scroll.push(vh)
    last = h1
  }
  vh += (1 - last) * BASE_VH
  time.push(1)
  scroll.push(vh)
  return { vh: Math.round(vh), scroll: scroll.map((s) => s / vh), time }
}

/** Scroll progress (0..1) → timeline progress (0..1), and the track height in vh. */
export const TRACK = buildTrack()
