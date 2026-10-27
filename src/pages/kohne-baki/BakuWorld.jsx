import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Sky from './Sky.jsx'
import Panorama from './Panorama.jsx'
import Sea from './Sea.jsx'
import EraStyle from './EraStyle.jsx'
import EraTitle from './EraTitle.jsx'
import YearCounter from './YearCounter.jsx'
import { ERAS, TRACK } from './timeline.js'

/**
 * Scroll-driven time-lapse of Baku: one fixed view of the bay from the Caspian, from 1078 to
 * today. Scrolling moves time, not the camera: the sky goes through one long day, the
 * drawing style changes with the era and the city is built on the hills (see timeline.js).
 */
export default function BakuWorld() {
  const scrollRef = useRef(null)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  // Scroll → time: the track is stretched at every stop's hold so each text gets its own scroll
  const timeProgress = useTransform(scrollYProgress, TRACK.scroll, TRACK.time)
  // Spring on top of it: smooth, like the hands of a clock catching up
  const time = useSpring(timeProgress, { stiffness: 60, damping: 22, restDelta: 0.0002 })

  // 0 → 0.03: intro title fades as soon as time starts moving
  const introOpacity = useTransform(time, [0, 0.03], [1, 0])

  return (
    <div ref={scrollRef} className="no-scrollbar fixed inset-0 overflow-y-auto bg-black font-sans text-white">
      {/* Tall scroll track; the sticky stage stays pinned while it scrolls */}
      <div className="relative" style={{ height: `${TRACK.vh}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <Sky time={time} />
          <Panorama time={time} />
          <Sea time={time} />
          <EraStyle time={time} />
          {ERAS.map((era) => (
            <EraTitle key={era.key} era={era} progress={time} />
          ))}
          <YearCounter time={time} />

          <motion.div
            className="pointer-events-none absolute inset-x-4 top-[30vh] z-[700] text-center"
            style={{ opacity: introOpacity }}
          >
            <h1 className="font-old text-4xl font-bold text-[#fff3dc] drop-shadow-[0_2px_16px_rgba(20,10,40,0.9)] sm:text-6xl">
              Köhnə Bakı
            </h1>
            <p className="mt-2 font-old text-xl text-amber-100 drop-shadow-[0_2px_10px_rgba(20,10,40,0.9)] sm:text-2xl">
              900 il, bir mənzərə
            </p>
            <p className="mt-4 text-base text-white/90 drop-shadow-[0_1px_8px_rgba(20,10,40,0.9)] sm:text-lg">
              Zamanı irəli çəkmək üçün aşağı sürüşdürün
            </p>
            <motion.p
              className="mt-2 text-2xl text-amber-100"
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
