import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { reveal } from '../audio/soundEffects.js'

const VARIANTS = [
  'Qağa, qapı açıqdı, gir də, nə durmusan? 🚪',
  'Ala, açarı tapdıq 🔑 Gəl görək içəridə nə var',
  'Hack qurtardı, əsl söhbət indi başlayır ✨',
  'Portal açıldı. Ürəyin çatırsa, gir 🌀',
  'Vallah, hər dəfə başqa yerə düşürsən. Yoxla 🌌',
  'Ağ dovşanın dalınca get, qağa 🐇',
  'Şansını yoxla, bəlkə bomba şey çıxdı 🎲',
  'İçəridə səni gözləyirlər… kim? Gir gör də 👀',
]

export default function PrankReveal({ name, onEnter }) {
  const message = useMemo(() => VARIANTS[Math.floor(Math.random() * VARIANTS.length)], [])
  const target = name.trim()

  // Reveal sound
  useEffect(() => {
    reveal()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        className="max-w-2xl rounded-lg border border-neon/40 bg-black/85 p-8 shadow-[0_0_40px_rgba(0,255,102,0.2)]"
      >
        <h1 className="neon-text text-4xl font-extrabold sm:text-6xl">{message}</h1>
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
