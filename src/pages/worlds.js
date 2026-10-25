import SpaceWorld from './kosmos/SpaceWorld.jsx'
import OceanWorld from './okean/OceanWorld.jsx'
import SynthWorld from './retro/SynthWorld.jsx'
import PartyWorld from './toy/PartyWorld.jsx'
import AuroraWorld from './aurora/AuroraWorld.jsx'
import CatWorld from './pisikler/CatWorld.jsx'
import PhoneWorld from './telefon/PhoneWorld.jsx'

export const WORLDS_PATH = '/v1'

// One route per world: /v1/<slug>, shown in this order. Each page lives in its own
// folder (src/pages/<slug>/).
export const WORLDS = [
  { slug: 'kosmos', Component: SpaceWorld },
  { slug: 'okean', Component: OceanWorld },
  { slug: 'retro', Component: SynthWorld },
  { slug: 'toy', Component: PartyWorld },
  { slug: 'aurora', Component: AuroraWorld },
  { slug: 'pisikler', Component: CatWorld },
  { slug: 'telefon', Component: PhoneWorld },
  // The eye (src/pages/goz/) is not a world: it only plays on "/", after the terminal
]

export const worldPath = (slug) => `${WORLDS_PATH}/${slug}`

export const firstWorld = () => WORLDS[0].slug

// The world after `slug` in the list (back to the first after the last one)
export const nextWorld = (slug) => {
  const i = WORLDS.findIndex((w) => w.slug === slug)
  return WORLDS[(i + 1) % WORLDS.length].slug
}
