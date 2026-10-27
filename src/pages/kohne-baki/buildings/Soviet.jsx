import { motion } from 'framer-motion'

// Soviet poster palette: flat shapes, no outlines, cream, red and near-black
const CREAM = '#f4e9d8'
const STONE = '#d8c8ae'
const RED = '#c0392b'
const DARK = '#1f1a17'
const STEEL = '#5a5550'

/** Hökumət evi (1936–1952): a wide stone block with arcades, side towers and a central tower. */
export function GovernmentHouse() {
  return (
    <g>
      <rect x="-56" y="-34" width="112" height="34" fill={STONE} />
      <rect x="-56" y="-34" width="112" height="4" fill={CREAM} />
      {[-48, -40, -32, -24, -16, 16, 24, 32, 40, 48].map((x) => (
        <rect key={x} x={x - 2} y="-26" width="4" height="10" fill={DARK} opacity="0.7" />
      ))}
      {[-44, -28, 28, 44].map((x) => (
        <path key={x} d={`M${x - 5},0 L${x - 5},-8 Q${x},-13 ${x + 5},-8 L${x + 5},0 Z`} fill={DARK} opacity="0.8" />
      ))}
      {[-60, 52].map((x) => (
        <rect key={x} x={x} y="-46" width="8" height="46" fill={CREAM} />
      ))}
      <rect x="-14" y="-60" width="28" height="60" fill={CREAM} />
      <rect x="-9" y="-74" width="18" height="14" fill={STONE} />
      <path d="M-6,-74 L0,-86 L6,-74 Z" fill={STONE} />
      <path d="M-8,0 L-8,-14 Q0,-22 8,-14 L8,0 Z" fill={DARK} />
      {[-48, -36].map((y) => (
        <rect key={y} x="-8" y={y} width="16" height="8" fill={DARK} opacity="0.7" />
      ))}
    </g>
  )
}

/** Neft Daşları (1949): oil platforms out at sea on steel trestles, joined by long bridges. */
export function NeftDashlari() {
  const piles = [-60, -40, -20, 0, 20, 40, 60]
  return (
    <g>
      <rect x="-64" y="-8" width="128" height="2.5" fill={STEEL} />
      {piles.map((x) => (
        <rect key={x} x={x - 0.8} y="-6" width="1.6" height="8" fill={STEEL} />
      ))}
      {[-48, 8, 52].map((x) => (
        <g key={x}>
          <rect x={x - 7} y="-14" width="14" height="6" fill={CREAM} />
          <path d={`M${x - 4},-14 L${x},-30 L${x + 4},-14 Z`} fill="none" stroke={STEEL} strokeWidth="1" />
        </g>
      ))}
      <rect x="18" y="-20" width="8" height="6" fill={RED} />
    </g>
  )
}

/** One nodding pumpjack: the beam rocks slowly on its post (base centre at 0, 0). */
function Pumpjack({ delay }) {
  return (
    <g>
      <path d="M-2,0 L0,-12 L2,0 Z" fill={DARK} />
      <motion.g
        style={{ originX: 0.5, originY: 0.5, transformBox: 'fill-box' }}
        animate={{ rotate: [-12, 12, -12] }}
        transition={{ duration: 3.5, delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="-12" y="-13.5" width="24" height="3" fill={DARK} />
        <path d="M12,-15 Q16,-12 12,-8 Z" fill={DARK} />
      </motion.g>
      <rect x="-12" y="-4" width="5" height="4" fill={RED} />
    </g>
  )
}

/** The pumpjacks of Balaxanı, nodding where the wooden derricks stood. */
export function Pumpjacks() {
  return (
    <g>
      {[-60, -20, 20, 60].map((x, i) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <Pumpjack delay={i * 0.8} />
        </g>
      ))}
    </g>
  )
}

/** The funicular (1960): its track up the hill, a car riding slowly up and down it. */
export function Funicular() {
  return (
    <g>
      <line x1="24" y1="0" x2="-44" y2="-38" stroke={DARK} strokeWidth="2" />
      <line x1="24" y1="3" x2="-44" y2="-35" stroke={STEEL} strokeWidth="1" />
      <motion.g
        initial={{ x: 18, y: -3 }}
        animate={{ x: [18, -38, 18], y: [-3, -34, -3] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="-5" y="-6" width="10" height="6" fill={RED} />
        <rect x="-3" y="-5" width="6" height="2" fill={CREAM} />
      </motion.g>
    </g>
  )
}

/** A metro entrance on the boulevard (1967): the red "M" on its pole and a small pavilion. */
export function MetroSign() {
  return (
    <g>
      <rect x="-12" y="-10" width="24" height="10" fill={CREAM} />
      <rect x="-4" y="-8" width="8" height="8" fill={DARK} />
      <line x1="16" y1="0" x2="16" y2="-22" stroke={DARK} strokeWidth="1.2" />
      <rect x="10" y="-30" width="12" height="10" rx="1" fill={RED} />
      <path d="M12,-22 L12,-28 L16,-24 L20,-28 L20,-22" fill="none" stroke={CREAM} strokeWidth="1.3" />
    </g>
  )
}
