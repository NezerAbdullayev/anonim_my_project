// Must be called synchronously from a user gesture; unsupported browsers just continue
export const enterFullscreen = () => {
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) return
    const el = document.documentElement
    const reqFn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
    const res = reqFn?.call(el, { navigationUI: 'hide' })
    res?.catch?.(() => {})
  } catch {
    // unsupported (e.g. iPhone Safari): ignore
  }
}

export const leaveFullscreen = () => {
  try {
    const active = document.fullscreenElement || document.webkitFullscreenElement
    if (!active) return
    const exitFn = document.exitFullscreen || document.webkitExitFullscreen
    const res = exitFn?.call(document)
    res?.catch?.(() => {})
  } catch {
    // unsupported: ignore
  }
}

// Pages after the landing are fullscreen by default: if it was left (or the page was
// opened directly), the next click/tap re-enters it. Returns the cleanup function.
export const keepFullscreen = () => {
  window.addEventListener('pointerdown', enterFullscreen)
  return () => window.removeEventListener('pointerdown', enterFullscreen)
}
