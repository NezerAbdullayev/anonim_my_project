// The route through the Solar System. `at` = [start, end] of a body's slot on the
// scroll timeline (0 = top, 1 = bottom); slots overlap a little so the next planet
// is already a dot in the distance while the current one flies past.
// `size` = on-screen diameter at its closest calm moment (vmin), `px` = render
// resolution cap of the disk (lowered to fit the screen), `side` = which side of the screen it passes on.

export const BODIES = [
  {
    key: 'mercury',
    name: 'Merkuri',
    tagline: 'Günəşə ən yaxın planet',
    facts: ['Günəşdən: 57,9 mln km', 'Diametr: 4 879 km', 'Bir il: 88 gün'],
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
    facts: ['Günəşdən: 108,2 mln km', 'Diametr: 12 104 km', 'Səth: ~465 °C'],
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
    facts: ['Günəşdən: 149,6 mln km', 'Diametr: 12 742 km', 'Peyki: Ay'],
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
    facts: ['Günəşdən: 227,9 mln km', 'Diametr: 6 779 km', 'Olimp dağı: ~22 km'],
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
    facts: ['Günəşdən: 778,5 mln km', 'Diametr: 139 820 km', 'Böyük Qırmızı Ləkə'],
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
    facts: ['Günəşdən: 1,43 mlrd km', 'Diametr: 116 460 km', 'Halqalar: buz və daş'],
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
    facts: ['Günəşdən: 2,87 mlrd km', 'Diametr: 50 724 km', 'Ox meyli: 98°'],
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
    facts: ['Günəşdən: 4,5 mlrd km', 'Diametr: 49 244 km', 'Küləklər: 2 100 km/saat'],
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

// Inside a slot: the planet calms down near the screen at HOLD[0]..HOLD[1] (label shown)
export const HOLD = [0.45, 0.72]

/** Point on the timeline where the body is at its calm, closest-but-not-passing moment. */
export const holdAt = (body) => body.at[0] + ((HOLD[0] + HOLD[1]) / 2) * (body.at[1] - body.at[0])
