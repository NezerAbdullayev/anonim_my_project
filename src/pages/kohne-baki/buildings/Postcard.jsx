import { motion, useTransform } from 'framer-motion'

// Hand-coloured postcard palette: cream stone, terracotta roofs, soft blue windows, brown ink
const CREAM = '#f1e4c8'
const SAND = '#e2cfa6'
const ROOF = '#b5654a'
const GLASS = '#4a6a8a'
const LEAF = '#5f8a4a'
const INK = '#4a3420'
const ink = { stroke: INK, strokeWidth: 1, strokeLinejoin: 'round' }

const pointed = (x, y, w, h) => `M${x},${y} L${x},${y - h + w / 2} Q${x + w / 2},${y - h - w / 3} ${x + w},${y - h + w / 2} L${x + w},${y} Z`

/** Tağıyev's theatre (1883): a classical front with columns under a pediment. */
export function TagiyevTheatre() {
  return (
    <g>
      <rect x="-30" y="-34" width="60" height="34" fill={CREAM} {...ink} />
      <path d="M-33,-34 L0,-46 L33,-34 Z" fill={SAND} {...ink} />
      {[-22, -13, -4, 5, 14, 23].map((x) => (
        <rect key={x} x={x - 1.5} y="-30" width="3" height="26" fill="#fff8e8" {...ink} strokeWidth="0.6" />
      ))}
      <rect x="-32" y="-4" width="64" height="4" fill={SAND} {...ink} />
    </g>
  )
}

/** Tağıyev's school for girls (1901): a gothic front with pointed windows and two turrets. */
export function GirlsSchool() {
  return (
    <g>
      <rect x="-28" y="-44" width="56" height="44" fill={CREAM} {...ink} />
      {[-28, 22].map((x) => (
        <g key={x}>
          <rect x={x} y="-50" width="6" height="50" fill={SAND} {...ink} />
          <path d={`M${x},-50 L${x + 3},-58 L${x + 6},-50 Z`} fill={ROOF} {...ink} />
        </g>
      ))}
      {[-30, -14].map((y) =>
        [-16, -6, 4, 14].map((x) => <path key={`${x}${y}`} d={pointed(x - 3, y, 6, 10)} fill={GLASS} />)
      )}
      <path d={pointed(-4, 0, 8, 12)} fill={INK} />
    </g>
  )
}

// The boulevard: a row of young trees along the shore, with lamp posts and a pavilion
const TREES = Array.from({ length: 25 }, (_, i) => -300 + i * 25)
const LAMPS = [-264, -168, -72, 72, 168, 264]

/** One tree of the boulevard, planted in its own turn as the boulevard grows. */
function Tree({ grow, i, n, x }) {
  // its slice of the boulevard's growth: from the middle outward, each taking 40% of the time
  const start = (Math.abs(i - (n - 1) / 2) / ((n - 1) / 2)) * 0.6
  const s = useTransform(grow, [start, start + 0.4], [0, 1])
  return (
    <g transform={`translate(${x} 0)`}>
      <motion.g style={{ scale: s, opacity: s, originY: 1, transformBox: 'fill-box' }}>
        <rect x="-1" y="-8" width="2" height="8" fill={INK} />
        <circle cx="0" cy="-12" r="6" fill={LEAF} {...ink} strokeWidth="0.6" />
      </motion.g>
    </g>
  )
}

/** Dənizkənarı bulvar (1909): trees planted from the middle outward, lamps and a pavilion. */
export function Boulevard({ grow }) {
  const show = useTransform(grow, [0, 0.3], [0, 1])
  return (
    <g>
      <motion.g style={{ opacity: show }}>
        <rect x="-310" y="-1.5" width="620" height="3" fill={SAND} {...ink} strokeWidth="0.6" />
        {LAMPS.map((x) => (
          <g key={x}>
            <line x1={x} x2={x} y1="0" y2="-14" stroke={INK} strokeWidth="1" />
            <circle cx={x} cy="-15" r="1.6" fill="#f6d77a" {...ink} strokeWidth="0.5" />
          </g>
        ))}
        <path d="M-14,0 L-14,-12 L14,-12 L14,0 M-18,-12 L0,-22 L18,-12 Z" fill={CREAM} {...ink} />
      </motion.g>
      {TREES.map((x, i) => (Math.abs(x) < 20 ? null : <Tree key={x} grow={grow} i={i} n={TREES.length} x={x} />))}
    </g>
  )
}

/** İsmailiyyə (1913): Venetian gothic palace, an arcade below and tall pointed windows above. */
export function Ismailiyya() {
  return (
    <g>
      <rect x="-32" y="-42" width="64" height="42" fill="#f4ead6" {...ink} />
      <path d="M-8,-42 L0,-53 L8,-42 Z" fill={SAND} {...ink} />
      {[-28, -20, -12, -4, 4, 12, 20, 28].map((x) => (
        <rect key={x} x={x - 1.5} y="-46" width="3" height="4" fill="#f4ead6" {...ink} strokeWidth="0.6" />
      ))}
      {[-24, -14, -4, 6, 16].map((x) => (
        <path key={x} d={pointed(x, 0, 8, 12)} fill={INK} opacity="0.75" />
      ))}
      {[-26, -16, -6, 4, 14, 24].map((x) => (
        <path key={x} d={pointed(x - 2.5, -18, 5, 18)} fill={GLASS} />
      ))}
    </g>
  )
}

/** The Republic's tricolour on the parliament's roof (blue, red, green, crescent and star). */
export function ParliamentFlag() {
  return (
    <g>
      <line x1="0" y1="0" x2="0" y2="-30" stroke={INK} strokeWidth="1.2" />
      <rect x="0" y="-30" width="24" height="5" fill="#00b5e2" />
      <rect x="0" y="-25" width="24" height="5" fill="#ef3340" />
      <rect x="0" y="-20" width="24" height="5" fill="#509e2f" />
      <circle cx="11" cy="-22.5" r="1.8" fill="#fff" />
      <circle cx="11.7" cy="-22.5" r="1.5" fill="#ef3340" />
      <path d="M14,-22.5 l0.6,0.4 l-0.2,-0.7 l0.6,-0.4 l-0.7,0 z" fill="#fff" />
    </g>
  )
}

/** Baku University (1919): a small classical building on the hill above the town. */
export function University() {
  return (
    <g>
      <rect x="-22" y="-22" width="44" height="22" fill={CREAM} {...ink} />
      <path d="M-24,-22 L0,-32 L24,-22 Z" fill={SAND} {...ink} />
      {[-14, -5, 5, 14].map((x) => (
        <rect key={x} x={x - 1.2} y="-19" width="2.4" height="17" fill="#fff8e8" {...ink} strokeWidth="0.5" />
      ))}
    </g>
  )
}
