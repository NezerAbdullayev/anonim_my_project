import { useEffect } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { keepFullscreen } from '../../fullscreen.js'
import { nextWorld, worldPath } from '../worlds.js'

/** Shell for every /v1/<slug> page: fade between worlds + button to the next world in order. */
export default function WorldsLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const navigate = useNavigate()
  const slug = location.pathname.split('/')[2]

  useEffect(keepFullscreen, [])

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
        onClick={() => navigate(worldPath(nextWorld(slug)))}
        className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/40 bg-black/40 px-4 py-2 font-sans text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/60 sm:px-5 sm:py-2.5 sm:text-sm"
      >
        Başqa səhifəni kəşf et
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </>
  )
}
