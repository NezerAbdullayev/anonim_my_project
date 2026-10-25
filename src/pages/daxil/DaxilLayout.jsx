import { useEffect } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { keepFullscreen } from '../../fullscreen.js'
import { pickWorld, saveLastWorld, worldPath } from '../worlds.js'

/** Shell for every /daxil/<slug> page: fade between worlds + "Başqa yerə at" button. */
export default function DaxilLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const navigate = useNavigate()
  const slug = location.pathname.split('/')[2]

  useEffect(keepFullscreen, [])

  // Remember the shown world so the next visit starts somewhere else
  useEffect(() => {
    if (slug) saveLastWorld(slug)
  }, [slug])

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={() => navigate(worldPath(pickWorld(slug)))}
        className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/40 bg-black/40 px-5 py-2.5 font-sans text-sm font-semibold text-white backdrop-blur-md transition hover:bg-black/60"
      >
        <Shuffle className="h-4 w-4" aria-hidden="true" />
        Başqa yerə at
      </button>
    </>
  )
}
