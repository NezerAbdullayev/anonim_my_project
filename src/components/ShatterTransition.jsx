import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { crack, shatter } from '../audio/soundEffects.js'

// Timeline (ms): cracks spread over the black → the black shatters into shards
const CRACK_MS = 450
const SHATTER_MS = 1500
const RAYS = 14 // shards around the impact point
const RINGS = [0.12, 0.3, 0.55, 0.85, 1.25] // ring radii (× half screen diagonal)
const GRAVITY = 1400 // px/s²
const EDGE = '#00ff66'

// The page underneath should start appearing when the shards start flying (s)
export const SHATTER_REVEAL_DELAY = CRACK_MS / 1000

const rand = (min, max) => Math.random() * (max - min) + min

// Radial crack pattern around (cx, cy): triangles at the centre, (split) quads further out
function makeShards(cx, cy, maxR) {
  const step = (Math.PI * 2) / RAYS
  const angles = Array.from({ length: RAYS }, (_, k) => k * step + rand(-0.35, 0.35) * step)
  const rings = RINGS.map((r, ri) =>
    angles.map((a) => {
      // The outer ring only jitters outward, so the screen corners are always covered
      const rad = r * maxR * (ri === RINGS.length - 1 ? rand(1, 1.15) : rand(0.85, 1.15))
      return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]
    })
  )
  const polys = []
  for (let k = 0; k < RAYS; k++) {
    const k2 = (k + 1) % RAYS
    polys.push({ pts: [[cx, cy], rings[0][k], rings[0][k2]], ring: 0 })
    for (let r = 0; r < rings.length - 1; r++) {
      const quad = [rings[r][k], rings[r][k2], rings[r + 1][k2], rings[r + 1][k]]
      if (Math.random() < 0.5) {
        polys.push({ pts: [quad[0], quad[1], quad[2]], ring: r + 1 })
        polys.push({ pts: [quad[0], quad[2], quad[3]], ring: r + 1 })
      } else {
        polys.push({ pts: quad, ring: r + 1 })
      }
    }
  }
  return polys.map((p) => {
    const mx = p.pts.reduce((s, q) => s + q[0], 0) / p.pts.length
    const my = p.pts.reduce((s, q) => s + q[1], 0) / p.pts.length
    const dx = mx - cx
    const dy = my - cy
    const d = Math.hypot(dx, dy) || 1
    const dist = Math.min(1, d / maxR) // 0 = centre, 1 = edge
    const speed = rand(500, 900) * (1.4 - dist * 0.6) // inner shards fly faster
    return {
      ...p,
      mx,
      my,
      local: p.pts.map(([x, y]) => [x - mx, y - my]), // points relative to the centroid
      vx: (dx / d) * speed,
      vy: (dy / d) * speed - rand(100, 300),
      spin: rand(-4, 4), // rad/s in the screen plane
      flip: rand(3, 8), // rad/s tumbling (fake 3D: squashes the shard)
      delay: dist * 0.25, // s: inner shards break first
    }
  })
}

/**
 * Full-screen black that cracks and then shatters into tumbling shards, revealing
 * whatever is rendered underneath. Calls onDone when the last shard is gone.
 */
export default function ShatterTransition({ onDone }) {
  const reduce = useReducedMotion()
  const canvasRef = useRef(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (reduce) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const cx = w / 2
    const cy = h / 2
    const maxR = Math.hypot(w, h) / 2
    const shards = makeShards(cx, cy, maxR)
    const ringCount = RINGS.length
    const start = performance.now()
    let shattered = false
    let raf = 0

    crack()

    const path = (pts) => {
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
    }

    const frame = (now) => {
      const e = now - start
      ctx.clearRect(0, 0, w, h)

      if (e < CRACK_MS) {
        // Whole screen still black; cracks spread ring by ring from the centre
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, w, h)
        const reached = (e / CRACK_MS) * (ringCount + 1)
        ctx.strokeStyle = EDGE
        ctx.shadowColor = EDGE
        ctx.shadowBlur = 10
        ctx.lineWidth = 1.5
        for (const s of shards) {
          if (s.ring > reached) continue
          ctx.globalAlpha = Math.min(1, reached - s.ring)
          path(s.pts)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
        // Impact glow at the centre, fading out
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.25)
        g.addColorStop(0, `rgba(180,255,210,${0.5 * (1 - e / CRACK_MS)})`)
        g.addColorStop(1, 'rgba(0,255,102,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
        raf = requestAnimationFrame(frame)
        return
      }

      if (!shattered) {
        shattered = true
        shatter()
      }

      // Shards fly outward, tumble and fall, fading near the end
      const t = (e - CRACK_MS) / 1000
      let alive = false
      for (const s of shards) {
        const st = Math.max(0, t - s.delay)
        const life = st / (SHATTER_MS / 1000 - s.delay)
        if (life >= 1) continue
        alive = true
        const x = s.mx + s.vx * st
        const y = s.my + s.vy * st + 0.5 * GRAVITY * st * st
        const alpha = life < 0.55 ? 1 : 1 - (life - 0.55) / 0.45
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(s.spin * st)
        ctx.scale(Math.cos(s.flip * st), 1 - 0.15 * life) // tumbling in 3D
        ctx.globalAlpha = alpha
        path(s.local)
        ctx.fillStyle = '#000'
        ctx.fill()
        ctx.strokeStyle = EDGE
        ctx.lineWidth = 1.5
        ctx.globalAlpha = alpha * (1 - life)
        ctx.stroke()
        ctx.restore()
      }

      if (alive) raf = requestAnimationFrame(frame)
      else onDoneRef.current?.()
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [reduce])

  // Reduced motion: no cracks or flying shards, just a calm fade
  if (reduce) {
    return (
      <motion.div
        className="pointer-events-none fixed inset-0 z-40 bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        onAnimationComplete={() => onDoneRef.current?.()}
      />
    )
  }

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 h-full w-full" />
}
