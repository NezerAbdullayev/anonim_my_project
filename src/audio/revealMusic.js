// Endless creepy ambient for the reveal page (Web Audio, no files).
// Continuous layers (drone, beating pad, wind) play for as long as the page is open;
// an 8-second bar (music-box phrase, distant boom, occasional creak) is scheduled
// over and over just ahead of time, so it loops seamlessly.

const MASTER = 0.55
const FADE_IN_S = 2.5
const BAR_S = 8
const LOOKAHEAD_S = 2 // schedule the next bar this far ahead
const TICK_MS = 500

// Music-box phrase: A minor with a tritone (D#) for the eerie touch. [note Hz, beat]
const PHRASE = [
  [880, 0], [1046.5, 1], [1244.5, 2], [987.8, 3],
  [830.6, 4.5], [880, 5.5], [659.3, 6.5],
]
const BEAT_S = BAR_S / 8

/** Starts the loop; returns stop() (fades out, then releases the audio). */
export function playRevealMusic() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return () => {}
  let ctx
  try {
    ctx = new AC()
  } catch {
    return () => {}
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})

  const now = ctx.currentTime
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -16
  comp.ratio.value = 4
  comp.connect(ctx.destination)
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, now)
  master.gain.linearRampToValueAtTime(MASTER, now + FADE_IN_S)
  master.connect(comp)
  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 4)
  reverb.connect(master)

  const sources = [] // everything that has to be stopped at the end
  const send = (node, amount) => {
    const g = ctx.createGain()
    g.gain.value = amount
    node.connect(g)
    g.connect(reverb)
  }
  const lfo = (rate, depth, param) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = rate
    g.gain.value = depth
    o.connect(g)
    g.connect(param)
    o.start()
    sources.push(o)
  }
  const voice = (type, freq, dest) => {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = freq
    o.connect(dest)
    o.start()
    sources.push(o)
    return o
  }

  // 1. Drone: low detuned saws + tritone, cutoff slowly breathing (8 s)
  const droneGain = ctx.createGain()
  droneGain.gain.value = 0.22
  droneGain.connect(master)
  send(droneGain, 0.3)
  const droneLp = ctx.createBiquadFilter()
  droneLp.type = 'lowpass'
  droneLp.frequency.value = 400
  droneLp.Q.value = 3
  droneLp.connect(droneGain)
  lfo(1 / 8, 220, droneLp.frequency)
  for (const f of [55, 55.7, 77.8, 110.3]) voice('sawtooth', f, droneLp)

  // 2. Beating pad: a minor second (A3 / A#3) with slow tremolo
  const padGain = ctx.createGain()
  padGain.gain.value = 0.05
  padGain.connect(master)
  send(padGain, 0.6)
  lfo(0.3, 0.025, padGain.gain)
  voice('sine', 220, padGain)
  voice('sine', 233.1, padGain)

  // 3. Wind: noise through a wandering band-pass
  const windGain = ctx.createGain()
  windGain.gain.value = 0.06
  windGain.connect(master)
  send(windGain, 0.4)
  const windBp = ctx.createBiquadFilter()
  windBp.type = 'bandpass'
  windBp.frequency.value = 700
  windBp.Q.value = 2
  windBp.connect(windGain)
  lfo(1 / 11, 450, windBp.frequency)
  const wind = ctx.createBufferSource()
  wind.buffer = noiseBuffer(ctx, 3)
  wind.loop = true
  wind.connect(windBp)
  wind.start()
  sources.push(wind)

  // 4. One bar of the loop, starting at time t
  const scheduleBar = (t) => {
    // Music box: soft bell notes into a big echo
    for (const [f, beat] of PHRASE) {
      const at = t + 0.5 + beat * BEAT_S
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(0.05, at + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.6)
      g.connect(master)
      send(g, 1)
      for (const [mult, type] of [[1, 'triangle'], [2.01, 'sine']]) {
        const o = ctx.createOscillator()
        o.type = type
        o.frequency.value = f * mult
        o.connect(g)
        o.start(at)
        o.stop(at + 1.7)
      }
    }

    // Distant boom at the top of the bar
    const bg = ctx.createGain()
    bg.gain.setValueAtTime(0.35, t)
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 2.5)
    bg.connect(master)
    send(bg, 0.8)
    const boom = ctx.createOscillator()
    boom.frequency.setValueAtTime(70, t)
    boom.frequency.exponentialRampToValueAtTime(30, t + 1.5)
    boom.connect(bg)
    boom.start(t)
    boom.stop(t + 2.6)

    // Sometimes a creaking whine sliding down
    if (Math.random() < 0.5) {
      const at = t + 2 + Math.random() * 4
      const cg = ctx.createGain()
      cg.gain.setValueAtTime(0.0001, at)
      cg.gain.exponentialRampToValueAtTime(0.025, at + 0.4)
      cg.gain.exponentialRampToValueAtTime(0.0001, at + 2.2)
      cg.connect(master)
      send(cg, 0.9)
      const creak = ctx.createOscillator()
      creak.type = 'sawtooth'
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 1800
      creak.frequency.setValueAtTime(1300 + Math.random() * 400, at)
      creak.frequency.exponentialRampToValueAtTime(700, at + 2.2)
      creak.connect(lp)
      lp.connect(cg)
      creak.start(at)
      creak.stop(at + 2.3)
    }
  }

  // Keep the bars coming, always LOOKAHEAD_S ahead of the audio clock
  let nextBar = now + 1
  const tick = () => {
    while (nextBar < ctx.currentTime + LOOKAHEAD_S) {
      scheduleBar(nextBar)
      nextBar += BAR_S
    }
  }
  tick()
  const timer = setInterval(tick, TICK_MS)

  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    clearInterval(timer)
    try {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.2)
    } catch {
      // context already gone: ignore
    }
    setTimeout(() => {
      sources.forEach((s) => {
        try {
          s.stop()
        } catch {
          // already stopped: ignore
        }
      })
      ctx.close().catch(() => {})
    }, 1000)
  }
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
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5)
  }
  return buf
}
