import { useEffect, useState } from 'react'
import { motion, useTransform } from 'framer-motion'
import { BUILDINGS, ERAS, HILLS, HOLD } from './timeline.js'
import { HORIZON } from './Sky.jsx'
import Callout from './Callout.jsx'
import { Camel, Caravanserai, GroundFire, MaidenTower, Minaret, ShirvanshahPalace, Walls } from './buildings/Medieval.jsx'

// Panorama units: viewBox 1440 × 300, drawn at its real aspect (never stretched)
const W = 1440
const H = 300
// The old town's terrace on the near hill; buildings stand on it
const GROUND = 232

// The hills around the bay: high on both sides, a flat terrace for the old town by the shore
const FAR =
  'M0,120 C120,90 220,70 330,96 C440,122 520,150 640,160 C760,170 860,150 960,120 C1080,84 1200,60 1320,74 C1380,82 1420,96 1440,104 L1440,300 L0,300 Z'
const NEAR =
  'M0,190 C140,170 260,176 380,200 C440,212 470,230 520,232 L980,232 C1040,226 1080,206 1170,188 C1260,176 1350,178 1440,186 L1440,300 L0,300 Z'

const DRAWINGS = {
  minaret: Minaret,
  walls: Walls,
  'maiden-tower': MaidenTower,
  yanardag: GroundFire,
  shirvanshah: ShirvanshahPalace,
  caravanserai: Caravanserai,
}
// Where a building's base stands, if not on the old town's terrace
const BASE = { yanardag: 72 }

// The camera looks at the middle during era titles and at each building while its note is up
const PAN = [...ERAS.map((e) => [e.title, 0.5]), ...BUILDINGS.map((b) => [b.at, b.x / W])].sort((a, b) => a[0] - b[0])

/** One building: it grows up out of the ground in the moments before its note appears. */
function Building({ building, time }) {
  const Drawing = DRAWINGS[building.key]
  const done = building.at - HOLD / 2
  // done - span → done: the building rises from the ground and fades in
  const grow = useTransform(time, [done - building.span, done], [0, 1])
  return (
    <g transform={`translate(${building.x} ${BASE[building.key] ?? GROUND})`}>
      <motion.g style={{ scaleY: grow, opacity: grow, originY: 1, transformBox: 'fill-box' }}>
        <Drawing />
      </motion.g>
    </g>
  )
}

/**
 * The view itself, from the sea toward the city: hills, and era by era the buildings on them,
 * each with its note. Wider than a phone screen: there the camera pans to each new building.
 */
export default function Panorama({ time }) {
  const far = useTransform(time, HILLS.points, HILLS.far)
  const near = useTransform(time, HILLS.points, HILLS.near)

  const [screen, setScreen] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setScreen({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  // The panorama is at least the screen's width and at least 30vh tall
  const width = Math.max(screen.w, (screen.h * 0.3 * W) / H)
  const slack = (width - screen.w) / 2

  // Pan: the point of the panorama to keep in the middle of the screen, as far as it can go
  const focus = useTransform(time, PAN.map((p) => p[0]), PAN.map((p) => p[1]))
  const x = useTransform(focus, (f) => Math.max(-slack, Math.min(slack, (0.5 - f) * width)))

  // The caravan walks the shore in the Middle Ages and is gone by the oil boom
  const caravanOpacity = useTransform(time, [0.04, 0.08, 0.22, 0.26], [0, 1, 1, 0])

  return (
    <motion.div
      className="absolute"
      style={{ width, height: (width * H) / W, left: (screen.w - width) / 2, bottom: `${100 - HORIZON}vh`, x }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <motion.path d={FAR} style={{ fill: far }} />
        {BUILDINGS.filter((b) => BASE[b.key]).map((b) => (
          <Building key={b.key} building={b} time={time} />
        ))}
        <motion.path d={NEAR} style={{ fill: near }} />
        {BUILDINGS.filter((b) => !BASE[b.key] && b.key !== 'walls').map((b) => (
          <Building key={b.key} building={b} time={time} />
        ))}
        {/* The walls stand in front of the town */}
        <Building building={BUILDINGS.find((b) => b.key === 'walls')} time={time} />
      </svg>

      {/* The caravan: four camels walking the shore below the walls, across the whole view */}
      <motion.div className="absolute bottom-[2%] left-0 w-[9%]" style={{ opacity: caravanOpacity }} aria-hidden="true">
        <motion.svg
          viewBox="0 0 120 20"
          className="w-full"
          initial={{ x: '-110%' }}
          animate={{ x: '1120%' }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 30, 60, 90].map((dx) => (
            <g key={dx} transform={`translate(${dx} 19)`}>
              <Camel />
            </g>
          ))}
        </motion.svg>
      </motion.div>

      {BUILDINGS.map((b) => (
        <Callout
          key={b.key}
          building={b}
          time={time}
          left={`${(b.x / W) * 100}%`}
          top={`${(b.top / H) * 100}%`}
        />
      ))}
    </motion.div>
  )
}
