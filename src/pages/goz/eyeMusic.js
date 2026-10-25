import { TWITCH_AT, INTRO_CLOSED, SHOCK_AT, ZOOM_AT, TOTAL_MS } from './timeline.js'

// 12-second synthesized score for the eye animation (Web Audio, no files):
//   closed eye  → dark drone + slow heartbeat + twitch tick
//   crack open  → rising noise riser, then a split-second of silence
//   SHOCK       → sub boom, distorted hit, noise blast, metallic ring, ear-ringing whine
//   zoom-in     → swelling dark chord + rising tone + accelerating heartbeat + riser
//   black       → hard cut, one last deep thump fading out

const MASTER = 0.8

/**
 * Starts the score in sync with an animation that started at `animStart`
 * (a performance.now() value). If the browser blocks audio until a gesture, it
 * starts on the first tap/key, joining at the right moment. Returns stop().
 */
export function playEyeMusic(animStart) {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return () => {}
  let ctx
  try {
    ctx = new AC()
  } catch {
    return () => {}
  }
  let scheduled = false
  let closed = false
  let master = null

  const schedule = () => {
    if (scheduled || closed || ctx.state !== 'running') return
    const elapsed = (performance.now() - animStart) / 1000
    if (elapsed > TOTAL_MS / 1000) return // too late: animation already over
    scheduled = true
    removeListeners()
    master = buildScore(ctx, ctx.currentTime - elapsed)
  }
  const unlock = () => ctx.resume().then(schedule).catch(() => {})
  const removeListeners = () => {
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }

  if (ctx.state === 'running') schedule()
  else {
    unlock() // works if the user already clicked on this page (e.g. "Daxil ol")
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
  }

  // Short fade-out instead of a hard cut (the last thump blends into what comes next)
  return () => {
    closed = true
    removeListeners()
    const close = () => {
      try {
        ctx.close()
      } catch {
        // already closed: ignore
      }
    }
    if (master && ctx.state === 'running') {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
      setTimeout(close, 800)
    } else {
      close()
    }
  }
}

/**
 * Schedules every sound relative to t0 (AudioContext time of the animation start).
 * Returns the master gain, so the score can be faded out early.
 */
function buildScore(ctx, t0) {
  const now = ctx.currentTime
  const s = (ms) => t0 + ms / 1000 // timeline ms → AudioContext seconds (can be < 0)
  // AudioParam times must be ≥ 0 (they throw otherwise); t0 is negative whenever
  // the context starts after the animation, which is almost always the case
  const T = (t) => Math.max(0, t)
  const SHOCK = s(SHOCK_AT)
  const ZOOM = s(ZOOM_AT)
  const END = s(TOTAL_MS)
  const CUT = SHOCK - 0.06 // a split-second of silence right before the impact

  // Output chain: master → compressor → speakers, plus a shared reverb send
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -14
  comp.ratio.value = 6
  comp.connect(ctx.destination)
  const master = ctx.createGain()
  master.gain.value = MASTER
  master.connect(comp)
  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 3)
  reverb.connect(master)

  const noise = noiseBuffer(ctx, 2)

  // --- helpers -------------------------------------------------------------
  // Skip one-shots that are already in the past (late start after a tap)
  const future = (t) => t >= now - 0.02
  const gainNode = (points, dest = master, send = 0) => {
    const g = ctx.createGain()
    g.gain.setValueAtTime(points[0][1], T(points[0][0]))
    for (let i = 1; i < points.length; i++) g.gain.linearRampToValueAtTime(points[i][1], T(points[i][0]))
    g.connect(dest)
    if (send) {
      const sg = ctx.createGain()
      sg.gain.value = send
      g.connect(sg)
      sg.connect(reverb)
    }
    return g
  }
  const osc = (type, freq, start, stop, dest) => {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(freq, T(start))
    o.connect(dest)
    o.start(Math.max(start, now))
    o.stop(stop)
    return o
  }
  const noiseSrc = (start, stop, dest) => {
    const n = ctx.createBufferSource()
    n.buffer = noise
    n.loop = true
    n.connect(dest)
    n.start(Math.max(start, now))
    n.stop(stop)
    return n
  }
  const filter = (type, freq, dest, q = 1) => {
    const f = ctx.createBiquadFilter()
    f.type = type
    f.frequency.value = freq
    f.Q.value = q
    f.connect(dest)
    return f
  }
  // Heartbeat thump: a quick low sine drop
  const thump = (t, vol) => {
    if (!future(t)) return
    const g = gainNode([[t, vol], [t + 0.28, 0.0001]])
    const o = osc('sine', 65, t, t + 0.3, g)
    o.frequency.exponentialRampToValueAtTime(36, T(t + 0.18))
    // Upper "knock" so the beat is heard on laptop/phone speakers too
    const kg = gainNode([[t, vol * 0.5], [t + 0.12, 0.0001]])
    const k = osc('triangle', 160, t, t + 0.14, kg)
    k.frequency.exponentialRampToValueAtTime(80, T(t + 0.1))
  }

  // --- 1. Closed eye: dark drone + eerie high tone ---------------------------
  if (CUT > now) {
    const dg = gainNode([[s(0), 0], [s(1500), 0.18], [CUT - 0.04, 0.22], [CUT, 0]], master, 0.3)
    const lp = filter('lowpass', 600, dg)
    osc('sawtooth', 55, s(0), CUT, lp)
    osc('sawtooth', 55.6, s(0), CUT, lp)
    osc('sawtooth', 110.4, s(0), CUT, lp) // octave up: audible on small speakers

    const hg = gainNode([[s(0), 0], [s(1200), 0.015], [CUT - 0.04, 0.03], [CUT, 0]], master, 0.5)
    const high = osc('sine', 1760, s(0), CUT, hg)
    const lfo = ctx.createOscillator() // slow wobble
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 5
    lfoGain.gain.value = 6
    lfo.connect(lfoGain)
    lfoGain.connect(high.frequency)
    lfo.start(Math.max(s(0), now))
    lfo.stop(CUT)
  }

  // Slow heartbeat while the eye is closed (lub-dub)
  for (const ms of [150, 380, 950, 1180]) thump(s(ms), ms % 2 ? 0.5 : 0.7)

  // Twitch: tiny tick
  if (future(s(TWITCH_AT))) {
    const t = s(TWITCH_AT)
    const g = gainNode([[t, 0.25], [t + 0.03, 0.0001]], master, 0.4)
    noiseSrc(t, t + 0.04, filter('highpass', 2000, g))
    osc('sine', 2400, t, t + 0.04, g)
  }

  // --- 2. Crack open: rising riser, then silence ----------------------------
  const riseFrom = s(INTRO_CLOSED - 200)
  if (CUT > now) {
    const rg = gainNode([[riseFrom, 0], [CUT - 0.02, 0.35], [CUT, 0]], master, 0.3)
    const bp = filter('bandpass', 400, rg, 6)
    bp.frequency.setValueAtTime(400, T(riseFrom))
    bp.frequency.exponentialRampToValueAtTime(6000, T(CUT))
    noiseSrc(riseFrom, CUT, bp)
    const tg = gainNode([[riseFrom, 0], [CUT - 0.02, 0.1], [CUT, 0]])
    const tone = osc('sawtooth', 110, riseFrom, CUT, filter('lowpass', 1500, tg))
    tone.frequency.exponentialRampToValueAtTime(440, T(CUT))
  }

  // --- 3. SHOCK ----------------------------------------------------------------
  if (future(SHOCK)) {
    // Sub boom
    const sub = osc('sine', 120, SHOCK, SHOCK + 2.3, gainNode([[SHOCK, 1], [SHOCK + 2.2, 0.0001]]))
    sub.frequency.exponentialRampToValueAtTime(30, T(SHOCK + 0.9))

    // Distorted hit
    const shaper = ctx.createWaveShaper()
    shaper.curve = distortionCurve(50)
    shaper.connect(filter('lowpass', 900, gainNode([[SHOCK, 0.35], [SHOCK + 0.7, 0.0001]])))
    osc('sawtooth', 50, SHOCK, SHOCK + 0.75, shaper)

    // Noise blast closing down like a muffled explosion
    const nb = filter('lowpass', 9000, gainNode([[SHOCK, 0.9], [SHOCK + 1, 0.0001]], master, 0.6))
    nb.frequency.setValueAtTime(9000, T(SHOCK))
    nb.frequency.exponentialRampToValueAtTime(180, T(SHOCK + 0.7))
    noiseSrc(SHOCK, SHOCK + 1.05, nb)

    // Metallic ring (inharmonic partials) into the reverb
    const mg = gainNode([[SHOCK, 0.06], [SHOCK + 3, 0.0001]], master, 1.2)
    for (const f of [233, 377, 541, 812, 1123]) osc('sine', f, SHOCK, SHOCK + 3.05, mg)
  }
  // Ear-ringing whine after the blast
  if (ZOOM + 1.5 > now) {
    const eg = gainNode([[SHOCK, 0], [SHOCK + 0.4, 0.02], [ZOOM, 0.015], [ZOOM + 1.5, 0]])
    osc('sine', 4200, SHOCK, ZOOM + 1.5, eg)
  }

  // --- 4. Zoom-in: swelling dark chord + rising tone + riser ------------------
  const padFrom = ZOOM - 0.3
  if (END > now) {
    const pg = gainNode([[padFrom, 0], [ZOOM + 1.5, 0.12], [END - 0.05, 0.3], [END, 0]], master, 0.4)
    const lp = filter('lowpass', 180, pg, 4)
    lp.frequency.setValueAtTime(180, T(padFrom))
    lp.frequency.exponentialRampToValueAtTime(2600, T(END))
    for (const f of [55, 82.41, 110, 130.81, 164.81]) {
      osc('sawtooth', f, padFrom, END, lp)
      osc('sawtooth', f * 1.004, padFrom, END, lp) // detuned twin = thicker
    }

    const rg = gainNode([[padFrom, 0], [END - 0.05, 0.12], [END, 0]])
    const lp2 = filter('lowpass', 1200, rg)
    for (const detune of [1, 1.006]) {
      const o = osc('sawtooth', 55 * detune, padFrom, END, lp2)
      o.frequency.exponentialRampToValueAtTime(220 * detune, T(END))
    }

    const riserFrom = s(8000)
    const ng = gainNode([[riserFrom, 0], [END - 0.05, 0.4], [END, 0]], master, 0.3)
    const bp = filter('bandpass', 300, ng, 5)
    bp.frequency.setValueAtTime(300, T(riserFrom))
    bp.frequency.exponentialRampToValueAtTime(8000, T(END))
    noiseSrc(riserFrom, END, bp)
  }

  // Heartbeat speeding up (interval 0.85 s → 0.28 s) and getting louder
  for (let t = ZOOM + 0.4; t < END - 0.15; ) {
    const p = (t - ZOOM) / (END - ZOOM)
    const interval = 0.85 - 0.57 * p
    const vol = 0.45 + 0.45 * p
    thump(t, vol)
    if (interval > 0.45) thump(t + interval * 0.25, vol * 0.7) // lub-dub while still slow
    t += interval
  }

  // --- 5. Into the black: one last deep thump --------------------------------
  if (future(END)) {
    const fin = osc('sine', 80, END, END + 2.6, gainNode([[END, 0.9], [END + 2.5, 0.0001]], master, 0.8))
    fin.frequency.exponentialRampToValueAtTime(25, T(END + 1.2))
  }

  return master
}

function noiseBuffer(ctx, seconds) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buf
}

// Simple reverb: stereo noise with an exponential decay
function impulse(ctx, seconds) {
  const len = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  }
  return buf
}

function distortionCurve(k) {
  const n = 1024
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x))
  }
  return curve
}
