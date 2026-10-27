import { motion, useTransform } from 'framer-motion'
import { TITLE, TITLE_SHORT } from './timeline.js'

/**
 * An era's title as a banner that slides in from the left and out to the right: time flows
 * sideways here, the way you read a timeline.
 */
export default function EraTitle({ era, progress }) {
  const start = era.at[0]
  const span = era.short ? TITLE_SHORT : TITLE
  const fade = span * 0.25
  // start → start + span: the banner crosses the screen from left to right, pausing in the middle
  const x = useTransform(progress, [start, start + fade, start + span - fade, start + span], ['-60vw', '0vw', '0vw', '60vw'])
  const opacity = useTransform(progress, [start, start + fade, start + span - fade, start + span], [0, 1, 1, 0])

  return (
    <motion.section
      className="pointer-events-none absolute inset-x-0 top-[24vh] z-[600] flex flex-col items-center px-4 text-center sm:top-[26vh] short:top-[32vh]"
      style={{ x, opacity }}
      aria-label={era.name}
    >
      <p className="font-mono text-xs tracking-[0.3em] text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-sm">
        {Math.floor(era.years[0])} – {Math.floor(era.years[1])}
      </p>
      <h2 className={`mt-1 font-black ${era.short ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-6xl'} short:text-2xl ${era.titleClass}`}>{era.name}</h2>
      <p className="mt-3 max-w-lg rounded-xl bg-black/25 px-4 py-2 text-sm leading-relaxed text-white backdrop-blur-sm sm:text-base short:mt-1 short:py-1 short:text-xs">
        {era.text}
      </p>
    </motion.section>
  )
}
