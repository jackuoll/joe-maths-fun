// "Professor Hoot" — a friendly owl guide who shows hints and encouragement.
// The hat is a cosmetic bought in the shop (see game/shop.js).
import { motion } from 'framer-motion'

// little 5-petal flower for the flower crown
const flower = (x, y, c, key) => (
  <g key={key} transform={`translate(${x} ${y})`}>
    <circle cx="0" cy="-2.4" r="2" fill={c} />
    <circle cx="2.3" cy="-0.7" r="2" fill={c} />
    <circle cx="1.4" cy="2" r="2" fill={c} />
    <circle cx="-1.4" cy="2" r="2" fill={c} />
    <circle cx="-2.3" cy="-0.7" r="2" fill={c} />
    <circle cx="0" cy="0" r="1.6" fill="#fde047" />
  </g>
)

// every hat draws inside the owl's 120x120 viewBox, sitting on the head
function Hat({ id }) {
  switch (id) {
    case 'crown':
      return (
        <g>
          <path d="M40 32 L40 18 L49 26 L60 14 L71 26 L80 18 L80 32 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="40" y="30" width="40" height="5" rx="2" fill="#f59e0b" />
          <circle cx="60" cy="16" r="2.6" fill="#ef4444" />
          <circle cx="41" cy="20" r="1.8" fill="#60a5fa" />
          <circle cx="79" cy="20" r="1.8" fill="#60a5fa" />
          <circle cx="50" cy="31" r="1.5" fill="#34d399" />
          <circle cx="70" cy="31" r="1.5" fill="#34d399" />
        </g>
      )
    case 'wizard':
      return (
        <g>
          <path d="M60 4 L46 33 L74 33 Z" fill="#6d28d9" stroke="#4c1d95" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M44 32 q16 7 32 0 l0 4 q-16 7 -32 0 Z" fill="#5b21b6" />
          <path d="M60 12 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z" fill="#fde047" />
          <circle cx="54" cy="26" r="1.4" fill="#fde047" />
          <circle cx="66" cy="22" r="1.2" fill="#fde047" />
        </g>
      )
    case 'party':
      return (
        <g>
          <path d="M60 6 L48 33 L72 33 Z" fill="#f472b6" stroke="#db2777" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="60" cy="6" r="3" fill="#38bdf8" />
          <circle cx="60" cy="16" r="1.8" fill="#fde047" />
          <circle cx="55" cy="24" r="1.8" fill="#34d399" />
          <circle cx="65" cy="24" r="1.8" fill="#fb923c" />
          <circle cx="58" cy="30" r="1.6" fill="#fde047" />
        </g>
      )
    case 'santa':
      return (
        <g>
          <path d="M38 32 C 40 16 58 9 73 13 C 80 15 83 19 82 22 L 78 24 C 70 17 54 20 47 32 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" strokeLinejoin="round" />
          <rect x="36" y="30" width="42" height="6.5" rx="3.25" fill="#f8fafc" />
          <circle cx="82" cy="22" r="4.5" fill="#f8fafc" />
        </g>
      )
    case 'propeller':
      return (
        <g>
          <path d="M40 30 a20 17 0 0 1 40 0 Z" fill="#22c55e" />
          <path d="M40 30 q20 -7 40 0" fill="none" stroke="#15803d" strokeWidth="2" />
          <rect x="37" y="28" width="46" height="5" rx="2.5" fill="#dc2626" />
          <rect x="57.5" y="9" width="5" height="8" rx="2" fill="#374151" />
          <ellipse cx="60" cy="8" rx="13" ry="2.8" fill="#ef4444" />
          <circle cx="60" cy="8.5" r="2" fill="#374151" />
        </g>
      )
    case 'flower':
      return (
        <g>
          <path d="M39 31 q21 -10 42 0" fill="none" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
          {flower(42, 30, '#f9a8d4', 'f1')}
          {flower(51, 25, '#fda4af', 'f2')}
          {flower(60, 23, '#c4b5fd', 'f3')}
          {flower(69, 25, '#fdba74', 'f4')}
          {flower(78, 30, '#f9a8d4', 'f5')}
        </g>
      )
    // ---- Minecraft block hats (drawn blocky with crisp pixel edges) ----
    case 'creeper':
      return (
        <g shapeRendering="crispEdges">
          <rect x="42" y="7" width="36" height="27" fill="#6cc349" />
          <rect x="46" y="11" width="7" height="7" fill="#7ccd56" />
          <rect x="67" y="22" width="7" height="7" fill="#5aa83d" />
          <rect x="53" y="26" width="6" height="6" fill="#5aa83d" />
          <rect x="42" y="7" width="36" height="27" fill="none" stroke="#4f8f37" strokeWidth="2" />
          {/* creeper face */}
          <rect x="49" y="13" width="7" height="7" fill="#1e2a18" />
          <rect x="64" y="13" width="7" height="7" fill="#1e2a18" />
          <rect x="57" y="19" width="6" height="8" fill="#1e2a18" />
          <rect x="51" y="25" width="6" height="6" fill="#1e2a18" />
          <rect x="63" y="25" width="6" height="6" fill="#1e2a18" />
        </g>
      )
    case 'diamond':
      return (
        <g shapeRendering="crispEdges">
          <rect x="44" y="8" width="32" height="9" fill="#43cfc4" />
          <rect x="40" y="16" width="40" height="12" fill="#4be0d4" />
          <rect x="40" y="16" width="6" height="12" fill="#86ece4" />
          <rect x="74" y="16" width="6" height="12" fill="#2bb3a8" />
          <rect x="50" y="11" width="6" height="5" fill="#c7f6f1" />
        </g>
      )
    case 'gold':
      return (
        <g shapeRendering="crispEdges">
          <rect x="44" y="8" width="32" height="9" fill="#e6b73e" />
          <rect x="40" y="16" width="40" height="12" fill="#f6cf52" />
          <rect x="40" y="16" width="6" height="12" fill="#ffe488" />
          <rect x="74" y="16" width="6" height="12" fill="#d99f2e" />
          <rect x="50" y="11" width="6" height="5" fill="#fff0bf" />
        </g>
      )
    case 'iron':
      return (
        <g shapeRendering="crispEdges">
          <rect x="44" y="8" width="32" height="9" fill="#b6bbc1" />
          <rect x="40" y="16" width="40" height="12" fill="#c7ccd1" />
          <rect x="40" y="16" width="6" height="12" fill="#e7ebee" />
          <rect x="74" y="16" width="6" height="12" fill="#8c9196" />
          <rect x="50" y="11" width="6" height="5" fill="#eef1f3" />
        </g>
      )
    case 'pumpkin':
      return (
        <g shapeRendering="crispEdges">
          <rect x="57" y="3" width="6" height="6" fill="#4f7a2a" />
          <rect x="42" y="8" width="36" height="26" fill="#e2872a" />
          <rect x="53" y="8" width="2" height="26" fill="#c9741f" />
          <rect x="65" y="8" width="2" height="26" fill="#c9741f" />
          {/* carved glowing face */}
          <polygon points="47,16 56,16 51.5,23" fill="#ffd23b" />
          <polygon points="64,16 73,16 68.5,23" fill="#ffd23b" />
          <rect x="50" y="27" width="20" height="4" fill="#ffd23b" />
          <rect x="52" y="24" width="3" height="3" fill="#ffd23b" />
          <rect x="65" y="24" width="3" height="3" fill="#ffd23b" />
        </g>
      )
    case 'tnt':
      return (
        <g shapeRendering="crispEdges">
          <rect x="42" y="8" width="36" height="26" fill="#cf3b2c" />
          <rect x="42" y="17" width="36" height="8" fill="#f0ede6" />
          <rect x="42" y="8" width="36" height="26" fill="none" stroke="#8f2419" strokeWidth="2" />
          <text x="60" y="24" textAnchor="middle" fontSize="7" fontWeight="800" fill="#2a2a2a" fontFamily="var(--font-display)">TNT</text>
        </g>
      )
    case 'graduate':
    default:
      return (
        <g>
          <rect x="44" y="26" width="32" height="8" rx="2" fill="#1f2937" transform="rotate(-4 60 30)" />
          <path d="M40 26 L60 18 L80 26 L60 34 Z" fill="#111827" />
          <circle cx="80" cy="26" r="2.5" fill="#f59e0b" />
          <line x1="80" y1="26" x2="84" y2="38" stroke="#f59e0b" strokeWidth="1.6" />
        </g>
      )
  }
}

export default function Mascot({ size = 96, mood = 'happy', hat = 'graduate' }) {
  const blink = mood === 'cheer'
  return (
    <motion.svg
      viewBox="0 0 120 120" width={size} height={size}
      animate={mood === 'cheer' ? { rotate: [0, -6, 6, 0], y: [0, -6, 0] } : { y: [0, -4, 0] }}
      transition={{ duration: mood === 'cheer' ? 0.6 : 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx="60" cy="110" rx="26" ry="6" fill="#000" opacity="0.1" />
      {/* ear tufts */}
      <path d="M38 34 L30 14 L50 28 Z" fill="#7c5cff" />
      <path d="M82 34 L90 14 L70 28 Z" fill="#7c5cff" />
      {/* body */}
      <path d="M28 60 a32 36 0 0 1 64 0 q0 34 -32 34 q-32 0 -32 -34 Z" fill="#8b6cff" />
      <ellipse cx="60" cy="74" rx="22" ry="24" fill="#ede9fe" />
      {/* wings */}
      <path d="M30 58 q-8 22 6 34 q6 -14 4 -30 Z" fill="#6d4ddb" />
      <path d="M90 58 q8 22 -6 34 q-6 -14 -4 -30 Z" fill="#6d4ddb" />
      {/* eyes */}
      <circle cx="48" cy="52" r="14" fill="#fff" />
      <circle cx="72" cy="52" r="14" fill="#fff" />
      <circle cx="48" cy="53" r={blink ? 2 : 6.5} fill="#1f2937" />
      <circle cx="72" cy="53" r={blink ? 2 : 6.5} fill="#1f2937" />
      <circle cx="50" cy="50" r="2" fill="#fff" />
      <circle cx="74" cy="50" r="2" fill="#fff" />
      {/* beak */}
      <path d="M55 62 L65 62 L60 72 Z" fill="#f59e0b" />
      {/* hat (cosmetic) */}
      <Hat id={hat} />
    </motion.svg>
  )
}
