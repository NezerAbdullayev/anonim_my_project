import { useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion'
import SphereView from './SphereView.jsx'
import { SurfacePhoto, zoomScale } from './SurfaceZoom.jsx'
import { SUN } from './journey.js'

const END = 0.08 // the Sun is out of frame by here
const LABEL_END = 0.001 // the label hides as soon as the trip starts moving

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

      <SurfacePhoto zoom={zoom} surface={SUN.surface} reduce={reduce} className="z-20" />

      {/* Same look as the planet labels, on the left (at the bottom on phones); positioning on
          the outer box, since the animated x would override its centring translate */}
      <div className="pointer-events-none absolute bottom-[calc(7vh+40px)] left-4 right-4 z-[600] sm:bottom-auto sm:left-[6vw] sm:right-auto sm:top-1/2 sm:w-[30vw] sm:-translate-y-1/2">
        <motion.div
          initial={false}
          animate={
            labelShown
              ? { opacity: 1, x: 0, filter: 'blur(0px)' }
              : { opacity: 0, x: reduce ? 0 : -24, filter: reduce ? 'blur(0px)' : 'blur(4px)' }
          }
          transition={{ duration: labelShown ? 0.5 : 0.3, ease: 'easeOut' }}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">{SUN.tagline}</p>
          <h2 className="font-display text-3xl font-black tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-7xl">
            {SUN.name}
          </h2>
          <ul className="mt-3 space-y-1 font-mono text-xs text-slate-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-xl">
            {SUN.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </>
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
