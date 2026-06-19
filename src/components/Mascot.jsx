// "Professor Hoot" — a friendly owl guide who shows hints and encouragement.
import { motion } from 'framer-motion'

export default function Mascot({ size = 96, mood = 'happy' }) {
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
      {/* beak + graduation cap */}
      <path d="M55 62 L65 62 L60 72 Z" fill="#f59e0b" />
      <g>
        <rect x="44" y="26" width="32" height="8" rx="2" fill="#1f2937" transform="rotate(-4 60 30)" />
        <path d="M40 26 L60 18 L80 26 L60 34 Z" fill="#111827" />
        <circle cx="80" cy="26" r="2.5" fill="#f59e0b" />
        <line x1="80" y1="26" x2="84" y2="38" stroke="#f59e0b" strokeWidth="1.6" />
      </g>
    </motion.svg>
  )
}
