import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { beep, alarm, success } from '../audio/soundEffects.js'

// Same jokes as before, now written as (harmless, nonsense) code
const POOL = [
  'await devServer.connect() // connecting...',
  "skills.decode(['React', 'JavaScript', 'HTML/CSS']) // ✓ ✓ ✓",
  "fs.open('ideas.txt') // 999+ ideas found",
  'coffee.level = "critical" // ☕',
  'while (coffeeCount++) { /* counter cannot stop */ }',
  'caffeine.percent = 87 // ready to code',
  "archive.open('education').find('Bachelor') // ✓",
  "diplomas.verify('Master') // 🎓",
  'gym.checkIns.thisWeek // still there 💪',
  'muscleMemory.scan({ squat: 100, bugFix: 100 })',
  "route.walk(['park', 'bench', 'park']) // 🌳",
  'steps > 10_000 && ideas.autoGenerate()',
  'git.log().every(c => c.msg === "final fix")',
  'keyboard.mostTired() // => "Ctrl+S"',
  'stackOverflow.visits // [classified] 🤫',
  'browser.tabs.length // 47, all important',
  "theme.set('dark') // a lifestyle 🌙",
  'bugHunter.enable()',
  'lastBug.excuse = "not my code" // rejected',
  'console.log.count() // number too big',
  'target.favQuote = "just a one-minute job"',
  "deploy({ day: 'Friday' }) // denied ✓ smart dev",
  'motivation = coffee + gym + goodIdea',
  'ideaGenerator.run({ uptime: "24/7" })',
  'import { creativity } from "./problem-solving" // 100%',
  'memory.scan() // wants to learn every new tech',
  'loop(["workout", "code", "coffee"]) // repeat',
  'gym.maxLift = ["weights", "mood"]',
  'codeQuality.check() // clean ✓ readable ✓ tidy ✓',
  'teamwork.level = "high" // shares coffee too ☕',
  'debugging.skill = "Sherlock Holmes" // 🔍',
  'breakAlgo(30 /* min in park */) // => 3 new fixes',
  'learningSpeed > coffeeSpeed // true',
  'projects.forEach(p => p.tellStory())',
  "space.findFor(yourIdea) // '/projects/next' ✓",
  'clientSatisfaction.status = "active" // 😊',
  'patience.fill(1.0) // unlike coffee',
  "morning.start('coffee').then(code)",
  'target.superpower = simplify(complex)',
  'contact.channels.open() // waiting for your ideas 📬',
  'npm install motivation --save // added 1 package',
  'if (bug) { coffee.refill(); bug.fix() }',
  'tea.neighbour.temperature // cold: detected 🍵',
  'socks.pairs.count() // 7 pairs, 1 missing 🧦',
  "pizza.track({ order: 42 }) // on its way 🍕",
  'cat.secretPlan.decrypt() // nap → food → nap 🐱',
  'keyboard.rgb = "on" // +10 speed',
  'sleep(8 * 60) // TODO: someday 😴',
  'deadline.distance > 0 // still calm',
  "music.play('lofi') // focus mode on 🎧",
  'snack.drawer.open() // cookies: 3 left 🍪',
  'meetings.length = 0 // a dream',
  'semicolons.missing // 0, all in place ;',
  'weekend.plans = ["code", "park", "code"]',
  'darkMode && coffee && code // perfect state',
]

const CODE_LINES = 50 // how many code lines after the first one…
const CODE_TOTAL_MS = 5000 // …all of them finished within this time
const DECODE_MS = 300 // one line: random symbols → code, left to right
const SCRAMBLE = '!<>-_\\/[]{}=+*^?#01'

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

// Light syntax colouring: strings amber, `// comments` dim green
const renderCode = (text) => {
  const at = text.indexOf('//')
  const code = at < 0 ? text : text.slice(0, at)
  const comment = at < 0 ? '' : text.slice(at)
  return (
    <>
      {code.split(/("[^"]*"|'[^']*')/).map((part, i) =>
        i % 2 ? (
          <span key={i} className="text-amber-300">
            {part}
          </span>
        ) : (
          part
        )
      )}
      {comment && <span className="text-green-600">{comment}</span>}
    </>
  )
}

/** Code line that "decodes": symbols resolve into the real text left to right. */
function DecodeLine({ text, reduce }) {
  const [shown, setShown] = useState(reduce ? text : '')

  useEffect(() => {
    if (reduce) return
    const chars = Array.from(text)
    const start = performance.now()
    const tick = setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / DECODE_MS)
      const solved = Math.floor(p * chars.length)
      setShown(
        chars
          .map((ch, i) =>
            i < solved || ch === ' ' ? ch : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]
          )
          .join('')
      )
      if (p === 1) clearInterval(tick)
    }, 30)
    return () => clearInterval(tick)
  }, [text, reduce])

  return shown === text ? renderCode(text) : <span className="opacity-80">{shown}</span>
}

// Highlight the name after this prefix in blue (also while it is being typed)
const TARGET_PREFIX = 'Hədəf seçildi: '
const renderLine = (text) => {
  if (!text.startsWith(TARGET_PREFIX)) return text
  return (
    <>
      {TARGET_PREFIX}
      <span className="font-bold text-cyan-400 [text-shadow:0_0_8px_rgba(34,211,238,0.8)]">
        {text.slice(TARGET_PREFIX.length)}
      </span>
    </>
  )
}

/** Fake hacking terminal. Typewriter log, uneven progress bar, ACCESS GRANTED. */
export default function HackerTerminal({ onDone }) {
  const reduce = useReducedMotion()
  const [lines, setLines] = useState([]) // finished lines
  const [typing, setTyping] = useState('') // line currently being typed
  const [progress, setProgress] = useState(0)
  const [granted, setGranted] = useState(false)
  const scrollRef = useRef(null)

  // Main script: runs once per mount, cleaned up on unmount (so exit stops everything)
  useEffect(() => {
    let cancelled = false
    const timers = new Set()
    const sleep = (ms) =>
      new Promise((resolve) => {
        const t = setTimeout(() => {
          timers.delete(t)
          resolve()
        }, ms)
        timers.add(t)
      })

    // First line stays as it was (typed, name highlighted); the rest is code
    const first = 'Hədəf seçildi: Nəzər Abdullayev'
    const code = [
      ...shuffle(POOL).slice(0, CODE_LINES - 1),
      'return { target: "Nəzər Abdullayev", status: "READY" } // 🚀',
    ]

    const run = async () => {
      await sleep(400)
      // Typewriter: reveal characters one by one (instantly in reduced-motion mode)
      if (reduce) {
        setTyping(first)
      } else {
        for (let c = 1; c <= first.length; c++) {
          if (cancelled) return
          setTyping(first.slice(0, c))
          await sleep(rand(12, 32))
        }
      }
      if (cancelled) return
      setLines([{ text: first }])
      setTyping('')
      beep()
      await sleep(300)

      // Code burst: a new decoding line every `gap` ms, the last one done at CODE_TOTAL_MS
      const gap = (CODE_TOTAL_MS - DECODE_MS) / (code.length - 1)
      for (let i = 0; i < code.length; i++) {
        if (cancelled) return
        setLines((prev) => [...prev, { text: code[i], code: true }])
        beep()
        // Uneven progress: sometimes a jump, sometimes tiny, capped below 99
        setProgress((p) => Math.min(98, p + (Math.random() < 0.3 ? rand(0, 1) : rand(1, 3))))
        await sleep(gap)
      }
      await sleep(DECODE_MS)

      // Sticks near 99% for a while (the classic fake hang)
      if (cancelled) return
      setProgress(99)
      setLines((prev) => [...prev, { text: 'await lastStep() // always stuck at 99%', code: true }])
      alarm()
      await sleep(2200)
      if (cancelled) return
      setProgress(100)
      await sleep(500)
      if (cancelled) return
      setGranted(true)
      success()
      await sleep(2600)
      if (!cancelled) onDone()
    }
    run()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Autoscroll log to bottom
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, typing])

  return (
    <div className="flex min-h-screen flex-col p-3 sm:p-6">
      <div className="mb-3">
        <span className="neon-text text-sm opacity-80">[TERMİNAL: Məlumatlar toplanır ]</span>
      </div>

      {/* Uneven fake progress bar (above the log, same width as its border) */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-sm font-bold uppercase tracking-wider text-red-400 sm:text-base [text-shadow:0_0_8px_rgba(248,113,113,0.8)]">
            Məlumatlarınız emal olunur
          </span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded border border-neon/50 bg-black"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <motion.div
            className="h-full bg-neon"
            animate={{ width: `${progress}%` }}
            transition={{ duration: reduce ? 0 : 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Log window */}
      <div className="relative flex-1 overflow-hidden rounded border border-neon/40 bg-transparent">
        <div
          ref={scrollRef}
          className="term-scroll glitch absolute inset-0 overflow-y-auto p-4 text-sm sm:text-base"
          aria-live="off"
        >
          {lines.map((l, i) => (
            <div key={i} className="neon-text">
              <span className="text-green-600">$ </span>
              {l.code ? <DecodeLine text={l.text} reduce={reduce} /> : renderLine(l.text)}
            </div>
          ))}
          {!granted && (
            <div className="neon-text">
              <span className="text-green-600">$ </span>
              {renderLine(typing)}
              <span className="caret" aria-hidden="true" />
            </div>
          )}
        </div>

        {granted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70"
          >
            <h2 className="neon-text glitch text-center text-4xl font-extrabold tracking-widest sm:text-6xl">
              HƏRŞEY HAZIRDIR
            </h2>
          </motion.div>
        )}
      </div>
    </div>
  )
}
