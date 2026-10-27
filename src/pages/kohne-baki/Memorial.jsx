import { motion, useTransform } from 'framer-motion'
import { MEMORIALS, holdRange } from './timeline.js'

/**
 * A moment of remembrance: the whole picture slowly loses its colour and dims, and one quiet
 * line stands in the middle. No image and no effect, nothing flashes.
 */
function Moment({ memorial, time }) {
  const { at, span, when, text } = memorial
  const [h0, h1] = holdRange(at)
  // at - span → h0: colour drains away and the light dims; h1 → at + span: it comes back
  const shade = useTransform(time, [at - span, h0, h1, at + span], [0, 1, 1, 0])
  const dim = useTransform(shade, [0, 1], [0, 0.45])

  return (
    <>
      <motion.div className="pointer-events-none absolute inset-0 z-[560] bg-[#808080] mix-blend-saturation" style={{ opacity: shade }} />
      <motion.div className="pointer-events-none absolute inset-0 z-[560] bg-black" style={{ opacity: dim }} />
      <motion.section
        className="pointer-events-none absolute inset-x-4 top-[30vh] z-[640] mx-auto max-w-lg text-center short:top-[24vh]"
        style={{ opacity: shade }}
        aria-label={when}
      >
        <p className="font-old text-2xl font-bold text-white sm:text-3xl">{when}</p>
        <p className="mt-3 text-base leading-relaxed text-white/90 sm:text-lg">{text}</p>
      </motion.section>
    </>
  )
}

export default function Memorials({ time }) {
  return MEMORIALS.map((m) => <Moment key={m.key} memorial={m} time={time} />)
}
