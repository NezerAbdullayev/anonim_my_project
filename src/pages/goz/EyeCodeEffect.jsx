import { useEffect, useRef } from 'react'
import {
  INTRO_CLOSED, TWITCH_AT, INTRO_CRACK, INTRO_SNAP, INTRO_SETTLE, SHOCK_MS, TOTAL_MS, SHOCK_AT, ZOOM_AT,
} from './timeline.js'
import { playEyeMusic } from './eyeMusic.js'

const TOKENS = [
  'const', 'let', 'function', 'return', 'void', 'NaN', 'null', '=>', '{}', '[]', '<>', '0x3F',
  'if(', ')', ';', '==', '!=', '&&', '||', 'new', 'this', 'eye', 'see()', '01', '1101', '#',
  'await', 'async', 'class', 'import', 'export', 'true', 'false', '++', '/*', '*/', 'map', '%',
]
const FRAME_MS = 40 // ~25 fps
const SCROLL_ROW_CHANCE = 0.35 // share of rows that stream sideways
const MUTATIONS_PER_FRAME = 120 // random chars swapped each frame (shimmer)

// Palette (tune here)
const SURROUND = '#00ff66' // code all around the eye (the app's neon green)
const SURROUND_DIM = '#00a843' // …a bit darker toward the screen edges
const LID = '#0b7a36' // eyelid while blinking
const SCLERA = ['#ffffff', '#f0f0f0', '#b4b4b4'] // centre → corners
const IRIS = ['#d2d2d2', '#808080', '#141414'] // next to pupil → edge (grey → black)
const PUPIL = '#000000'

const CRACK_OPEN = 0.12 // how wide the slit opens before the snap
const SHAKE_PX = 16
const ZOOM_DILATE = 0.3 // pupil widens by 30% while we fall into it
const END_HOLD_MS = 1200 // black hold before onEnd

const rand = (min, max) => Math.random() * (max - min) + min
const token = () => TOKENS[Math.floor(Math.random() * TOKENS.length)]
const codeLine = (len) => {
  let s = ''
  while (s.length < len) s += token() + (Math.random() < 0.6 ? ' ' : '')
  return s.slice(0, len)
}

/**
 * Full-screen grid of code text with a big blinking eye "painted" into it: every
 * character takes the colour of a hidden eye image underneath (ASCII-art style).
 * Text is a mask (destination-in) over the colour layer, so a dense grid stays cheap.
 * The pupil follows the pointer (or wanders on its own).
 * `onEnd` (optional) is called a moment after the screen has gone fully black.
 */
export default function EyeCodeEffect({ onEnd }) {
  const canvasRef = useRef(null)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const colorCanvas = document.createElement('canvas')
    const cc = colorCanvas.getContext('2d')
    const textCanvas = document.createElement('canvas')
    const tc = textCanvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let font = 10
    let lineH = 11
    let charW = 6
    let cols = 0
    let rows = [] // { text, offset, speed }

    // Eye geometry (recomputed on resize)
    let cx = 0
    let cy = 0
    let halfW = 0 // half of eye width
    let halfH = 0 // half of eye height when fully open

    // Animated state
    let open = reduce ? 1 : 0 // 1 = open, 0 = closed
    const introStart = performance.now()
    let introDone = reduce
    const shockStart = introStart + SHOCK_AT
    let shock = 0 // 1 right at the shock → 0 when it's over
    const zoomStart = introStart + ZOOM_AT
    const endAt = introStart + TOTAL_MS
    const stopMusic = playEyeMusic(introStart)
    // Report the end: shortly after full black (lets the last thump ring out)
    const endTimer = setTimeout(() => onEndRef.current?.(), TOTAL_MS + END_HOLD_MS)
    let zoom = 0 // eased zoom progress 0 → 1
    let finished = false
    let nextBlink = Infinity // blinking starts after the intro
    let blinkStart = -1
    const pupil = { x: 0, y: 0, tx: 0, ty: 0 } // offset from eye centre, eased toward target
    let lastPointer = -Infinity
    let nextWander = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      for (const [cv, c] of [[canvas, ctx], [colorCanvas, cc], [textCanvas, tc]]) {
        cv.width = Math.round(w * dpr)
        cv.height = Math.round(h * dpr)
        c.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      // Big, tightly packed glyphs = more "ink", so the eye image reads clearly
      font = w < 640 ? 9 : 12
      lineH = font
      tc.font = `bold ${font}px monospace`
      charW = tc.measureText('M').width
      cols = Math.ceil(w / charW) + 1
      rows = Array.from({ length: Math.ceil(h / lineH) + 1 }, () => ({
        text: codeLine(cols * 3),
        offset: Math.floor(rand(0, cols)),
        speed: Math.random() < SCROLL_ROW_CHANCE ? rand(0.2, 0.9) : 0,
      }))
      // Keep the almond's proportions on wide-and-short screens too
      halfH = Math.min(w * 0.4 * 0.48, h * 0.3, 270)
      halfW = halfH / 0.48
      cx = w / 2
      cy = h * 0.53
    }

    // Lid curves, t ∈ [-1, 1] across the eye width. Both lids slide toward a shared
    // "closed" line (slightly below centre), so a blink shuts the eye completely.
    const closedLine = (t) => cy + halfH * 0.3 * (1 - t * t)
    const upperOpen = (t) => cy - halfH * Math.pow(1 - t * t, 0.8)
    const lowerOpen = (t) => cy + halfH * 0.8 * Math.pow(1 - t * t, 1.1)
    const upperLid = (t) => closedLine(t) + (upperOpen(t) - closedLine(t)) * open
    const lowerLid = (t) => closedLine(t) + (lowerOpen(t) - closedLine(t)) * open

    const almondPath = (c, upper, lower) => {
      c.beginPath()
      for (let s = 0; s <= 60; s++) {
        const t = -1 + (2 * s) / 60
        c.lineTo(cx + t * halfW, upper(t))
      }
      for (let s = 60; s >= 0; s--) {
        const t = -1 + (2 * s) / 60
        c.lineTo(cx + t * halfW, lower(t))
      }
      c.closePath()
    }

    const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
    const easeOut = (p) => 1 - Math.pow(1 - p, 3)

    // Intro: closed → twitch → slit → snap open with overshoot → settle
    const updateIntro = (now) => {
      let e = now - introStart
      if (e < INTRO_CLOSED) {
        open = e > TWITCH_AT && e < TWITCH_AT + 120 ? 0.05 : 0
        return
      }
      e -= INTRO_CLOSED
      if (e < INTRO_CRACK) {
        open = CRACK_OPEN * easeInOut(e / INTRO_CRACK)
        return
      }
      e -= INTRO_CRACK
      if (e < INTRO_SNAP) {
        open = CRACK_OPEN + (1.08 - CRACK_OPEN) * easeOut(e / INTRO_SNAP)
        return
      }
      e -= INTRO_SNAP
      if (e < INTRO_SETTLE) {
        open = 1.08 - 0.08 * easeOut(e / INTRO_SETTLE)
        return
      }
      open = 1
      introDone = true
      nextBlink = now + rand(3000, 5000)
    }

    const updateShock = (now) => {
      const e = now - shockStart
      shock = reduce || e < 0 || e > SHOCK_MS ? 0 : 1 - e / SHOCK_MS
    }

    const updateZoom = (now) => {
      if (reduce) return
      const p = Math.max(0, Math.min(1, (now - zoomStart) / (endAt - zoomStart)))
      zoom = easeInOut(p)
    }

    // Blink: close 110ms → hold 40ms → open 170ms, every 3–5 s (sometimes twice)
    const updateBlink = (now) => {
      if (blinkStart < 0 && now >= nextBlink) blinkStart = now
      if (blinkStart < 0) return
      const e = now - blinkStart
      if (e < 110) open = 1 - e / 110
      else if (e < 150) open = 0
      else if (e < 320) open = (e - 150) / 170
      else {
        open = 1
        blinkStart = -1
        nextBlink = now + (Math.random() < 0.2 ? 250 : rand(3000, 5000))
      }
    }

    const updatePupil = (now) => {
      if (zoom > 0) {
        // Falling into the eye: the gaze settles straight ahead
        pupil.tx = 0
        pupil.ty = 0
      } else if (now - lastPointer > 3000 && now >= nextWander) {
        // No pointer lately: glance around on its own
        pupil.tx = rand(-1, 1)
        pupil.ty = rand(-0.6, 0.6)
        nextWander = now + rand(1500, 3500)
      }
      pupil.x += (pupil.tx - pupil.x) * 0.12
      pupil.y += (pupil.ty - pupil.y) * 0.12
    }

    // Text mask: streaming rows of code + random char swaps
    const drawText = (animate) => {
      tc.clearRect(0, 0, w, h)
      tc.fillStyle = '#fff'
      tc.textBaseline = 'top'
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r]
        if (animate) row.offset = (row.offset + row.speed) % (row.text.length - cols - 8)
        const o = Math.floor(row.offset)
        // Shock glitch: some rows jump sideways for a moment
        const glitch = shock > 0.1 && Math.random() < 0.35 ? rand(-1, 1) * charW * 8 * shock : 0
        tc.fillText(row.text.slice(o, o + cols + 8), glitch - charW * 4, r * lineH)
      }
      if (!animate) return
      for (let k = 0; k < MUTATIONS_PER_FRAME; k++) {
        const row = rows[Math.floor(Math.random() * rows.length)]
        const i = Math.floor(Math.random() * row.text.length)
        const t = token()
        row.text = row.text.slice(0, i) + t[0] + row.text.slice(i + 1)
      }
    }

    // Colour layer: the "photo" of the eye that the text gets painted with
    const drawColor = (now) => {
      const irisR = halfH * 0.9
      // Slow dilate/contract; snaps small on the shock, widens while zooming in
      const pupilR =
        irisR * 0.4 * (1 + 0.08 * Math.sin(now / 900)) * (1 - 0.5 * shock) * (1 + ZOOM_DILATE * zoom)
      const ix = cx + pupil.x * halfW * 0.35
      const iy = cy + pupil.y * halfH * 0.3

      cc.fillStyle = SURROUND_DIM
      cc.fillRect(0, 0, w, h)

      // Zoom into the pupil: scale around it on a log scale (steady "falling in" feel)
      // while sliding it to the screen centre, until its black covers every corner.
      cc.save()
      if (zoom > 0) {
        const zMax = (Math.hypot(w, h) / 2 / (irisR * 0.4 * 0.92 * (1 + ZOOM_DILATE))) * 1.15
        const z = Math.exp(Math.log(zMax) * zoom)
        cc.translate(ix + (w / 2 - ix) * zoom, iy + (h / 2 - iy) * zoom)
        cc.scale(z, z)
        cc.translate(-ix, -iy)
      }

      // Surround: green code, a little darker toward the edges
      const bg = cc.createRadialGradient(cx, cy, halfW * 0.5, cx, cy, Math.max(w, h) * 0.75)
      bg.addColorStop(0, SURROUND)
      bg.addColorStop(1, SURROUND_DIM)
      cc.fillStyle = bg
      cc.fillRect(0, 0, w, h)

      // Dark oval shadow around the eye socket (a circle squashed vertically)
      cc.save()
      cc.translate(cx, cy)
      cc.scale(1, (halfH * 1.5) / halfW)
      const oval = cc.createRadialGradient(0, 0, halfW * 0.9, 0, 0, halfW * 1.3)
      oval.addColorStop(0, 'rgba(0,0,0,0.8)')
      oval.addColorStop(1, 'rgba(0,0,0,0)')
      cc.fillStyle = oval
      cc.fillRect(-halfW * 1.5, -halfW * 1.5, halfW * 3, halfW * 3)
      cc.restore()

      // Eyelid skin (visible while blinking)
      almondPath(cc, upperOpen, lowerOpen)
      cc.fillStyle = LID
      cc.fill()

      // Open part of the eye, clipped to the current lids
      cc.save()
      almondPath(cc, upperLid, lowerLid)
      cc.clip()

      // Sclera: white centre → grey corners
      const sc = cc.createRadialGradient(cx, cy, 0, cx, cy, halfW)
      sc.addColorStop(0, SCLERA[0])
      sc.addColorStop(0.55, SCLERA[1])
      sc.addColorStop(1, SCLERA[2])
      cc.fillStyle = sc
      cc.fillRect(cx - halfW, cy - halfH, halfW * 2, halfH * 2)

      // Iris: grey next to the pupil → black at the edge
      const ir = cc.createRadialGradient(ix, iy, pupilR, ix, iy, irisR)
      ir.addColorStop(0, IRIS[0])
      ir.addColorStop(0.6, IRIS[1])
      ir.addColorStop(1, IRIS[2])
      cc.fillStyle = ir
      cc.beginPath()
      cc.arc(ix, iy, irisR, 0, Math.PI * 2)
      cc.fill()

      // Iris fibres: thin radial streaks
      cc.lineWidth = Math.max(1, charW * 0.5)
      for (let k = 0; k < 48; k++) {
        const a = (k / 48) * Math.PI * 2
        cc.strokeStyle = k % 2 ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.12)'
        cc.beginPath()
        cc.moveTo(ix + Math.cos(a) * pupilR, iy + Math.sin(a) * pupilR)
        cc.lineTo(ix + Math.cos(a) * irisR, iy + Math.sin(a) * irisR)
        cc.stroke()
      }

      // Pupil
      cc.fillStyle = PUPIL
      cc.beginPath()
      cc.arc(ix, iy, pupilR, 0, Math.PI * 2)
      cc.fill()

      // Small glint (fades early in the zoom, so the final black stays pure)
      cc.fillStyle = `rgba(255,255,255,${0.9 * Math.max(0, 1 - zoom * 4)})`
      cc.beginPath()
      cc.arc(ix - pupilR * 0.55, iy - pupilR * 0.55, pupilR * 0.22, 0, Math.PI * 2)
      cc.fill()

      // Shade under the upper lid
      const lidShade = cc.createLinearGradient(0, cy - halfH, 0, cy)
      lidShade.addColorStop(0, 'rgba(0,0,0,0.35)')
      lidShade.addColorStop(1, 'rgba(0,0,0,0)')
      cc.fillStyle = lidShade
      cc.fillRect(cx - halfW, cy - halfH, halfW * 2, halfH)
      cc.restore()

      // Dark rim along the lids
      almondPath(cc, upperLid, lowerLid)
      cc.strokeStyle = 'rgba(0,0,0,0.9)'
      cc.lineWidth = lineH * 0.9
      cc.stroke()
      cc.restore() // end of zoom transform

      if (shock > 0) drawShock()
    }

    // Shock: one white flare of the code + two shockwave rings bursting out of the eye.
    // A single flare (not repeated), so it stays within the 3-flashes-per-second rule.
    const drawShock = () => {
      const q = 1 - shock // 0 → 1 over the shock
      cc.fillStyle = `rgba(255,255,255,${0.6 * Math.pow(shock, 3)})`
      cc.fillRect(0, 0, w, h)
      for (const delay of [0, 0.18]) {
        const p = (q - delay) / (1 - delay)
        if (p <= 0 || p >= 1) continue
        const r = halfW * (1 + easeOut(p) * 2.6)
        cc.strokeStyle = `rgba(230,255,240,${0.9 * (1 - p)})`
        cc.lineWidth = lineH * (6 * (1 - p) + 1)
        cc.beginPath()
        cc.ellipse(cx, cy, r, r * 0.62, 0, 0, Math.PI * 2)
        cc.stroke()
      }
    }

    const render = (now, animate) => {
      drawText(animate)
      drawColor(now)
      ctx.clearRect(0, 0, w, h)
      // Screen shake during the shock (slightly zoomed so the edges never show)
      const sx = shock ? rand(-1, 1) * SHAKE_PX * shock : 0
      const sy = shock ? rand(-1, 1) * SHAKE_PX * shock : 0
      const pad = shock ? SHAKE_PX : 0
      ctx.save()
      ctx.translate(sx - pad, sy - pad)
      ctx.scale((w + pad * 2) / w, (h + pad * 2) / h)
      ctx.drawImage(colorCanvas, 0, 0, w, h)
      ctx.globalCompositeOperation = 'destination-in' // keep colour only where text is
      ctx.drawImage(textCanvas, 0, 0, w, h)
      ctx.restore()
    }

    let rafId = null
    let last = 0
    let running = true

    const loop = (now) => {
      if (!running) return
      if (now - last >= FRAME_MS) {
        last = now
        if (!introDone) updateIntro(now)
        else if (zoom === 0) updateBlink(now) // no blinking while zooming in
        updateShock(now)
        updateZoom(now)
        updatePupil(now)
        render(now, true)
        if (now >= endAt) {
          // Fully black: stop animating, keep the last frame
          finished = true
          rafId = null
          return
        }
      }
      rafId = requestAnimationFrame(loop)
    }
    const start = () => {
      if (rafId == null && running && !finished) rafId = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      rafId = null
    }

    const onResize = () => {
      resize()
      if (reduce) render(0, false) // reduced motion: one still frame, eye open
      else if (finished) render(performance.now(), false) // stay black at the new size
    }
    const onPointer = (e) => {
      lastPointer = performance.now()
      pupil.tx = Math.max(-1, Math.min(1, (e.clientX - cx) / halfW))
      pupil.ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (halfH * 2)))
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    resize()
    window.addEventListener('resize', onResize)
    if (reduce) {
      render(0, false)
    } else {
      window.addEventListener('pointermove', onPointer)
      document.addEventListener('visibilitychange', onVisibility)
      if (!document.hidden) start()
    }

    return () => {
      running = false
      stop()
      stopMusic()
      clearTimeout(endTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
}
