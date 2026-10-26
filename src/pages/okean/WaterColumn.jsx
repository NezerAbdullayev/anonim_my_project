import { motion, useMotionTemplate, useTransform } from 'framer-motion'
import { WATER } from './dive.js'

const WAVE = 'M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z'

function Waves({ color, duration, className }) {
  return (
    <motion.div
      className={`absolute bottom-0 left-0 flex w-[200%] ${className}`}
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {[0, 1].map((k) => (
        <svg key={k} viewBox="0 0 1440 100" preserveAspectRatio="none" className="h-full w-1/2">
          <path d={WAVE} fill={color} />
        </svg>
      ))}
    </motion.div>
  )
}

// Sun rays from the surface: [left %, width, tilt]
const RAYS = [
  [8, 'w-16', 12],
  [24, 'w-28', 16],
  [45, 'w-20', 10],
  [63, 'w-32', 14],
  [82, 'w-16', 18],
]

/** The water itself: its colour by depth, the surface overhead and the sun rays. */
export default function WaterColumn({ progress }) {
  const top = useTransform(progress, WATER.points, WATER.top)
  const bottom = useTransform(progress, WATER.points, WATER.bottom)
  const background = useMotionTemplate`linear-gradient(to bottom, ${top}, ${bottom})`

  // 0 → 0.07: the surface (sky + waves) rises off the top of the screen as we go under
  const surfaceY = useTransform(progress, [0, 0.07], ['0vh', '-40vh'])
  // 0.05 → 0.22: the rays fade out over the sunlit zone (1% of the light is left at 200 m)
  const raysOpacity = useTransform(progress, [0, 0.05, 0.22], [0.7, 0.7, 0])
  // 0 → 0.22: and slide up with the surface they come from
  const raysY = useTransform(progress, [0, 0.22], ['0vh', '-30vh'])

  return (
    <motion.div className="absolute inset-0" style={{ background }}>
      <motion.div className="absolute inset-x-0" style={{ opacity: raysOpacity, y: raysY, top: '22vh' }}>
        {RAYS.map(([left, width, rotate], i) => (
          <motion.div
            key={i}
            className={`absolute top-0 h-[110vh] origin-top bg-gradient-to-b from-white/40 via-white/10 to-transparent blur-md ${width}`}
            style={{ left: `${left}%`, rotate }}
            animate={{ opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 5 + i * 1.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-x-0 top-0 h-[26vh] overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100"
        style={{ y: surfaceY }}
      >
        <Waves color="rgba(56,189,248,0.7)" duration={14} className="h-16 sm:h-20" />
        <Waves color="#22b8d8" duration={9} className="h-10 sm:h-12" />
      </motion.div>
    </motion.div>
  )
}
