// The dive from the surface to the bottom of the Mariana Trench. `at` = [start, end] of a
// zone on the dive timeline (0 = surface, 1 = bottom). Real zones are very uneven (the sunlit
// one is 200 m, the trench one ~5 000 m), so every zone gets about the same share of scroll
// and the depth runs linearly inside its own range.

export const MAX_DEPTH = 10_935 // Challenger Deep, m

export const ZONES = [
  {
    key: 'epi',
    name: 'Günəşli zona',
    sci: 'Epipelagik',
    range: [0, 200],
    at: [0.05, 0.22],
    text: 'Günəş işığı buraya qədər çatır. Fitoplankton fotosintez edir və dəniz həyatının ~90%-i bu nazik qatda yaşayır.',
  },
  {
    key: 'meso',
    name: 'Alatoran zona',
    sci: 'Mezopelagik',
    range: [200, 1000],
    at: [0.22, 0.39],
    text: 'İşıq solğun göy parıltıya çevrilir, bitkilər yaşaya bilmir. Canlılar artıq özləri parlayır və ilk "dəniz qarı" yağır.',
  },
  {
    key: 'bathy',
    name: 'Gecəyarısı zonası',
    sci: 'Batipelagik',
    range: [1000, 4000],
    at: [0.39, 0.58],
    text: 'Günəş işığı heç vaxt çatmır. Yeganə işıq canlıların öz parıltısıdır, su ~4 °C-dir.',
  },
  {
    key: 'abysso',
    name: 'Uçurum',
    sci: 'Abissopelagik',
    range: [4000, 6000],
    at: [0.58, 0.75],
    text: 'Donmağa yaxın soyuq və sonsuz palçıqlı düzənliklər. Okean dibinin böyük hissəsi belədir.',
  },
  {
    key: 'hadal',
    name: 'Çökəklik zonası',
    sci: 'Hadal',
    range: [6000, MAX_DEPTH],
    at: [0.75, 0.94],
    text: 'Yalnız dərin çökəkliklərdə olur. Təzyiq səthdəkindən ~1 100 dəfə çoxdur: baş barmağın üstündə ~1 ton.',
  },
]

// The intro (0 m) before the first zone, the bottom (MAX_DEPTH) after the last
export const DEPTH = {
  points: [0, ...ZONES.map((z) => z.at[0]), ZONES.at(-1).at[1], 1],
  meters: [0, ...ZONES.map((z) => z.range[0]), MAX_DEPTH, MAX_DEPTH],
}

// Water colour [top, bottom of the screen] at dive points: turquoise → blue → indigo → black
export const WATER = {
  points: [0, 0.05, 0.22, 0.39, 0.58, 1],
  top: ['#22b8d8', '#1aa7cc','#075985', '#0b1640', '#03040b', '#010103'],
  bottom: ['#0ea5e9', '#0369a1', '#1e3a8a', '#060a24', '#010206', '#000000'],
}

// Scroll track height: ≈ 4–5 s of calm scrolling per zone (~50vh/s)
export const DIVE_VH = 1400

/** Pressure in atm: 1 at the surface, +1 for every ~10 m of seawater. */
export const pressureAt = (m) => 1 + m / 10.06

// Water temperature (°C) by depth: warm surface, thermocline, then near-freezing
const TEMP = [
  [0, 25],
  [200, 15],
  [1000, 4],
  [4000, 2],
  [6000, 1.5],
  [MAX_DEPTH, 2.5],
]

export const temperatureAt = (m) => {
  for (let i = 1; i < TEMP.length; i++) {
    const [m1, t1] = TEMP[i]
    if (m <= m1) {
      const [m0, t0] = TEMP[i - 1]
      return t0 + ((m - m0) / (m1 - m0)) * (t1 - t0)
    }
  }
  return TEMP.at(-1)[1]
}

/** Sunlight left (% of the surface): 1% at 200 m, practically none past 1 000 m. */
export const lightAt = (m) => 100 * Math.exp((-m * Math.log(100)) / 200)

/** Index of the zone at a depth (0 at the surface). */
export const zoneAt = (m) => {
  const i = ZONES.findIndex((z) => m < z.range[1])
  return i === -1 ? ZONES.length - 1 : i
}
