import { useEffect, useState } from 'react'
import { motion, useTransform } from 'framer-motion'
import { BUILDINGS, ERAS, HILLS, HOLD, NOTES, holdRange } from './timeline.js'
import { HORIZON } from './Sky.jsx'
import Callout from './Callout.jsx'
import { Camel, Caravanserai, GroundFire, MaidenTower, Minaret, ShirvanshahPalace, Walls } from './buildings/Medieval.jsx'
import { BlackCity, Derricks, DerricksWest, FirstWell, Zoroaster } from './buildings/Oil.jsx'
import { Boulevard, GirlsSchool, Ismailiyya, ParliamentFlag, TagiyevTheatre, University } from './buildings/Postcard.jsx'
import { Funicular, GovernmentHouse, MetroSign, NeftDashlari, Pumpjacks } from './buildings/Soviet.jsx'

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
  'first-well': FirstWell,
  derricks: Derricks,
  'derricks-west': DerricksWest,
  'black-city': BlackCity,
  zoroaster: Zoroaster,
  theatre: TagiyevTheatre,
  'girls-school': GirlsSchool,
  boulevard: Boulevard,
  ismailiyya: Ismailiyya,
  parliament: ParliamentFlag,
  university: University,
  'government-house': GovernmentHouse,
  'neft-dashlari': NeftDashlari,
  pumpjacks: Pumpjacks,
  funicular: Funicular,
  metro: MetroSign,
}
// Buildings on the far hill (drawn behind the near one); a `base` in the data overrides GROUND
const FAR_HILL = { yanardag: 72, university: 88 }
const baseOf = (b) => b.base ?? FAR_HILL[b.key] ?? GROUND
// Drawings that grow in parts themselves (one derrick, one tree at a time)
const PARTS = new Set(['derricks', 'derricks-west', 'boulevard'])
// How long a building takes to go up at the least (timeline progress), and to fade when removed
const MIN_GROW = 0.008
const FADE = 0.008

// The camera looks at the middle during era titles and stays on each building while its note
// is up (the whole hold), moving on between them
const PAN = [
  ...ERAS.map((e) => [e.title, 0.5]),
  ...NOTES.flatMap((b) => holdRange(b.at).map((t) => [t, b.x / W])),
].sort((a, b) => a[0] - b[0])

/**
 * One building: it grows up out of the ground in the moments before its note appears and,
 * if it is `removed` later, fades away in that year. Drawings that grow in parts (the derrick
 * forest) get the growth as `grow`.
 */
function Building({ building, time }) {
  const Drawing = DRAWINGS[building.key]
  const done = building.at - HOLD / 2
  const start = done - Math.max(building.span ?? 0, MIN_GROW)
  // start → done: the building rises from the ground and fades in (or on until `built`)
  const grow = useTransform(time, [start, building.builtAt ?? done], [0, 1])
  const gone = building.goneAt ?? 2
  // goneAt - FADE → goneAt: and fades out when it is gone
  const left = useTransform(time, [gone - FADE, gone], [1, 0])
  const opacity = useTransform(() => grow.get() * left.get())
  const parts = PARTS.has(building.key)
  return (
    <g transform={`translate(${building.x} ${baseOf(building)})`}>
      <motion.g style={{ scaleY: parts ? 1 : grow, opacity, originY: 1, transformBox: 'fill-box' }}>
        <Drawing grow={grow} />
      </motion.g>
    </g>
  )
}

/**
 * Size and camera of the panorama, shared by the drawing and the notes layer above the era's
 * style: at its real aspect, at least the screen's width and 30vh tall. Where it is wider than
 * the screen (phones) the camera pans to keep the building of the current note in the middle.
 */
function usePanorama(time) {
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

  return { width, height: (width * H) / W, left: (screen.w - width) / 2, bottom: `${100 - HORIZON}vh`, x }
}

/** The view itself, from the sea toward the city: hills and, era by era, the buildings on them. */
export default function Panorama({ time }) {
  const far = useTransform(time, HILLS.points, HILLS.far)
  const near = useTransform(time, HILLS.points, HILLS.near)
  const frame = usePanorama(time)

  // The caravan walks the shore in the Middle Ages and is gone by the oil boom
  const caravanOpacity = useTransform(time, [0.04, 0.08, 0.22, 0.26], [0, 1, 1, 0])

  return (
    <motion.div className="absolute" style={frame}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          {/* Engraving hatch for the sepia buildings */}
          <pattern id="hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="3" stroke="#3e2a14" strokeWidth="0.6" opacity="0.55" />
          </pattern>
        </defs>
        <motion.path d={FAR} style={{ fill: far }} />
        {BUILDINGS.filter((b) => FAR_HILL[b.key]).map((b) => (
          <Building key={b.key} building={b} time={time} />
        ))}
        <motion.path d={NEAR} style={{ fill: near }} />
        {BUILDINGS.filter((b) => !FAR_HILL[b.key] && b.key !== 'walls').map((b) => (
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
    </motion.div>
  )
}

/** The buildings' notes, over the panorama and above the era's style (so they stay crisp). */
export function Notes({ time }) {
  const frame = usePanorama(time)
  return (
    <motion.div className="pointer-events-none absolute z-[550]" style={frame}>
      {NOTES.map((b) => (
        <Callout key={b.key} building={b} time={time} left={`${(b.x / W) * 100}%`} top={`${(b.top / H) * 100}%`} />
      ))}
    </motion.div>
  )
}
