import { useMemo } from 'react'
import { motion } from 'framer-motion'
import AnimatedTitle from '../shared/AnimatedTitle.jsx'
import { rand, pick } from '../shared/util.js'

const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#facc15']

export default function PartyWorld() {
  const confetti = useMemo(
    () =>
      Array.from({ length: 70 }, () => ({
        left: rand(0, 100),
        color: pick(COLORS),
        w: rand(6, 10),
        h: rand(10, 16),
        duration: rand(4, 8),
        delay: rand(0, 6),
        spin: rand(360, 1080) * (Math.random() < 0.5 ? -1 : 1),
      })),
    []
  )
  const balloons = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        left: rand(2, 92),
        duration: rand(9, 15),
        delay: rand(0, 8),
        hue: rand(0, 360),
      })),
    []
  )

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-amber-100 via-pink-200 to-violet-300 font-sans text-violet-950">
      {balloons.map((b, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 text-5xl sm:text-6xl"
          style={{ left: `${b.left}%`, filter: `hue-rotate(${b.hue}deg)` }}
          animate={{ y: ['20vh', '-120vh'], rotate: [-8, 8, -8] }}
          transition={{
            y: { duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'linear' },
            rotate: { duration: 3, repeat: Infinity },
          }}
        >
          🎈
        </motion.span>
      ))}

      {confetti.map((c, i) => (
        <motion.span
          key={i}
          className="absolute top-0 rounded-sm"
          style={{ left: `${c.left}%`, width: c.w, height: c.h, backgroundColor: c.color }}
          animate={{ y: ['-10vh', '110vh'], rotate: [0, c.spin], x: [0, 30, -30, 0] }}
          transition={{
            y: { duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'linear' },
            rotate: { duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'linear' },
            x: { duration: 3, repeat: Infinity },
          }}
        />
      ))}

      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        <AnimatedTitle text="Toy-büsat başladı!" bounce className="text-5xl font-black sm:text-8xl" />
        <motion.div
          className="mt-6 text-6xl"
          animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        >
          🎉
        </motion.div>
        <motion.p
          className="mt-4 text-lg font-semibold sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          Səbəb? Səbəb sənsən də! 🥳
        </motion.p>
      </div>
    </div>
  )
}
