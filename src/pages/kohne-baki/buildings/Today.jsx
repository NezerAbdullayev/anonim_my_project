import { motion } from 'framer-motion'

// Night neon palette: dark bodies, glowing outlines and lit windows
const BODY = '#0f172a'
const GLOW = '#67e8f9'
const WARM = '#fcd34d'
const WHITE = '#e2e8f0'
const glow = { stroke: GLOW, strokeWidth: 1.2, strokeLinejoin: 'round' }

/** The TV tower (1996): a tall mast with its round restaurant deck and a red light on top. */
export function TvTower() {
  return (
    <g>
      <path d="M-6,0 L-2,-70 L2,-70 L6,0 Z" fill={BODY} {...glow} />
      <ellipse cx="0" cy="-58" rx="8" ry="3" fill={BODY} {...glow} />
      <rect x="-0.8" y="-96" width="1.6" height="26" fill={GLOW} />
      <motion.circle
        cx="0"
        cy="-97"
        r="1.6"
        fill="#f87171"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </g>
  )
}

/** The national flag on its giant pole on Bayıl cape (2010). */
export function FlagSquare() {
  return (
    <g>
      <rect x="-0.8" y="-100" width="1.6" height="100" fill={WHITE} />
      <motion.g
        style={{ originX: 0, transformBox: 'fill-box' }}
        animate={{ skewY: [-3, 3, -3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="0.8" y="-100" width="32" height="6" fill="#00b5e2" />
        <rect x="0.8" y="-94" width="32" height="6" fill="#ef3340" />
        <rect x="0.8" y="-88" width="32" height="6" fill="#509e2f" />
        <circle cx="15" cy="-91" r="2.2" fill="#fff" />
        <circle cx="15.8" cy="-91" r="1.8" fill="#ef3340" />
      </motion.g>
    </g>
  )
}

/** Crystal Hall: a low faceted arena by the flag, lit from inside. */
export function CrystalHall() {
  return (
    <g>
      <path d="M-24,0 L-18,-12 L18,-12 L24,0 Z" fill={BODY} {...glow} />
      {[-12, -4, 4, 12].map((x) => (
        <line key={x} x1={x} y1="-12" x2={x * 1.3} y2="0" stroke={GLOW} strokeWidth="0.6" opacity="0.7" />
      ))}
    </g>
  )
}

/** Ağ şəhər: new white blocks where the Black City's refineries stood. */
export function WhiteCity() {
  const blocks = [
    [-40, 22],
    [-22, 34],
    [-4, 28],
    [14, 40],
    [32, 26],
  ]
  return (
    <g>
      {blocks.map(([x, h]) => (
        <g key={x}>
          <rect x={x - 7} y={-h} width="14" height={h} fill={WHITE} />
          {Array.from({ length: Math.floor(h / 7) }, (_, i) => (
            <rect key={i} x={x - 4} y={-h + 4 + i * 7} width="8" height="2" fill={WARM} opacity="0.8" />
          ))}
        </g>
      ))}
    </g>
  )
}

// One flame tower's outline: a glass flame (viewBox units, base centre at 0, 0)
const flame = (w, h) => `M${-w},0 C${-w},${-h * 0.45} ${-w * 0.7},${-h * 0.8} 0,${-h} C${w * 0.35},${-h * 0.8} ${w},${-h * 0.45} ${w},0 Z`

/** Alov qüllələri (2012): three glass flames whose LED fronts glow like fire (slowly). */
export function FlameTowers() {
  const towers = [
    [-16, 9, 58, 0],
    [0, 11, 73, 1.2],
    [16, 9, 62, 2.4],
  ]
  return (
    <g>
      <defs>
        <linearGradient id="fire" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="0.6" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      {towers.map(([x, w, h, delay]) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <path d={flame(w, h)} fill={BODY} {...glow} />
          <motion.path
            d={flame(w - 2, h - 4)}
            fill="url(#fire)"
            animate={{ opacity: [0.55, 0.95, 0.55] }}
            transition={{ duration: 3.6, delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>
      ))}
    </g>
  )
}

/** The Heydar Aliyev Center (2012): one white curving wave with no straight line. */
export function HeydarAliyevCenter() {
  return (
    <g>
      <path
        d="M-46,0 C-40,-6 -34,-26 -18,-30 C-4,-34 6,-18 16,-20 C28,-22 34,-34 44,-30 C50,-26 50,-12 48,0 Z"
        fill={WHITE}
      />
      <path d="M-40,0 C-34,-8 -28,-20 -16,-22 C-4,-24 6,-12 16,-14 C26,-16 32,-24 40,-22" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
      <path d="M-30,0 C-24,-6 -14,-10 0,-8 C14,-6 24,-10 36,-12 L36,0 Z" fill="#1e293b" opacity="0.6" />
    </g>
  )
}
