import { useEffect, useRef } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { playSpaceMusic } from '../../audio/spaceMusic.js'
import Starfield from './Starfield.jsx'
import Sun, { SunLight } from './Sun.jsx'
import Planet from './Planet.jsx'
import JourneyHud from './JourneyHud.jsx'
import { BODIES, TRACK } from './journey.js'
import { useSpaceEngine } from './useSpaceEngine.js'
import { useZoom } from './SurfaceZoom.jsx'

// Route order = generation order, so the first bodies are ready first
const TEXTURE_KEYS = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

/**
 * Scroll-driven trip through the Solar System: start at the Sun (zoom into its surface
 * and back first), fly past every
 * planet (and through the asteroid belt) out to Neptune. At each planet the trip pauses
 * while its facts are on screen (see TRACK in journey.js for the scroll lengths).
 */
export default function SpaceWorld() {
  const scrollRef = useRef(null)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  // Scroll → journey: the track is stretched at every planet's hold so each fact gets its own scroll
  const journeyProgress = useTransform(scrollYProgress, TRACK.scroll, TRACK.journey)
  // Spring on top of it: soft and floaty, like coasting through space
  const progress = useSpring(journeyProgress, { stiffness: 55, damping: 22, restDelta: 0.0002 })
  // Before the journey: the Sun zoom (planets run their own, see Planet.jsx)
  const zoom = useZoom(scrollYProgress, TRACK.zooms.sun)
  const { textures, engine } = useSpaceEngine(TEXTURE_KEYS)
  const loaded = Object.keys(textures).length

  // Background music for as long as this world is open; it brightens further out
  const musicRef = useRef(null)
  useEffect(() => {
    const music = playSpaceMusic()
    musicRef.current = music
    return () => {
      music.stop()
      musicRef.current = null
    }
  }, [])
  useMotionValueEvent(progress, 'change', (p) => musicRef.current?.setProgress(p))

  // zoom 0 → 0.08: intro title fades as soon as the zoom begins
  const introOpacity = useTransform(zoom, [0, 0.08], [1, 0])
  // 0.965 → 0.99: outro appears past Neptune
  const outroOpacity = useTransform(progress, [0.965, 0.99], [0, 1])

  return (
    <div ref={scrollRef} className="no-scrollbar fixed inset-0 overflow-y-auto bg-black font-sans text-white">
      {/* Tall scroll track; the sticky stage stays pinned while it scrolls */}
      <div className="relative" style={{ height: `${TRACK.vh}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <Starfield progress={progress} />
          <SunLight progress={progress} />
          <Sun progress={progress} zoom={zoom} engine={engine} texture={textures.sun} />
          {BODIES.map((body) => (
            <Planet
              key={body.key}
              body={body}
              progress={progress}
              scroll={scrollYProgress}
              engine={engine}
              texture={textures[body.key]}
              moonTexture={textures.moon}
            />
          ))}
          <JourneyHud progress={progress} />

          <motion.div
            className="pointer-events-none absolute inset-x-4 top-[12vh] z-[700] text-center"
            style={{ opacity: introOpacity }}
          >
            <h1 className="font-display text-4xl font-black tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-6xl">
              Günəş sistemi və planetlər
            </h1>
            <p className="mt-3 text-base text-slate-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:text-xl">
              Səyahətə başlamaq üçün aşağı doğru sürüşdürün
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

          <motion.div
            className="pointer-events-none absolute inset-x-4 top-1/2 z-[700] -translate-y-1/2 text-center"
            style={{ opacity: outroOpacity }}
          >
            <h2 className="font-display text-3xl font-black tracking-wide sm:text-5xl">Neptundan o yana — sonsuzluq ✨</h2>
            <p className="mt-3 text-slate-300">Səyahət bitdi. Yenidən başlamaq üçün yuxarı qalx ↑</p>
          </motion.div>

          {loaded < TEXTURE_KEYS.length && (
            <p className="pointer-events-none absolute bottom-4 left-4 z-[700] font-mono text-[11px] text-slate-400">
              Planetlər hazırlanır… {loaded}/{TEXTURE_KEYS.length}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
