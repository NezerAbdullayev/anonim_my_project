import { motion } from 'framer-motion'
import AnimatedTitle from '../shared/AnimatedTitle.jsx'

const BLOBS = [
  { color: 'bg-emerald-400', pos: 'left-[-10%] top-[-10%]', x: [0, 200, 0], y: [0, 120, 0], duration: 16 },
  { color: 'bg-cyan-400', pos: 'right-[-10%] top-[10%]', x: [0, -180, 0], y: [0, 160, 0], duration: 19 },
  { color: 'bg-violet-500', pos: 'bottom-[-15%] left-[20%]', x: [0, 150, 0], y: [0, -140, 0], duration: 14 },
  { color: 'bg-fuchsia-500', pos: 'bottom-[-10%] right-[5%]', x: [0, -120, 0], y: [0, -100, 0], duration: 21 },
]

const SHAPES = [
  { cls: 'left-[12%] top-[20%] h-16 w-16 rounded-xl', duration: 10 },
  { cls: 'right-[15%] top-[25%] h-20 w-20 rounded-full border-dashed', duration: 14 },
  { cls: 'left-[18%] bottom-[18%] h-12 w-12', duration: 8 },
  { cls: 'right-[22%] bottom-[22%] h-14 w-14 rounded-2xl', duration: 12 },
]

export default function AuroraWorld() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950 font-sans text-white">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute h-[45vmax] w-[45vmax] rounded-full opacity-50 blur-3xl ${b.color} ${b.pos}`}
          animate={{ x: b.x, y: b.y, scale: [1, 1.2, 1] }}
          transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {SHAPES.map((s, i) => (
        <motion.div
          key={i}
          className={`absolute border-2 border-white/30 ${s.cls}`}
          animate={{ rotate: 360, y: [0, -20, 0] }}
          transition={{
            rotate: { duration: s.duration, repeat: Infinity, ease: 'linear' },
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}

      <div className="relative flex h-full items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12"
        >
          <AnimatedTitle
            text="Bıy, bu nə gözəllikdi?"
            delay={0.3}
            className="text-4xl font-extrabold text-emerald-100 [text-shadow:0_0_24px_rgba(110,231,183,0.6)] sm:text-6xl"
          />
          <motion.p
            className="mt-6 text-lg text-white/80 sm:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            Rənglər yavaş-yavaş oynayır, bax, doy ✨
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
