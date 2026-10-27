import SpaceWorld from './kosmos/SpaceWorld.jsx'
import OceanWorld from './okean/OceanWorld.jsx'
import BakuWorld from './kohne-baki/BakuWorld.jsx'

export const WORLDS_PATH = '/v1'

// One route per world: /v1/<slug>, shown in this order. Each page lives in its own
// folder (src/pages/<slug>/).
export const WORLDS = [
  { slug: 'kosmos', Component: SpaceWorld },
  { slug: 'okean', Component: OceanWorld },
  { slug: 'kohne-baki', Component: BakuWorld },
  // The eye (src/pages/goz/) is not a world: it only plays on "/", after the terminal
]

export const worldPath = (slug) => `${WORLDS_PATH}/${slug}`

export const firstWorld = () => WORLDS[0].slug

// The world after `slug` in the list (back to the first after the last one)
export const nextWorld = (slug) => {
  const i = WORLDS.findIndex((w) => w.slug === slug)
  return WORLDS[(i + 1) % WORLDS.length].slug
}
