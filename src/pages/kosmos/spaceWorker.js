import { generateTexture } from './textures.js'
import { computeRings, computeSphere, sphereTransfer } from './sphere.js'

// All the heavy maths of the space trip, off the main thread:
//   { type: 'texture', key }                → planet surface maps
//   { type: 'sphere', id, ...params }       → per-pixel sphere geometry
//   { type: 'rings', id, ...params }        → ring images
// Geometry jobs jump the queue: a planet coming into view must not wait behind
// textures of planets that are still far away.

const queue = []
let busy = false

const run = (job) => {
  if (job.type === 'texture') {
    const tex = generateTexture(job.key)
    const transfer = [tex.data.buffer]
    if (tex.clouds) transfer.push(tex.clouds.buffer)
    self.postMessage({ type: 'texture', tex }, transfer)
  } else if (job.type === 'sphere') {
    const geometry = computeSphere(job.params)
    self.postMessage({ type: 'sphere', id: job.id, geometry }, sphereTransfer(geometry))
  } else if (job.type === 'rings') {
    const rings = computeRings(job.params)
    self.postMessage({ type: 'rings', id: job.id, rings }, [rings.back.buffer, rings.front.buffer])
  }
}

const pump = () => {
  const job = queue.shift()
  if (!job) {
    busy = false
    return
  }
  run(job)
  setTimeout(pump, 0) // let new (priority) messages arrive between jobs
}

self.onmessage = (e) => {
  const job = e.data
  if (job.type === 'texture') queue.push(job)
  else queue.unshift(job)
  if (!busy) {
    busy = true
    setTimeout(pump, 0)
  }
}
