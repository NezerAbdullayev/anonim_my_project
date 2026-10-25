import { useEffect, useRef } from 'react'
import { createSphereRenderer, ringCanvases } from './sphere.js'

const FRAME_MS = 80 // spin redraw rate: ~12 fps is plenty for a slow rotation

/**
 * A rendered, slowly spinning planet (plus rings) filling its parent box: the box is
 * the planet's disk, the atmosphere halo and rings spill outside it.
 * Geometry is precomputed by the engine (Web Worker); `px` caps the resolution,
 * which otherwise follows the box's real size on screen. `spin` = turns per second.
 */
export default function SphereView({ engine, texture, px, options = {}, spin = 0, cloudSpin = 0, rings = null }) {
  const holderRef = useRef(null)

  useEffect(() => {
    const el = holderRef.current
    if (!el || !texture || !engine) return
    let cancelled = false
    let raf = 0

    // Layout width ignores the scroll-driven scale, so this is the "calm" size
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = Math.max(64, Math.min(px, Math.round(el.offsetWidth * dpr)))
    const pitch = options.pitch ?? 0.2

    Promise.all([
      engine.sphere({ W: texture.width, H: texture.height, size, ...options }),
      rings ? engine.rings({ size, tilt: options.tilt || 0, pitch, ...rings }) : null,
    ]).then(([geometry, ringData]) => {
      if (cancelled) return
      const sphere = createSphereRenderer(geometry, texture)
      const ringSet = ringData ? ringCanvases(ringData) : null

      // Each canvas is centred on the disk; width relative to the disk diameter
      const place = (canvas, relWidth) => {
        Object.assign(canvas.style, {
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${relWidth * 100}%`,
          height: `${relWidth * 100}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          opacity: '0',
          transition: 'opacity 0.5s ease-out',
        })
        el.appendChild(canvas)
        requestAnimationFrame(() => (canvas.style.opacity = '1'))
      }
      if (ringSet) place(ringSet.back, ringData.scale) // far half of the rings, behind the planet
      place(sphere.canvas, 1 / sphere.diskFraction)
      if (ringSet) place(ringSet.front, ringData.scale) // near half, in front

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const rot0 = Math.random()
      const start = performance.now()
      let last = 0
      const loop = (now) => {
        if (now - last >= FRAME_MS) {
          last = now
          const t = (now - start) / 1000
          sphere.render(rot0 + spin * t, rot0 + cloudSpin * t)
        }
        raf = requestAnimationFrame(loop)
      }
      if (reduce || (!spin && !cloudSpin)) sphere.render(rot0, rot0)
      else raf = requestAnimationFrame(loop)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      el.replaceChildren()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, engine])

  return <div ref={holderRef} className="absolute inset-0" />
}
