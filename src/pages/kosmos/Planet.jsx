import { useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion'
import SphereView from './SphereView.jsx'
import { SurfacePhoto, useZoom, zoomScale } from './SurfaceZoom.jsx'
import { TRACK, holdRange } from './journey.js'

// Perspective: on-screen scale = 1 / distance; interpolating the distance on a log
// scale gives the steady "it keeps getting closer" feel of a real approach
const logLerp = (a, b, t) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t)

/**
 * One body on the route: approaches from far away, lingers, then rushes past. A body
 * with a `surface` is also zoomed into (scroll-driven) right after its facts.
 */
export default function Planet({ body, progress, scroll, engine, texture, moonTexture }) {
  const [t0, t1] = body.at
  const [h0, h1] = holdRange(body)

  // Only build the (memory-heavy) renderer while the planet is on or near the screen
  const [near, setNear] = useState(false)
  // h0 → h1: the label with all its facts is on screen (HOLD_VH of scroll)
  const [inHold, setInHold] = useState(false)
  useMotionValueEvent(progress, 'change', (p) => {
    setNear(p > t0 - 0.04 && p < t1 + 0.01)
    setInHold(p >= h0 && p <= h1)
  })
  // Surface zoom (stays 0 for bodies without one); the label hides once it starts
  const zoom = useZoom(scroll, TRACK.zooms[body.key])
  const [zoomed, setZoomed] = useState(false)
  useMotionValueEvent(zoom, 'change', (z) => setZoomed(z > 0.001))
  const shown = inHold && !zoomed
  const reduce = useReducedMotion()

  const flyScale = useTransform(progress, (p) => {
    if (p <= t0) return 0.02
    // t0 → h0: a dot in the distance grows as we approach (40 → 1.15 sizes away)
    if (p < h0) return 1 / logLerp(40, 1.15, (p - t0) / (h0 - t0))
    // h0 → h1: slow drift past at its closest calm distance (label is shown here)
    if (p < h1) return 1 / logLerp(1.15, 0.9, (p - h0) / (h1 - h0))
    // h1 → t1: we rush past it, it swells and leaves the frame
    if (p < t1) return 1 / logLerp(0.9, 0.18, (p - h1) / (t1 - h1))
    return 6
  })
  // On top of the flight: the surface zoom (reduced motion: no zoom, the photo just fades in and out)
  const scale = useTransform([flyScale, zoom], ([s, z]) => s * (reduce ? 1 : zoomScale(z)))
  // Whole slot: sits off-centre on its side; h1 → t1: slides out past that side
  const x = useTransform(progress, (p) => {
    const u = p < h1 ? 0 : Math.min(1, (p - h1) / (t1 - h1))
    return `${body.side * (14 + 85 * u * u)}vw`
  })
  // h1 → t1: also drifts a bit upward as it passes below/beside us
  const y = useTransform(progress, (p) => {
    const u = p < h1 ? 0 : Math.min(1, (p - h1) / (t1 - h1))
    return `${-4 - 10 * u * u}vh`
  })
  // t0 → t0+0.012: fades in as a dot; t1-0.02 → t1: fades out at the edge
  const opacity = useTransform(progress, [t0, t0 + 0.012, t1 - 0.02, t1], [0, 1, 1, 0])
  // Closer bodies are drawn on top (kept under the labels and the surface photo)
  const zIndex = useTransform(scale, (s) => Math.min(590, Math.round(s * 100)))

  const size = `${body.size}vmin`
  // Label on the opposite side of the screen from the planet (at the bottom on phones)
  const labelSide = body.side > 0 ? 'sm:left-[6vw] sm:right-auto' : 'sm:left-auto sm:right-[6vw] sm:text-right'

  return (
    <>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width: size,
          height: size,
          marginLeft: `-${body.size / 2}vmin`,
          marginTop: `-${body.size / 2}vmin`,
          x,
          y,
          scale,
          opacity,
          zIndex,
        }}
      >
        {near && texture && (
          <SphereView
            engine={engine}
            texture={texture}
            px={body.px}
            options={body.sphere}
            spin={body.spin}
            cloudSpin={body.cloudSpin}
            rings={body.rings}
          />
        )}
        {near && body.moon && moonTexture && (
          <div
            className="absolute"
            style={{
              width: `${body.moon.size * 100}%`,
              height: `${body.moon.size * 100}%`,
              left: `${(0.5 + body.moon.x - body.moon.size / 2) * 100}%`,
              top: `${(0.5 + body.moon.y - body.moon.size / 2) * 100}%`,
            }}
          >
            <SphereView engine={engine} texture={moonTexture} px={body.moon.px} spin={body.moon.spin} options={{ pitch: 0.1, limb: 0.05 }} />
          </div>
        )}
      </motion.div>

      {body.surface && <SurfacePhoto zoom={zoom} surface={body.surface} reduce={reduce} className="z-[595]" />}

      {/* Positioning (incl. the centring translate) on the outer box: the animated x would override it */}
      <div
        className={`pointer-events-none absolute bottom-[7vh] left-4 right-4 z-[600] sm:bottom-auto sm:top-1/2 sm:w-[30vw] sm:-translate-y-1/2 ${labelSide}`}
      >
        <motion.div
          initial={false}
          animate={
            shown
              ? { opacity: 1, x: 0, filter: 'blur(0px)' }
              : { opacity: 0, x: reduce ? 0 : body.side * -24, filter: reduce ? 'blur(0px)' : 'blur(4px)' }
          }
          // Everything appears at once over 0.5 s, then stays for the HOLD_VH stretch of scroll
          transition={{ duration: shown ? 0.5 : 0.3, ease: 'easeOut' }}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-sky-200/70">{body.tagline}</p>
          <h2 className="font-display text-5xl font-black tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-7xl">
            {body.name}
          </h2>
          <ul className="mt-3 space-y-1 font-mono text-xl text-slate-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            {body.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </>
  )
}
