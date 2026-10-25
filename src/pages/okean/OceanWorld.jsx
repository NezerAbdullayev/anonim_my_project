import { useMemo } from 'react'
import { motion } from 'framer-motion'
import AnimatedTitle from '../shared/AnimatedTitle.jsx'
import { rand, pick } from '../shared/util.js'

const WAVE = 'M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z'

function Waves({ color, duration, className }) {
  return (
    <motion.div
      className={`absolute bottom-0 left-0 flex w-[200%] ${className}`}
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {[0, 1].map((k) => (
        <svg key={k} viewBox="0 0 1440 100" preserveAspectRatio="none" className="h-full w-1/2">
          <path d={WAVE} fill={color} />
        </svg>
      ))}
    </motion.div>
  )
}

export default function OceanWorld() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        left: rand(0, 100),
        size: rand(8, 28),
        duration: rand(6, 12),
        delay: rand(0, 8),
      })),
    []
  )
  const fish = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        emoji: pick(['🐠', '🐟', '🐡', '🐬']),
        top: 15 + i * 12 + rand(-4, 4),
        duration: rand(10, 20),
        delay: rand(0, 6),
        reverse: i % 2 === 1,
      })),
    []
  )

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-cyan-300 via-sky-600 to-blue-950 font-sans text-white">
      {/* Light rays */}
      {[15, 40, 70].map((left, i) => (
        <motion.div
          key={i}
          className="absolute -top-20 h-[120%] w-24 origin-top bg-gradient-to-b from-white/30 to-transparent blur-md"
          style={{ left: `${left}%`, rotate: 15 }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 5 + i, repeat: Infinity }}
        />
      ))}

      {fish.map((f, i) => (
        <motion.span
          key={i}
          className="absolute text-4xl sm:text-5xl"
          style={{ top: `${f.top}%`, scaleX: f.reverse ? 1 : -1 }}
          animate={{ x: f.reverse ? ['110vw', '-20vw'] : ['-20vw', '110vw'], y: [0, -15, 0, 15, 0] }}
          transition={{
            x: { duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'linear' },
            y: { duration: 3, repeat: Infinity },
          }}
        >
          {f.emoji}
        </motion.span>
      ))}

      {bubbles.map((b, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 rounded-full border border-white/60 bg-white/10"
          style={{ left: `${b.left}%`, width: b.size, height: b.size }}
          animate={{ y: ['10vh', '-110vh'], x: [0, 12, -12, 0] }}
          transition={{
            y: { duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'linear' },
            x: { duration: 2.5, repeat: Infinity },
          }}
        />
      ))}

      <Waves color="rgba(30,64,175,0.6)" duration={14} className="h-24" />
      <Waves color="rgba(23,37,84,0.9)" duration={9} className="h-16" />

      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <AnimatedTitle
            text="Qağa, dənizin dibindəyik"
            className="text-4xl font-extrabold drop-shadow-[0_4px_20px_rgba(8,47,73,0.8)] sm:text-7xl"
          />
        </motion.div>
        <motion.p
          className="mt-6 text-lg text-cyan-50 sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          Nəfəsini tut, balıqlar səni artıq tanıyır 🫧
        </motion.p>
      </div>
    </div>
  )
}
