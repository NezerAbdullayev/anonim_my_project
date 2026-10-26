import { motion, useTransform } from 'framer-motion'
import { ZONES } from './dive.js'

const ABYSS = ZONES[3].at
const HADAL = ZONES[4].at

// Rolling mud plain (viewBox 1440 × 200)
const PLAIN =
  'M0,90 C120,70 240,60 360,78 C480,96 600,110 720,92 C840,74 960,52 1080,64 C1200,76 1320,100 1440,86 L1440,200 L0,200 Z'
// Jagged rock face of a trench wall, its open side on the right (viewBox 100 × 1000)
const WALL =
  'M0,0 L62,0 L70,60 L58,130 L76,210 L64,290 L84,370 L70,450 L88,540 L72,620 L92,700 L78,790 L96,880 L84,1000 L0,1000 Z'

function Wall({ side, x, scaleX }) {
  const right = side === 'right'
  return (
    <motion.svg
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
      className={`absolute top-0 h-full w-[14vw] sm:w-[16vw] ${right ? 'right-0 origin-right' : 'left-0 origin-left'}`}
      style={{ x, scaleX }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`wall-${side}`} x1="0" x2="1">
          <stop offset="0" stopColor="#010205" />
          <stop offset="0.8" stopColor="#0b1220" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      {/* the right wall is the left one mirrored */}
      <path d={WALL} fill={`url(#wall-${side})`} transform={right ? 'translate(100 0) scale(-1 1)' : undefined} />
    </motion.svg>
  )
}

/**
 * The ground: the abyssal mud plain rises into view in the abyss, then, as the dive drops
 * into the trench, the plain falls away and the trench walls close in from both sides.
 */
export default function Terrain({ progress }) {
  // abyss start → +0.05: the plain rises from below; hadal start → +0.05: it sinks away again
  const plainY = useTransform(progress, [ABYSS[0], ABYSS[0] + 0.05, HADAL[0], HADAL[0] + 0.05], ['30vh', '0vh', '0vh', '40vh'])
  // hadal start → +0.05: the walls slide in from the sides
  const leftX = useTransform(progress, [HADAL[0], HADAL[0] + 0.05], ['-100%', '0%'])
  const rightX = useTransform(progress, [HADAL[0], HADAL[0] + 0.05], ['100%', '0%'])
  // → hadal end: and keep narrowing the trench toward the bottom
  const wallScale = useTransform(progress, [HADAL[0] + 0.05, HADAL[1]], [1, 1.3])

  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[22vh] w-full"
        style={{ y: plainY }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="plain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1c2333" />
            <stop offset="0.25" stopColor="#0b0f18" />
            <stop offset="1" stopColor="#030407" />
          </linearGradient>
        </defs>
        <path d={PLAIN} fill="url(#plain)" />
      </motion.svg>

      <Wall side="left" x={leftX} scaleX={wallScale} />
      <Wall side="right" x={rightX} scaleX={wallScale} />
    </div>
  )
}
