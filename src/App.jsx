import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { installButtonClickSound } from './audio/uiSound.js'
import HomePage from './pages/home/HomePage.jsx'
import WorldsLayout from './pages/v1/WorldsLayout.jsx'
import { WORLDS_PATH, WORLDS, firstWorld, worldPath } from './pages/worlds.js'

// "/v1" on its own (or an unknown world): start at the first world, no extra history entry
const FirstWorld = () => <Navigate to={worldPath(firstWorld())} replace />

export default function App() {
  // Every button in the app makes a click sound
  useEffect(installButtonClickSound, [])

  return (
    <div className="relative min-h-full w-full overflow-hidden bg-black font-mono text-neon">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path={WORLDS_PATH} element={<WorldsLayout />}>
          <Route index element={<FirstWorld />} />
          {WORLDS.map(({ slug, Component }) => (
            <Route key={slug} path={slug} element={<Component />} />
          ))}
          <Route path="*" element={<FirstWorld />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
