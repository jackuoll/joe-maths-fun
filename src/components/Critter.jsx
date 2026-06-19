// Procedurally-drawn collectible critter. One compact SVG, themed by hue.
import { RARITY_RING } from '../game/critters'

function Topper({ kind, dark, mid }) {
  switch (kind) {
    case 'antennae':
      return (
        <g stroke={dark} strokeWidth="3" fill={dark}>
          <line x1="50" y1="34" x2="42" y2="14" />
          <line x1="70" y1="34" x2="78" y2="14" />
          <circle cx="42" cy="12" r="5" />
          <circle cx="78" cy="12" r="5" />
        </g>
      )
    case 'horns':
      return (
        <g fill={dark}>
          <path d="M44 36 L36 12 L52 30 Z" />
          <path d="M76 36 L84 12 L68 30 Z" />
        </g>
      )
    case 'ears':
      return (
        <g fill={mid}>
          <ellipse cx="42" cy="22" rx="11" ry="16" />
          <ellipse cx="78" cy="22" rx="11" ry="16" />
        </g>
      )
    case 'leaf':
      return (
        <g>
          <line x1="60" y1="30" x2="60" y2="14" stroke={dark} strokeWidth="3" />
          <path d="M60 16 q16 -10 22 2 q-14 10 -22 -2 Z" fill="#4ade80" />
        </g>
      )
    case 'tuft':
      return (
        <g fill={dark}>
          <path d="M50 30 q-6 -18 6 -22 q-2 10 6 8 q-2 -14 8 -14 q-2 12 8 10 q4 12 -6 18 Z" />
        </g>
      )
    case 'wings':
      return (
        <g fill={mid} opacity="0.9">
          <ellipse cx="26" cy="66" rx="16" ry="24" transform="rotate(-20 26 66)" />
          <ellipse cx="94" cy="66" rx="16" ry="24" transform="rotate(20 94 66)" />
        </g>
      )
    default:
      return null
  }
}

function Pattern({ kind, light, dark }) {
  switch (kind) {
    case 'belly':
      return <ellipse cx="60" cy="78" rx="22" ry="20" fill={light} />
    case 'spots':
      return (
        <g fill={dark} opacity="0.55">
          <circle cx="44" cy="80" r="6" />
          <circle cx="74" cy="86" r="5" />
          <circle cx="62" cy="68" r="4" />
        </g>
      )
    case 'stripe':
      return <path d="M34 74 q26 14 52 0 l0 10 q-26 14 -52 0 Z" fill={dark} opacity="0.45" />
    default:
      return null
  }
}

export default function Critter({ critter, size = 120, owned = true, className = '' }) {
  const { hue, topper, pattern, rarity } = critter
  const body = `hsl(${hue} 70% 60%)`
  const dark = `hsl(${hue} 60% 42%)`
  const mid = `hsl(${hue} 72% 70%)`
  const light = `hsl(${hue} 85% 88%)`

  if (!owned) {
    return (
      <svg viewBox="0 0 120 120" width={size} height={size} className={className}>
        <ellipse cx="60" cy="100" rx="30" ry="7" fill="#000" opacity="0.08" />
        <path d="M30 70 a30 34 0 0 1 60 0 q0 26 -30 26 q-30 0 -30 -26 Z" fill="#cbd5e1" />
        <text x="60" y="80" textAnchor="middle" fontSize="34" fontWeight="800" fill="#94a3b8" fontFamily="Baloo 2">?</text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className}>
      <ellipse cx="60" cy="104" rx="30" ry="7" fill="#000" opacity="0.1" />
      <circle cx="60" cy="60" r="56" fill="none" stroke={RARITY_RING[rarity]} strokeWidth="3" strokeDasharray="4 6" opacity="0.5" />
      <Topper kind={topper} dark={dark} mid={mid} />
      {/* feet */}
      <ellipse cx="46" cy="100" rx="9" ry="7" fill={dark} />
      <ellipse cx="74" cy="100" rx="9" ry="7" fill={dark} />
      {/* body */}
      <path d="M30 66 a30 34 0 0 1 60 0 q0 30 -30 30 q-30 0 -30 -30 Z" fill={body} />
      <Pattern kind={pattern} light={light} dark={dark} />
      {/* cheeks */}
      <circle cx="42" cy="68" r="6" fill="#fb7185" opacity="0.55" />
      <circle cx="78" cy="68" r="6" fill="#fb7185" opacity="0.55" />
      {/* eyes */}
      <g>
        <ellipse cx="50" cy="56" rx="9" ry="10" fill="#fff" />
        <ellipse cx="70" cy="56" rx="9" ry="10" fill="#fff" />
        <circle cx="51" cy="58" r="4.5" fill="#1f2937" />
        <circle cx="69" cy="58" r="4.5" fill="#1f2937" />
        <circle cx="52.5" cy="56" r="1.6" fill="#fff" />
        <circle cx="70.5" cy="56" r="1.6" fill="#fff" />
      </g>
      {/* smile */}
      <path d="M52 72 q8 8 16 0" fill="none" stroke="#1f2937" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}
