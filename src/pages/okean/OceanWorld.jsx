import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { playOceanMusic } from '../../audio/oceanMusic.js'
import WaterColumn from './WaterColumn.jsx'
import MarineSnow from './MarineSnow.jsx'
import Terrain from './Terrain.jsx'
import DepthHud from './DepthHud.jsx'
import ZoneTitle from './ZoneTitle.jsx'
import Creature from './Creature.jsx'
import Landmark from './Landmark.jsx'
import Seabed from './Seabed.jsx'
import { TRACK, ZONES } from './dive.js'
import { rand } from '../shared/util.js'

/**
 * Scroll-driven dive from the surface to the bottom of the Mariana Trench (10 935 m),
 * through the ocean's five zones. The water darkens, the sun rays fade, marine snow
 * thickens and the gauge counts depth, pressure, temperature and light (see dive.js).
 *
 * Music lives here; the dive itself is remounted on "back to the surface", so every
 * scroll position and spring starts fresh at 0 m.
 */
export default function OceanWorld() {
  const [run, setRun] = useState(0)

  // Background music for as long as this world is open; it sinks with the dive
  const musicRef = useRef(null)
  useEffect(() => {
    const music = playOceanMusic()
    musicRef.current = music
    return () => {
      music.stop()
      musicRef.current = null
    }
  }, [])

  return (
    <Dive
      key={run}
      fromBottom={run > 0}
      onProgress={(p) => musicRef.current?.setProgress(p)}
      onRestart={() => setRun((r) => r + 1)}
    />
  )
}

/** Back from the bottom: a cloud of bubbles rushes up past the surface view and clears. */
function Bubbles() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        left: rand(0, 100),
        size: rand(10, 42),
        duration: rand(1.6, 2.6),
        delay: rand(0, 0.4),
      })),
    []
  )
  return (
    <div className="pointer-events-none absolute inset-0 z-[900] overflow-hidden" aria-hidden="true">
      {bubbles.map((b, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 rounded-full border border-white/70 bg-white/20"
          style={{ left: `${b.left}%`, width: b.size, height: b.size }}
          initial={{ y: '0vh', opacity: 0.9 }}
          animate={{ y: '-120vh', opacity: 0 }}
          transition={{ duration: b.duration, delay: b.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

function Dive({ fromBottom, onProgress, onRestart }) {
  const scrollRef = useRef(null)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  // Scroll → dive: the track is stretched at every stop's hold so each fact gets its own scroll
  const diveProgress = useTransform(scrollYProgress, TRACK.scroll, TRACK.dive)
  // Spring on top of it: heavy and slow, like sinking through water
  const progress = useSpring(diveProgress, { stiffness: 45, damping: 20, restDelta: 0.0002 })

  useMotionValueEvent(progress, 'change', onProgress)

  // 0 → 0.04: intro title fades as soon as the dive begins
  const introOpacity = useTransform(progress, [0, 0.04], [1, 0])

  return (
    <div ref={scrollRef} className="no-scrollbar fixed inset-0 overflow-y-auto bg-black font-sans text-white">
      {/* Tall scroll track; the sticky stage stays pinned while it scrolls */}
      <div className="relative" style={{ height: `${TRACK.vh}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <WaterColumn progress={progress} />
          <MarineSnow progress={progress} />
          <Terrain progress={progress} />
          {ZONES.map((zone, i) => (
            <ZoneTitle key={zone.key} zone={zone} index={i} progress={progress} />
          ))}
          {ZONES.flatMap((zone) =>
            (zone.stops ?? []).map((s) =>
              s.kind === 'line' ? (
                <Landmark key={s.key} landmark={s} progress={progress} />
              ) : (
                <Creature key={s.key} creature={s} progress={progress} />
              )
            )
          )}
          <Seabed progress={progress} onRestart={onRestart} />
          <DepthHud progress={progress} />
          {fromBottom && <Bubbles />}

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
