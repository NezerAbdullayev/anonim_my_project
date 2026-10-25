import { useMemo } from 'react'
import { motion } from 'framer-motion'
import AnimatedTitle from '../shared/AnimatedTitle.jsx'
import { rand } from '../shared/util.js'

const PAWS = 10

export default function CatWorld() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        left: rand(0, 100),
        duration: rand(6, 11),
        delay: rand(0, 6),
        size: rand(18, 34),
      })),
    []
  )

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-orange-100 via-rose-100 to-amber-200 font-sans text-amber-950">
      {/* Paw trail walking diagonally across the screen */}
      {Array.from({ length: PAWS }, (_, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl"
          style={{ left: `${5 + i * 9}%`, top: `${80 - i * 7 + (i % 2) * 4}%`, rotate: 35 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4, times: [0, 0.1, 0.7, 1], delay: i * 0.35, repeat: Infinity, repeatDelay: PAWS * 0.35 - 2 }}
        >
          🐾
        </motion.span>
      ))}

      {hearts.map((h, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0"
          style={{ left: `${h.left}%`, fontSize: h.size }}
          animate={{ y: ['10vh', '-110vh'], x: [0, 15, -15, 0] }}
          transition={{
            y: { duration: h.duration, delay: h.delay, repeat: Infinity, ease: 'linear' },
            x: { duration: 3, repeat: Infinity },
          }}
        >
          💕
        </motion.span>
      ))}

      {/* Rolling yarn ball */}
      <motion.span
        className="absolute bottom-[6%] text-5xl"
        animate={{ x: ['-10vw', '110vw'], rotate: [0, 1080] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      >
        🧶
      </motion.span>

      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.div
          className="text-7xl sm:text-8xl"
          animate={{ y: [0, -30, 0], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐱
        </motion.div>
        <AnimatedTitle text="Pişiklərin padşahlığı" className="mt-4 text-4xl font-extrabold sm:text-6xl" />
        <motion.p
          className="mt-4 text-lg sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          Gizli plan açıldı: hamını istəmək, vəssalam 😻
        </motion.p>
      </div>
    </div>
  )
}
