import { useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion'
import { BLACK_HOLE } from './journey.js'

// The black hole after Neptune; `bh` = its own progress 0..1 (see TRACK.blackHole).
// Phases along it:
const HOLD = [0.2, 0.32] // calm, its label is shown (≈ 2 s)
const FALL = [0.32, 0.5] // falling toward the horizon: the two clocks drift apart
const INSIDE = 0.5 // horizon crossed: the sky shrinks into a ring above us
const RING = 0.62 // second caption inside
const DARK = 0.8 // total darkness at the end of known physics
const WHITE = 0.88 // white hole: light opens up again, then "start again"

const logLerp = (a, b, t) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t)
const clamp01 = (v) => Math.min(1, Math.max(0, v))

const YEAR = 365.25 * 86400
/** Seconds → a short Azerbaijani duration ("3,2 san", "12 gün", "1,4 mln il"). */
const formatDuration = (s) => {
  const n = (v, d = 0) => v.toLocaleString('az-AZ', { maximumFractionDigits: d, minimumFractionDigits: d })
  if (s < 60) return `${n(s, 1)} san`
  if (s < 3600) return `${n(s / 60)} dəq`
  if (s < 86400) return `${n(s / 3600)} saat`
  if (s < YEAR) return `${n(s / 86400)} gün`
  const y = s / YEAR
  if (y < 1e3) return `${n(y)} il`
  if (y < 1e6) return `${n(y / 1e3, 1)} min il`
  if (y < 1e9) return `${n(y / 1e6, 1)} mln il`
  return `${n(y / 1e9, 1)} mlrd il`
}

/**
 * Fades its children in over 0.5 s while `shown`, out quickly otherwise. Positioning
 * (incl. translate classes) stays on the outer box: the animated y would override it.
 */
function Caption({ shown, className = '', children }) {
  const reduce = useReducedMotion()
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <motion.div
        initial={false}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : 12 }}
        transition={{ duration: shown ? 0.5 : 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/** Accretion disk, seen tilted; `front` keeps only the half that passes in front of the shadow. */
function Disk({ front, reduce }) {
  const annulus = 'radial-gradient(circle, transparent 27%, #000 31%, #000 60%, transparent 70%)'
  return (
    <div
      className="absolute inset-0"
      style={{ transform: 'rotate(-8deg) scaleY(0.24)', clipPath: front ? 'inset(50% 0 0 0)' : undefined }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-full" style={{ maskImage: annulus, WebkitMaskImage: annulus }}>
        {/* Hot gas, streaky; it orbits */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'repeating-radial-gradient(circle, rgba(60,10,0,0.25) 0 1.2%, transparent 1.2% 2.6%), conic-gradient(from 0deg, #ffb35c, #ff7a1a, #ffd9a0, #ff8a2a, #b54a10, #ffc27a, #ff7a1a, #ffe1b0, #ffb35c)',
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        />
        {/* The side coming toward us is brighter (Doppler beaming) */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,245,225,0.55),transparent_45%,rgba(0,0,0,0.5))]" />
      </div>
    </div>
  )
}

/**
 * Past Neptune: Sagittarius A* comes into view, its facts (and real EHT image) show,
 * we fall in while the clocks drift apart, cross the horizon, the sky shrinks into
 * a ring, total darkness — then, in theory, a white hole lets the light back in and
 * the trip can start again (onRestart).
 */
export default function BlackHole({ bh, onRestart }) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState('away')
  useMotionValueEvent(bh, 'change', (b) => {
    if (b <= 0.001) setPhase('away')
    else if (b < HOLD[0]) setPhase('approach')
    else if (b < HOLD[1]) setPhase('hold')
    else if (b < INSIDE) setPhase('fall')
    else if (b < RING) setPhase('horizon')
    else if (b < DARK) setPhase('ring')
    else if (b < WHITE) setPhase('dark')
    else if (b < 0.95) setPhase('white')
    else setPhase('end')
  })

  // 0 → HOLD[0]: a dot far away grows as we approach (30 → 1 sizes away)
  // HOLD: slow drift closer; FALL: it swells until its shadow fills the screen
  const scale = useTransform(bh, (b) => {
    if (b < HOLD[0]) return 1 / logLerp(30, 1, b / HOLD[0])
    if (b < HOLD[1]) return 1 / logLerp(1, 0.87, (b - HOLD[0]) / (HOLD[1] - HOLD[0]))
    return 1.15 * Math.pow(12, clamp01((b - FALL[0]) / (FALL[1] - FALL[0])))
  })
  // 0 → 0.02: fades in as a dot
  const outsideOpacity = useTransform(bh, [0, 0.02], [0, 1])

  // FALL: our own clock creeps to ~5 s while the far-away (Earth) clock races to ~1,6 mlrd il
  const fallT = useTransform(bh, (b) => clamp01((b - FALL[0]) / (FALL[1] - FALL[0])))
  const ownClock = useTransform(fallT, (u) => formatDuration(Math.max(0.1, u * 5)))
  const farClock = useTransform(fallT, (u) => formatDuration(Math.max(0.1, u * 5) * Math.pow(10, u * 16)))

  // Inside: INSIDE-0.03 → INSIDE: darkness closes in over everything
  const insideOpacity = useTransform(bh, [INSIDE - 0.03, INSIDE], [0, 1])
  // INSIDE → DARK: the whole sky behind us shrinks into a small ring, getting bluer and brighter
  const ringSize = useTransform(bh, [INSIDE, DARK], ['80vmin', '3vmin'])
  const ringOpacity = useTransform(bh, [INSIDE, INSIDE + 0.03, DARK - 0.04, DARK], [0, 1, 1, 0])
  const ringColor = useTransform(bh, [INSIDE, DARK], ['rgba(255,236,200,0.9)', 'rgba(170,215,255,1)'])
  const ringGlow = useTransform(ringColor, (c) => `0 0 24px 4px ${c}, inset 0 0 18px 2px ${c}`)
  // WHITE → 0.98: light slowly opens up from the centre (slow on purpose: no flash)
  const whiteScale = useTransform(bh, [WHITE, 0.98], [0, 3])
  const whiteOpacity = useTransform(bh, [WHITE, 0.94], [0, 1])

  if (phase === 'away') return null
  const insidePhases = ['horizon', 'ring', 'dark', 'white', 'end']

  return (
    <>
      {/* Outside view: shadow, photon ring, tilted accretion disk */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[650] -ml-[30vmin] -mt-[30vmin] h-[60vmin] w-[60vmin]"
        style={{ scale, opacity: outsideOpacity }}
      >
        <div className="absolute -inset-[40%] rounded-full bg-[radial-gradient(circle,rgba(255,150,60,0.28)_0%,rgba(255,110,30,0.08)_35%,transparent_65%)]" />
        <Disk reduce={reduce} />
        {/* Light from the far side of the disk, bent over and under the shadow */}
        <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,transparent_56%,rgba(255,225,170,0.95)_62%,rgba(255,150,60,0.55)_68%,transparent_78%)]" />
        <div className="absolute inset-[30%] rounded-full bg-black shadow-[0_0_30px_10px_rgba(0,0,0,0.9)]" />
        <Disk front reduce={reduce} />
      </motion.div>

      {/* Label with its facts and the real image (same look as the planet labels) */}
      <Caption
        shown={phase === 'hold'}
        className="bottom-[calc(7vh+40px)] left-4 right-4 z-[660] sm:bottom-auto sm:left-[6vw] sm:right-auto sm:top-1/2 sm:w-[32vw] sm:-translate-y-1/2"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">{BLACK_HOLE.tagline}</p>
        <h2 className="font-display text-3xl font-black tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-7xl">
          {BLACK_HOLE.name}
        </h2>
        <ul className="mt-3 space-y-1 font-mono text-xs text-slate-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-xl">
          {BLACK_HOLE.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <figure className="mt-4 flex items-center gap-3">
          <img src={BLACK_HOLE.photo.src} alt="" className="h-20 w-20 rounded-lg object-cover ring-1 ring-white/20 sm:h-28 sm:w-28" />
          <figcaption className="font-mono text-[11px] text-slate-400">{BLACK_HOLE.photo.caption}</figcaption>
        </figure>
      </Caption>

      {/* Falling: the two clocks */}
      <Caption shown={phase === 'fall'} className="inset-x-4 top-[10vh] z-[700] text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">Hadisələr üfüqünə yaxınlaşırıq</p>
        <div className="mt-4 flex justify-center gap-8 font-mono sm:gap-16">
          <div>
            <p className="text-xs text-slate-400 sm:text-sm">Sənin saatın</p>
            <motion.p className="text-2xl font-bold text-white sm:text-4xl">{ownClock}</motion.p>
          </div>
          <div>
            <p className="text-xs text-slate-400 sm:text-sm">Yerdəki saat</p>
            <motion.p className="text-2xl font-bold text-amber-300 sm:text-4xl">{farClock}</motion.p>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-base">
          Güclü cazibədə zaman yavaşlayır: uzaqdan baxan üçün sən üfüqün kənarında donub qalırsan
          (Eynşteynin nisbilik nəzəriyyəsi)
        </p>
      </Caption>

      {/* Inside the horizon (covers everything, the HUD too) */}
      {insidePhases.includes(phase) && (
        <motion.div className="absolute inset-0 z-[800] bg-black" style={{ opacity: insideOpacity }}>
          {/* The whole universe behind us, squeezed into a ring of light */}
          <motion.div
            className="absolute left-1/2 top-[30vh] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{ width: ringSize, height: ringSize, opacity: ringOpacity, borderColor: ringColor, boxShadow: ringGlow }}
          />

          <Caption shown={phase === 'horizon'} className="inset-x-4 bottom-[18vh] text-center">
            <h2 className="font-display text-3xl font-black tracking-wide sm:text-5xl">Hadisələr üfüqü keçildi</h2>
            <p className="mt-3 text-base text-slate-300 sm:text-xl">Artıq geri yol yoxdur — buradan işıq belə çıxa bilmir</p>
          </Caption>
          <Caption shown={phase === 'ring'} className="inset-x-4 bottom-[18vh] text-center">
            <h2 className="font-display text-3xl font-black tracking-wide sm:text-5xl">Bütün kainat arxada qaldı</h2>
            <p className="mt-3 text-base text-slate-300 sm:text-xl">Onun işığı kiçik, parlaq bir halqaya sıxılır</p>
          </Caption>
          <Caption shown={phase === 'dark'} className="inset-x-4 top-1/2 -translate-y-1/2 text-center">
            <h2 className="font-display text-3xl font-black tracking-wide text-slate-200 sm:text-5xl">
              Burada bildiyimiz fizika bitir
            </h2>
          </Caption>

          {/* White hole: warm light opening from the centre */}
          <motion.div
            className="absolute left-1/2 top-1/2 -ml-[50vmax] -mt-[50vmax] h-[100vmax] w-[100vmax] rounded-full bg-[radial-gradient(circle,#fff8ec_0%,#ffeccc_45%,rgba(255,220,170,0)_70%)]"
            style={{ scale: whiteScale, opacity: whiteOpacity }}
          />
          <Caption shown={phase === 'white' || phase === 'end'} className="inset-x-4 top-[30vh] text-center text-slate-900">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-700">Nəzəriyyədə</p>
            <h2 className="mt-2 font-display text-4xl font-black tracking-wide sm:text-6xl">Ağ dəlik</h2>
            <p className="mt-3 text-base text-slate-700 sm:text-xl">Qara dəliyin əksi — hər şeyin geri çıxdığı yer</p>
          </Caption>
          {phase === 'end' && (
            <motion.button
              type="button"
              onClick={onRestart}
              className="absolute bottom-[18vh] left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-8 py-3 font-display text-sm font-bold text-amber-100 shadow-lg sm:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Yenidən başla ↑
            </motion.button>
          )}
        </motion.div>
      )}
    </>
  )
}
