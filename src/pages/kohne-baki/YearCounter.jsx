import { useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { ERAS, YEAR, eraAt } from './timeline.js'

/** One flap of the flip clock: a new digit flips down into place whenever it changes. */
function Flap({ digit }) {
  return (
    <span className="relative inline-block h-[1.3em] w-[0.9em] overflow-hidden rounded-md bg-[#1b1712] text-center leading-[1.3em] shadow-[inset_0_-2px_0_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.5)] [perspective:200px]">
      <motion.span
        key={digit}
        className="absolute inset-0 origin-top"
        initial={{ rotateX: -80, opacity: 0.4 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {digit}
      </motion.span>
      {/* the hinge across the middle of the flap */}
      <span className="absolute inset-x-0 top-1/2 h-px bg-black/60" aria-hidden="true" />
    </span>
  )
}

/** The year as a flip clock (top centre) and the era we are in, with a dot per era. */
export default function YearCounter({ time }) {
  const yearValue = useTransform(time, YEAR.points, YEAR.years)
  const [year, setYear] = useState(YEAR.years[0])
  useMotionValueEvent(yearValue, 'change', (y) => setYear(Math.floor(y)))
  const era = eraAt(year)

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-[700] flex flex-col items-center sm:top-6 short:top-2" aria-live="off">
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#f3e2c0]/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] sm:text-xs short:hidden">
        İl
      </p>
      <div className="mt-1 flex gap-1 font-mono text-3xl font-bold text-[#f3e2c0] sm:text-5xl short:mt-0 short:text-xl" aria-label={`İl ${year}`}>
        {String(year)
          .padStart(4, '0')
          .split('')
          .map((d, i) => (
            <Flap key={i} digit={d} />
          ))}
      </div>
      <p className="mt-2 font-old text-sm text-[#f3e2c0] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-base short:hidden">
        {ERAS[era].name}
      </p>
      <ol className="mt-2 flex gap-2 short:mt-1" aria-hidden="true">
        {ERAS.map((e, i) => (
          <li
            key={e.key}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === era ? 'w-6 bg-[#f3e2c0]' : i < era ? 'w-1.5 bg-[#f3e2c0]/60' : 'w-1.5 bg-[#f3e2c0]/25'
            }`}
          />
        ))}
      </ol>
    </div>
  )
}
