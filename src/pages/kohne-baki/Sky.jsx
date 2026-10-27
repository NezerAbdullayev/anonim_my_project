import { useMemo } from 'react'
import { motion, useMotionTemplate, useTransform } from 'framer-motion'
import { SKY } from './timeline.js'
import { rand } from '../shared/util.js'

export const HORIZON = 64 // vh from the top: where the sea meets the shore

// The sun crosses the sky over the "day" (dawn → sunset), the moon rises after it
const SUN_DAY = [0.04, 0.63]
const MOON_RISE = [0.7, 0.9]

const arc = (t, height) => HORIZON - Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * height

/** The sky of the one long day: its colour, the sun, the moon and the stars. */
export default function Sky({ time }) {
  const top = useTransform(time, SKY.points, SKY.top)
  const bottom = useTransform(time, SKY.points, SKY.bottom)
  const background = useMotionTemplate`linear-gradient(to bottom, ${top}, ${bottom} ${HORIZON}%)`

  // SUN_DAY: the sun rises on the left, climbs to noon and sets on the right
  const sunT = useTransform(time, SUN_DAY, [0, 1])
  const sunLeft = useTransform(sunT, (t) => `${8 + 84 * t}%`)
  const sunTop = useTransform(sunT, (t) => `${arc(t, 48)}vh`)
  // low sun is big and red, high sun small and pale
  const sunColor = useTransform(sunT, [0, 0.15, 0.5, 0.85, 1], ['#ff9a5a', '#ffd89a', '#fff6d8', '#ffb26b', '#ff6a3d'])
  const sunScale = useTransform(sunT, [0, 0.5, 1], [1.4, 0.9, 1.5])
  const sunGlow = useTransform(sunColor, (c) => `0 0 60px 20px ${c}`)

  // MOON_RISE: the moon comes up on the left after dark
  const moonT = useTransform(time, MOON_RISE, [0, 1])
  const moonLeft = useTransform(moonT, (t) => `${14 + 16 * t}%`)
  const moonTop = useTransform(moonT, (t) => `${HORIZON - 46 * t}vh`)

  // Stars: fading out at the first light, back after the sunset
  const starsOpacity = useTransform(time, [0, 0.05, 0.64, 0.8], [0.8, 0, 0, 1])

  const stars = useMemo(
    () => Array.from({ length: 90 }, () => ({ x: rand(0, 100), y: rand(0, HORIZON - 6), r: rand(0.6, 1.6) })),
    []
  )

  return (
    <motion.div className="absolute inset-0" style={{ background }}>
      <motion.svg className="absolute inset-0 h-full w-full" style={{ opacity: starsOpacity }} aria-hidden="true">
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#fff" opacity={0.5 + s.r / 4} />
        ))}
      </motion.svg>

      <motion.div
        className="absolute h-[9vmin] w-[9vmin] rounded-full"
        style={{ left: sunLeft, top: sunTop, x: '-50%', y: '-50%', backgroundColor: sunColor, boxShadow: sunGlow, scale: sunScale }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute h-[6vmin] w-[6vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4f1e6] shadow-[0_0_40px_10px_rgba(244,241,230,0.35)]"
        style={{ left: moonLeft, top: moonTop }}
        aria-hidden="true"
      />
    </motion.div>
  )
}
