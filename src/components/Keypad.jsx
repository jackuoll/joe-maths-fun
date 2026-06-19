import { motion } from 'framer-motion'

export default function Keypad({ onDigit, disabled, accent = '#6366f1' }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-md mx-auto">
      {Array.from({ length: 10 }, (_, d) => (
        <motion.button
          key={d}
          whileTap={{ scale: 0.88 }}
          disabled={disabled}
          onClick={() => onDigit(d)}
          className="aspect-square rounded-2xl font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed select-none"
          style={{ background: `linear-gradient(160deg, ${accent}, ${accent}cc)`, boxShadow: `0 4px 0 ${accent}88` }}
        >
          {d}
        </motion.button>
      ))}
    </div>
  )
}
