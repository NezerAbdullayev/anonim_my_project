// Seeded 3D value noise + fBm. Textures sample it on the unit sphere, so they wrap
// around the planet seamlessly (no seam at the date line, no pinching at the poles).

// mulberry32: small, fast, seedable PRNG
export function createRandom(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createNoise(seed) {
  const rnd = createRandom(seed)
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  const vals = new Float32Array(256)
  for (let i = 0; i < 256; i++) vals[i] = rnd()

  const fade = (t) => t * t * (3 - 2 * t)
  const hash = (x, y, z) => vals[perm[perm[perm[x] + y] + z]]

  // 0..1
  const noise = (x, y, z) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const zi = Math.floor(z)
    const u = fade(x - xi)
    const v = fade(y - yi)
    const w = fade(z - zi)
    const X = xi & 255
    const Y = yi & 255
    const Z = zi & 255
    const c000 = hash(X, Y, Z)
    const c100 = hash(X + 1, Y, Z)
    const c010 = hash(X, Y + 1, Z)
    const c110 = hash(X + 1, Y + 1, Z)
    const c001 = hash(X, Y, Z + 1)
    const c101 = hash(X + 1, Y, Z + 1)
    const c011 = hash(X, Y + 1, Z + 1)
    const c111 = hash(X + 1, Y + 1, Z + 1)
    const x00 = c000 + (c100 - c000) * u
    const x10 = c010 + (c110 - c010) * u
    const x01 = c001 + (c101 - c001) * u
    const x11 = c011 + (c111 - c011) * u
    const y0 = x00 + (x10 - x00) * v
    const y1 = x01 + (x11 - x01) * v
    return y0 + (y1 - y0) * w
  }

  // Fractal sum of octaves, normalised back to ~0..1
  const fbm = (x, y, z, octaves = 5) => {
    let sum = 0
    let amp = 0.5
    let norm = 0
    let f = 1
    for (let o = 0; o < octaves; o++) {
      sum += amp * noise(x * f + o * 17.3, y * f - o * 9.1, z * f + o * 3.7)
      norm += amp
      amp *= 0.5
      f *= 2.03
    }
    return sum / norm
  }

  return { noise, fbm, rnd }
}
