// The dive from the surface to the bottom of the Mariana Trench. `at` = [start, end] of a
// zone on the dive timeline (0 = surface, 1 = bottom). Real zones are very uneven (the sunlit
// one is 200 m, the trench one ~5 000 m), so every zone gets about the same share of scroll
// and the depth runs linearly inside its own range. A zone's `stops` (creatures, landmarks)
// sit at their real `depth` (m) inside it.

export const MAX_DEPTH = 10_935 // Challenger Deep, m

export const ZONES = [
  {
    key: 'epi',
    name: 'Günəşli zona',
    sci: 'Epipelagik',
    range: [0, 200],
    at: [0.05, 0.22],
    text: 'Günəş işığı buraya qədər çatır. Fitoplankton fotosintez edir və dəniz həyatının ~90%-i bu nazik qatda yaşayır.',
    stops: [
      {
        key: 'clownfish',
        depth: 25,
        name: 'Kloun balığı',
        tagline: 'Mərcan rifinin sakini',
        facts: [
          'Aktiniyanın yandıran qolları arasında yaşayır',
          'Bədənindəki selik qatı onu yanıqdan qoruyur',
          'Hamısı erkək doğulur, dəstənin ən böyüyü dişiyə çevrilir',
          'Mərcan rifləri okean dibinin 1%-dən azını tutur',
          'Amma dəniz canlılarının ~25%-i riflərdə yaşayır',
        ],
        photo: { src: '/images/okean/clownfish.jpg', caption: 'Foto: Michael Arvedlund (ictimai mülkiyyət)' },
      },
      {
        key: 'dolphins',
        depth: 60,
        name: 'Delfinlər',
        tagline: 'Okeanın ən ağıllı üzgüçüləri',
        facts: [
          'Hər delfinin öz "adı" var: fərdi fit səsi',
          'Exolokasiya ilə qaranlıqda da "görür"',
          'Yatanda beyninin yalnız yarısı yatır',
          'Saatda ~30 km sürətlə üzür',
          'Dəstə ilə yaşayır və birlikdə ov edir',
        ],
        photo: { src: '/images/okean/dolphins.jpg', caption: 'Foto: NOAA Photo Library (ictimai mülkiyyət)' },
      },
      {
        key: 'turtle',
        depth: 95,
        name: 'Yaşıl dəniz tısbağası',
        tagline: 'Okean səyyahı',
        facts: [
          '70 ildən çox yaşaya bilir',
          'Yumurtlamaq üçün doğulduğu sahilə qayıdır',
          'Qumun istiliyi balaların cinsini təyin edir: isti qumda dişi çıxır',
          'Dincələndə su altında saatlarla qala bilir',
          'Böyüyəndə yalnız dəniz otu və yosun yeyir',
        ],
        photo: { src: '/images/okean/turtle.jpg', caption: 'Foto: David Vogel (ictimai mülkiyyət)' },
      },
      {
        key: 'sardines',
        depth: 130,
        name: 'Sardina sürüsü',
        tagline: 'Milyonlarla balıq, bir bədən',
        facts: [
          'Sürü bir canlı kimi birdən dönür',
          'Yırtıcı tək bir balığı seçə bilmir: sürü onu çaşdırır',
          'Hər qış Cənubi Afrikada "sardina qaçışı" olur',
          'O zaman sürülərin uzunluğu ~7 km-ə çatır',
          'Delfinlər, köpəkbalıqları və quşlar birlikdə ova çıxır',
        ],
        photo: {
          src: '/images/okean/sardines.jpg',
          caption: 'Sardina qaçışı və ov edən delfinlər · Foto: Stanislav Stelmakhovich (CC0)',
        },
      },
      {
        key: 'blue-whale',
        depth: 170,
        name: 'Mavi balina',
        tagline: 'Bildiyimiz ən böyük heyvan',
        facts: [
          'Uzunluğu ~30 m, çəkisi ~190 tona qədər',
          'Dinozavrlardan da böyükdür',
          'Ürəyi ~180 kq-dır, kiçik avtomobil boyda',
          'Gündə ~4 ton kril yeyir',
          'Səsi yüzlərlə km uzağa çatır',
        ],
        photo: { src: '/images/okean/blue-whale.jpg', caption: 'Foto: NOAA Photo Library (ictimai mülkiyyət)' },
      },
    ],
  },
  {
    key: 'meso',
    name: 'Alatoran zona',
    sci: 'Mezopelagik',
    range: [200, 1000],
    at: [0.22, 0.39],
    text: 'İşıq solğun göy parıltıya çevrilir, bitkilər yaşaya bilmir. Canlılar artıq özləri parlayır və ilk "dəniz qarı" yağır.',
    stops: [
      {
        key: 'humboldt-squid',
        depth: 300,
        name: 'Humboldt kalmarı',
        tagline: 'Balıqçıların "qırmızı şeytanı"',
        facts: [
          'Uzunluğu ~1,5–2 m-ə çatır',
          'Dərisinin rəngini bir anda qırmızıdan ağa dəyişir',
          'Bununla dəstədəki digər kalmarlara siqnal verir',
          'Gündüz dərində gizlənir, gecə səthə yaxın ov edir',
          'Dəstə ilə, bəzən yüzlərlə birlikdə ov edir',
        ],
        photo: {
          src: '/images/okean/humboldt-squid.jpg',
          caption: '~250 m, Kaliforniya · Foto: NOAA Photo Library (CC BY 2.0)',
        },
      },
      {
        key: 'hatchetfish',
        depth: 450,
        name: 'Balta balığı',
        tagline: 'Qarnı parlayan balıq',
        facts: [
          'Qarnındakı işıq orqanları göy parlayır',
          'Bu işıq yuxarıdan düşən zəif işığa uyğunlaşır',
          'Belə olanda aşağıdakı yırtıcı onun kölgəsini görmür',
          'Bədəni balta kimi nazik və gümüşüdür, cəmi ~5–10 sm',
          'Açıq okean canlılarının ~75%-i işıq saça bilir',
        ],
        photo: {
          src: '/images/okean/hatchetfish.jpg',
          caption: 'Balta balığının parlayan qarnı · Foto: HulloThere (CC BY 4.0)',
        },
      },
      {
        key: 'anglerfish',
        depth: 640,
        name: 'Fənərli balıq',
        tagline: 'Tilovla ov edən balıq',
        facts: [
          'Başındakı dəyişmiş üzgəc tilov kimi işləyir',
          'Dibdə tərpənmədən yatıb ovunu gözləyir',
          'Ağzı o qədər genişdir ki, özü boyda ovu uda bilir',
          'Dərin dəniz növlərində tilovun ucu parlayır',
          'Bəzi növlərdə kiçik erkək dişiyə yapışıb ömürlük onunla birləşir',
        ],
        photo: {
          src: '/images/okean/anglerfish.jpg',
          caption: 'Lophiodes beroe, ~640 m · Foto: NOAA Okeanos Explorer (ictimai mülkiyyət)',
        },
      },
      {
        key: 'siphonophore',
        depth: 850,
        name: 'Sifonofor',
        tagline: 'Bir bədəndə minlərlə canlı',
        facts: [
          'Tək canlı kimi görünür, amma bir koloniyadır',
          'Hər hissənin öz işi var: üzmək, ov tutmaq, həzm etmək',
          'Bəzi növləri 40 m-dən uzundur, mavi balinadan da uzun',
          'Bədəni demək olar ki, tam şəffafdır',
        ],
        photo: {
          src: '/images/okean/siphonophore.jpg',
          caption: 'Puerto-Riko yaxınlığı · Foto: NOAA Ocean Exploration (ictimai mülkiyyət)',
        },
      },
    ],
  },
  {
    key: 'bathy',
    name: 'Gecəyarısı zonası',
    sci: 'Batipelagik',
    range: [1000, 4000],
    at: [0.39, 0.58],
    text: 'Günəş işığı heç vaxt çatmır. Yeganə işıq canlıların öz parıltısıdır, su ~4 °C-dir.',
    stops: [
      {
        key: 'sperm-whale',
        depth: 1250,
        name: 'Kaşalot',
        tagline: 'Dərinliyin dalğıcı',
        facts: [
          '2 000 m-dən də dərinə enə bilir',
          'Nəfəsini ~90 dəqiqəyə qədər saxlayır',
          'Beyni yer üzündə ən böyük beyindir: ~8 kq',
          'Qaranlıqda nəhəng kalmarı səslə tapıb ovlayır',
          'Klik səsi heyvanlar aləmində ən güclü səsdir',
        ],
        photo: {
          src: '/images/okean/sperm-whale.jpg',
          caption: 'Ana və balası, Mavriki · Foto: Gabriel Barathieu (CC BY-SA 2.0)',
        },
      },
      {
        key: 'baikal',
        kind: 'line',
        depth: 1642,
        name: 'Baykal gölünün dibi',
        text: 'Dünyanın ən dərin gölü bu dərinlikdə bitir. Okeanın dibinə isə hələ 9 km-dən çox var.',
      },
      {
        key: 'atolla',
        depth: 2250,
        name: 'Atolla meduzası',
        tagline: '"Siqnalizasiya" meduzası',
        facts: [
          'Hücum olanda dairəvi göy işıq dalğaları saçır',
          'Bu işıq daha böyük yırtıcını çağırır',
          'O gəlib meduzaya hücum edəni qorxudur',
          'Qırmızı rəngi burada görünmür: qırmızı işıq bu dərinliyə çatmır',
        ],
        photo: {
          src: '/images/okean/atolla.jpg',
          caption: 'Foto: Edith Widder, Operation Deep Scope 2005 (CC BY-SA 4.0)',
        },
      },
      {
        key: 'gulper-eel',
        depth: 2900,
        name: 'Pelikan ilanbalığı',
        tagline: 'Ağzı bədənindən böyük',
        facts: [
          'Ağzı çanta kimi açılır, özündən böyük ovu tuta bilir',
          'Quyruğunun ucunda kiçik çəhrayı işıq yanır',
          'Uzunluğu ~0,75–1 m',
          'Burada yemək azdır: tapdığını dərhal udur',
        ],
        photo: { src: '/images/okean/gulper-eel.jpg', caption: 'Foto: David Shale (CC BY 4.0)' },
      },
      {
        key: 'titanic',
        depth: 3800,
        name: 'Titanik',
        tagline: '1912-ci ildə batan gəmi',
        facts: [
          'Qalıqları ~3 800 m dərinlikdədir',
          'Okeanın orta dərinliyi ~3 700 m-dir: Titanik demək olar ki, "ortada" yatır',
          'Qalıqları yalnız 1985-ci ildə tapıldı',
          'Burada təzyiq ~380 atm-dir',
          'Bakteriyalar gəminin dəmirini yavaş-yavaş yeyir',
        ],
        photo: {
          src: '/images/okean/titanic.jpg',
          caption: 'Gəminin burnu, 2004 · Foto: NOAA/IFE/URI (ictimai mülkiyyət)',
        },
      },
    ],
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

// Each zone opens with its title card for TITLE of the dive (the depth waits at the zone's
// top meanwhile), then the depth runs through the zone's range over the rest of it
export const TITLE = 0.05

const diveAt = (zone, m) =>
  zone.at[0] + TITLE + ((m - zone.range[0]) / (zone.range[1] - zone.range[0])) * (zone.at[1] - zone.at[0] - TITLE)

// The intro (0 m) before the first zone, the bottom (MAX_DEPTH) after the last
export const DEPTH = {
  points: [0, ...ZONES.flatMap((z) => [z.at[0], z.at[0] + TITLE]), ZONES.at(-1).at[1], 1],
  meters: [0, ...ZONES.flatMap((z) => [z.range[0], z.range[0]]), MAX_DEPTH, MAX_DEPTH],
}

// Water colour [top, bottom of the screen] at dive points: turquoise → blue → indigo → black
export const WATER = {
  points: [0, 0.05, 0.22, 0.39, 0.58, 1],
  top: ['#22b8d8', '#1aa7cc','#075985', '#0b1640', '#03040b', '#010103'],
  bottom: ['#0ea5e9', '#0369a1', '#1e3a8a', '#060a24', '#010206', '#000000'],
}

// Every stop (a title card, a creature or a landmark) is a point on the dive timeline; around
// it the dive slows to a crawl for HOLD so the facts can be read
export const HOLD = 0.006
// The longest a stop is on screen either side of its point (dive progress)
const MAX_SPAN = 0.012

// Place every stop at its real depth. It may stay on screen until halfway to its neighbours,
// but not over the zone's title card (before it) or the next zone's (after it).
for (const zone of ZONES) {
  zone.title = zone.at[0] + TITLE / 2
  const stops = zone.stops ?? []
  stops.forEach((s) => (s.at = diveAt(zone, s.depth)))
  stops.forEach((s, i) => {
    const before = i ? (s.at - stops[i - 1].at) / 2 : s.at - (zone.at[0] + TITLE)
    const after = i < stops.length - 1 ? (stops[i + 1].at - s.at) / 2 : zone.at[1] - s.at
    s.span = Math.min(MAX_SPAN, before, after) // on screen from at - span to at + span
    s.side = i % 2 ? 'right' : 'left' // which side of the screen the photo is on
  })
}

const STOPS = ZONES.flatMap((z) => [z.title, ...(z.stops ?? []).map((s) => s.at)])

/** [start, end] of a stop's hold on the dive timeline. */
export const holdRange = (at) => [at - HOLD / 2, at + HOLD / 2]

// Scroll track. Travel between stops: the whole dive would be BASE_VH long; each hold is
// instead HOLD_VH of scroll (≈ 2,5 s at a calm scrolling pace, ~50vh/s)
const BASE_VH = 2400
const HOLD_VH = 120

const buildTrack = () => {
  const dive = [0]
  const scroll = [0]
  let vh = 0
  let last = 0
  for (const at of STOPS) {
    const [h0, h1] = holdRange(at)
    vh += (h0 - last) * BASE_VH
    dive.push(h0)
    scroll.push(vh)
    vh += HOLD_VH
    dive.push(h1)
    scroll.push(vh)
    last = h1
  }
  vh += (1 - last) * BASE_VH
  dive.push(1)
  scroll.push(vh)
  return { vh: Math.round(vh), scroll: scroll.map((s) => s / vh), dive }
}

/** Scroll progress (0..1) → dive progress (0..1), and the track height in vh. */
export const TRACK = buildTrack()

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
