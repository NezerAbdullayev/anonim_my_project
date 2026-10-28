import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { LogIn, Loader2 } from 'lucide-react'
import { reveal } from '../audio/soundEffects.js'
import { playRevealMusic } from '../audio/revealMusic.js'

const MESSAGE = 'Hərşey hazırdır, daxil ola bilərsiz'
const LOADING_MS = 3000 // after "Daxil ol": loading bar, then the transition

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
      className="neon-text font-display text-2xl font-black leading-tight tracking-wide [perspective:600px] sm:text-6xl"
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

/** Bar that fills in LOADING_MS with a % counter, then calls onDone. */
function LoadingBar({ onDone }) {
  const [percent, setPercent] = useState(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const start = performance.now()
    const tick = setInterval(() => {
      setPercent(Math.min(100, Math.round(((performance.now() - start) / LOADING_MS) * 100)))
    }, 50)
    const done = setTimeout(() => onDoneRef.current(), LOADING_MS)
    return () => {
      clearInterval(tick)
      clearTimeout(done)
    }
  }, [])

  return (
    <div className="w-[90%]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <div className="mb-1 flex justify-between text-xs text-green-200">
        <span>Yüklənir...</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded border border-neon/50 bg-black">
        <motion.div
          className="h-full bg-neon shadow-[0_0_10px_rgba(0,255,102,0.8)]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: LOADING_MS / 1000, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

/** `delay` (s): wait before the entrance, e.g. while a transition is still covering the page. */
export default function PrankReveal({ name, onEnter, delay = 0 }) {
  const target = name.trim()
  const [loading, setLoading] = useState(false) // "Daxil ol" clicked: button disabled, bar filling

  // Reveal sound together with the card's entrance, then the creepy loop for as long
  // as this page is open
  useEffect(() => {
    let stopMusic = null
    const t = setTimeout(() => {
      reveal()
      stopMusic = playRevealMusic()
    }, delay * 1000)
    return () => {
      clearTimeout(t)
      stopMusic?.()
    }
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
        <div className="mt-8 flex flex-col items-center gap-4 sm:mt-16">
          <button
            type="button"
            onClick={() => setLoading(true)}
            disabled={loading}
            className="flex w-[90%] items-center justify-center gap-2 rounded border-2 border-neon bg-neon/10 px-5 py-3 font-bold hover:bg-neon/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-neon/10"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogIn className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? 'Yüklənir...' : 'Daxil ol'}
          </button>

          {loading && <LoadingBar onDone={onEnter} />}
        </div>
      </motion.div>
    </main>
  )
}
