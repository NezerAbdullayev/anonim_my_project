import SpaceWorld from './kosmos/SpaceWorld.jsx'
import OceanWorld from './okean/OceanWorld.jsx'
import SynthWorld from './retro/SynthWorld.jsx'
import PartyWorld from './toy/PartyWorld.jsx'
import AuroraWorld from './aurora/AuroraWorld.jsx'
import CatWorld from './pisikler/CatWorld.jsx'
import PhoneWorld from './telefon/PhoneWorld.jsx'
import EyeWorld from './goz/EyeWorld.jsx'

export const DAXIL_PATH = '/daxil'

// One route per world: /daxil/<slug>. Each page lives in its own folder (src/pages/<slug>/).
export const WORLDS = [
  { slug: 'kosmos', Component: SpaceWorld },
  { slug: 'okean', Component: OceanWorld },
  { slug: 'retro', Component: SynthWorld },
  { slug: 'toy', Component: PartyWorld },
  { slug: 'aurora', Component: AuroraWorld },
  { slug: 'pisikler', Component: CatWorld },
  { slug: 'telefon', Component: PhoneWorld },
  { slug: 'goz', Component: EyeWorld },
]

export const worldPath = (slug) => `${DAXIL_PATH}/${slug}`

const LAST_KEY = 'last-world'

export const readLastWorld = () => {
  try {
    return localStorage.getItem(LAST_KEY)
  } catch {
    return null
  }
}

export const saveLastWorld = (slug) => {
  try {
    localStorage.setItem(LAST_KEY, slug)
  } catch {
    // storage blocked: ignore
  }
}

// Random world slug that differs from `exclude` (the previous one, also across visits)
export const pickWorld = (exclude) => {
  const options = WORLDS.filter((w) => w.slug !== exclude)
  return options[Math.floor(Math.random() * options.length)].slug
}
