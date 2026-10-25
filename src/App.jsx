import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/home/HomePage.jsx'
import DaxilLayout from './pages/daxil/DaxilLayout.jsx'
import { DAXIL_PATH, WORLDS, pickWorld, readLastWorld, worldPath } from './pages/worlds.js'

// "/daxil" on its own: jump to a random world (different from the last one), no extra history entry
const RandomWorld = () => <Navigate to={worldPath(pickWorld(readLastWorld()))} replace />

export default function App() {
  return (
    <div className="relative min-h-full w-full overflow-hidden bg-black font-mono text-neon">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path={DAXIL_PATH} element={<DaxilLayout />}>
          <Route index element={<RandomWorld />} />
          {WORLDS.map(({ slug, Component }) => (
            <Route key={slug} path={slug} element={<Component />} />
          ))}
          <Route path="*" element={<RandomWorld />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
