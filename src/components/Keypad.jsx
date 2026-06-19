import { motion } from 'framer-motion'

export default function Keypad({ onDigit, disabled }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-md mx-auto">
      {Array.from({ length: 10 }, (_, d) => (
        <motion.button
          key={d}
          whileTap={{ scale: 0.9 }}
          disabled={disabled}
          onClick={() => onDigit(d)}
          className="mc-btn aspect-square grid place-items-center font-[family-name:var(--font-mono)] text-3xl sm:text-4xl select-none"
        >
          {d}
        </motion.button>
      ))}
    </div>
  )
}
