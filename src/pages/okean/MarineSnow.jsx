import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

const MAX_FLAKES = 180
// How far the flakes move up per full dive (in screen heights): the sense of sinking
const PARALLAX = 14
const SINK_PX = 0.15 // the flakes' own slow fall, per frame

// Flakes by dive point: barely any plankton specks near the surface, thick "snow" below 1 000 m
const DENSITY = [
  [0, 0.15],
  [0.22, 0.45],
  [0.39, 1],
  [1, 1],
]

const densityAt = (p) => {
  for (let i = 1; i < DENSITY.length; i++) {
    const [p1, d1] = DENSITY[i]
    if (p <= p1) {
      const [p0, d0] = DENSITY[i - 1]
      return d0 + ((p - p0) / (p1 - p0)) * (d1 - d0)
    }
  }
  return 1
}

/**
 * "Marine snow": organic specks drifting down through the water column. They stream
 * upward as you scroll down, so the scroll feels like sinking. Canvas, paused while the
 * tab is hidden; with reduced motion they only move with the scroll.
 */
export default function MarineSnow({ progress }) {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let flakes = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.min(MAX_FLAKES, Math.round((w * h) / 7000))
      flakes = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.6,
        a: 0.25 + Math.random() * 0.5,
        depth: 0.4 + Math.random() * 0.6, // nearer flakes move faster
        sway: Math.random() * Math.PI * 2,
        rank: i / n, // shown once the density passes it
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    let last = progress.get()
    let raf = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (document.hidden) return
      const p = progress.get()
      const dy = (p - last) * PARALLAX * h
      last = p
      const density = densityAt(p)

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#dbeafe'
      for (const f of flakes) {
        f.y -= dy * f.depth
        if (!reduced) {
          f.y += SINK_PX * f.depth
          f.sway += 0.01
        }
        if (f.y < -4) f.y += h + 8
        if (f.y > h + 4) f.y -= h + 8
        if (f.rank > density) continue
        ctx.globalAlpha = f.a
        ctx.beginPath()
        ctx.arc(f.x + Math.sin(f.sway) * 6, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [progress, reduced])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
}
