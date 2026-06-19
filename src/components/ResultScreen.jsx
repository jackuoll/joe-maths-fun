import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { critterById } from '../game/critters'
import { bigCelebration } from '../game/confetti'
import Critter from './Critter'

export default function ResultScreen({ stage, result, newCritters, onNext, onMap, isLast }) {
  useEffect(() => { bigCelebration() }, [])
  const critter = newCritters[0] ? critterById(newCritters[0]) : null

  return (
    <div className="min-h-full w-full grid place-items-center px-4" style={{ background: `linear-gradient(180deg, ${stage.color2}, #fff 70%)` }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm text-center"
      >
        <h2 className="font-[family-name:var(--font-display)] font-extrabold text-3xl text-slate-800">Stage Clear!</h2>
        <p className="text-slate-500 font-semibold">{stage.emoji} {stage.title}</p>

        {/* Stars */}
        <div className="flex justify-center gap-2 my-4">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: i < result.stars ? 1.1 : 0.7, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.18, type: 'spring', stiffness: 260 }}
              className={i < result.stars ? 'text-amber-400' : 'text-slate-200'}
              style={{ fontSize: '3rem' }}
            >★</motion.span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 bg-amber-100 text-amber-700 font-bold rounded-2xl py-2.5 mb-3">
          <span className="text-2xl">🪙</span>
          <span className="text-xl">+{result.coinsEarned} coins</span>
        </div>
        <p className="text-slate-400 text-sm font-medium mb-2">
          {result.mistakes === 0 ? 'Perfect — no mistakes! 🌟' : `Finished with ${result.mistakes} slip-up${result.mistakes === 1 ? '' : 's'}. Keep practising!`}
        </p>

        {/* New critter */}
        {critter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
            className="mt-3 mb-1 bg-gradient-to-b from-fuchsia-50 to-white rounded-2xl p-3 border-2 border-fuchsia-200"
          >
            <p className="font-[family-name:var(--font-display)] font-bold text-fuchsia-600">New critter unlocked!</p>
            <div className="flex items-center justify-center gap-2">
              <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Critter critter={critter} size={96} />
              </motion.div>
              <div className="text-left">
                <p className="font-[family-name:var(--font-display)] font-extrabold text-xl text-slate-800">{critter.name}</p>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(' + critter.hue + ' 60% 45%)' }}>{critter.rarity}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onMap} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold active:scale-95 transition">Map</button>
          <button
            onClick={onNext}
            className="flex-1 py-3 rounded-2xl text-white font-bold active:scale-95 transition shadow-md"
            style={{ background: stage.color }}
          >
            {isLast ? 'Play Again' : 'Next →'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
