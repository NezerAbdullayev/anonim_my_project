import { motion, useTransform } from 'framer-motion'

// Sepia engraving palette: brown ink lines over pale paper, hatched shadows (#hatch, Panorama.jsx)
const PAPER = '#d9c49a'
const INK = '#3e2a14'
const OIL = '#1a120a'
const ink = { stroke: INK, strokeWidth: 1, strokeLinejoin: 'round' }

/** A wooden derrick: a tall lattice pyramid over a little shed (base centre at 0, 0). */
function Derrick({ h = 46 }) {
  const w = h * 0.28
  const rungs = [0.25, 0.5, 0.72]
  return (
    <g>
      <path d={`M${-w},0 L-1.5,${-h} L1.5,${-h} L${w},0`} fill="none" {...ink} />
      {rungs.map((r) => {
        const y = -h * r
        const half = w * (1 - r) + 1.5 * r
        return <line key={r} x1={-half} x2={half} y1={y} y2={y} {...ink} />
      })}
      <path d={`M${-w},0 L${w * 0.75},${-h * 0.25} M${w},0 L${-w * 0.75},${-h * 0.25}`} {...ink} strokeWidth="0.6" />
      <rect x={w - 2} y="-8" width="10" height="8" fill={PAPER} {...ink} />
      <rect x={w - 2} y="-8" width="10" height="8" fill="url(#hatch)" />
    </g>
  )
}

/** Bibiheybət, 1846: the first drilled well, one small derrick with a shed and a barrel. */
export function FirstWell() {
  return (
    <g>
      <Derrick h={40} />
      <ellipse cx="-14" cy="-3" rx="3" ry="3.5" fill={OIL} />
    </g>
  )
}

// A cluster of derricks: [x, height]; the first ones rise first
const FOREST = [
  [0, 52], [-22, 44], [24, 48], [-44, 40], [46, 42], [-10, 36], [12, 38], [-64, 34], [66, 36],
  [-32, 30], [34, 32], [-80, 28], [84, 30], [-54, 26], [56, 26],
]
// Gushers in the cluster: [x, height] (oil fountains that rise and fall slowly, no flicker)
const GUSHERS = [
  [24, 70],
  [-44, 58],
]

/** One derrick of the forest, rising in its own turn as the forest grows. */
function GrowingDerrick({ grow, i, n, x, h }) {
  // its slice of the forest's growth: early ones first, each taking 40% of the time
  const start = (i / n) * 0.6
  const s = useTransform(grow, [start, start + 0.4], [0, 1])
  return (
    <g transform={`translate(${x} 0)`}>
      <motion.g style={{ scaleY: s, opacity: s, originY: 1, transformBox: 'fill-box' }}>
        <Derrick h={h} />
      </motion.g>
    </g>
  )
}

/** The derrick forest (Balaxanı, Bibiheybət) with its oil fountains. */
export function Derricks({ grow, gushers = true }) {
  return (
    <g>
      {FOREST.map(([x, h], i) => (
        <GrowingDerrick key={i} grow={grow} i={i} n={FOREST.length} x={x} h={h} />
      ))}
      {gushers &&
        GUSHERS.map(([x, h], i) => (
          <g key={i} transform={`translate(${x} 0)`}>
            <motion.path
              d={`M-2,0 C-3,${-h * 0.5} -2,${-h * 0.8} 0,${-h} C2,${-h * 0.8} 3,${-h * 0.5} 2,0 Z M0,${-h} C-6,${-h + 4} -9,${-h + 12} -10,${-h + 20} M0,${-h} C6,${-h + 4} 9,${-h + 12} 10,${-h + 20}`}
              fill={OIL}
              stroke={OIL}
              strokeWidth="2"
              style={{ originY: 1, transformBox: 'fill-box' }}
              animate={{ scaleY: [0.85, 1.05, 0.9, 0.85] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        ))}
    </g>
  )
}

export const DerricksWest = ({ grow }) => <Derricks grow={grow} gushers={false} />

/** A puff of smoke drifting up and away from a chimney top (slowly, on a loop). */
function Smoke({ x, y, delay = 0 }) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r="5"
      fill="#2a2420"
      initial={{ opacity: 0.6, y: 0, x: 0, scale: 0.6 }}
      animate={{ opacity: 0, y: -26, x: 14, scale: 1.8 }}
      transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

/** Qara şəhər: refinery stills, round tanks and smoking chimneys. */
export function BlackCity() {
  const chimneys = [-30, -6, 22]
  return (
    <g>
      {chimneys.map((x, i) => (
        <g key={x}>
          <rect x={x - 3} y="-58" width="6" height="58" fill={PAPER} {...ink} />
          <rect x={x - 3} y="-58" width="6" height="58" fill="url(#hatch)" />
          <Smoke x={x} y={-62} delay={i * 1.6} />
          <Smoke x={x} y={-62} delay={i * 1.6 + 2.5} />
        </g>
      ))}
      <rect x="-48" y="-22" width="70" height="22" fill={PAPER} {...ink} />
      <rect x="-48" y="-22" width="70" height="22" fill="url(#hatch)" />
      {[30, 50].map((x) => (
        <g key={x}>
          <rect x={x - 9} y="-16" width="18" height="16" fill={PAPER} {...ink} />
          <ellipse cx={x} cy="-16" rx="9" ry="2.5" fill={PAPER} {...ink} />
        </g>
      ))}
    </g>
  )
}

/** Zoroaster (1878): a small steam tanker, its funnel smoking, at anchor off the shore. */
export function Zoroaster() {
  return (
    <g>
      <path d="M-46,-8 L44,-8 L36,0 L-40,0 Z" fill={INK} />
      <rect x="-30" y="-14" width="52" height="6" fill={PAPER} {...ink} />
      <rect x="12" y="-28" width="6" height="14" fill={INK} />
      <line x1="-22" y1="-14" x2="-22" y2="-36" {...ink} />
      <Smoke x={15} y={-32} />
      <Smoke x={15} y={-32} delay={2.5} />
    </g>
  )
}
