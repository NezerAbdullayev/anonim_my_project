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

// Sailing boats of the old Caspian trade: [top (% of the sea), scale, crossing seconds, delay]
const DHOWS = [
  [6, 0.8, 70, 0],
  [22, 1.2, 90, 25],
]

/** A dhow with its lateen sail, sailing left to right. */
function Dhow({ top, scale, duration, delay }) {
  return (
    <motion.svg
      viewBox="0 0 60 44"
      className="absolute w-[9vmin]"
      style={{ top: `${top}%`, left: 0, scale }}
      initial={{ x: '-15vw' }}
      animate={{ x: '110vw' }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      aria-hidden="true"
    >
      <path d="M4,32 L56,32 L48,40 L12,40 Z" fill="#6b3f17" />
      <line x1="30" y1="32" x2="30" y2="4" stroke="#6b3f17" strokeWidth="1.5" />
      <path d="M30,4 L52,28 L30,28 Z" fill="#f3e2c0" stroke="#6b3f17" strokeWidth="1" />
      <path d="M30,8 L14,28 L30,28 Z" fill="#e8cf9a" stroke="#6b3f17" strokeWidth="1" />
    </motion.svg>
  )
}

/** The Caspian in the foreground: its colour through the day, slow ripples and its ships. */
export default function Sea({ time }) {
  const top = useTransform(time, SEA.points, SEA.top)
  const bottom = useTransform(time, SEA.points, SEA.bottom)
  const background = useMotionTemplate`linear-gradient(to bottom, ${top}, ${bottom})`
  // The sailing boats belong to the Middle Ages; gone once the steamships come
  const dhowOpacity = useTransform(time, [0.04, 0.08, 0.22, 0.27], [0, 1, 1, 0])

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
      <motion.div className="absolute inset-0" style={{ opacity: dhowOpacity }}>
        {DHOWS.map(([t, scale, duration, delay], i) => (
          <Dhow key={i} top={t} scale={scale} duration={duration} delay={delay} />
        ))}
      </motion.div>
    </motion.div>
  )
}
