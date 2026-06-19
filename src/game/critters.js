// Collectible Minecraft pets. Each renders as pixel art (see petSprites.js +
// components/Critter.jsx). 12 total: 6 are stage rewards, 6 hatch from eggs.
// `id`s are kept stable so existing saves keep their unlocked pets.

export const CRITTERS = [
  { id: 'addybug',   name: 'Piglet',      rarity: 'common',    sprite: 'pig' },
  { id: 'sumling',   name: 'Chick',       rarity: 'common',    sprite: 'chicken' },
  { id: 'carrymoth', name: 'Bumblebee',   rarity: 'rare',      sprite: 'bee' },
  { id: 'borrobear', name: 'Wolf Pup',    rarity: 'common',    sprite: 'wolf' },
  { id: 'minusmole', name: 'Polar Cub',   rarity: 'common',    sprite: 'polarbear' },
  { id: 'digitdrake',name: 'Enderman',    rarity: 'epic',      sprite: 'enderman' },
  { id: 'tentopus',  name: 'Slime',       rarity: 'rare',      sprite: 'slime' },
  { id: 'zerozoom',  name: 'Calf',        rarity: 'common',    sprite: 'cow' },
  { id: 'pluppy',    name: 'Axolotl',     rarity: 'common',    sprite: 'axolotl' },
  { id: 'glowgoo',   name: 'Creeper',     rarity: 'rare',      sprite: 'creeper' },
  { id: 'starlex',   name: 'Diamond',     rarity: 'epic',      sprite: 'diamond' },
  { id: 'cloudkin',  name: 'Ender Dragon',rarity: 'legendary', sprite: 'enderdragon' },
]

export const critterById = (id) => CRITTERS.find((c) => c.id === id)

export const RARITY_RING = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}
