import { motion, useSpring, useTransform } from 'framer-motion'

// A surface zoom (0..1, see TRACK.zooms): the body grows to ZOOM_MAX, then snaps back
// over the last RETURN of it (15vh of the 400vh zoom ≈ 0.3 s)
const ZOOM_MAX = 12
const RETURN = 0.0375
const GROWN = 1 - RETURN

/** Size factor from the zoom: steady exponential growth, then a quick return. */
export const zoomScale = (z) =>
  z < GROWN ? Math.pow(ZOOM_MAX, z / GROWN) : Math.pow(ZOOM_MAX, 1 - (z - GROWN) / RETURN)

/**
 * Zoom progress (0..1) from raw scroll progress over `range`; stays 0 without a range.
 * A stiffer spring than the journey's, so the quick return stays quick.
 */
export function useZoom(scroll, range) {
  const raw = useTransform(scroll, range || [0, 1], range ? [0, 1] : [0, 0])
  return useSpring(raw, { stiffness: 120, damping: 26, restDelta: 0.0005 })
}

/** Full-screen photo of the real surface, shown while the zoom is deep in. */
export function SurfacePhoto({ zoom, surface, reduce, className = '' }) {
  // 0.5 → 0.78: fades in as the blurry disk fills the screen; out during the first half of the return
  const opacity = useTransform(zoom, [0.5, 0.78, GROWN, GROWN + RETURN / 2], [0, 1, 1, 0])
  // 0.5 → GROWN: keeps closing in on the surface; GROWN → 1: pulls back with the body
  const scale = useTransform(zoom, [0.5, GROWN, 1], reduce ? [1, 1, 1] : [1, 1.4, 1])

  // Always mounted (just transparent), so the photo is loaded before it's needed
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity, backgroundColor: surface.tint }}
    >
      {/* Slightly dimmed so a full screen of it isn't glaring */}
      <motion.img
        src={surface.src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover brightness-[0.85]"
        style={{ scale }}
      />
      {/* Darker edges for depth */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, transparent 45%, ${surface.tint}99 100%)` }}
      />
      <p className="absolute bottom-2 right-3 font-mono text-[10px] text-white/60">{surface.caption}</p>
    </motion.div>
  )
}
