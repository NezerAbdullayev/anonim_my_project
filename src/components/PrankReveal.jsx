import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { reveal } from '../audio/soundEffects.js'

const MESSAGE = 'Hərşey hazırdır, daxil ola bilərsiz'

// Flip wave loop (s): each letter spins once around its X axis, one after another
const FLIP_S = 0.9 // one letter's flip
const STAGGER_S = 0.05 // delay between neighbouring letters
const PERIOD_S = 4 // the wave starts again this often

/** Title whose letters do a 3D flip wave on a loop, over a softly breathing neon glow. */
function FlipWaveTitle({ text }) {
  const reduce = useReducedMotion()
  let n = 0
  return (
    <motion.h1
      aria-label={text}
      className="neon-text font-display text-4xl font-black leading-tight tracking-wide [perspective:600px] sm:text-6xl"
      animate={
        reduce
          ? undefined
          : {
              textShadow: [
                '0 0 6px rgba(0,255,102,0.6), 0 0 14px rgba(0,255,102,0.3)',
                '0 0 12px rgba(0,255,102,0.9), 0 0 32px rgba(0,255,102,0.6)',
                '0 0 6px rgba(0,255,102,0.6), 0 0 14px rgba(0,255,102,0.3)',
              ],
            }
      }
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {text.split(' ').map((word, wi, words) => (
        <span key={wi} aria-hidden="true">
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => {
              const i = n++
              return (
                <motion.span
                  key={ci}
                  className="inline-block"
                  animate={reduce ? undefined : { rotateX: [0, 360], y: [0, -10, 0] }}
                  transition={{
                    duration: FLIP_S,
                    ease: 'easeInOut',
                    delay: 0.6 + i * STAGGER_S,
                    repeat: Infinity,
                    repeatDelay: PERIOD_S - FLIP_S,
                  }}
                >
                  {ch}
                </motion.span>
              )
            })}
          </span>
          {wi < words.length - 1 && ' '}
        </span>
      ))}
    </motion.h1>
  )
}

/** `delay` (s): wait before the entrance, e.g. while a transition is still covering the page. */
export default function PrankReveal({ name, onEnter, delay = 0 }) {
  const target = name.trim()

  // Reveal sound, together with the card's entrance
  useEffect(() => {
    const t = setTimeout(reveal, delay * 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12, delay }}
        className="max-w-2xl rounded-lg border border-neon/40 bg-black/85 p-8 shadow-[0_0_40px_rgba(0,255,102,0.2)]"
      >
        <FlipWaveTitle text={MESSAGE} />
        {target && (
          <p className="mt-4 text-lg text-green-200">
            Hörmətli <strong className="neon-text">{target}</strong>, narahat olma: heç nə oğurlanmadı.
          </p>
        )}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onEnter}
            className="flex w-[90%] items-center justify-center gap-2 rounded border-2 border-neon bg-neon/10 px-5 py-3 font-bold hover:bg-neon/20"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Daxil ol
          </button>
        </div>
      </motion.div>
    </main>
  )
}
