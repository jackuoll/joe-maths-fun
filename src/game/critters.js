// Collectible "Number Critters". Each is drawn procedurally from this data
// (see components/Critter.jsx). 12 total: 6 are stage rewards, 6 hatch from eggs.

export const CRITTERS = [
  { id: 'addybug',  name: 'Addybug',   hue: 145, topper: 'antennae', pattern: 'spots',  rarity: 'common' },
  { id: 'sumling',  name: 'Sumling',   hue: 35,  topper: 'leaf',     pattern: 'belly',  rarity: 'common' },
  { id: 'carrymoth',name: 'Carrymoth', hue: 265, topper: 'wings',    pattern: 'stripe', rarity: 'rare'   },
  { id: 'borrobear',name: 'Borrobear', hue: 205, topper: 'ears',     pattern: 'belly',  rarity: 'common' },
  { id: 'minusmole',name: 'Minusmole', hue: 20,  topper: 'tuft',     pattern: 'spots',  rarity: 'common' },
  { id: 'digitdrake',name:'Digit Drake',hue: 0,  topper: 'horns',    pattern: 'stripe', rarity: 'epic'   },
  { id: 'tentopus', name: 'Tentopus',  hue: 320, topper: 'none',     pattern: 'spots',  rarity: 'rare'   },
  { id: 'zerozoom', name: 'Zerozoom',  hue: 190, topper: 'antennae', pattern: 'belly',  rarity: 'common' },
  { id: 'pluppy',   name: 'Pluppy',    hue: 50,  topper: 'ears',     pattern: 'belly',  rarity: 'common' },
  { id: 'glowgoo',  name: 'Glowgoo',   hue: 100, topper: 'tuft',     pattern: 'stripe', rarity: 'rare'   },
  { id: 'starlex',  name: 'Starlex',   hue: 285, topper: 'horns',    pattern: 'spots',  rarity: 'epic'   },
  { id: 'cloudkin', name: 'Cloudkin',  hue: 215, topper: 'wings',    pattern: 'belly',  rarity: 'legendary' },
]

export const critterById = (id) => CRITTERS.find((c) => c.id === id)

export const RARITY_RING = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}
