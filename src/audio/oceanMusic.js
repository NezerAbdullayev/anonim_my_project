// Background music for the ocean dive: a synthesized (Web Audio) ambient piece.
//   • a slow, warm pad of drifting chords
//   • the swell of the waves (filtered noise), loud at the surface, gone in the deep
//   • a low drone that grows as the light disappears
//   • now and then a soft sonar ping, once we are deep enough
//
// setProgress(p) takes it down with the dive: the chords drop an octave and get muffled,
// the reverb grows and the waves fade out.

const MASTER = 0.45
const FADE_IN_S = 4
const CHORD_S = 8 // each chord lasts this long, overlapping the next one
const ATTACK_S = 3
const RELEASE_S = 4
const LOOKAHEAD_S = 2
const TICK_MS = 250
const PING_EVERY_S = [5, 8] // random gap between sonar pings
const PING_FROM = 0.35 // dive progress where the pings begin (≈ alatoran zona)

// Dm9 → B♭maj7 → Fadd9 → C(sus2): chord tones in Hz
const CHORDS = [
  [146.83, 174.61, 220, 261.63, 329.63],
  [116.54, 146.83, 174.61, 220, 293.66],
  [174.61, 220, 261.63, 392, 440],
  [130.81, 196, 261.63, 293.66, 392],
]

/**
 * Starts the music. Returns { stop(), setProgress(p) } (p = dive progress 0..1).
 */
export function playOceanMusic() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return { stop() {}, setProgress() {} }
  let ctx
  try {
    ctx = new AC()
  } catch {
    return { stop() {}, setProgress() {} }
  }

  // Browsers block sound until the user has interacted with the page: if so,
  // start on the first tap/click/key (scrolling alone doesn't count)
  const unlock = () => ctx.resume().catch(() => {})
  const unlockEvents = ['pointerdown', 'keydown', 'touchend']
  const removeUnlock = () => unlockEvents.forEach((ev) => window.removeEventListener(ev, unlock))
  if (ctx.state === 'suspended') {
    unlock()
    unlockEvents.forEach((ev) => window.addEventListener(ev, unlock))
    ctx.onstatechange = () => ctx.state === 'running' && removeUnlock()
  }

  const now = ctx.currentTime
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.ratio.value = 3
  comp.connect(ctx.destination)
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, now)
  master.gain.linearRampToValueAtTime(MASTER, now + FADE_IN_S)
  master.connect(comp)

  // Big, dark underwater reverb
  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 6)
  const wet = ctx.createGain()
  wet.gain.value = 0.5
  reverb.connect(wet)
  wet.connect(master)

  // Pad bus: the lowpass is what makes it "muffled" in the deep
  const padFilter = ctx.createBiquadFilter()
  padFilter.type = 'lowpass'
  padFilter.frequency.value = 2400
  padFilter.Q.value = 0.7
  const pad = ctx.createGain()
  pad.gain.value = 0.32
  padFilter.connect(pad)
  pad.connect(master)
  pad.connect(reverb)

  // Waves: noise through a lowpass, its level swelling and ebbing every ~7 s
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer(ctx, 4)
  noise.loop = true
  const waveFilter = ctx.createBiquadFilter()
  waveFilter.type = 'lowpass'
  waveFilter.frequency.value = 900
  const swell = ctx.createGain()
  swell.gain.value = 0.5
  const swellLfo = ctx.createOscillator()
  swellLfo.frequency.value = 1 / 7
  const swellDepth = ctx.createGain()
  swellDepth.gain.value = 0.4
  swellLfo.connect(swellDepth)
  swellDepth.connect(swell.gain)
  const waves = ctx.createGain()
  waves.gain.value = 0.22
  noise.connect(waveFilter)
  waveFilter.connect(swell)
  swell.connect(waves)
  waves.connect(master)
  noise.start(now)
  swellLfo.start(now)

  // Drone: a low sine pair (slightly detuned, so it beats slowly)
  const drone = ctx.createGain()
  drone.gain.value = 0
  drone.connect(master)
  drone.connect(reverb)
  for (const f of [36.71, 36.95, 73.42]) {
    const o = ctx.createOscillator()
    o.frequency.value = f
    o.connect(drone)
    o.start(now)
  }

  // Current musical state, set by setProgress
  let pitch = 1 // chords are scheduled at this pitch: 1 at the surface → 0.5 at the bottom
  let pingLevel = 0

  // One pad note: two softly detuned triangles with a slow swell in and out
  const padNote = (f, t) => {
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.linearRampToValueAtTime(0.09, t + ATTACK_S)
    env.gain.setValueAtTime(0.09, t + CHORD_S)
    env.gain.linearRampToValueAtTime(0.0001, t + CHORD_S + RELEASE_S)
    env.connect(padFilter)
    for (const detune of [-7, 7]) {
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = f
      o.detune.value = detune
      o.connect(env)
      o.start(t)
      o.stop(t + CHORD_S + RELEASE_S + 0.1)
    }
  }

  // Sonar ping: a pure tone with a long ring, mostly heard through the reverb
  const ping = (t) => {
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.12 * pingLevel, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)
    g.connect(reverb)
    g.connect(master)
    const o = ctx.createOscillator()
    o.frequency.value = 1180
    o.connect(g)
    o.start(t)
    o.stop(t + 1.9)
  }

  let nextChord = now + 0.2
  let nextPing = now + PING_EVERY_S[0]
  let index = 0
  const pump = () => {
    while (nextChord < ctx.currentTime + LOOKAHEAD_S) {
      for (const f of CHORDS[index % CHORDS.length]) padNote(f * pitch, nextChord)
      index++
      nextChord += CHORD_S
    }
    while (nextPing < ctx.currentTime + LOOKAHEAD_S) {
      if (pingLevel > 0.01) ping(nextPing)
      nextPing += PING_EVERY_S[0] + Math.random() * (PING_EVERY_S[1] - PING_EVERY_S[0])
    }
  }
  pump()
  const timer = setInterval(pump, TICK_MS)

  let stopped = false
  return {
    // Down with the dive: pad 2,4 kHz → 350 Hz and an octave lower, waves out, drone and reverb in
    setProgress(p) {
      if (stopped) return
      const q = Math.max(0, Math.min(1, p))
      const t = ctx.currentTime
      pitch = 1 - 0.5 * q
      padFilter.frequency.setTargetAtTime(2400 * Math.pow(350 / 2400, q), t, 1)
      waves.gain.setTargetAtTime(0.22 * Math.max(0, 1 - q / 0.25), t, 1)
      drone.gain.setTargetAtTime(0.1 * Math.min(1, q / 0.5), t, 1)
      wet.gain.setTargetAtTime(0.5 + 0.4 * q, t, 1)
      pingLevel = q < PING_FROM ? 0 : Math.min(1, (q - PING_FROM) / 0.15)
    },
    stop() {
      if (stopped) return
      stopped = true
      clearInterval(timer)
      removeUnlock()
      try {
        master.gain.cancelScheduledValues(ctx.currentTime)
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
      } catch {
        // context already gone: ignore
      }
      setTimeout(() => ctx.close().catch(() => {}), 1500)
    },
  }
}

// Long stereo reverb tail: noise with an exponential decay
function impulse(ctx, seconds) {
  const len = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  }
  return buf
}

// A few seconds of white noise to loop for the waves
function noiseBuffer(ctx, seconds) {
  const len = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}
