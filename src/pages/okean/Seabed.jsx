import { useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { BOTTOM, ZONES, holdRange } from './dive.js'

const END = ZONES.at(-1).at[1] // where the trench ends and the floor comes into view
const [H0] = holdRange(BOTTOM.at)

// Soft, sediment-covered floor of the trench (viewBox 1440 × 200)
const FLOOR = 'M0,70 C180,40 360,56 540,62 C720,68 900,36 1080,48 C1260,60 1350,74 1440,66 L1440,200 L0,200 Z'

/**
 * The bottom of the Challenger Deep: the floor rises between the trench walls, a light
 * from above slowly comes up on it (slow on purpose: no flash), and the final card shows
 * with a button back up to the surface (onRestart).
 */
export default function Seabed({ progress, onRestart }) {
  const [shown, setShown] = useState(false)
  useMotionValueEvent(progress, 'change', (p) => setShown(p >= H0 - 0.004))

  // END → H0: the floor comes up from below the screen
  const floorY = useTransform(progress, [END, H0], ['30vh', '0vh'])
  // END + 0.005 → H0: the light from our submersible fades in on the floor
  const lightOpacity = useTransform(progress, [END + 0.005, H0], [0, 1])
  // H0 - 0.012 → H0: the final card fades in and drifts up into place
  const cardOpacity = useTransform(progress, [H0 - 0.012, H0], [0, 1])
  const cardY = useTransform(progress, [H0 - 0.012, H0], ['4vh', '0vh'])

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[450]" aria-hidden="true">
        <motion.div
          className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_45%_60%_at_50%_95%,rgba(186,230,253,0.28)_0%,rgba(125,211,252,0.08)_45%,transparent_75%)]"
          style={{ opacity: lightOpacity }}
        />
        <motion.svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[24vh] w-full"
          style={{ y: floorY }}
        >
          <defs>
            <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5b6475" />
              <stop offset="0.2" stopColor="#262b36" />
              <stop offset="1" stopColor="#07080c" />
            </linearGradient>
          </defs>
          <path d={FLOOR} fill="url(#floor)" />
        </motion.svg>
      </div>

      <motion.section
        className="pointer-events-none absolute inset-0 z-[600] mx-auto flex max-w-xl flex-col items-center justify-center px-4 pb-24 text-center sm:pb-16"
        style={{ opacity: cardOpacity, y: cardY }}
        aria-label={BOTTOM.name}
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-200/80">Dibə çatdıq</p>
        <h2 className="mt-2 font-display text-4xl font-black drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-6xl">
          {BOTTOM.name}
        </h2>
        <p className="mt-2 text-sm text-cyan-100 sm:text-base">{BOTTOM.tagline}</p>
        <ul className="mt-4 space-y-1.5 rounded-2xl bg-slate-950/40 p-4 text-left text-sm leading-snug text-slate-100 backdrop-blur-sm sm:p-5 sm:text-base">
          {BOTTOM.facts.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
        {shown && (
          <motion.button
            type="button"
            onClick={onRestart}
            className="pointer-events-auto mt-6 rounded-full bg-cyan-100 px-8 py-3 font-display text-lg font-bold text-slate-900 shadow-[0_0_24px_rgba(165,243,252,0.35)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Səthə qayıt ↑
          </motion.button>
        )}
      </motion.section>
    </>
  )
}
