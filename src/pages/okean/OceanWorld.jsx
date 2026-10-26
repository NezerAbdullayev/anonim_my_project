import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import WaterColumn from './WaterColumn.jsx'
import MarineSnow from './MarineSnow.jsx'
import DepthHud from './DepthHud.jsx'
import ZoneTitle from './ZoneTitle.jsx'
import { DIVE_VH, ZONES } from './dive.js'

/**
 * Scroll-driven dive from the surface to the bottom of the Mariana Trench (10 935 m),
 * through the ocean's five zones. The water darkens, the sun rays fade, marine snow
 * thickens and the gauge counts depth, pressure, temperature and light (see dive.js).
 */
export default function OceanWorld() {
  const scrollRef = useRef(null)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  // Spring on top of the raw scroll: heavy and slow, like sinking through water
  const progress = useSpring(scrollYProgress, { stiffness: 45, damping: 20, restDelta: 0.0002 })

  // 0 → 0.04: intro title fades as soon as the dive begins
  const introOpacity = useTransform(progress, [0, 0.04], [1, 0])

  return (
    <div ref={scrollRef} className="no-scrollbar fixed inset-0 overflow-y-auto bg-black font-sans text-white">
      {/* Tall scroll track; the sticky stage stays pinned while it scrolls */}
      <div className="relative" style={{ height: `${DIVE_VH}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <WaterColumn progress={progress} />
          <MarineSnow progress={progress} />
          {ZONES.map((zone, i) => (
            <ZoneTitle key={zone.key} zone={zone} index={i} progress={progress} />
          ))}
          <DepthHud progress={progress} />

          <motion.div
            className="pointer-events-none absolute inset-x-4 top-[34vh] z-[700] text-center"
            style={{ opacity: introOpacity }}
          >
            <h1 className="font-display text-4xl font-black tracking-wide drop-shadow-[0_2px_16px_rgba(8,47,73,0.9)] sm:text-6xl">
              Okeanın dibinə səyahət
            </h1>
            <p className="mt-3 text-base text-cyan-50 drop-shadow-[0_1px_8px_rgba(8,47,73,0.9)] sm:text-xl">
              Mariana çökəkliyinə, 10 935 metrə enmək üçün aşağı sürüşdürün
            </p>
            <motion.p
              className="mt-2 text-2xl text-cyan-100"
              aria-hidden="true"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              ↓
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
