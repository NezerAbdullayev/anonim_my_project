import { useMemo } from 'react'
import { motion } from 'framer-motion'
import AnimatedTitle from '../shared/AnimatedTitle.jsx'
import { rand } from '../shared/util.js'

export default function SpaceWorld() {
  const stars = useMemo(
    () =>
      Array.from({ length: 120 }, () => ({
        left: rand(0, 100),
        top: rand(0, 100),
        size: rand(1, 3),
        duration: rand(2, 5),
        delay: rand(0, 4),
      })),
    []
  )

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-950 to-black font-sans text-white">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }}
        />
      ))}

      {/* Shooting star */}
      <motion.span
        className="absolute h-0.5 w-32 rounded-full bg-gradient-to-r from-transparent to-white"
        style={{ top: '15%', left: '-10%', rotate: 20 }}
        animate={{ x: ['0vw', '120vw'], y: ['0vh', '45vh'], opacity: [0, 1, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.5, ease: 'easeIn' }}
      />

      {/* Planet with ring and orbiting moon */}
      <div className="absolute right-[8%] top-[12%] h-40 w-40 sm:h-56 sm:w-56">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-900 shadow-[0_0_60px_rgba(192,132,252,0.5)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute left-1/2 top-1/2 h-12 w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[50%] border-4 border-amber-200/60" />
        <motion.div
          className="absolute -inset-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute left-0 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-slate-300 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
        </motion.div>
      </div>

      {/* Rocket */}
      <motion.div
        className="absolute bottom-[10%] left-[10%] text-5xl sm:text-6xl"
        animate={{ y: [0, -24, 0], rotate: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        🚀
      </motion.div>

      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        <AnimatedTitle
          text="Ala, kosmosa düşdük!"
          className="text-4xl font-extrabold tracking-wide drop-shadow-[0_0_20px_rgba(167,139,250,0.8)] sm:text-7xl"
        />
        <motion.p
          className="mt-6 text-lg text-indigo-200 sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          Burda çəki yoxdu, Wi-Fi da yoxdu, dərd də yoxdu 🛰️
        </motion.p>
      </div>
    </div>
  )
}
