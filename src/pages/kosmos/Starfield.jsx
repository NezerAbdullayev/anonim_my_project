import { useEffect, useRef } from 'react'
import { createNoise } from './noise.js'
import { LIGHT } from './sphere.js'
import { ASTEROID_BELT } from './journey.js'

const NEAR_STARS = 700 // 3D stars that stream past while travelling
const FAR_STARS = 2600 // painted sky (static, slow parallax)
const CRUISE = 0.015 // drift speed when not scrolling
const WARP = 18 // extra speed per unit of scroll velocity (scaled to the 3600vh track)
const MAX_ASTEROIDS = 70

const rand = (a, b) => Math.random() * (b - a) + a
// Real star colours: hot blue-white → sun-like yellow → cool orange
const STAR_COLORS = ['#cfd9ff', '#e6ecff', '#ffffff', '#fff4e0', '#ffe2b8', '#ffc78f']

/** Deep sky painted once: Milky Way band with dust lanes + thousands of faint stars. */
function paintSky(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  g.fillStyle = '#010104'
  g.fillRect(0, 0, w, h)

  // Milky Way: noise-shaped glow along a diagonal band, darker dust lanes inside
  const N = createNoise(7)
  const step = 4
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const across = ((x / w) * 0.55 - y / h + 0.25) * 3.2 // distance from band centre line
      const band = Math.exp(-across * across)
      if (band < 0.02) continue
      const glow = N.fbm(x / 220, y / 220, 0.5, 5)
      const dust = N.fbm(x / 90, y / 90, 3.1, 4)
      const v = band * Math.max(0, glow - 0.32) * 1.6 * (1 - Math.max(0, dust - 0.52) * 2.4)
      if (v <= 0.01) continue
      g.fillStyle = `rgba(${200 + glow * 40 | 0},${185 + glow * 30 | 0},${215 + glow * 30 | 0},${Math.min(0.32, v * 0.42)})`
      g.fillRect(x, y, step, step)
    }
  }
  // Faint nebula tints
  for (const [px, py, col] of [[0.2, 0.75, '120,60,160'], [0.78, 0.25, '40,90,170'], [0.55, 0.55, '160,80,70']]) {
    const r = Math.max(w, h) * 0.35
    const grad = g.createRadialGradient(px * w, py * h, 0, px * w, py * h, r)
    grad.addColorStop(0, `rgba(${col},0.07)`)
    grad.addColorStop(1, `rgba(${col},0)`)
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
  }
  // Far stars: mostly tiny and dim, denser inside the band
  for (let i = 0; i < FAR_STARS; i++) {
    let x = Math.random() * w
    let y = Math.random() * h
    if (Math.random() < 0.45) {
      // pull toward the band
      const t = Math.random()
      x = t * w
      y = ((t * 0.55 + 0.25) * h) + rand(-0.12, 0.12) * h
    }
    const m = Math.pow(Math.random(), 3)
    g.globalAlpha = 0.25 + m * 0.75
    g.fillStyle = STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0]
    g.beginPath()
    g.arc(x, y, 0.3 + m * 1.2, 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 1
  return c
}

function newStar(far = true) {
  return { x: rand(-1.6, 1.6), y: rand(-1, 1), z: far ? rand(0.6, 1) : rand(0.05, 1), c: STAR_COLORS[(Math.random() * 6) | 0] }
}

function newAsteroid() {
  const n = 7 + ((Math.random() * 5) | 0)
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const r = rand(0.65, 1)
    return [Math.cos(a) * r, Math.sin(a) * r * rand(0.7, 1)]
  })
  const tone = rand(70, 120)
  return {
    x: rand(-1.4, 1.4),
    y: rand(-0.9, 0.9),
    z: 1,
    size: rand(0.004, 0.03),
    rot: rand(0, Math.PI * 2),
    spin: rand(-1.2, 1.2),
    pts,
    light: `rgb(${tone + 50 | 0},${tone + 40 | 0},${tone + 28 | 0})`,
    dark: `rgb(${tone * 0.25 | 0},${tone * 0.22 | 0},${tone * 0.2 | 0})`,
  }
}

/**
 * Background of the journey. Reads the scroll progress itself every frame: the
 * faster you scroll, the faster stars (and, in the belt, asteroids) stream past.
 */
export default function Starfield({ progress }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let sky = null
    const stars = Array.from({ length: NEAR_STARS }, () => newStar(false))
    const rocks = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sky = paintSky(Math.round(w * 1.3), h) // wider than the screen for parallax
    }

    let last = performance.now()
    let lastP = progress.get()
    let vel = 0
    let raf = 0

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const p = progress.get()
      vel = vel * 0.85 + (Math.abs(p - lastP) / Math.max(dt, 0.001)) * 0.15
      lastP = p
      const speed = reduce ? 0 : CRUISE + vel * WARP

      // Painted sky drifts sideways a little over the whole journey
      ctx.drawImage(sky, -p * w * 0.3, 0)

      const cx = w / 2
      const cy = h / 2
      const f = Math.max(w, h) * 0.5
      for (const s of stars) {
        const prevZ = s.z
        s.z -= speed * dt
        if (s.z <= 0.03) Object.assign(s, newStar())
        const sx = cx + (s.x / s.z) * f
        const sy = cy + (s.y / s.z) * f
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) {
          Object.assign(s, newStar())
          continue
        }
        const near = 1 - s.z
        ctx.globalAlpha = Math.min(1, near * 1.2)
        ctx.fillStyle = s.c
        ctx.strokeStyle = s.c
        const r = 0.25 + near * near * 1.8
        // Fast travel: short motion streaks instead of dots
        if (speed > 0.12 && prevZ > s.z) {
          ctx.lineWidth = r
          ctx.beginPath()
          ctx.moveTo(cx + (s.x / prevZ) * f, cy + (s.y / prevZ) * f)
          ctx.lineTo(sx, sy)
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      // Asteroid belt: rocks spawn while we are inside it and tumble past
      const [b0, b1] = ASTEROID_BELT
      const inBelt = p > b0 && p < b1 ? Math.sin(((p - b0) / (b1 - b0)) * Math.PI) : 0
      if (!reduce && inBelt > 0 && rocks.length < MAX_ASTEROIDS * inBelt && Math.random() < 0.6) {
        rocks.push(newAsteroid())
      }
      for (let i = rocks.length - 1; i >= 0; i--) {
        const a = rocks[i]
        a.z -= (speed * 1.4 + 0.02) * dt
        a.rot += a.spin * dt
        const sx = cx + (a.x / a.z) * f
        const sy = cy + (a.y / a.z) * f
        const r = (a.size / a.z) * f
        if (a.z <= 0.04 || sx < -r * 2 || sx > w + r * 2 || sy < -r * 2 || sy > h + r * 2) {
          rocks.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.translate(sx, sy)
        ctx.rotate(a.rot)
        ctx.globalAlpha = Math.min(1, (1 - a.z) * 2.5)
        // Lit from the Sun's side (in the rock's own rotated frame)
        const lx = Math.cos(-a.rot) * LIGHT[0] - Math.sin(-a.rot) * -LIGHT[1]
        const ly = Math.sin(-a.rot) * LIGHT[0] + Math.cos(-a.rot) * -LIGHT[1]
        const grad = ctx.createRadialGradient(lx * r * 0.6, ly * r * 0.6, r * 0.1, 0, 0, r * 1.2)
        grad.addColorStop(0, a.light)
        grad.addColorStop(1, a.dark)
        ctx.fillStyle = grad
        ctx.beginPath()
        a.pts.forEach(([x, y], k) => (k ? ctx.lineTo(x * r, y * r) : ctx.moveTo(x * r, y * r)))
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      ctx.globalAlpha = 1

      if (!reduce) raf = requestAnimationFrame(frame)
    }

    resize()
    const onResize = () => {
      resize()
      if (reduce) frame(performance.now())
    }
    window.addEventListener('resize', onResize)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [progress])

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
}
