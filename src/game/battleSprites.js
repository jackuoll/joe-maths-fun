// Pixel-art sprites for the in-level battle: a Minecraft-style hero who fights a
// randomised hostile mob. Drawn as crisp SVG pixels by components/PixelSprite.jsx
// (same 8x8 convention as petSprites.js). Some enemies are reused from PETS so we
// don't duplicate their art.
import { PETS } from './petSprites'

// Steve-style hero head.
export const HERO = {
  pal: { h: '#4a3522', s: '#c8956a', a: '#a8754e', w: '#ffffff', b: '#3b6fb0', m: '#7a4a30' },
  rows: [
    'hhhhhhhh',
    'hhhhhhhh',
    'ssssssss',
    'swbssbws',
    'ssssssss',
    'ssaaaass',
    'ssmmmmss',
    'ssssssss',
  ],
}

// New hostile mobs (the friendly PETS are reused below for the rest).
const ZOMBIE = {
  pal: { g: '#6a9b54', G: '#4e7a3e', k: '#142414' },
  rows: [
    'GGGGGGGG',
    'GGGGGGGG',
    'gggggggg',
    'gkggggkg',
    'gggggggg',
    'gggggggg',
    'gkkkkkkg',
    'gggggggg',
  ],
}

const SKELETON = {
  pal: { w: '#e8e8e0', W: '#b6b6ac', k: '#202020' },
  rows: [
    '.wwwwww.',
    'wwwwwwww',
    'wkwwwwkw',
    'wwwWWwww',
    'wwwwwwww',
    'wkwkwkkw',
    'wwwwwwww',
    '.wwwwww.',
  ],
}

const SPIDER = {
  pal: { k: '#2a2018', K: '#3a2e22', r: '#e0402a', l: '#4a4038' },
  rows: [
    'l......l',
    '.lkkkkl.',
    'lkkkkkkl',
    'krkkkkrk',
    'kkkkkkkk',
    'lkkkkkkl',
    '.lkkkkl.',
    'l......l',
  ],
}

const BLAZE = {
  pal: { y: '#f5d020', o: '#ef8a1a', k: '#6a3a10' },
  rows: [
    '.o.oo.o.',
    'oyoyyoyo',
    'yyyyyyyy',
    'ykyyyyky',
    'yyyyyyyy',
    'oyyyyyyo',
    '.oyyyyo.',
    'o.o..o.o',
  ],
}

// The pool the level picks from at random. `boss` mobs are tougher-looking.
export const ENEMIES = [
  { id: 'zombie',   name: 'Zombie',       sprite: ZOMBIE },
  { id: 'skeleton', name: 'Skeleton',     sprite: SKELETON },
  { id: 'spider',   name: 'Cave Spider',  sprite: SPIDER },
  { id: 'blaze',    name: 'Blaze',        sprite: BLAZE },
  { id: 'creeper',  name: 'Creeper',      sprite: PETS.creeper },
  { id: 'enderman', name: 'Enderman',     sprite: PETS.enderman },
  { id: 'slime',    name: 'Slime',        sprite: PETS.slime },
  { id: 'dragon',   name: 'Ender Dragon', sprite: PETS.enderdragon, boss: true },
]

export const randomEnemy = () => ENEMIES[Math.floor(Math.random() * ENEMIES.length)]

// Minecraft-style hearts (black outline, red fill) for the hero's health row.
export const HEART_FILLED = {
  pal: { k: '#4a1010', H: '#e23b3b', h: '#ff8f8f' },
  rows: [
    '.kk.kk.',
    'kHhHHHk',
    'kHHHHHk',
    'kHHHHHk',
    '.kHHHk.',
    '..kHk..',
    '...k...',
  ],
}

export const HEART_EMPTY = {
  pal: { k: '#2b2b35', H: '#191921', h: '#191921' },
  rows: HEART_FILLED.rows,
}
