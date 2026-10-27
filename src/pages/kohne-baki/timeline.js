// 900 years of Baku seen from one spot on the Caspian shore. The camera never moves: scroll
// moves time. `at` = [start, end] of an era on the timeline (0 = intro, 1 = today); every era
// gets about the same share of scroll and the year runs linearly inside its own `years`.
// The whole timeline is also one day: dawn in the Middle Ages, night today (see SKY).

export const FIRST_YEAR = 1078 // Sınıqqala minaret, the oldest dated building in İçərişəhər
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
    years: [1500, 1846],
    at: [0.2, 0.25],
    text: 'Şəhər yüz illərlə qala divarları içində yaşayır. Torpağın altında isə "qara qızıl" gözləyir…',
    titleClass: 'font-old text-amber-100 drop-shadow-[0_2px_10px_rgba(60,30,0,0.8)]',
    short: true, // a fast-forward: only a small banner
  },
  {
    key: 'oil',
    name: 'Neft bumu',
    years: [1846, 1880],
    at: [0.25, 0.4],
    text: 'Dünyada ilk qazılmış neft quyusu. Taxta buruqlar meşə kimi çoxalır, şəhər neftlə zənginləşir.',
    titleClass: 'font-old text-[#f3e2c0] drop-shadow-[0_2px_10px_rgba(40,25,10,0.9)]',
  },
  {
    key: 'millionaires',
    name: 'Milyonçuların Bakısı',
    years: [1880, 1918],
    at: [0.4, 0.55],
    text: 'Neft milyonçuları saraylar, teatrlar və məktəblər tikdirir. Dənizin sahilində bulvar salınır.',
    titleClass: 'font-old text-[#fff3dc] drop-shadow-[0_2px_10px_rgba(60,35,10,0.8)]',
  },
  {
    key: 'republic',
    name: 'Cümhuriyyət',
    years: [1918, 1920],
    at: [0.55, 0.63],
    text: 'Azərbaycan Xalq Cümhuriyyəti: Şərqdə ilk parlamentli respublika. Bakı onun paytaxtı olur.',
    titleClass: 'font-old text-white drop-shadow-[0_2px_12px_rgba(80,20,30,0.9)]',
  },
  {
    key: 'soviet',
    name: 'Sovet Bakısı',
    years: [1920, 1991],
    at: [0.63, 0.8],
    text: 'Geniş meydanlar, ağır daş binalar, dənizin ortasında neft şəhəri.',
    titleClass: 'font-display uppercase tracking-wider text-[#f4e9d8] drop-shadow-[0_3px_0_rgba(140,30,30,0.9)]',
  },
  {
    key: 'today',
    name: 'Bugünkü Bakı',
    years: [1991, LAST_YEAR],
    at: [0.8, 0.96],
    text: 'Müstəqil Azərbaycanın paytaxtı. Gecələr təpənin üstündə Alov qüllələri yanır.',
    titleClass: 'font-display text-cyan-100 drop-shadow-[0_0_18px_rgba(103,232,249,0.8)]',
  },
]

// Each era opens with its title banner for TITLE of the timeline (TITLE_SHORT for a fast-forward)
export const TITLE = 0.04
export const TITLE_SHORT = 0.025

// The year at every era boundary: intro at the first year, today held to the end
export const YEAR = {
  points: [0, ...ERAS.map((e) => e.at[0]), ERAS.at(-1).at[1], 1],
  years: [FIRST_YEAR, ...ERAS.map((e) => e.years[0]), LAST_YEAR, LAST_YEAR],
}

// One day across 900 years. Colours at timeline points (era middles):
// pre-dawn → dawn (miniature) → hazy noon (sepia) → golden afternoon (postcard) → sunset
// → red dusk (Soviet poster) → night (neon)
const DAY = [0, 0.12, 0.32, 0.47, 0.59, 0.72, 0.88, 1]
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
// Paper grain over the picture: thick in the old "drawings", none in today's night
export const GRAIN = {
  points: [0, 0.12, 0.32, 0.47, 0.63, 0.8, 1],
  opacity: [0.25, 0.25, 0.45, 0.25, 0.15, 0, 0],
}

// Every stop (for now: the era titles) is a point on the timeline; around it time slows to a
// crawl for HOLD so the text can be read
export const HOLD = 0.006

for (const era of ERAS) era.title = era.at[0] + (era.short ? TITLE_SHORT : TITLE) / 2

const STOPS = ERAS.map((e) => e.title)

/** [start, end] of a stop's hold on the timeline. */
export const holdRange = (at) => [at - HOLD / 2, at + HOLD / 2]

// Scroll track. Between stops the whole timeline would be BASE_VH long; each hold is
// instead HOLD_VH of scroll (≈ 2,5 s at a calm scrolling pace, ~50vh/s)
const BASE_VH = 2400
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

/** Index of the era at a year. */
export const eraAt = (year) => {
  const i = ERAS.findIndex((e) => year < e.years[1])
  return i === -1 ? ERAS.length - 1 : i
}
