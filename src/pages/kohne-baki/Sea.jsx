import { motion, useMotionTemplate, useTransform } from 'framer-motion'
import { SEA } from './timeline.js'
import { HORIZON } from './Sky.jsx'

// Light ripples on the water: [top (% of the sea), left %, width %, drift seconds]
const RIPPLES = [
  [8, 12, 18, 14],
  [14, 58, 24, 18],
  [24, 30, 16, 12],
  [34, 70, 20, 16],
  [46, 8, 26, 20],
  [58, 46, 22, 15],
  [72, 20, 30, 22],
  [84, 64, 24, 17],
]

/** The Caspian in the foreground: its colour through the day and slow ripples. */
export default function Sea({ time }) {
  const top = useTransform(time, SEA.points, SEA.top)
  const bottom = useTransform(time, SEA.points, SEA.bottom)
  const background = useMotionTemplate`linear-gradient(to bottom, ${top}, ${bottom})`

  return (
    <motion.div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: `${HORIZON}vh`, background }}>
      {RIPPLES.map(([y, x, w, s], i) => (
        <motion.span
          key={i}
          className="absolute h-px rounded-full bg-white/25"
          style={{ top: `${y}%`, left: `${x}%`, width: `${w}%` }}
          // a slow drift sideways, like the swell
          animate={{ x: ['-4vw', '4vw', '-4vw'] }}
          transition={{ duration: s, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      ))}
    </motion.div>
  )
}
