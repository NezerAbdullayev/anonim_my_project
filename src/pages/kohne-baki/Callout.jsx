import { motion, useTransform } from 'framer-motion'
import { holdRange } from './timeline.js'

// The note's look follows the era's drawing style
const LOOK = {
  medieval: 'border-2 border-double border-[#d4a72c] bg-[#f3e2c0]/95 text-[#4a2a0c] font-old',
}

/**
 * A note pinned to a building as it goes up: a thin line up from the building's top to a
 * small label with its date, name and one line about it. Lives inside the panorama, so it
 * moves with it when the camera pans.
 */
export default function Callout({ building, time, left, top }) {
  const { at, span, era, when, name, text } = building
  const [h0, h1] = holdRange(at)

  // at - span → h0: the note fades in; h1 → at + span: it fades out again
  const opacity = useTransform(time, [at - span, h0, h1, at + span], [0, 1, 1, 0])
  // at - span → h0: the line draws itself up from the building
  const lineScale = useTransform(time, [at - span, h0], [0, 1])
  // and the label drifts up into place
  const y = useTransform(time, [at - span, h0], [10, 0])

  return (
    <motion.div
      className="pointer-events-none absolute z-[550] flex w-0 flex-col items-center"
      style={{ left, top, opacity }}
      aria-label={name}
    >
      <motion.div
        className={`absolute bottom-[6vh] w-56 rounded-md px-3 py-2 text-center shadow-lg sm:w-64 ${LOOK[era] ?? LOOK.medieval}`}
        style={{ y }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-70">{when}</p>
        <h3 className="text-base font-bold leading-tight sm:text-lg">{name}</h3>
        <p className="mt-1 font-sans text-xs leading-snug sm:text-sm">{text}</p>
      </motion.div>
      <motion.div className="absolute bottom-0 h-[6vh] w-px origin-bottom bg-[#4a2a0c]/80" style={{ scaleY: lineScale }} />
    </motion.div>
  )
}
