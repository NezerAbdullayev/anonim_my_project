import { motion } from 'framer-motion'
import AnimatedTitle from '../shared/AnimatedTitle.jsx'

export default function SynthWorld() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-[#1a0033] via-[#3b0a5c] to-[#7a1458] font-sans text-white">
      {/* Striped retro sun */}
      <div className="absolute left-1/2 top-[30%] -translate-x-1/2">
        <motion.div
          className="synth-sun h-56 w-56 rounded-full sm:h-80 sm:w-80"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Mountains */}
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute bottom-[38%] left-0 h-32 w-full">
        <path d="M0,200 L180,60 L320,150 L520,20 L700,140 L880,50 L1080,160 L1260,70 L1440,200 Z" fill="#12002b" />
      </svg>

      {/* Moving perspective grid */}
      <div className="absolute bottom-0 left-0 h-[38%] w-full overflow-hidden bg-[#12002b] [perspective:300px]">
        <div className="synth-grid absolute -left-1/2 top-0 h-[200%] w-[200%]" />
      </div>

      <div className="relative flex h-full flex-col items-center px-4 pt-[8vh] text-center">
        <AnimatedTitle
          text="80-lərə qayıtdıq, qağa"
          className="text-4xl font-black italic tracking-wider text-pink-300 [text-shadow:0_0_10px_#ff2e88,0_0_30px_#ff2e88] sm:text-7xl"
        />
        <motion.p
          className="mt-4 text-lg text-cyan-200 [text-shadow:0_0_10px_#22d3ee] sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          Kaset hazırdı, səsi aç, gəlsin 📼
        </motion.p>
      </div>
    </div>
  )
}
