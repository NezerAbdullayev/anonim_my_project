import { motion, useTransform } from 'framer-motion'
import { holdRange } from './timeline.js'

// The note's look follows the era's drawing style
const MINIATURE = 'border-2 border-double border-[#d4a72c] bg-[#f3e2c0]/95 text-[#4a2a0c] font-old'
const ENGRAVING = 'border border-[#3e2a14] bg-[#e9dcc0]/95 text-[#2e1f0e] font-old'
const POSTCARD = 'border border-[#8a6a3a] bg-[#fbf3e0]/95 text-[#3a2a1a] font-old outline outline-1 outline-offset-2 outline-dashed outline-[#8a6a3a]/60'
const LOOK = {
  medieval: MINIATURE,
  oil: ENGRAVING,
  millionaires: POSTCARD,
  republic: POSTCARD,
}

/**
 * A note pinned to a building as it goes up: a thin line up from the building's top to a
 * small label with its date, name and one line about it. Lives inside the panorama, so it
 * moves with it when the camera pans.
 */
export default function Callout({ building, time, left, top }) {
  const { at, span, era, when, name, text, x } = building
  // Near the panorama's ends the label leans inward, so it never runs off the screen
  const side = x < 300 ? 'left-[-2rem]' : x > 1140 ? 'right-[-2rem]' : ''
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
        className={`absolute bottom-[6vh] w-56 rounded-md px-3 py-2 text-center shadow-lg sm:w-64 ${side} ${LOOK[era] ?? MINIATURE}`}
        style={{ y }}
      >
        {era === 'republic' && (
          // the Republic's colours across the top of its notes
          <div className="absolute inset-x-0 top-0 flex h-1 overflow-hidden rounded-t-md" aria-hidden="true">
            <span className="flex-1 bg-[#00b5e2]" />
            <span className="flex-1 bg-[#ef3340]" />
            <span className="flex-1 bg-[#509e2f]" />
          </div>
        )}
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-70">{when}</p>
        <h3 className="text-base font-bold leading-tight sm:text-lg">{name}</h3>
        <p className="mt-1 font-sans text-xs leading-snug sm:text-sm">{text}</p>
      </motion.div>
      <motion.div className="absolute bottom-0 h-[6vh] w-px origin-bottom bg-[#4a2a0c]/80" style={{ scaleY: lineScale }} />
    </motion.div>
  )
}
