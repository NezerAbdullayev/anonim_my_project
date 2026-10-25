import { useEffect, useRef } from 'react'

const CHARS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF<>/\\+=*'
const FONT_SIZE = 14
const MAX_COLUMNS = 220
const DROPS_PER_COLUMN = 2 // more streams → denser rain
const FRAME_MS = 50
const TRAIL_FADE = 0.06 // lower = longer trails
const HEAD_COLOR = '#d9ffe6'
const TRAIL_COLOR = '#00ff66'

export default function MatrixRain({ opacity = 0.35 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let drops = []
    let columns = 0
    let rafId = null
    let last = 0
    let running = true

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      columns = Math.max(1, Math.min(MAX_COLUMNS, Math.floor(canvas.width / FONT_SIZE)))
      const rows = Math.ceil(canvas.height / FONT_SIZE)
      // Start spread over (and above) the screen so it's full right away
      drops = Array.from(
        { length: columns * DROPS_PER_COLUMN },
        () => Math.random() * rows * 1.5 - rows * 0.5
      )
      c.fillStyle = '#000'
      c.fillRect(0, 0, canvas.width, canvas.height)
    }

    const randChar = () => CHARS[Math.floor(Math.random() * CHARS.length)]

    const draw = () => {
      c.fillStyle = `rgba(0, 0, 0, ${TRAIL_FADE})`
      c.fillRect(0, 0, canvas.width, canvas.height)
      c.font = `bold ${FONT_SIZE}px monospace`
      c.shadowColor = TRAIL_COLOR
      const step = canvas.width / columns
      for (let d = 0; d < drops.length; d++) {
        const x = (d % columns) * step
        const y = drops[d] * FONT_SIZE
        // Repaint last frame's bright head in green so the trail stays green
        c.shadowBlur = 0
        c.fillStyle = TRAIL_COLOR
        c.fillText(randChar(), x, y - FONT_SIZE)
        // Bright glowing head
        c.shadowBlur = 8
        c.fillStyle = HEAD_COLOR
        c.fillText(randChar(), x, y)
        if (y > canvas.height && Math.random() > 0.95) drops[d] = 0
        drops[d] += 1
      }
      c.shadowBlur = 0
    }

    const loop = (t) => {
      if (!running) return
      if (t - last >= FRAME_MS) {
        last = t
        draw()
      }
      rafId = requestAnimationFrame(loop)
    }

    const start = () => {
      if (rafId == null && running) rafId = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      rafId = null
    }

    // Pause while the tab is hidden
    const onVisibility = () => (document.hidden ? stop() : start())

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    if (reduce) {
      for (let i = 0; i < 40; i++) draw()
    } else if (!document.hidden) {
      start()
    }

    return () => {
      running = false
      stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 h-full w-full"
      style={{ opacity, zIndex: 0 }}
    />
  )
}
