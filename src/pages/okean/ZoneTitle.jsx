import { motion, useTransform } from 'framer-motion'
import { TITLE, ZONES } from './dive.js'

const FADE = 0.012

const groupDigits = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** Title card as you enter a zone: its name, depth range and what the water is like there. */
export default function ZoneTitle({ zone, index, progress }) {
  const start = zone.at[0]
  // start → start + TITLE: the card fades in, stays, and fades out before the zone's creatures
  const opacity = useTransform(progress, [start, start + FADE, start + TITLE - FADE, start + TITLE], [0, 1, 1, 0])
  // and drifts up a little the whole time, like the water passing by
  const y = useTransform(progress, [start, start + TITLE], ['6vh', '-6vh'])

  return (
    <motion.section
      className="pointer-events-none absolute inset-0 z-[600] mx-auto flex max-w-xl flex-col justify-center px-4 text-center"
      style={{ opacity, y }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-200/80">
        {index + 1}/{ZONES.length} · {zone.sci}
      </p>
      <h2 className="mt-2 font-display text-4xl font-black drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)] sm:text-6xl">
        {zone.name}
      </h2>
      <p className="mt-2 font-mono text-sm text-cyan-100 sm:text-base">
        {groupDigits(zone.range[0])} – {groupDigits(zone.range[1])} m
      </p>
      <p className="mt-4 text-base leading-relaxed text-slate-100 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:text-lg">
        {zone.text}
      </p>
    </motion.section>
  )
}
