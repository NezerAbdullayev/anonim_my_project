let ctx = null
const LOUDNESS = 6

export function initAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return false
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume()
    return true
  } catch {
    return false
  }
}

export function closeAudio() {
  try {
    if (ctx) ctx.close()
  } catch {
    /* ignore */
  }
  ctx = null
}

// Play a single tone with a short envelope.
function tone(freq, start, duration, type = 'square', volume = 0.04) {
  if (!ctx) return
  volume = Math.min(1, volume * LOUDNESS)
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = ctx.currentTime + start
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function beep() {
  tone(700 + Math.random() * 500, 0, 0.05, 'square', 0.025)
}

export function alarm() {
  for (let i = 0; i < 3; i++) {
    tone(520, i * 0.5, 0.22, 'sawtooth', 0.035)
    tone(380, i * 0.5 + 0.25, 0.22, 'sawtooth', 0.035)
  }
}

export function success() {
  ;[440, 554, 659, 880].forEach((f, i) => tone(f, i * 0.12, 0.18, 'triangle', 0.05))
}

export function reveal() {
  tone(392, 0, 0.18, 'triangle', 0.05)
  tone(330, 0.2, 0.18, 'triangle', 0.05)
  tone(262, 0.4, 0.35, 'triangle', 0.05)
}
