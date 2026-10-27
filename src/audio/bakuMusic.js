// Background music for old Baku: one synthesized (Web Audio) piece whose layers come and go
// with the eras, all in the same key (D, after the mugham mode shur):
//   • sea      — the Caspian's swell (filtered noise), all the way through
//   • drone    — a low D and A, like the drone string of a saz
//   • tar      — plucked tar-like phrases with a little slide into each note (Middle Ages)
//   • machine  — the slow thud and hiss of oil pumps and steam (oil boom)
//   • crackle  — gramophone crackle (oil boom → Republic)
//   • waltz    — a soft oom-pah-pah in 3/4 (the millionaires' ballrooms)
//   • brass    — broad, slow chords (Soviet)
//   • synth    — a soft electronic arpeggio with echoes (today)
//
// setMix({ layer: 0..1 }) sets how loud each layer is (the page maps time to the mix),
// setHush(h) dims everything for the moments of remembrance (h = 0..1).

export const LAYERS = ['sea', 'drone', 'tar', 'machine', 'crackle', 'waltz', 'brass', 'synth']

const MASTER = 0.5
const FADE_IN_S = 3
const BPM = 108
const BEAT_S = 60 / BPM
const LOOKAHEAD_S = 1.5
const TICK_MS = 200

// Shur on D (the second step a little flat, as in the mode)
const TAR_SCALE = [293.66, 324.5, 349.23, 392, 440, 466.16, 523.25, 587.33]
// Waltz: [bass, chord] for Dm → Gm → A7 → Dm, one bar each
const WALTZ = [
  [73.42, [293.66, 349.23, 440]],
  [98, [293.66, 392, 466.16]],
  [110, [277.18, 329.63, 392]],
  [73.42, [293.66, 349.23, 440]],
]
// Brass: Dm → B♭ → F → A, two bars each
const BRASS = [
  [146.83, 220, 293.66, 349.23],
  [116.54, 233.08, 293.66, 349.23],
  [174.61, 220, 261.63, 349.23],
  [110, 220, 277.18, 329.63],
]
// Today's arpeggio over Dm9
const ARP = [293.66, 349.23, 440, 523.25, 659.25, 523.25, 440, 349.23]

/** Starts the music. Returns { stop(), setMix(levels), setHush(h) }. */
export function playBakuMusic() {
  const none = { stop() {}, setMix() {}, setHush() {} }
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return none
  let ctx
  try {
    ctx = new AC()
  } catch {
    return none
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
  // The hush for the memorials sits between the layers and the master
  const hush = ctx.createGain()
  hush.connect(master)

  // A warm hall reverb shared by the layers
  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 3.5)
  const wet = ctx.createGain()
  wet.gain.value = 0.45
  reverb.connect(wet)
  wet.connect(hush)

  // One bus per layer; its gain is the layer's level in the mix
  const bus = {}
  const level = {}
  for (const name of LAYERS) {
    bus[name] = ctx.createGain()
    bus[name].gain.value = 0
    bus[name].connect(hush)
    bus[name].connect(reverb)
    level[name] = 0
  }

  const noise = noiseBuffer(ctx, 3)

  // Sea: looping noise through a lowpass whose level swells every ~8 s
  const sea = ctx.createBufferSource()
  sea.buffer = noise
  sea.loop = true
  const seaFilter = ctx.createBiquadFilter()
  seaFilter.type = 'lowpass'
  seaFilter.frequency.value = 700
  const swell = ctx.createGain()
  swell.gain.value = 0.12
  const swellLfo = ctx.createOscillator()
  swellLfo.frequency.value = 1 / 8
  const swellDepth = ctx.createGain()
  swellDepth.gain.value = 0.08
  swellLfo.connect(swellDepth)
  swellDepth.connect(swell.gain)
  sea.connect(seaFilter)
  seaFilter.connect(swell)
  swell.connect(bus.sea)
  sea.start(now)
  swellLfo.start(now)

  // Drone: low D and A, slightly detuned so they beat slowly
  for (const [f, g] of [[73.42, 0.06], [73.7, 0.05], [110, 0.04]]) {
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = f
    const gain = ctx.createGain()
    gain.gain.value = g
    o.connect(gain)
    gain.connect(bus.drone)
    o.start(now)
  }

  // Tar: a bright pluck with a quick slide up into the note and a fast decay
  const tarNote = (f, t, accent) => {
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(f * 0.96, t)
    o.frequency.exponentialRampToValueAtTime(f, t + 0.05)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3200, t)
    filter.frequency.exponentialRampToValueAtTime(700, t + 0.5)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.exponentialRampToValueAtTime(accent ? 0.16 : 0.11, t + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
    o.connect(filter)
    filter.connect(env)
    env.connect(bus.tar)
    o.start(t)
    o.stop(t + 1)
  }
  // A phrase walks the scale by small steps and comes back home to D
  let tarStep = 0
  const tarBeat = (t, beat) => {
    if (beat % 8 === 7) return // a breath at the end of each phrase
    const plucks = beat % 2 ? [0, 0.5] : [0]
    for (const dt of plucks) {
      tarStep = Math.max(0, Math.min(TAR_SCALE.length - 1, tarStep + Math.round(Math.random() * 2 - 1)))
      if (beat % 8 === 6) tarStep = 0
      tarNote(TAR_SCALE[tarStep], t + dt * BEAT_S, dt === 0 && beat % 4 === 0)
    }
  }

  // Machine: a low thud on every beat and a hiss of steam every other one
  const machineBeat = (t, beat) => {
    const o = ctx.createOscillator()
    o.frequency.setValueAtTime(80, t)
    o.frequency.exponentialRampToValueAtTime(40, t + 0.2)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.22, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    o.connect(g)
    g.connect(bus.machine)
    o.start(t)
    o.stop(t + 0.32)
    if (beat % 2) {
      const n = ctx.createBufferSource()
      n.buffer = noise
      const f = ctx.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = 3000
      const ng = ctx.createGain()
      ng.gain.setValueAtTime(0.0001, t)
      ng.gain.linearRampToValueAtTime(0.05, t + 0.05)
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
      n.connect(f)
      f.connect(ng)
      ng.connect(bus.machine)
      n.start(t, Math.random())
      n.stop(t + 0.4)
    }
  }

  // Crackle: a few tiny clicks per beat, at random
  const crackleBeat = (t) => {
    const clicks = 2 + Math.floor(Math.random() * 4)
    for (let i = 0; i < clicks; i++) {
      const at = t + Math.random() * BEAT_S
      const n = ctx.createBufferSource()
      n.buffer = noise
      const f = ctx.createBiquadFilter()
      f.type = 'highpass'
      f.frequency.value = 2500
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.06 + Math.random() * 0.06, at)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.006)
      n.connect(f)
      f.connect(g)
      g.connect(bus.crackle)
      n.start(at, Math.random() * 2)
      n.stop(at + 0.01)
    }
  }

  // A soft note shared by the waltz, the brass and the synth
  const softNote = (dest, f, t, dur, { type = 'triangle', peak = 0.06, attack = 0.02, cutoff = 2400 } = {}) => {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = f
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = cutoff
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.linearRampToValueAtTime(peak, t + attack)
    env.gain.setValueAtTime(peak, t + Math.max(attack, dur - 0.1))
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3)
    o.connect(filter)
    filter.connect(env)
    env.connect(dest)
    o.start(t)
    o.stop(t + dur + 0.35)
  }

  // Waltz: bass on one, the chord on two and three
  const waltzBeat = (t, beat) => {
    const [bass, chord] = WALTZ[Math.floor(beat / 3) % WALTZ.length]
    if (beat % 3 === 0) softNote(bus.waltz, bass, t, BEAT_S * 0.9, { peak: 0.15 })
    else for (const f of chord) softNote(bus.waltz, f, t, BEAT_S * 0.45, { peak: 0.05 })
  }

  // Brass: a new broad chord every eight beats, swelling in slowly
  const brassBeat = (t, beat) => {
    if (beat % 8) return
    const chord = BRASS[Math.floor(beat / 8) % BRASS.length]
    for (const f of chord) softNote(bus.brass, f, t, BEAT_S * 8, { type: 'sawtooth', peak: 0.028, attack: 0.8, cutoff: 1100 })
  }

  // Synth: eighth-note arpeggio, echoed by a feedback delay
  const delay = ctx.createDelay(1)
  delay.delayTime.value = BEAT_S * 0.75
  const feedback = ctx.createGain()
  feedback.gain.value = 0.35
  const synthIn = ctx.createGain()
  synthIn.connect(bus.synth)
  synthIn.connect(delay)
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(bus.synth)
  const synthBeat = (t, beat) => {
    for (const half of [0, 1]) {
      const f = ARP[(beat * 2 + half) % ARP.length]
      softNote(synthIn, f, t + half * BEAT_S * 0.5, BEAT_S * 0.4, { type: 'sine', peak: 0.05, attack: 0.01 })
    }
  }

  const BEATS = { tar: tarBeat, machine: machineBeat, crackle: crackleBeat, waltz: waltzBeat, brass: brassBeat, synth: synthBeat }

  let next = now + 0.2
  let beat = 0
  const pump = () => {
    while (next < ctx.currentTime + LOOKAHEAD_S) {
      // only layers that can be heard get notes, so silent eras cost nothing
      for (const [name, play] of Object.entries(BEATS)) if (level[name] > 0.01) play(next, beat)
      beat++
      next += BEAT_S
    }
  }
  pump()
  const timer = setInterval(pump, TICK_MS)

  let stopped = false
  return {
    setMix(levels) {
      if (stopped) return
      const t = ctx.currentTime
      for (const name of LAYERS) {
        const v = Math.max(0, Math.min(1, levels[name] ?? 0))
        level[name] = v
        bus[name].gain.setTargetAtTime(v, t, 0.6)
      }
    },
    setHush(h) {
      if (stopped) return
      hush.gain.setTargetAtTime(1 - 0.75 * Math.max(0, Math.min(1, h)), ctx.currentTime, 0.4)
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

// Stereo reverb tail: noise with an exponential decay
function impulse(ctx, seconds) {
  const len = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  }
  return buf
}

// A few seconds of white noise, shared by the sea, the steam and the crackle
function noiseBuffer(ctx, seconds) {
  const len = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}
