// Click sound for every <button> in the app, via one global listener.
// Uses its own AudioContext (created on the first click = a user gesture), so it
// keeps working on pages where the other sound effects have been closed.

const VOLUME = 0.35

let ctx = null

const getCtx = () => {
  try {
    if (!ctx || ctx.state === 'closed') {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    return ctx
  } catch {
    return null
  }
}

/** Short crisp "tick": a falling square blip + a tiny high noise snap. */
export function clickSound() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime

  const g = c.createGain()
  g.gain.setValueAtTime(VOLUME, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
  g.connect(c.destination)
  const o = c.createOscillator()
  o.type = 'square'
  o.frequency.setValueAtTime(1800, t)
  o.frequency.exponentialRampToValueAtTime(700, t + 0.04)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 4000
  o.connect(lp)
  lp.connect(g)
  o.start(t)
  o.stop(t + 0.07)

  const len = Math.ceil(c.sampleRate * 0.015)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const n = c.createBufferSource()
  n.buffer = buf
  const ng = c.createGain()
  ng.gain.value = VOLUME * 0.6
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 3000
  n.connect(hp)
  hp.connect(ng)
  ng.connect(c.destination)
  n.start(t)
}

/** Plays clickSound on every button click (mouse, touch or keyboard). Returns cleanup. */
export function installButtonClickSound() {
  const onClick = (e) => {
    if (e.target instanceof Element && e.target.closest('button')) clickSound()
  }
  document.addEventListener('click', onClick, true) // capture: also before handlers that stop propagation
  return () => document.removeEventListener('click', onClick, true)
}
