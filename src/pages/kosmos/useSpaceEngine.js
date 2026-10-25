import { useEffect, useState } from 'react'
import { generateTexture } from './textures.js'
import { computeRings, computeSphere } from './sphere.js'

/**
 * Runs the space trip's heavy work in a Web Worker (main-thread fallback if there
 * are no workers). Returns:
 *   textures — { [key]: texture }, filled in as they are generated (in `keys` order)
 *   engine   — { sphere(params), rings(params) } → Promise of precomputed geometry
 */
export function useSpaceEngine(keys) {
  const [textures, setTextures] = useState({})
  const [engine, setEngine] = useState(null)

  useEffect(() => {
    let cancelled = false
    const addTexture = (tex) => {
      if (!cancelled) setTextures((prev) => ({ ...prev, [tex.key]: tex }))
    }

    let worker = null
    try {
      worker = new Worker(new URL('./spaceWorker.js', import.meta.url), { type: 'module' })
    } catch {
      worker = null
    }

    if (!worker) {
      // Fallback: same work on the main thread, spread over time
      const timers = keys.map((key, i) => setTimeout(() => addTexture(generateTexture(key)), 50 + i * 150))
      const later = (fn) => new Promise((resolve) => setTimeout(() => resolve(fn()), 0))
      setEngine({
        sphere: (params) => later(() => computeSphere(params)),
        rings: (params) => later(() => computeRings(params)),
      })
      return () => {
        cancelled = true
        timers.forEach(clearTimeout)
      }
    }

    const pending = new Map()
    let nextId = 1
    worker.onmessage = (e) => {
      const msg = e.data
      if (msg.type === 'texture') return addTexture(msg.tex)
      const resolve = pending.get(msg.id)
      pending.delete(msg.id)
      resolve?.(msg.type === 'sphere' ? msg.geometry : msg.rings)
    }
    const request = (type, params) =>
      new Promise((resolve) => {
        const id = nextId++
        pending.set(id, resolve)
        worker.postMessage({ type, id, params })
      })
    keys.forEach((key) => worker.postMessage({ type: 'texture', key }))
    setEngine({ sphere: (p) => request('sphere', p), rings: (p) => request('rings', p) })

    return () => {
      cancelled = true
      worker.terminate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { textures, engine }
}
