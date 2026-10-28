import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Terminal, ShieldCheck } from 'lucide-react'

const CREDIT = [
  { text: 'Bu proqram ' },
  { text: 'Nəzər Abdullayev tərəfindən praqramlaşdırıldı.', bold: true },
  { text: ' İdeyalarınız və fikirlərinizi reallaşdırmaq üçün əlaqə saxlaya bilərsiniz' },
]

// Loop timing (ms): type → hold → erase → pause → again
const TYPE_MS = 35
const HOLD_MS = 2500
const ERASE_MS = 12
const PAUSE_MS = 600

// ASCII only: same width as the real letters in the mono font, so nothing jumps
const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#01ABCDEFXZ'
const DECODE_MS = 1400 // how long one left-to-right decode takes
const DECODE_EVERY_MS = 4500 // a new decode starts this often
const SCRAMBLE_TICK_MS = 50

/** "Decrypt" effect: random symbols resolve into the text left to right, on a loop. */
function ScrambleText({ text }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (reduce) return
    const chars = Array.from(text)
    let tick = null
    const decode = () => {
      const start = performance.now()
      clearInterval(tick)
      tick = setInterval(() => {
        const p = Math.min(1, (performance.now() - start) / DECODE_MS)
        const solved = Math.floor(p * chars.length)
        setShown(
          chars
            .map((ch, i) =>
              i < solved || ch === ' '
                ? ch
                : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
            )
            .join('')
        )
        if (p === 1) clearInterval(tick)
      }, SCRAMBLE_TICK_MS)
    }
    decode()
    const loop = setInterval(decode, DECODE_EVERY_MS)
    return () => {
      clearInterval(loop)
      clearInterval(tick)
    }
  }, [text, reduce])

  return (
    <span className="relative z-10">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  )
}

/** Soft light band sweeping across its (relative, overflow-hidden) parent. */
function ScanBeam() {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-neon/25 to-transparent"
      initial={{ x: '-100%' }}
      animate={{ x: '300%' }}
      transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.9 }}
    />
  )
}

/** Text typed piece by piece, erased and typed again forever (static in reduced-motion). */
function TypewriterLoop({ segments }) {
  const reduce = useReducedMotion()
  const total = segments.reduce((n, s) => n + Array.from(s.text).length, 0)
  const [count, setCount] = useState(0)
  const [erasing, setErasing] = useState(false)

  useEffect(() => {
    if (reduce) return
    let delay = erasing ? ERASE_MS : TYPE_MS
    let next = () => setCount((c) => c + (erasing ? -1 : 1))
    if (!erasing && count === total) {
      delay = HOLD_MS
      next = () => setErasing(true)
    } else if (erasing && count === 0) {
      delay = PAUSE_MS
      next = () => setErasing(false)
    }
    const t = setTimeout(next, delay)
    return () => clearTimeout(t)
  }, [count, erasing, total, reduce])

  const shown = reduce ? total : count
  let left = shown
  const render = (full) =>
    segments.map((s, i) => {
      const chars = Array.from(s.text)
      const part = full ? s.text : chars.slice(0, Math.max(0, left)).join('')
      if (!full) left -= chars.length
      return s.bold ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    })

  return (
    <span className="relative block">
      <span className="sr-only">{segments.map((s) => s.text).join('')}</span>
      {/* Invisible full text keeps the box height fixed while typing */}
      <span className="invisible" aria-hidden="true">{render(true)}</span>
      <span className="absolute inset-0" aria-hidden="true">
        {render(false)}
        <motion.span
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-green-200"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        />
      </span>
    </span>
  )
}

export default function Landing({ name, setName, onStart }) {
  const submit = (e) => {
    e.preventDefault()
    onStart()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neon-text mb-8 text-center text-xl font-semibold tracking-widest sm:text-2xl"
      >
        Nəzər Abdullayev tərəfindən hazırlanmışdır
      </motion.p>
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg rounded-lg border border-neon/40 bg-black/80 p-6 shadow-[0_0_30px_rgba(0,255,102,0.15)] backdrop-blur sm:p-8"
      >
        <div className="mb-4 flex items-center gap-3">
          <Terminal className="h-8 w-8" aria-hidden="true" />
          <h1 className="neon-text text-2xl font-bold leading-tight sm:text-3xl">
            Nə axtarırsan?
          </h1>
        </div>

        <p className="mb-4 flex items-start gap-2 rounded border border-neon/30 bg-neon/5 p-3 text-sm text-green-200">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <TypewriterLoop segments={CREDIT} />
        </p>

        <div className="relative mb-5 w-full overflow-hidden neon-text rounded border-1 border-neon bg-neon/10 px-3 py-2 font-bold uppercase tracking-wider">
          <ScrambleText text="İçəri daxil olmağa əminsən ?" />
          <ScanBeam />
        </div>

        <button
          type="submit"
          className="neon-text w-full rounded border-2 border-neon bg-neon/10 px-6 py-4 text-base font-bold sm:text-xl uppercase tracking-wider transition hover:bg-neon/20 focus:ring-2"
        >
          Daxil ol
        </button>
      </motion.form>
    </main>
  )
}
