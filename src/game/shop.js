// Cosmetics you buy with coins. Two kinds:
//   - hats: worn by the mascot "Professor Hoot" (rendered in Mascot.jsx)
//   - themes: the background gradient used by the map / collection / shop
// `id`s are stable so existing saves keep their purchases. The free defaults
// ('graduate' / 'dusk') are always owned and never appear in `purchased`.

export const HATS = [
  { id: 'graduate',  name: 'Scholar Cap',   cost: 0,   blurb: 'The classic look.' },
  { id: 'party',     name: 'Party Hat',     cost: 70,  blurb: 'Every day is a celebration.' },
  { id: 'flower',    name: 'Flower Crown',  cost: 110, blurb: 'Fresh from the meadow.' },
  { id: 'santa',     name: 'Winter Hat',    cost: 120, blurb: 'Cosy and warm.' },
  { id: 'crown',     name: 'Royal Crown',   cost: 160, blurb: 'For a true number royal.' },
  { id: 'propeller', name: 'Propeller Cap', cost: 180, blurb: 'Wheee!' },
  { id: 'wizard',    name: 'Wizard Hat',    cost: 220, blurb: 'Master of maths magic.' },
  // --- Minecraft block hats ---
  { id: 'pumpkin',   name: 'Jack o’Lantern', cost: 90,  blurb: 'Spooky carved glow.' },
  { id: 'tnt',       name: 'TNT Block',     cost: 130, blurb: 'Hssssss... kaboom!' },
  { id: 'iron',      name: 'Iron Helmet',   cost: 140, blurb: 'Sturdy mob gear.' },
  { id: 'gold',      name: 'Gold Helmet',   cost: 200, blurb: 'Shiny but soft.' },
  { id: 'creeper',   name: 'Creeper Head',  cost: 240, blurb: 'Aw man...' },
  { id: 'diamond',   name: 'Diamond Helmet', cost: 300, blurb: 'The toughest of all.' },
]

export const THEMES = [
  { id: 'dusk',   name: 'Dusk',     cost: 0,   gradient: 'radial-gradient(120% 90% at 50% 0%, #3b4a63 0%, #1f2937 60%, #111827 100%)' },
  { id: 'forest', name: 'Forest',   cost: 90,  gradient: 'radial-gradient(120% 90% at 50% 0%, #4d7c0f 0%, #14532d 55%, #0a1f14 100%)' },
  { id: 'ocean',  name: 'Ocean',    cost: 100, gradient: 'radial-gradient(120% 90% at 50% 0%, #0ea5e9 0%, #075985 55%, #082032 100%)' },
  { id: 'sunset', name: 'Sunset',   cost: 130, gradient: 'radial-gradient(120% 90% at 50% 0%, #f59e0b 0%, #9a3412 55%, #1c1018 100%)' },
  { id: 'candy',  name: 'Candy',    cost: 150, gradient: 'radial-gradient(120% 90% at 50% 0%, #f472b6 0%, #a21caf 55%, #2a1033 100%)' },
  { id: 'lava',   name: 'Volcano',  cost: 170, gradient: 'radial-gradient(120% 90% at 50% 0%, #f97316 0%, #7f1d1d 50%, #190a0a 100%)' },
  { id: 'galaxy', name: 'Galaxy',   cost: 200, gradient: 'radial-gradient(120% 90% at 50% 0%, #6366f1 0%, #312e81 50%, #0b0a1f 100%)' },
  // --- Minecraft world themes ---
  { id: 'deepslate', name: 'Deepslate Cave', cost: 110, gradient: 'radial-gradient(120% 90% at 50% 0%, #475569 0%, #1e293b 55%, #0b0f17 100%)' },
  { id: 'nether',    name: 'The Nether',     cost: 180, gradient: 'radial-gradient(120% 90% at 50% 0%, #b91c1c 0%, #4a0f0f 50%, #170505 100%)' },
  { id: 'end',       name: 'The End',        cost: 250, gradient: 'radial-gradient(120% 90% at 50% 0%, #5b4a82 0%, #211a36 55%, #06040c 100%)' },
]

// fresh saves start equipped with the free defaults
export const DEFAULT_EQUIP = { hat: 'graduate', theme: 'dusk' }

const ALL_ITEMS = [...HATS, ...THEMES]
export const shopItemById = (id) => ALL_ITEMS.find((i) => i.id === id)

// resolve a theme id to its CSS gradient (falls back to the default)
export const themeGradient = (id) => (THEMES.find((t) => t.id === id) || THEMES[0]).gradient
