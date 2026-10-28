import { motion, useTransform } from 'framer-motion'
import { FACTS_END, holdRange } from './dive.js'

// Soft oval edge so the photo melts into the water around it
const MASK = 'radial-gradient(ellipse 50% 50% at center, #000 60%, transparent 100%)'

function Fact({ text, progress, range }) {
  // range[0] → range[1]: this fact fades in and slides over from the left
  const opacity = useTransform(progress, range, [0, 1])
  const x = useTransform(progress, range, [-12, 0])
  return (
    <motion.li className="flex gap-2" style={{ opacity, x }}>
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" aria-hidden="true" />
      {text}
    </motion.li>
  )
}

/**
 * One creature on the way down: its real photo rises up from below as you sink past it,
 * pauses (the hold, see dive.js) while its facts appear one by one, then rises off the top.
 */
export default function Creature({ creature, progress }) {
  const { at, span, side, name, tagline, facts, photo } = creature
  const [h0, h1] = holdRange(at)
  const enter = at - span
  const leave = at + span

  // enter → h0: comes up from below the screen; h0 → h1: stays; h1 → leave: goes up and away
  const y = useTransform(progress, [enter, h0, h1, leave], ['85vh', '0vh', '0vh', '-85vh'])
  // fully visible only near the hold, so neighbours never overlap
  const opacity = useTransform(progress, [enter + span * 0.3, h0, h1, leave - span * 0.3], [0, 1, 1, 0])
  // the photo grows a touch as it comes closer
  const scale = useTransform(progress, [enter, h0, h1, leave], [0.85, 1, 1, 0.9])

  // The facts appear one by one from just before the hold to FACTS_END of it; then a pause
  const r0 = h0 - span * 0.25
  const step = (h0 + (h1 - h0) * FACTS_END - r0) / facts.length

  return (
    <motion.section
      className={`pointer-events-none absolute inset-0 z-[500] flex flex-col items-center justify-end gap-3 px-4 pb-28 sm:justify-center sm:gap-10 sm:pb-0 sm:pl-12 sm:pr-52 short:gap-4 short:pb-12 short:pl-4 ${
        side === 'right' ? 'sm:flex-row-reverse' : 'sm:flex-row'
      }`}
      style={{ y, opacity }}
      aria-label={name}
    >
      <motion.figure className="w-full max-w-2xl sm:w-1/2" style={{ scale }}>
        <motion.img
          src={photo.src}
          alt={name}
          decoding="async"
          className="h-[30vh] w-full object-cover sm:h-auto short:h-[60vh]"
          style={{ maskImage: MASK, WebkitMaskImage: MASK }}
          // a slow drift, like the animal moving in the current
          animate={{ x: [-8, 8, -8], y: [0, -6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <figcaption className="mt-1 short:hidden text-center font-mono text-[10px] text-slate-300/70">{photo.caption}</figcaption>
      </motion.figure>

      <div className="w-full max-w-md rounded-2xl bg-slate-950/35 p-4 backdrop-blur-sm sm:w-auto sm:p-6 short:p-3">
        <h3 className="font-display text-2xl font-black sm:text-4xl short:text-xl">{name}</h3>
        <p className="mt-1 text-sm text-cyan-200 sm:text-base short:mt-0 short:text-xs">{tagline}</p>
        <ul className="mt-3 space-y-1.5 text-sm leading-snug text-slate-100 sm:text-base short:mt-1.5 short:space-y-0.5 short:text-xs">
          {facts.map((text, i) => (
            <Fact
              key={text}
              text={text}
              progress={progress}
              range={[r0 + i * step, r0 + (i + 0.6) * step]}
            />
          ))}
        </ul>
      </div>
    </motion.section>
  )
}
