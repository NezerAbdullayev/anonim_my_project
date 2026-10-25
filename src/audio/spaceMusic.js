// Background music for the space journey.
//
// 1. If an audio file exists at TRACK_URL (put it in public/audio/), that track
//    plays on a loop. The file is the owner's to provide (and to have the rights to).
// 2. Otherwise: a synthesized fallback (Web Audio), in the spirit of big
//    organ-driven space film scores — an original piece, not a copy:
//      • pipe organ (additive "stops") playing a steady arpeggio over a pedal bass
//      • a soft ticking clock on every beat
//      • a cathedral-sized reverb
//
// setProgress(p) builds a crescendo over the journey either way.

const TRACK_URL = '/audio/space-music.mp3'
const TRACK_VOLUME = [0.55, 1] // file volume at the start → end of the journey
const TRACK_FADE_S = 2.5

const MASTER = 0.55
const FADE_IN_S = 3
const BPM = 70
const BEAT_S = 60 / BPM
const STEP_S = BEAT_S / 2 // arpeggio in eighth notes
const BEATS_PER_CHORD = 8
const LOOKAHEAD_S = 2
const TICK_MS = 250

// Am(add9) → Fmaj7 → C → G(sus4): [pedal root, arpeggio notes (Hz)]
const CHORDS = [
  [55, [220, 261.63, 329.63, 493.88]],
  [43.65, [174.61, 220, 261.63, 329.63]],
  [65.41, [196, 261.63, 329.63, 392]],
  [49, [196, 261.63, 293.66, 392]],
]
// Arpeggio order over the 4 chord tones (up and back down)
const PATTERN = [0, 1, 2, 3, 2, 1, 2, 3]

// Organ stops: [frequency multiple, level]. The last two are the "bright" stops
// that come in during the crescendo.
const STOPS = [[0.5, 0.35], [1, 1], [2, 0.5], [3, 0.22], [4, 0.25]]
const BRIGHT_STOPS = [[6, 0.1], [8, 0.12]]

/**
 * Starts the music: the audio file if there is one, otherwise the synth.
 * Returns { stop(), setProgress(p) } (p = journey progress 0..1).
 */
export function playSpaceMusic() {
  let impl = null
  let stopped = false
  let lastP = 0
  const audio = new Audio()
  audio.loop = true
  audio.preload = 'auto'

  const start = (make) => {
    if (stopped || impl) return
    impl = make()
    impl.setProgress(lastP)
  }
  // No file (404, or the dev server answering with a page) → synth fallback
  audio.addEventListener('error', () => start(playSynthMusic), { once: true })
  audio.addEventListener('canplay', () => start(() => playTrack(audio)), { once: true })
  audio.src = TRACK_URL

  return {
    setProgress(p) {
      lastP = p
      impl?.setProgress(p)
    },
    stop() {
      stopped = true
      if (impl) impl.stop()
      else audio.removeAttribute('src')
    },
  }
}

/** Plays the audio file on a loop: fade in, crescendo with the journey, fade out. */
function playTrack(audio) {
  let target = TRACK_VOLUME[0]
  let stopped = false
  audio.volume = 0

  // Volume eases toward `target` (HTMLAudio has no ramps of its own):
  // a full 0 → 1 change takes TRACK_FADE_S at 20 ticks per second
  const step = 1 / (TRACK_FADE_S * 20)
  const fader = setInterval(() => {
    const v = audio.volume
    audio.volume = Math.abs(target - v) <= step ? target : v + Math.sign(target - v) * step
    if (stopped && audio.volume === 0) {
      clearInterval(fader)
      audio.pause()
      audio.removeAttribute('src')
    }
  }, 50)

  // Browsers block autoplay until the user has interacted with the page: if so,
  // start on the first tap/click/key (scrolling alone doesn't count)
  const unlockEvents = ['pointerdown', 'keydown', 'touchend']
  const removeUnlock = () => unlockEvents.forEach((ev) => window.removeEventListener(ev, tryPlay))
  function tryPlay() {
    if (stopped) return
    audio.play().then(removeUnlock).catch(() => {})
  }
  audio.play().catch(() => unlockEvents.forEach((ev) => window.addEventListener(ev, tryPlay)))

  return {
    setProgress(p) {
      if (stopped) return
      const q = Math.max(0, Math.min(1, p))
      target = TRACK_VOLUME[0] + (TRACK_VOLUME[1] - TRACK_VOLUME[0]) * q
    },
    stop() {
      stopped = true
      target = 0
      removeUnlock()
    },
  }
}

/** Synthesized fallback (see the top of the file). */
function playSynthMusic() {
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
  comp.threshold.value = -16
  comp.ratio.value = 3
  comp.connect(ctx.destination)
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, now)
  master.gain.linearRampToValueAtTime(MASTER, now + FADE_IN_S)
  master.connect(comp)

  // Cathedral reverb
  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 7)
  const wet = ctx.createGain()
  wet.gain.value = 0.85
  reverb.connect(wet)
  wet.connect(master)

  // Organ bus: crescendo = level + filter opening + bright stops fading in
  const organFilter = ctx.createBiquadFilter()
  organFilter.type = 'lowpass'
  organFilter.frequency.value = 1400
  const organ = ctx.createGain()
  organ.gain.value = 0.35
  organFilter.connect(organ)
  organ.connect(master)
  organ.connect(reverb)
  const bright = ctx.createGain()
  bright.gain.value = 0
  bright.connect(organFilter)

  // One organ note: every stop is a sine at a multiple of the pitch
  const organNote = (f, t, dur, level) => {
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.linearRampToValueAtTime(level, t + 0.06) // organ: fast, soft onset
    env.gain.setValueAtTime(level, t + dur - 0.08)
    env.gain.linearRampToValueAtTime(0.0001, t + dur + 0.25)
    env.connect(organFilter)
    const play = (stops, dest) => {
      for (const [mult, lvl] of stops) {
        const o = ctx.createOscillator()
        o.frequency.value = f * mult
        const g = ctx.createGain()
        g.gain.value = lvl
        o.connect(g)
        g.connect(dest)
        o.start(t)
        o.stop(t + dur + 0.3)
      }
    }
    play(STOPS, env)
    // Bright stops go through the shared `bright` level (raised by the crescendo)
    const bg = ctx.createGain()
    bg.gain.setValueAtTime(0.0001, t)
    bg.gain.linearRampToValueAtTime(level, t + 0.06)
    bg.gain.setValueAtTime(level, t + dur - 0.08)
    bg.gain.linearRampToValueAtTime(0.0001, t + dur + 0.25)
    bg.connect(bright)
    play(BRIGHT_STOPS, bg)
  }

  // Clock tick: a short, dry, woody click
  const tick = (t, accent) => {
    const g = ctx.createGain()
    g.gain.setValueAtTime(accent ? 0.22 : 0.14, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    g.connect(master)
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.setValueAtTime(accent ? 1900 : 1500, t)
    o.frequency.exponentialRampToValueAtTime(900, t + 0.04)
    o.connect(g)
    o.start(t)
    o.stop(t + 0.06)
  }

  // One chord block: pedal bass held through, arpeggio in eighths, tick on each beat
  const scheduleChord = (t, [root, notes]) => {
    const len = BEATS_PER_CHORD * BEAT_S
    organNote(root, t, len, 0.5)
    organNote(root * 2, t, len, 0.25)
    const steps = BEATS_PER_CHORD * 2
    for (let s = 0; s < steps; s++) {
      organNote(notes[PATTERN[s % PATTERN.length]], t + s * STEP_S, STEP_S * 0.95, 0.22)
    }
    for (let b = 0; b < BEATS_PER_CHORD; b++) tick(t + b * BEAT_S, b % 4 === 0)
  }

  let next = now + 0.2
  let index = 0
  const pump = () => {
    while (next < ctx.currentTime + LOOKAHEAD_S) {
      scheduleChord(next, CHORDS[index % CHORDS.length])
      index++
      next += BEATS_PER_CHORD * BEAT_S
    }
  }
  pump()
  const timer = setInterval(pump, TICK_MS)

  let stopped = false
  return {
    // Crescendo over the journey: organ 0.35 → 0.75, filter 1.4 → 5 kHz, bright stops 0 → full
    setProgress(p) {
      if (stopped) return
      const q = Math.max(0, Math.min(1, p))
      const t = ctx.currentTime
      organ.gain.setTargetAtTime(0.35 + 0.4 * q, t, 1)
      organFilter.frequency.setTargetAtTime(1400 + 3600 * q, t, 1)
      bright.gain.setTargetAtTime(q, t, 1)
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
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
  }
  return buf
}
