import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import EyeCodeEffect from './EyeCodeEffect.jsx'

// Browsers only allow sound after the visitor has interacted with the page. Coming in
// via "Daxil ol" / "Başqa yerə at" that already happened; on a direct visit we wait
// for one tap, so the 12-second animation always runs with its music from the start.
const canPlaySound = () => navigator.userActivation?.hasBeenActive ?? true

export default function EyeWorld() {
  const [started, setStarted] = useState(canPlaySound)

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505]">
      {started ? (
        <EyeCodeEffect />
      ) : (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="flex h-full w-full flex-col items-center justify-center gap-4 font-mono text-neon"
        >
          <motion.span
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Eye className="h-16 w-16" aria-hidden="true" />
          </motion.span>
          <span className="neon-text text-lg font-bold uppercase tracking-widest sm:text-xl">
            Başlamaq üçün toxun 🔊
          </span>
        </button>
      )}
    </div>
  )
}
