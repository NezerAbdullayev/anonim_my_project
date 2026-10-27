import { motion, useTransform } from 'framer-motion'
import { HILLS } from './timeline.js'
import { HORIZON } from './Sky.jsx'

// The hills around the bay (viewBox 1440 × 300): high on both sides, a dip at the old town
const FAR =
  'M0,120 C120,90 220,70 330,96 C440,122 520,150 640,160 C760,170 860,150 960,120 C1080,84 1200,60 1320,74 C1380,82 1420,96 1440,104 L1440,300 L0,300 Z'
const NEAR =
  'M0,190 C140,170 260,176 380,196 C500,216 600,236 720,238 C840,240 940,226 1040,206 C1160,182 1300,176 1440,186 L1440,300 L0,300 Z'

/**
 * The view itself, from the sea toward the city: hills (and, era by era, the buildings on
 * them). Wider than a phone screen, so there it is a panorama the camera can pan along.
 */
export default function Panorama({ time }) {
  const far = useTransform(time, HILLS.points, HILLS.far)
  const near = useTransform(time, HILLS.points, HILLS.near)

  return (
    <div
      className="absolute left-1/2 w-[max(100vw,170vh)] -translate-x-1/2"
      style={{ top: `${HORIZON - 30}vh`, height: '30vh' }}
    >
      <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <motion.path d={FAR} style={{ fill: far }} />
        <motion.path d={NEAR} style={{ fill: near }} />
      </svg>
    </div>
  )
}
