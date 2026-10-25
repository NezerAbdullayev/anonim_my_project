import { createNoise } from './noise.js'

// Procedural surface maps (equirectangular: x = longitude, y = latitude).
// RGB = colour; alpha = water mask (255 = ocean, gets a sun glint). Earth also
// gets a separate cloud alpha map that rotates a little faster than the ground.

export const TEX_W = 1024
export const TEX_H = 512

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
// fBm of value noise sits around 0.5 with little spread; stretch it to use 0..1
const stretch = (n, k = 2.2) => clamp01((n - 0.5) * k + 0.5)
const mix = (out, a, b, t) => {
  out[0] = a[0] + (b[0] - a[0]) * t
  out[1] = a[1] + (b[1] - a[1]) * t
  out[2] = a[2] + (b[2] - a[2]) * t
  return out
}

/** Fills an RGBA map by calling shade(x, y, z, lat, lon, out) for every texel. */
function paint(shade) {
  const data = new Uint8ClampedArray(TEX_W * TEX_H * 4)
  const out = [0, 0, 0, 0]
  for (let j = 0; j < TEX_H; j++) {
    const lat = Math.PI / 2 - ((j + 0.5) / TEX_H) * Math.PI
    const cl = Math.cos(lat)
    const y = Math.sin(lat)
    for (let i = 0; i < TEX_W; i++) {
      const lon = ((i + 0.5) / TEX_W) * Math.PI * 2 - Math.PI
      const x = cl * Math.sin(lon)
      const z = cl * Math.cos(lon)
      out[3] = 0
      shade(x, y, z, lat, lon, out)
      const k = (j * TEX_W + i) * 4
      data[k] = out[0]
      data[k + 1] = out[1]
      data[k + 2] = out[2]
      data[k + 3] = out[3]
    }
  }
  return data
}

/** Bowl-shaped craters with bright rims, stamped straight into the map. */
function addCraters(data, rnd, count, minR, maxR, depth) {
  for (let c = 0; c < count; c++) {
    // Uniform on the sphere; small craters are much more common than big ones
    const lat0 = Math.asin(rnd() * 2 - 1)
    const lon0 = rnd() * Math.PI * 2 - Math.PI
    const r = minR + (maxR - minR) * Math.pow(rnd(), 3)
    const c0 = [Math.cos(lat0) * Math.sin(lon0), Math.sin(lat0), Math.cos(lat0) * Math.cos(lon0)]
    const jMin = Math.max(0, Math.floor(((Math.PI / 2 - (lat0 + r * 1.3)) / Math.PI) * TEX_H))
    const jMax = Math.min(TEX_H - 1, Math.ceil(((Math.PI / 2 - (lat0 - r * 1.3)) / Math.PI) * TEX_H))
    for (let j = jMin; j <= jMax; j++) {
      const lat = Math.PI / 2 - ((j + 0.5) / TEX_H) * Math.PI
      const cl = Math.cos(lat)
      const span = Math.min(Math.PI, (r * 1.3) / Math.max(cl, 0.05))
      const iMin = Math.floor(((lon0 - span + Math.PI) / (Math.PI * 2)) * TEX_W)
      const iMax = Math.ceil(((lon0 + span + Math.PI) / (Math.PI * 2)) * TEX_W)
      for (let ii = iMin; ii <= iMax; ii++) {
        const i = ((ii % TEX_W) + TEX_W) % TEX_W
        const lon = ((i + 0.5) / TEX_W) * Math.PI * 2 - Math.PI
        const dot = cl * Math.sin(lon) * c0[0] + Math.sin(lat) * c0[1] + cl * Math.cos(lon) * c0[2]
        const d = Math.acos(Math.min(1, dot)) / r // 0 = centre, 1 = rim
        if (d > 1.3) continue
        // Dark floor, bright raised rim, fading ejecta outside
        const f = d < 0.85 ? 1 - depth * (1 - d * d * 0.6) : d < 1.05 ? 1 + depth * 0.9 : 1 + depth * 0.4 * (1.3 - d) / 0.25
        const k = (j * TEX_W + i) * 4
        data[k] *= f
        data[k + 1] *= f
        data[k + 2] *= f
      }
    }
  }
}

const GENERATORS = {
  sun() {
    const N = createNoise(11)
    const hot = [255, 248, 210]
    const warm = [255, 175, 55]
    // Granulation: lots of small convection cells, a few dark sunspots
    const data = paint((x, y, z, lat, lon, out) => {
      const g = stretch(N.fbm(x * 22, y * 22, z * 22, 4), 2.6)
      const spot = smooth(0.72, 0.8, N.fbm(x * 3 + 5, y * 3, z * 3, 3)) * smooth(0.6, 0.2, Math.abs(lat))
      mix(out, warm, hot, g * 0.85)
      const s = 1 - spot * 0.75
      out[0] *= s
      out[1] *= s
      out[2] *= s
    })
    return { data }
  },

  mercury() {
    const N = createNoise(21)
    const dark = [92, 88, 84]
    const light = [178, 172, 164]
    const data = paint((x, y, z, lat, lon, out) => {
      const n = stretch(N.fbm(x * 3, y * 3, z * 3, 6), 2.4)
      const fine = N.fbm(x * 18, y * 18, z * 18, 3)
      mix(out, dark, light, clamp01(n * 0.8 + fine * 0.3))
    })
    addCraters(data, N.rnd, 900, 0.006, 0.16, 0.35)
    return { data }
  },

  venus() {
    const N = createNoise(31)
    const deep = [196, 150, 88]
    const pale = [244, 222, 170]
    // Thick swirling cloud deck, stretched along the latitude lines
    const data = paint((x, y, z, lat, lon, out) => {
      const q = N.fbm(x * 1.5, y * 1.5, z * 1.5, 4)
      const n = stretch(N.fbm(x * 2 + q * 2.5, y * 7 + q, z * 2 + q * 2.5, 6), 2.0)
      mix(out, deep, pale, n)
    })
    return { data }
  },

  earth() {
    const N = createNoise(41)
    const C = createNoise(42)
    const deep = [6, 26, 70]
    const shallow = [22, 84, 140]
    const green = [46, 92, 38]
    const forest = [26, 64, 30]
    const desert = [176, 148, 96]
    const rock = [112, 100, 86]
    const ice = [236, 242, 248]
    const SEA = 0.6 // ≈68% of the surface under water (+ polar ice), like the real Earth
    const data = paint((x, y, z, lat, lon, out) => {
      const n = stretch(N.fbm(x * 1.7 + 2, y * 1.7, z * 1.7, 7), 2.4)
      const absLat = Math.abs(lat)
      const iceEdge = 1.18 + (N.fbm(x * 6, y * 6, z * 6, 3) - 0.5) * 0.35
      if (absLat > iceEdge) {
        mix(out, ice, ice, 0)
        return
      }
      if (n < SEA) {
        mix(out, deep, shallow, smooth(SEA - 0.22, SEA, n))
        out[3] = 255 // water: gets the sun glint
        return
      }
      const h = (n - SEA) / (1 - SEA)
      const wet = N.fbm(x * 5 + 9, y * 5, z * 5, 4)
      // Deserts around ±25°, forests near the equator and at mid latitudes
      const dry = smooth(0.25, 0.05, Math.abs(absLat - 0.42)) * smooth(0.45, 0.6, 1 - wet)
      mix(out, forest, green, smooth(0.35, 0.65, wet))
      const t = [out[0], out[1], out[2]]
      mix(out, t, desert, clamp01(dry * 1.2))
      const t2 = [out[0], out[1], out[2]]
      mix(out, t2, rock, smooth(0.45, 0.8, h))
      if (h > 0.82 || absLat > iceEdge - 0.1) mix(out, [out[0], out[1], out[2]], ice, 0.7)
    })
    // Clouds: swirly, mostly zonal, denser in the storm belts
    const clouds = new Uint8ClampedArray(TEX_W * TEX_H)
    for (let j = 0; j < TEX_H; j++) {
      const lat = Math.PI / 2 - ((j + 0.5) / TEX_H) * Math.PI
      const cl = Math.cos(lat)
      const y = Math.sin(lat)
      for (let i = 0; i < TEX_W; i++) {
        const lon = ((i + 0.5) / TEX_W) * Math.PI * 2 - Math.PI
        const x = cl * Math.sin(lon)
        const z = cl * Math.cos(lon)
        const q = C.fbm(x * 2, y * 2, z * 2, 3)
        const c = stretch(C.fbm(x * 3 + q * 2, y * 5 + q, z * 3 + q * 2, 6), 2.2)
        clouds[j * TEX_W + i] = smooth(0.48, 0.8, c) * 235
      }
    }
    return { data, clouds }
  },

  moon() {
    const N = createNoise(51)
    const maria = [86, 84, 82]
    const highland = [176, 174, 170]
    const data = paint((x, y, z, lat, lon, out) => {
      const m = smooth(0.5, 0.62, N.fbm(x * 1.6, y * 1.6, z * 1.6, 5))
      const fine = N.fbm(x * 14, y * 14, z * 14, 3)
      mix(out, highland, maria, m)
      const f = 0.85 + fine * 0.3
      out[0] *= f
      out[1] *= f
      out[2] *= f
    })
    addCraters(data, N.rnd, 500, 0.008, 0.14, 0.3)
    return { data }
  },

  mars() {
    const N = createNoise(61)
    const rust = [176, 86, 48]
    const dust = [214, 146, 96]
    const dark = [96, 50, 34]
    const ice = [240, 236, 232]
    const data = paint((x, y, z, lat, lon, out) => {
      const n = stretch(N.fbm(x * 2.2, y * 2.2, z * 2.2, 6), 2.2)
      const d = smooth(0.55, 0.75, stretch(N.fbm(x * 1.6 + 7, y * 1.6, z * 1.6, 5), 2.4))
      mix(out, rust, dust, n)
      mix(out, [out[0], out[1], out[2]], dark, d * 0.75)
      const cap = smooth(1.28, 1.36, lat + (N.fbm(x * 8, y * 8, z * 8, 3) - 0.5) * 0.12)
      const south = smooth(-1.38, -1.45, lat)
      mix(out, [out[0], out[1], out[2]], ice, Math.max(cap, south))
    })
    addCraters(data, N.rnd, 260, 0.006, 0.1, 0.22)
    return { data }
  },

  jupiter() {
    const N = createNoise(71)
    const zone = [228, 214, 186]
    const belt = [168, 118, 80]
    const deepBelt = [128, 80, 54]
    const pole = [128, 122, 116]
    const spot = [196, 104, 70]
    const data = paint((x, y, z, lat, lon, out) => {
      // Belts and zones, wobbled by turbulence so they are never straight
      const warp = N.fbm(x * 3, y * 3, z * 3, 5)
      const turb = N.fbm(x * 10, y * 2, z * 10, 4)
      const band = Math.sin(lat * 19 + warp * 2.4 + turb * 1.6)
      const t = band * 0.5 + 0.5
      mix(out, belt, zone, t)
      if (band < -0.55) mix(out, [out[0], out[1], out[2]], deepBelt, smooth(-0.55, -0.95, band))
      mix(out, [out[0], out[1], out[2]], pole, smooth(0.85, 1.35, Math.abs(lat)))
      // Great Red Spot: a swirled oval in the southern hemisphere
      const dLat = (lat + 0.39) / 0.11
      const dLon = (lon - 0.8) / 0.24
      const d = dLat * dLat + dLon * dLon
      if (d < 1.6) {
        const swirl = 0.5 + 0.5 * Math.sin(Math.sqrt(d) * 11 + turb * 3)
        const k = smooth(1.6, 0.6, d)
        mix(out, [out[0], out[1], out[2]], spot, k * (0.75 + swirl * 0.25))
      }
      const fine = (N.fbm(x * 30, y * 6, z * 30, 2) - 0.5) * 26
      out[0] += fine
      out[1] += fine
      out[2] += fine
    })
    return { data }
  },

  saturn() {
    const N = createNoise(81)
    const light = [230, 212, 164]
    const dark = [188, 158, 108]
    const pole = [160, 152, 124]
    const data = paint((x, y, z, lat, lon, out) => {
      const warp = N.fbm(x * 2.5, y * 2.5, z * 2.5, 4)
      const band = Math.sin(lat * 28 + warp * 1.2) * 0.6 + Math.sin(lat * 9 + warp) * 0.4
      mix(out, dark, light, band * 0.5 + 0.5)
      mix(out, [out[0], out[1], out[2]], pole, smooth(0.9, 1.4, Math.abs(lat)))
      const fine = (N.fbm(x * 24, y * 4, z * 24, 2) - 0.5) * 14
      out[0] += fine
      out[1] += fine
      out[2] += fine
    })
    return { data }
  },

  uranus() {
    const N = createNoise(91)
    const base = [160, 214, 224]
    const band = [140, 196, 210]
    const data = paint((x, y, z, lat, lon, out) => {
      const b = Math.sin(lat * 7 + N.fbm(x * 2, y * 2, z * 2, 3) * 1.5) * 0.5 + 0.5
      mix(out, band, base, b)
      const polar = smooth(0.9, 1.4, lat) * 18
      out[0] += polar
      out[1] += polar
      out[2] += polar
    })
    return { data }
  },

  neptune() {
    const N = createNoise(101)
    const deep = [34, 64, 168]
    const mid = [62, 112, 214]
    const darkSpot = [22, 40, 112]
    const data = paint((x, y, z, lat, lon, out) => {
      const warp = N.fbm(x * 2.5, y * 2.5, z * 2.5, 4)
      const band = Math.sin(lat * 11 + warp * 2.2) * 0.5 + 0.5
      mix(out, deep, mid, band)
      // Great Dark Spot
      const dLat = (lat + 0.36) / 0.1
      const dLon = (lon - 1.2) / 0.2
      const d = dLat * dLat + dLon * dLon
      if (d < 1.4) mix(out, [out[0], out[1], out[2]], darkSpot, smooth(1.4, 0.5, d))
      // Bright high-altitude streaks
      const streak = smooth(0.66, 0.78, N.fbm(x * 2 + 4, y * 16, z * 2, 4))
      mix(out, [out[0], out[1], out[2]], [235, 240, 255], streak * 0.65)
    })
    return { data }
  },
}

export const TEXTURE_KEYS = Object.keys(GENERATORS)

/** Generates one body's maps: { width, height, data, clouds? }. */
export function generateTexture(key) {
  const { data, clouds } = GENERATORS[key]()
  return { key, width: TEX_W, height: TEX_H, data, clouds: clouds || null }
}
