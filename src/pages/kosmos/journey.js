// The route through the Solar System. `at` = [start, end] of a body's slot on the
// scroll timeline (0 = top, 1 = bottom); slots overlap a little so the next planet
// is already a dot in the distance while the current one flies past.
// `size` = on-screen diameter at its closest calm moment (vmin), `px` = render
// resolution cap of the disk (lowered to fit the screen), `side` = which side of the screen it passes on.

// The Sun's label is on screen at the start and hides as soon as scrolling begins
export const SUN = {
  name: 'Günəş',
  tagline: 'Sistemimizin ulduzu',
  facts: [
    'Diametr: ~1,39 mln km',
    'İçinə ~1,3 mln Yer sığar',
    'Sistemin kütləsinin ~99,86%-i',
    'Yaşı: ~4,6 mlrd il',
    'Səth: ~5 500 °C',
    'Nüvə: ~15 mln °C',
    'Tərkibi: ~73% hidrogen, ~25% helium',
    'Növü: sarı cırtdan ulduz (G2V)',
    'İşığı Yerə ~8 dəq 20 san-da çatır',
    'Ekvatorda bir dövrə: ~25 gün',
    'Qalaktika ətrafında bir dövrə: ~230 mln il',
  ],
  // Zoomed into on the first scroll (real photo: Inouye Solar Telescope, CC BY 4.0)
  surface: { src: '/images/sun-surface.jpg', caption: 'Günəşin səthi · Foto: NSO/NSF/AURA (CC BY 4.0)', tint: '#2a0a00' },
}

export const BODIES = [
  {
    key: 'mercury',
    name: 'Merkuri',
    tagline: 'Günəşə ən yaxın planet',
    facts: [
      'Günəşdən: 57,9 mln km',
      'Diametr: 4 879 km',
      'Bir il: 88 gün',
      'Bir gün (gündoğandan gündoğana): 176 Yer günü',
      'Gündüz ~430 °C, gecə ~−180 °C',
      'Peyki yoxdur',
      'Atmosferi demək olar ki, yoxdur',
      'Ən sürətli planet: orbitdə ~47 km/san',
      'Səthi kraterlərlə doludur, Aya bənzəyir',
      'Dəmir nüvəsi radiusunun ~85%-ni tutur',
      'MESSENGER 2011–2015-də orbitdən öyrənib',
    ],
    // Zoomed into after its facts (real photo: MESSENGER, Debussy region, public domain)
    surface: { src: '/images/mercury-surface.jpg', caption: 'Merkurinin səthi · Foto: NASA/JHUAPL/Carnegie (MESSENGER)', tint: '#0b0b0c' },
    distanceKm: 57.9e6,
    at: [0.05, 0.16],
    size: 34,
    px: 440,
    side: 1,
    spin: 0.002,
    sphere: { pitch: 0.1, limb: 0.1 },
  },
  {
    key: 'venus',
    name: 'Venera',
    tagline: 'Ən isti planet',
    facts: [
      'Günəşdən: 108,2 mln km',
      'Diametr: 12 104 km',
      'Səth: ~465 °C',
      'Bir il: 225 Yer günü',
      'Bir gün: 243 Yer günü — ilindən uzun',
      'Əksinə fırlanır: Günəş qərbdən doğur',
      'Atmosfer: ~96% karbon qazı',
      'Səth təzyiqi Yerdəkindən ~92 dəfə çox',
      'Buludları sulfat turşusundandır',
      'Peyki yoxdur',
      'Gecə səmasında Aydan sonra ən parlaq',
    ],
    // Zoomed into after its facts (Magellan radar, 3D view of Sapas Mons, public domain)
    surface: { src: '/images/venus-surface.jpg', caption: 'Veneranın səthi (Sapas dağı) · Radar: NASA/JPL (Magellan)', tint: '#1a0c02' },
    distanceKm: 108.2e6,
    at: [0.14, 0.25],
    size: 46,
    px: 540,
    side: -1,
    spin: -0.001,
    sphere: { pitch: 0.1, limb: 0.35, atmosphere: [255, 230, 180, 0.5] },
  },
  {
    key: 'earth',
    name: 'Yer',
    tagline: 'Evimiz 🌍',
    facts: [
      'Günəşdən: 149,6 mln km',
      'Diametr: 12 742 km',
      'Peyki: Ay',
      'Bir il: 365,25 gün',
      'Ox ətrafında dövr: 23 saat 56 dəq',
      'Səthin ~71%-i su ilə örtülüdür',
      'Həyat olduğu bilinən yeganə planet',
      'Yaşı: ~4,54 mlrd il',
      'Hava: 78% azot, 21% oksigen',
      'Ox meyli 23,4° — fəsilləri yaradır',
      'Aya qədər: ~384 400 km',
    ],
    // Zoomed into after its facts: Azerbaijan (NASA MODIS, 2020-04-20, public domain);
    // `position` keeps Absheron/Baku in frame when a narrow screen crops the photo
    surface: {
      src: '/images/earth-azerbaijan.jpg',
      caption: 'Azərbaycan kosmosdan · Foto: NASA (MODIS, 2020)',
      tint: '#06101c',
      position: '75% 55%',
    },
    distanceKm: 149.6e6,
    at: [0.23, 0.36],
    size: 50,
    px: 620,
    side: 1,
    spin: 0.005,
    cloudSpin: 0.007,
    sphere: { tilt: 0.41, pitch: 0.25, limb: 0.05, atmosphere: [110, 170, 255, 0.9] },
    moon: { key: 'moon', size: 0.27, px: 200, x: -1.15, y: -0.55, spin: 0.002 },
  },
  {
    key: 'mars',
    name: 'Mars',
    tagline: 'Qırmızı planet',
    facts: [
      'Günəşdən: 227,9 mln km',
      'Diametr: 6 779 km',
      'Olimp dağı: ~22 km',
      'Bir il: 687 Yer günü',
      'Bir gün: 24 saat 37 dəq',
      'Peykləri: Fobos və Deymos',
      'Rəngi səthdəki dəmir oksidindəndir (pas)',
      'Atmosfer seyrəkdir: ~95% karbon qazı',
      'Orta temperatur: ~−63 °C',
      'Valles Marineris kanyonu: ~4 000 km',
      'Cazibə qüvvəsi Yerin ~38%-i qədər',
    ],
    // Zoomed into after its facts: Mount Sharp seen by Curiosity (PIA19912, credit required)
    surface: {
      src: '/images/mars-surface.jpg',
      caption: 'Marsın səthi (Şarp dağı) · Foto: NASA/JPL-Caltech/MSSS (Curiosity)',
      tint: '#1c0f08',
      position: '45% 60%',
    },
    distanceKm: 227.9e6,
    at: [0.34, 0.46],
    size: 40,
    px: 500,
    side: -1,
    spin: 0.005,
    sphere: { tilt: 0.44, pitch: 0.2, limb: 0.1, atmosphere: [230, 150, 110, 0.35] },
  },
  {
    key: 'jupiter',
    name: 'Yupiter',
    tagline: 'Nəhəng qaz planeti',
    facts: [
      'Günəşdən: 778,5 mln km',
      'Diametr: 139 820 km',
      'Böyük Qırmızı Ləkə',
      'Ən böyük planet: içinə 1 300+ Yer sığar',
      'Bir gün: ~9 saat 56 dəq — ən qısa',
      'Bir il: ~11,9 Yer ili',
      'Qırmızı Ləkə Yerdən böyük fırtınadır',
      '90-dan çox peyki var',
      'Ganimed — Günəş sisteminin ən böyük peyki',
      'Əsasən hidrogen və heliumdan ibarətdir',
      'Kütləsi qalan planetlərin cəmindən 2,5× çox',
    ],
    // No solid surface: zoomed into the cloud tops of the Great Red Spot (Juno, 2017, public domain)
    surface: {
      src: '/images/jupiter-surface.jpg',
      caption: 'Böyük Qırmızı Ləkə · Foto: NASA/JPL-Caltech/SwRI/MSSS/G. Eichstädt/S. Doran (Juno)',
      tint: '#1f0a03',
      position: '50% 45%',
    },
    distanceKm: 778.5e6,
    at: [0.52, 0.65],
    size: 82,
    px: 740,
    side: 1,
    spin: 0.008,
    sphere: { tilt: 0.05, pitch: 0.12, limb: 0.45 },
  },
  {
    key: 'saturn',
    name: 'Saturn',
    tagline: 'Halqaların sahibi',
    facts: [
      'Günəşdən: 1,43 mlrd km',
      'Diametr: 116 460 km',
      'Halqalar: buz və daş',
      'Bir il: ~29,4 Yer ili',
      'Bir gün: ~10 saat 33 dəq',
      'Sıxlığı sudan azdır',
      '270-dən çox peyki var — rekord',
      'Titan: qalın atmosferi olan yeganə peyk',
      'Halqalar ~280 000 km enində, çox nazik',
      'Şimal qütbündə altıbucaqlı fırtına',
      'Cassini 2004–2017-də orbitdə olub',
    ],
    // No solid surface: zoomed into the north polar hexagon (Cassini PIA20513, public domain)
    surface: {
      src: '/images/saturn-surface.jpg',
      caption: 'Şimal qütbündəki altıbucaqlı fırtına · Foto: NASA/JPL-Caltech/SSI (Cassini)',
      tint: '#0a0a0a',
      position: '25% 35%',
    },
    distanceKm: 1.43e9,
    at: [0.64, 0.78],
    size: 46,
    px: 600,
    side: -1,
    spin: 0.007,
    sphere: { tilt: -0.35, pitch: 0.42, limb: 0.4 },
    rings: { inner: 1.24, outer: 2.27, profile: 'saturn', color: [214, 196, 158], opacity: 0.95 },
  },
  {
    key: 'uranus',
    name: 'Uran',
    tagline: 'Yan üstə fırlanan planet',
    facts: [
      'Günəşdən: 2,87 mlrd km',
      'Diametr: 50 724 km',
      'Ox meyli: 98°',
      'Bir il: ~84 Yer ili',
      'Bir gün: ~17 saat 14 dəq',
      '1781-də teleskopla tapılan ilk planet',
      'Mavi-yaşıl rəngi metan qazındandır',
      'Ən soyuq atmosfer: ~−224 °C',
      'Peyklərinə Şekspir qəhrəmanlarının adları verilib',
      'Qütblərdə 42 il gündüz, 42 il gecə',
      'Yalnız Voyager 2 (1986) yaxından keçib',
    ],
    distanceKm: 2.87e9,
    at: [0.77, 0.88],
    size: 44,
    px: 540,
    side: 1,
    spin: -0.005,
    sphere: { tilt: 1.45, pitch: 0.55, limb: 0.35, atmosphere: [170, 230, 240, 0.45] },
    rings: { inner: 1.6, outer: 2.05, profile: 'uranus', color: [150, 160, 170], opacity: 0.6 },
  },
  {
    key: 'neptune',
    name: 'Neptun',
    tagline: 'Ən uzaq planet',
    facts: [
      'Günəşdən: 4,5 mlrd km',
      'Diametr: 49 244 km',
      'Küləklər: 2 100 km/saat',
      'Bir il: ~165 Yer ili',
      'Bir gün: ~16 saat 6 dəq',
      'Riyazi hesabla tapılan ilk planet (1846)',
      'Kəşfindən sonra ilk tam ilini 2011-də bitirdi',
      'Ən böyük peyki Triton əksinə fırlanır',
      'Tritonda azot geyzerləri var',
      'Gün işığı Yerdəkindən ~900 dəfə zəif',
      'Voyager 2 1989-da yanından keçib',
    ],
    distanceKm: 4.5e9,
    at: [0.87, 0.97],
    size: 44,
    px: 540,
    side: -1,
    spin: 0.006,
    sphere: { tilt: 0.49, pitch: 0.2, limb: 0.4, atmosphere: [90, 140, 255, 0.55] },
  },
]

// Asteroid belt between Mars and Jupiter (scroll range)
export const ASTEROID_BELT = [0.45, 0.54]

// Inside a slot: the planet calms down near the screen at HOLD[0]..HOLD[1] (label shown,
// its facts appear one by one as you scroll through this stretch)
export const HOLD = [0.35, 0.8]

/** Point on the timeline where the body is at its calm, closest-but-not-passing moment. */
export const holdAt = (body) => body.at[0] + ((HOLD[0] + HOLD[1]) / 2) * (body.at[1] - body.at[0])

/** [start, end] of a body's hold on the journey timeline. */
export const holdRange = (body) => {
  const span = body.at[1] - body.at[0]
  return [body.at[0] + HOLD[0] * span, body.at[0] + HOLD[1] * span]
}

// Scroll track. Travel between planets: the whole journey would be BASE_VH long;
// each hold (all facts on screen) is instead HOLD_VH of scroll
// (≈ 2 s at a calm scrolling pace, ~50vh/s); raise HOLD_VH to keep facts up longer.
const BASE_VH = 3600
const HOLD_VH = 100
// Surface zooms (≈ 8 s of scroll each), the journey stands still meanwhile: the Sun's
// before the trip starts, a planet's (one with `surface`) right after its hold
const ZOOM_VH = 400

const buildTrack = () => {
  const journey = [0]
  const scroll = [0]
  const zooms = { sun: [0, ZOOM_VH] }
  let vh = ZOOM_VH
  journey.push(0)
  scroll.push(vh)
  let last = 0
  for (const body of BODIES) {
    const [h0, h1] = holdRange(body)
    vh += (h0 - last) * BASE_VH
    journey.push(h0)
    scroll.push(vh)
    vh += HOLD_VH
    journey.push(h1)
    scroll.push(vh)
    if (body.surface) {
      zooms[body.key] = [vh, vh + ZOOM_VH]
      vh += ZOOM_VH
      journey.push(h1)
      scroll.push(vh)
    }
    last = h1
  }
  vh += (1 - last) * BASE_VH
  journey.push(1)
  scroll.push(vh)
  for (const key in zooms) zooms[key] = zooms[key].map((s) => s / vh)
  return { vh: Math.round(vh), scroll: scroll.map((s) => s / vh), journey, zooms }
}

/**
 * Scroll progress (0..1) → journey progress (0..1), the track height in vh, and
 * zooms: { [key]: [start, end] } scroll progress of each surface zoom.
 */
export const TRACK = buildTrack()
