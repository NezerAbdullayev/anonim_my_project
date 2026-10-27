import { motion } from 'framer-motion'

// Miniature palette: warm stone, a dark ink outline, gold and turquoise tiles
const STONE = '#ecd5a3'
const SHADE = '#c9a26a'
const INK = '#6b3f17'
const GOLD = '#d4a72c'
const TILE = '#2aa3a3'
const TILE_DARK = '#1d6f8a'

// Every building is drawn with its base centre at (0, 0), going up (negative y),
// in panorama units (see Panorama.jsx); `ink` = the outline every shape shares.
const ink = { stroke: INK, strokeWidth: 1.2, strokeLinejoin: 'round' }

/** Sınıqqala minaret (1078) with its small mosque. */
export function Minaret() {
  return (
    <g>
      <rect x="10" y="-22" width="40" height="22" fill={STONE} {...ink} />
      <path d="M24,0 L24,-10 Q30,-18 36,-10 L36,0 Z" fill={TILE} {...ink} />
      <path d="M-8,0 L-7,-60 L7,-60 L8,0 Z" fill={STONE} {...ink} />
      <path d="M-8,0 L-7,-60 L-2,-60 L-2,0 Z" fill={SHADE} />
      <rect x="-11" y="-64" width="22" height="4" fill={GOLD} {...ink} />
      <rect x="-5.5" y="-76" width="11" height="12" fill={STONE} {...ink} />
      <path d="M-6,-76 L0,-82 L6,-76 Z" fill={TILE_DARK} {...ink} />
      <rect x="-2" y="-46" width="4" height="7" rx="2" fill={TILE_DARK} />
    </g>
  )
}

/** The double city walls with round towers, from the palace hill down to the shore. */
export function Walls() {
  const towers = [-60, 10, 80, 150, 220, 290, 360]
  const merlons = Array.from({ length: 36 }, (_, i) => -60 + i * 12)
  return (
    <g>
      <rect x="-60" y="-18" width="420" height="18" fill={SHADE} {...ink} />
      {merlons.map((x) => (
        <rect key={x} x={x} y="-22" width="6" height="4" fill={SHADE} {...ink} />
      ))}
      {towers.map((x) => (
        <g key={x}>
          <rect x={x - 8} y="-28" width="16" height="28" fill={STONE} {...ink} />
          <path d={`M${x - 9},-28 h4 v-3 h3 v3 h4 v-3 h3 v3 h4`} fill="none" {...ink} />
        </g>
      ))}
      {/* Qoşa qala qapısı: the double gate */}
      <path d="M118,0 L118,-12 Q124,-20 130,-12 L130,0 Z" fill={INK} />
    </g>
  )
}

/** Qız qalası: the stone tower with its buttress toward the sea. */
export function MaidenTower() {
  return (
    <g>
      <path d="M18,0 L18,-78 L30,-74 L30,0 Z" fill={SHADE} {...ink} />
      <path d="M-18,0 L-17,-94 L17,-94 L18,0 Z" fill={STONE} {...ink} />
      <path d="M-18,0 L-17,-94 L-8,-94 L-8,0 Z" fill={SHADE} />
      {[-30, -62].map((y) => (
        <line key={y} x1="-17.5" x2="17.5" y1={y} y2={y} stroke={INK} strokeWidth="0.8" />
      ))}
      <rect x="-19" y="-98" width="38" height="4" fill={GOLD} {...ink} />
      {[-48, -80].map((y) => (
        <rect key={y} x="-1.5" y={y} width="3" height="6" fill={INK} />
      ))}
    </g>
  )
}

/** Yanardağ-like ground fire on the far hill: it never goes out (sways slowly, no flicker). */
export function GroundFire() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="10" ry="2.5" fill="#5a3a1a" />
      <motion.g
        style={{ originY: 1, transformBox: 'fill-box' }}
        animate={{ scaleY: [1, 1.15, 0.95, 1], scaleX: [1, 0.95, 1.05, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M-8,0 C-10,-8 -4,-12 -3,-20 C2,-14 9,-10 8,0 Z" fill="#ff8a2a" />
        <path d="M-4,0 C-5,-6 -1,-9 0,-14 C3,-9 5,-6 4,0 Z" fill="#ffd25a" />
      </motion.g>
    </g>
  )
}

/** The Palace of the Shirvanshahs: tomb dome, mosque dome and minaret, a tiled portal. */
export function ShirvanshahPalace() {
  return (
    <g>
      <rect x="31" y="-66" width="6" height="36" fill={STONE} {...ink} />
      <path d="M30,-66 L34,-72 L38,-66 Z" fill={TILE_DARK} {...ink} />
      <rect x="-40" y="-30" width="80" height="30" fill={STONE} {...ink} />
      <rect x="-40" y="-30" width="80" height="6" fill={SHADE} {...ink} />
      <path d="M-36,-30 A14,14 0 0 1 -8,-30 Z" fill={STONE} {...ink} />
      <path d="M2,-30 A12,12 0 0 1 26,-30 Z" fill={STONE} {...ink} />
      <circle cx="-22" cy="-45" r="1.6" fill={GOLD} />
      <circle cx="14" cy="-43" r="1.6" fill={GOLD} />
      <path d="M-8,0 L-8,-16 Q0,-26 8,-16 L8,0 Z" fill={TILE} {...ink} />
      <path d="M-4,0 L-4,-13 Q0,-18 4,-13 L4,0 Z" fill={TILE_DARK} />
      {[-30, -20, 20, 30].map((x) => (
        <path key={x} d={`M${x - 3},-6 L${x - 3},-14 Q${x},-18 ${x + 3},-14 L${x + 3},-6 Z`} fill={TILE_DARK} />
      ))}
    </g>
  )
}

/** A caravanserai: a low square court behind a tall arched portal. */
export function Caravanserai() {
  return (
    <g>
      <rect x="-28" y="-24" width="56" height="24" fill={STONE} {...ink} />
      <rect x="-10" y="-30" width="20" height="30" fill={SHADE} {...ink} />
      <path d="M-6,0 L-6,-18 Q0,-26 6,-18 L6,0 Z" fill={INK} />
      {[-22, -16, 16, 22].map((x) => (
        <path key={x} d={`M${x - 2},-8 L${x - 2},-14 Q${x},-17 ${x + 2},-14 L${x + 2},-8 Z`} fill={TILE_DARK} />
      ))}
    </g>
  )
}

/** A camel of the caravan (side view), for the ambient caravan along the shore. */
export function Camel() {
  return (
    <path
      d="M0,0 L1,-9 C0,-12 2,-15 6,-15 C8,-19 12,-19 13,-15 C15,-18 19,-18 20,-14 L23,-16 L26,-15 L25,-12 L22,-11 L21,-9 L21,0 L19,0 L19,-7 L4,-7 L3,0 Z"
      fill="#7a4b1e"
    />
  )
}
