import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

// Exploded-view layers, bottom to top. `z` = how far (px) the layer flies out once
// fully exploded; `at` = scroll progress where its label fades in. Tune here.
const LAYERS = [
  { key: 'back', label: 'Arxa qapaq — cızıq yoxdu, təzə kimidi', z: -210, at: 0.55 },
  { key: 'battery', label: 'Batareya — 5000 mAh, gün boyu dözür', z: -120, at: 0.6 },
  { key: 'board', label: 'Ana plata — bütün beyin burdadı', z: -30, at: 0.65 },
  { key: 'camera', label: 'Kamera — 3 göz, heç nə qaçmır', z: 60, at: 0.7 },
  { key: 'screen', label: 'Ekran — OLED, gecə də gözü yormur', z: 150, at: 0.75 },
  { key: 'glass', label: 'Şüşə — düşsə də sınmır (inşallah)', z: 240, at: 0.8 },
]

function BackCover() {
  return (
    <div className="absolute inset-0 rounded-[2.5rem] border border-zinc-500 bg-gradient-to-br from-zinc-600 to-zinc-900 shadow-2xl" />
  )
}

function Battery() {
  return (
    <div className="absolute inset-[14%] flex items-center justify-center rounded-xl border-2 border-emerald-300 bg-emerald-500/80 text-sm font-bold text-emerald-950">
      5000 mAh
    </div>
  )
}

function Motherboard() {
  return (
    <div className="absolute inset-[6%] grid grid-cols-3 gap-2 rounded-2xl border border-lime-400/60 bg-green-900/90 p-4">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`rounded ${i % 4 === 0 ? 'bg-amber-300/80' : 'bg-zinc-800'} border border-lime-300/40`} />
      ))}
    </div>
  )
}

function Camera() {
  return (
    <div className="absolute left-[8%] top-[5%] grid h-[22%] w-[45%] grid-cols-2 gap-1.5 rounded-2xl bg-zinc-800 p-2">
      {[0, 1, 2].map((i) => (
        <span key={i} className="rounded-full border-2 border-zinc-500 bg-gradient-to-br from-sky-900 to-black" />
      ))}
    </div>
  )
}

function Screen() {
  return (
    <div className="absolute inset-[3%] flex flex-col items-center justify-center rounded-[2.2rem] bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600">
      <span className="text-4xl font-bold text-white">12:34</span>
      <span className="text-xs text-white/80">Bazar ertəsi, qağa</span>
    </div>
  )
}

function Glass() {
  return <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/40 bg-white/10" />
}

const PARTS = { back: BackCover, battery: Battery, board: Motherboard, camera: Camera, screen: Screen, glass: Glass }

/** One phone part whose depth (z) is bound to scroll progress. */
function Layer({ progress, layer }) {
  // 0.2 → 0.5: part slides out along z to its exploded position, then holds
  const z = useTransform(progress, [0.2, 0.5], [0, layer.z])
  const Part = PARTS[layer.key]
  return (
    <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ z }}>
      <Part />
    </motion.div>
  )
}

/** Label in the side list; fades and slides in at its own scroll point. */
function LayerLabel({ progress, layer, index }) {
  const opacity = useTransform(progress, [layer.at, layer.at + 0.05], [0, 1])
  const x = useTransform(progress, [layer.at, layer.at + 0.05], [30, 0])
  return (
    <motion.li style={{ opacity, x }} className="flex items-center gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 text-xs font-bold">
        {LAYERS.length - index}
      </span>
      {layer.label}
    </motion.li>
  )
}

export default function PhoneWorld() {
  const scrollRef = useRef(null)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  // Spring on top of raw scroll so the explode feels smooth, not jittery
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 })

  // 0 → 0.2: phone tilts from flat into an isometric view
  const rotateX = useTransform(progress, [0, 0.2], [0, 55])
  const rotateZ = useTransform(progress, [0, 0.2], [0, -35])
  // 0.85 → 1: everything shrinks a bit for the final shot
  const scale = useTransform(progress, [0, 0.2, 0.85, 1], [1, 0.85, 0.85, 0.75])

  const introOpacity = useTransform(progress, [0, 0.1], [1, 0])
  const outroOpacity = useTransform(progress, [0.88, 0.98], [0, 1])

  return (
    <div ref={scrollRef} className="no-scrollbar fixed inset-0 overflow-y-auto bg-slate-950 font-sans text-white">
      {/* Tall scroll track; the sticky stage stays pinned while it scrolls */}
      <div className="relative h-[400vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-8 overflow-hidden px-4 sm:flex-row sm:gap-16 [perspective:1200px]">
          <motion.div
            className="pointer-events-none absolute top-[8vh] text-center"
            style={{ opacity: introOpacity }}
          >
            <h1 className="text-3xl font-extrabold sm:text-5xl">Telefonu sökürük, qağa 🔧</h1>
            <motion.p
              className="mt-3 text-lg text-slate-300"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Aşağı sürüşdür ↓
            </motion.p>
          </motion.div>

          <motion.div
            className="relative aspect-[1/2] w-[42vw] max-w-[220px] [transform-style:preserve-3d]"
            style={{ rotateX, rotateZ, scale }}
          >
            {LAYERS.map((layer) => (
              <Layer key={layer.key} progress={progress} layer={layer} />
            ))}
          </motion.div>

          <ol className="flex flex-col-reverse gap-3 text-sm sm:text-base">
            {LAYERS.map((layer, i) => (
              <LayerLabel key={layer.key} progress={progress} layer={layer} index={i} />
            ))}
          </ol>

          <motion.p
            className="pointer-events-none absolute bottom-[14vh] text-center text-xl font-bold text-fuchsia-300 sm:text-2xl"
            style={{ opacity: outroOpacity }}
          >
            Hamısı yerindədi, heç nə itmədi 😎
          </motion.p>
        </div>
      </div>
    </div>
  )
}
