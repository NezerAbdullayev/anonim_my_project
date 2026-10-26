import { motion, useTransform } from 'framer-motion'
import { holdRange } from './dive.js'

const groupDigits = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/**
 * A depth to compare with (e.g. the bottom of Lake Baikal): a dashed line across the water
 * that rises past you as you sink through that depth, with a note on it.
 */
export default function Landmark({ landmark, progress }) {
  const { at, span, depth, name, text } = landmark
  const [h0, h1] = holdRange(at)
  const enter = at - span
  const leave = at + span

  // enter → h0: the line comes up from below; h0 → h1: it waits at the middle; then rises away
  const y = useTransform(progress, [enter, h0, h1, leave], ['60vh', '0vh', '0vh', '-60vh'])
  const opacity = useTransform(progress, [enter, h0, h1, leave], [0, 1, 1, 0])
  // h0 - span/2 → h0: the line draws itself across the screen from the left
  const scaleX = useTransform(progress, [h0 - span / 2, h0], [0, 1])

  return (
    <motion.section
      className="pointer-events-none absolute inset-0 z-[500] flex flex-col justify-center"
      style={{ y, opacity }}
      aria-label={name}
    >
      <div className="mx-auto mb-3 max-w-lg px-4 text-center">
        <p className="font-mono text-sm text-cyan-200">{groupDigits(depth)} m</p>
        <h3 className="mt-1 font-display text-2xl font-black sm:text-4xl">{name}</h3>
      </div>
      <motion.div
        className="h-0 origin-left sm:mr-52 border-t-2 border-dashed border-cyan-200/70 shadow-[0_0_12px_rgba(165,243,252,0.5)]"
        style={{ scaleX }}
      />
      <p className="mx-auto mt-3 max-w-md px-4 text-center text-sm leading-relaxed text-slate-200 sm:text-base">{text}</p>
    </motion.section>
  )
}
