import { motion, useTransform } from 'framer-motion'
import { GRAIN } from './timeline.js'

/**
 * The "drawing" look of each era laid over the picture: paper grain that is thick in the old
 * miniatures and engravings and gone by today's night. One static SVG noise; only its
 * opacity follows time, so it stays cheap.
 */
export default function EraStyle({ time }) {
  const opacity = useTransform(time, GRAIN.points, GRAIN.opacity)

  return (
    <motion.svg
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply will-change-[opacity]"
      style={{ opacity }}
      aria-hidden="true"
    >
      <filter id="paper">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.9 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper)" />
    </motion.svg>
  )
}
