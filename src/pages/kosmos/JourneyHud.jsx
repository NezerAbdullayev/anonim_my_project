import { useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { BODIES, holdAt } from './journey.js'

const LIGHT_KM_S = 299_792

const formatKm = (km) =>
  km < 1e9
    ? `${(km / 1e6).toFixed(1).replace('.', ',')} mln km`
    : `${(km / 1e9).toFixed(2).replace('.', ',')} mlrd km`

const formatLightTime = (km) => {
  const s = Math.round(km / LIGHT_KM_S)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h ? `${h} saat ${m} dəq` : `${m} dəq ${sec} san`
}

// Distance from the Sun along the route: real distances at each planet's calm moment
const POINTS = [0, 0.04, ...BODIES.map(holdAt), 1]
const KMS = [0, 0.7e6, ...BODIES.map((b) => b.distanceKm), 4.6e9]
const STOPS = ['Günəş', ...BODIES.map((b) => b.name)]

/** Distance counter (top-left) and the route rail (right). */
export default function JourneyHud({ progress }) {
  const km = useTransform(progress, POINTS, KMS)
  const distance = useTransform(km, formatKm)
  const lightTime = useTransform(km, formatLightTime)

  const [current, setCurrent] = useState(0)
  useMotionValueEvent(progress, 'change', (p) => {
    let i = 0
    BODIES.forEach((b, k) => {
      if (p >= b.at[0] + 0.02) i = k + 1
    })
    setCurrent(i)
  })

  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-[700] font-mono text-[11px] uppercase tracking-widest text-slate-300/80 sm:left-6 sm:top-6 sm:text-xs">
        <p>Günəşdən məsafə</p>
        <motion.p className="text-base font-bold normal-case tracking-normal text-white sm:text-lg">{distance}</motion.p>
        <p className="mt-2">İşıq buraya çatır</p>
        <motion.p className="text-sm normal-case tracking-normal text-amber-200 sm:text-base">{lightTime}</motion.p>
      </div>

      <ol className="pointer-events-none absolute right-6 top-1/2 z-[700] hidden -translate-y-1/2 flex-col gap-3 font-mono text-xs sm:flex">
        {STOPS.map((name, i) => (
          <li
            key={name}
            className={`flex items-center justify-end gap-2 transition-colors duration-500 ${
              i === current ? 'text-white' : i < current ? 'text-slate-500' : 'text-slate-600'
            }`}
          >
            {name}
            <span
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                i === current ? 'scale-150 bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]' : 'bg-slate-600'
              }`}
            />
          </li>
        ))}
      </ol>
    </>
  )
}
