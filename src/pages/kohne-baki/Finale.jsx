import { useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { FINALE, holdRange } from './timeline.js'

const [H0] = holdRange(FINALE)

/**
 * The end of the day and of the thousand years: one last card over today's night, and the
 * button that winds time back (onRewind) so the city un-builds itself back to 1000.
 */
export default function Finale({ time, onRewind, rewinding }) {
  const [shown, setShown] = useState(false)
  useMotionValueEvent(time, 'change', (t) => setShown(t >= H0 - 0.004))

  // H0 - 0.015 → H0: the card fades in and settles
  const opacity = useTransform(time, [H0 - 0.015, H0], [0, 1])
  const y = useTransform(time, [H0 - 0.015, H0], ['3vh', '0vh'])

  return (
    <motion.section
      className="pointer-events-none absolute inset-x-4 top-[22vh] z-[650] mx-auto max-w-xl text-center sm:top-[24vh] short:top-[18vh]"
      style={{ opacity, y }}
      aria-label="Bakı"
    >
      <h2 className="font-display text-5xl font-black text-cyan-50 drop-shadow-[0_0_22px_rgba(103,232,249,0.7)] sm:text-7xl short:text-3xl">
        Bakı
      </h2>
      <p className="mt-1 font-old text-lg text-amber-100 sm:text-2xl short:mt-0 short:text-base">1000 il, bir mənzərə</p>
      <p className="mx-auto mt-3 max-w-md short:hidden rounded-xl bg-slate-950/50 px-4 py-2 text-sm leading-relaxed text-slate-100 backdrop-blur-sm sm:text-base">
        1078-ci ilin minarəsi ilə 2012-nin Alov qüllələri eyni dənizə, eyni təpələrə baxır.
      </p>
      {shown && !rewinding && (
        <motion.button
          type="button"
          onClick={onRewind}
          className="pointer-events-auto mt-5 short:mt-2 short:py-1.5 short:text-base rounded-full border border-cyan-200/70 bg-slate-950/60 px-7 py-3 font-display text-lg font-bold text-cyan-50 shadow-[0_0_20px_rgba(103,232,249,0.35)] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Zamanı geri fırlat ↺
        </motion.button>
      )}
    </motion.section>
  )
}
