// Renders an equirectangular map onto a lit 3D sphere, pixel by pixel.
// Split in two so the heavy part can run in the Web Worker:
//   computeSphere / computeRings  — pure maths, no DOM (worker): which texel each
//                                   pixel sees, how much light it gets, ring pixels
//   createSphereRenderer / ringCanvases — main thread: canvases + cheap per-frame lookups

// Sun behind the viewer, up and to the left: lit face toward us, terminator on the right
export const LIGHT = normalize([-0.55, 0.3, 0.78])

function normalize(v) {
  const l = Math.hypot(v[0], v[1], v[2])
  return [v[0] / l, v[1] / l, v[2] / l]
}

/**
 * Precomputes a sphere for a W×H map.
 * @param size     disk diameter in canvas pixels
 * @param tilt     roll of the spin axis in the image plane (rad)
 * @param pitch    how far the north pole leans toward the viewer (rad)
 * @param atmosphere [r, g, b, strength] rim glow, or null
 * @param emissive true for the Sun: no day/night side, just limb darkening
 * @param limb     limb darkening amount for gas giants (0..1)
 * @returns transferable geometry: { S, diskFraction, base (RGBA halo), P, U, V, SH, SP, RM, atm }
 */
export function computeSphere({ W, H, size, tilt = 0, pitch = 0.2, atmosphere = null, emissive = false, limb = 0.25 }) {
  const margin = atmosphere ? Math.round(size * 0.07) : 2
  const S = size + margin * 2
  const R = size / 2
  const base = new Uint8ClampedArray(S * S * 4)
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const [Lx, Ly, Lz] = LIGHT
  // Half-vector for the ocean glint (viewer looks along +z)
  const Hv = normalize([Lx, Ly, Lz + 1])

  const max = Math.ceil(Math.PI * R * R) + 4 * S
  const P = new Int32Array(max)
  const U = new Float32Array(max)
  const V = new Float32Array(max)
  const SH = new Float32Array(max)
  const SP = new Float32Array(max)
  const RM = new Float32Array(max)
  let n = 0

  for (let j = 0; j < S; j++) {
    for (let i = 0; i < S; i++) {
      const nx = (i + 0.5 - S / 2) / R
      const ny = -(j + 0.5 - S / 2) / R
      const r2 = nx * nx + ny * ny
      const k = (j * S + i) * 4

      if (r2 > 1) {
        // Atmosphere halo outside the disk (static: it doesn't rotate)
        if (!atmosphere) continue
        const r = Math.sqrt(r2)
        const t = 1 - (r - 1) / (margin / R)
        if (t <= 0) continue
        const facing = Math.max(0, (nx * Lx + ny * Ly) / r) // brighter on the sunlit side
        const a = Math.pow(t, 2.2) * atmosphere[3] * (0.25 + 0.75 * facing)
        base[k] = atmosphere[0]
        base[k + 1] = atmosphere[1]
        base[k + 2] = atmosphere[2]
        base[k + 3] = Math.min(255, a * 255)
        continue
      }

      const nz = Math.sqrt(1 - r2)
      // View space → planet space: undo the roll, then the pitch
      const rx = nx * ct + ny * st
      const ry = -nx * st + ny * ct
      const py = ry * cp + nz * sp
      const pz = -ry * sp + nz * cp
      const lat = Math.asin(Math.max(-1, Math.min(1, py)))
      const lon = Math.atan2(rx, pz)

      let shade
      let spec = 0
      let rim = 0
      if (emissive) {
        shade = 0.5 + 0.5 * Math.pow(nz, 0.6) // limb darkening
      } else {
        const d = nx * Lx + ny * Ly + nz * Lz
        // Soft terminator: a little light wraps past 90° like a real atmosphere/haze
        const lit = Math.max(0, (d + 0.06) / 1.06)
        shade = 0.02 + 0.98 * Math.pow(lit, 0.9)
        shade *= 1 - limb + limb * Math.pow(nz, 0.35)
        const h = Math.max(0, nx * Hv[0] + ny * Hv[1] + nz * Hv[2])
        spec = Math.pow(h, 70) * lit
        if (atmosphere) rim = Math.pow(1 - nz, 3) * atmosphere[3] * (0.15 + lit)
      }

      P[n] = k
      U[n] = ((lon / (Math.PI * 2) + 0.5) * W) % W
      V[n] = Math.min(H - 1.001, Math.max(0, (0.5 - lat / Math.PI) * H - 0.5))
      SH[n] = shade
      SP[n] = spec
      RM[n] = rim
      base[k + 3] = 255
      n++
    }
  }

  return {
    S,
    diskFraction: size / S,
    base,
    P: P.slice(0, n),
    U: U.slice(0, n),
    V: V.slice(0, n),
    SH: SH.slice(0, n),
    SP: SP.slice(0, n),
    RM: RM.slice(0, n),
    atm: atmosphere || [0, 0, 0, 0],
  }
}

/** Buffers to transfer (not copy) when posting a computeSphere result. */
export const sphereTransfer = (g) => [g.base.buffer, g.P.buffer, g.U.buffer, g.V.buffer, g.SH.buffer, g.SP.buffer, g.RM.buffer]

/** Main thread: canvas + render(rotation, cloudRotation) from precomputed geometry. */
export function createSphereRenderer(geometry, texture) {
  const { S, base, P, U, V, SH, SP, RM, atm } = geometry
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(S, S)
  const out = img.data
  out.set(base)
  const { width: W, data: tex, clouds } = texture
  const n = P.length

  /** Draws one frame; rotation and cloudRotation are fractions of a full turn. */
  function render(rotation = 0, cloudRotation = 0) {
    const off = (((rotation % 1) + 1) % 1) * W
    const cOff = (((cloudRotation % 1) + 1) % 1) * W
    for (let q = 0; q < n; q++) {
      // Bilinear sample of the map
      let u = U[q] + off
      if (u >= W) u -= W
      const v = V[q]
      const u0 = u | 0
      const v0 = v | 0
      const fu = u - u0
      const fv = v - v0
      const u1 = u0 + 1 === W ? 0 : u0 + 1
      const a = (v0 * W + u0) * 4
      const b = (v0 * W + u1) * 4
      const c = ((v0 + 1) * W + u0) * 4
      const d = ((v0 + 1) * W + u1) * 4
      const w00 = (1 - fu) * (1 - fv)
      const w10 = fu * (1 - fv)
      const w01 = (1 - fu) * fv
      const w11 = fu * fv
      let R0 = tex[a] * w00 + tex[b] * w10 + tex[c] * w01 + tex[d] * w11
      let G0 = tex[a + 1] * w00 + tex[b + 1] * w10 + tex[c + 1] * w01 + tex[d + 1] * w11
      let B0 = tex[a + 2] * w00 + tex[b + 2] * w10 + tex[c + 2] * w01 + tex[d + 2] * w11
      const water = (tex[a + 3] * w00 + tex[b + 3] * w10 + tex[c + 3] * w01 + tex[d + 3] * w11) / 255

      if (clouds) {
        let cu = U[q] + cOff
        if (cu >= W) cu -= W
        const cl = clouds[v0 * W + (cu | 0)] / 255
        R0 += (250 - R0) * cl
        G0 += (252 - G0) * cl
        B0 += (255 - B0) * cl
      }

      const s = SH[q]
      const g = SP[q] * water * 230
      const rim = RM[q]
      const k = P[q]
      out[k] = R0 * s + g + atm[0] * rim
      out[k + 1] = G0 * s + g + atm[1] * rim
      out[k + 2] = B0 * s + g * 0.95 + atm[2] * rim
    }
    ctx.putImageData(img, 0, 0)
  }

  render(0, 0)
  return { canvas, render, diskFraction: geometry.diskFraction }
}

// Ring density profiles, by name (functions can't be sent to the worker). r = planet radii.
const RING_PROFILES = {
  // Saturn: C ring (faint), B ring (bright), Cassini division, A ring with the Encke gap
  saturn: (r) => {
    if (r < 1.53) return 0.12 + 0.1 * Math.sin(r * 90) ** 2
    if (r < 1.95) return 0.75 + 0.2 * Math.sin(r * 140) * Math.sin(r * 37)
    if (r < 2.03) return 0.04
    if (r > 2.2 && r < 2.225) return 0.05
    return 0.5 + 0.15 * Math.sin(r * 110)
  },
  // Uranus: a few thin, dark, narrow rings
  uranus: (r) => (Math.abs(Math.sin(r * 26)) > 0.985 ? 0.5 : 0),
}

/**
 * Rings split into the half behind the planet and the half in front, with the
 * planet's shadow falling on them. Same tilt/pitch as the planet.
 * @returns transferable { S, scale, back, front } (RGBA arrays)
 */
export function computeRings({ size, tilt = 0, pitch = 0.45, inner, outer, profile, color, opacity = 1 }) {
  const density = RING_PROFILES[profile]
  const R = size / 2
  const S = Math.ceil(outer * size) + 4
  const back = new Uint8ClampedArray(S * S * 4)
  const front = new Uint8ClampedArray(S * S * 4)
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const sinI = Math.sin(pitch)
  const cosI = Math.cos(pitch)
  const [Lx, Ly, Lz] = LIGHT

  for (let j = 0; j < S; j++) {
    for (let i = 0; i < S; i++) {
      const sx = (i + 0.5 - S / 2) / R
      const sy = -(j + 0.5 - S / 2) / R
      // Undo the roll, then find the point on the tilted ring plane
      const vx = sx * ct + sy * st
      const vy = -sx * st + sy * ct
      const rz = -vy / sinI
      const r = Math.hypot(vx, rz)
      if (r < inner || r > outer) continue
      const dens = density(r)
      if (dens <= 0.01) continue
      const vz = rz * cosI
      // Planet shadow on the rings: does the ray toward the Sun hit the planet?
      const b = vx * Lx + vy * Ly + vz * Lz
      const cc = vx * vx + vy * vy + vz * vz - 1
      const disc = b * b - cc
      const light = disc > 0 && -b + Math.sqrt(disc) > 0 ? 0.12 : 1
      const target = vz > 0 ? front : back // near half in front of the planet
      const k = (j * S + i) * 4
      target[k] = color[0] * light
      target[k + 1] = color[1] * light
      target[k + 2] = color[2] * light
      target[k + 3] = Math.min(255, dens * opacity * 255)
    }
  }
  // scale = ring canvas width as a multiple of the planet disk
  return { S, scale: S / size, back, front }
}

/** Main thread: the two ring canvases from computeRings data. */
export function ringCanvases({ S, back, front }) {
  const make = (data) => {
    const c = document.createElement('canvas')
    c.width = S
    c.height = S
    const g = c.getContext('2d')
    const img = g.createImageData(S, S)
    img.data.set(data)
    g.putImageData(img, 0, 0)
    return c
  }
  return { back: make(back), front: make(front) }
}
