import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Landing from '../../components/Landing.jsx'
import HackerTerminal from '../../components/HackerTerminal.jsx'
import PrankReveal from '../../components/PrankReveal.jsx'
import MatrixRain from '../../components/MatrixRain.jsx'
import EyeCodeEffect from '../goz/EyeCodeEffect.jsx'
import { initAudio, closeAudio } from '../../audio/soundEffects.js'
import { enterFullscreen, leaveFullscreen, keepFullscreen } from '../../fullscreen.js'
import { DAXIL_PATH } from '../worlds.js'

/** "/" — landing → fake hacking terminal → eye animation (12 s, with music) → prank reveal. */
export default function HomePage() {
  const [stage, setStage] = useState('landing')
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const start = () => {
    enterFullscreen()
    initAudio()
    setStage('running')
  }

  const exit = () => {
    closeAudio()
    leaveFullscreen()
    setStage('landing')
  }

  // "Daxil ol": go to a random world under /daxil; stays fullscreen
  const enter = () => {
    enterFullscreen()
    closeAudio()
    navigate(DAXIL_PATH)
  }

  useEffect(() => {
    if (stage === 'landing') return
    return keepFullscreen()
  }, [stage])

  useEffect(() => {
    if (stage === 'landing') return
    const onKey = (e) => {
      if (e.key === 'Escape') exit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage])

  // Leaving "/" (e.g. browser back/forward) stops the synth
  useEffect(() => closeAudio, [])

  return (
    <>
      <MatrixRain opacity={stage === 'running' ? 0.4 : 0.7} />
      <div className="scanlines fixed inset-0 z-10" aria-hidden="true" />

      <div className="relative z-20 min-h-full">
        {stage === 'landing' && <Landing name={name} setName={setName} onStart={start} />}
        {stage === 'running' && (
          <HackerTerminal name={name} onDone={() => setStage('eye')} onExit={exit} />
        )}
        {stage === 'eye' && (
          <div className="fixed inset-0 z-30 bg-[#050505]">
            <EyeCodeEffect onEnd={() => setStage('reveal')} />
          </div>
        )}
        {stage === 'reveal' && <PrankReveal name={name} onEnter={enter} />}
      </div>
    </>
  )
}
