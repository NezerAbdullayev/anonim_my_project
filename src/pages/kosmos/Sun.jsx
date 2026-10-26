import { useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion'
import SphereView from './SphereView.jsx'
import { SUN } from './journey.js'

// Real photo: sunspot and granulation, Inouye Solar Telescope (NSO/NSF/AURA, CC BY 4.0)
const SURFACE_URL = '/images/sun-surface.jpg'

const END = 0.08 // the Sun is out of frame by here
const LABEL_END = 0.001 // the label hides as soon as the trip starts moving
// Zoom (0..1, before the journey): grows to ZOOM_MAX, then snaps back over the last
// RETURN of it (15vh of the 400vh zoom ≈ 0.3 s)
const ZOOM_MAX = 12
const RETURN = 0.0375
const GROWN = 1 - RETURN

/** Sun's size factor from the zoom: steady exponential growth, then a quick return. */
const zoomScale = (z) =>
  z < GROWN ? Math.pow(ZOOM_MAX, z / GROWN) : Math.pow(ZOOM_MAX, 1 - (z - GROWN) / RETURN)

/**
 * The journey starts facing the Sun. Scrolling first zooms into it until its surface
 * fills the screen, then it snaps back; then we turn away and it slides off to the left.
 */
export default function Sun({ progress, zoom, engine, texture }) {
  const [visible, setVisible] = useState(true)
  // Label: shown on load (at the very top), gone on the first scroll
  const [moved, setMoved] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  useMotionValueEvent(progress, 'change', (p) => {
    setVisible(p < END + 0.01)
    setMoved(p >= LABEL_END)
  })
  useMotionValueEvent(zoom, 'change', (z) => setZoomed(z >= LABEL_END))
  const labelShown = !moved && !zoomed
  const reduce = useReducedMotion()

  // 0 → END: camera turns away: the Sun slides off to the left…
  const x = useTransform(progress, [0, END], ['0vw', '-80vw'])
  // …and swells a little (it is passing the edge of our view); before that the zoom
  // (reduced motion: no zoom, the surface just fades in and out)
  const scale = useTransform([progress, zoom], ([p, z]) => (1 + 0.5 * Math.min(1, p / END)) * (reduce ? 1 : zoomScale(z)))
  // END-0.03 → END: fades as it leaves
  const opacity = useTransform(progress, [END - 0.03, END], [1, 0])

  if (!visible) return null
  return (
    <>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[60vmin] w-[60vmin] -ml-[30vmin] -mt-[26vmin]"
        style={{ x, scale, opacity }}
      >
        {/* Outer glow, breathing slowly */}
        <motion.div
          className="absolute -inset-[70%] rounded-full bg-[radial-gradient(circle,rgba(255,196,90,0.5)_0%,rgba(255,140,40,0.16)_32%,rgba(255,120,30,0)_68%)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Corona hugging the disk */}
        <div className="absolute -inset-[16%] rounded-full bg-[radial-gradient(circle,rgba(255,250,220,0.95)_52%,rgba(255,210,120,0.45)_62%,rgba(255,170,60,0)_76%)]" />
        {texture && <SphereView engine={engine} texture={texture} px={560} spin={0.008} options={{ emissive: true, pitch: 0.1 }} />}
      </motion.div>

      <SunSurface zoom={zoom} reduce={reduce} />

      {/* Same look as the planet labels, on the left (at the bottom on phones) */}
      <motion.div
        className="pointer-events-none absolute bottom-[7vh] left-4 right-4 z-[600] sm:bottom-auto sm:left-[6vw] sm:right-auto sm:top-1/2 sm:w-[30vw] sm:-translate-y-1/2"
        initial={false}
        animate={
          labelShown
            ? { opacity: 1, x: 0, filter: 'blur(0px)' }
            : { opacity: 0, x: reduce ? 0 : -24, filter: reduce ? 'blur(0px)' : 'blur(4px)' }
        }
        transition={{ duration: labelShown ? 0.5 : 0.3, ease: 'easeOut' }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">{SUN.tagline}</p>
        <h2 className="font-display text-5xl font-black tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-7xl">
          {SUN.name}
        </h2>
        <ul className="mt-3 space-y-1 font-mono text-xl text-slate-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
          {SUN.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </motion.div>
    </>
  )
}

/** Full-screen photo of the real surface, shown while the zoom is deep in. */
function SunSurface({ zoom, reduce }) {
  // 0.5 → 0.78: fades in as the blurry disk fills the screen; out during the first half of the return
  const opacity = useTransform(zoom, [0.5, 0.78, GROWN, GROWN + RETURN / 2], [0, 1, 1, 0])
  // 0.5 → GROWN: keeps closing in on the surface; GROWN → 1: pulls back with the Sun
  const scale = useTransform(zoom, [0.5, GROWN, 1], reduce ? [1, 1, 1] : [1, 1.4, 1])

  // Always mounted (just transparent), so the photo is loaded before it's needed
  return (
    <motion.div className="pointer-events-none absolute inset-0 z-20 overflow-hidden bg-[#2a0a00]" style={{ opacity }}>
      {/* Slightly dimmed so a full screen of it isn't glaring */}
      <motion.img
        src={SURFACE_URL}
        alt=""
        className="absolute inset-0 h-full w-full object-cover brightness-[0.85]"
        style={{ scale }}
      />
      {/* Darker edges for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_45%,rgba(40,6,0,0.6)_100%)]" />
      <p className="absolute bottom-2 right-3 font-mono text-[10px] text-white/60">
        Günəşin səthi · Foto: NSO/NSF/AURA (CC BY 4.0)
      </p>
    </motion.div>
  )
}

/** Warm sunlight washing in from the left; weaker the farther out we are. */
export function SunLight({ progress }) {
  // 0.03 → 0.1: appears as the Sun leaves the frame; then fades with distance
  const opacity = useTransform(progress, [0.03, 0.1, 0.5, 1], [0, 1, 0.45, 0.15])
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_-10%_30%,rgba(255,214,150,0.22),rgba(255,214,150,0)_60%)]"
      style={{ opacity }}
    />
  )
}
