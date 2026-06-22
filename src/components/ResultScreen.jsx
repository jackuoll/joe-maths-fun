import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { critterById, RARITY_RING } from '../game/critters'
import { bigCelebration } from '../game/confetti'
import { HEART_FILLED, HEART_EMPTY } from '../game/battleSprites'
import Critter from './Critter'
import PixelSprite from './PixelSprite'

const ui = (name) => `${import.meta.env.BASE_URL}ui/${name}`

export default function ResultScreen({ stage, result, newCritters, onNext, onMap, isLast }) {
  useEffect(() => { bigCelebration() }, [])
  const critter = newCritters[0] ? critterById(newCritters[0]) : null

  return (
    <div className="min-h-full w-full grid place-items-center px-4" style={{ background: `linear-gradient(180deg, ${stage.color}cc, #1c1e26 70%)` }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="mc-panel p-7 w-full max-w-sm text-center"
      >
        <motion.img
          src={ui('txt-complete.png')} alt="Stage Clear!" draggable={false}
          initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 12 }}
          className="w-56 max-w-[80%] mx-auto -mt-2 mb-1 object-contain"
        />
        <p className="text-slate-600 font-[family-name:var(--font-display)]">{stage.emoji} {stage.title}</p>

        {/* Stars */}
        <div className="flex justify-center gap-2 my-4">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: i < result.stars ? 1.1 : 0.7, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.18, type: 'spring', stiffness: 260 }}
              className={i < result.stars ? 'text-amber-400' : 'text-slate-300'}
              style={{ fontSize: '3rem' }}
            >★</motion.span>
          ))}
        </div>

        <div className="mc-slot flex items-center justify-center gap-2 text-amber-800 py-2.5 mb-3">
          <span className="text-2xl">🪙</span>
          <span className="text-xl">+{result.coinsEarned} coins</span>
        </div>

        {/* Hero health + defeated mob */}
        {result.heartsLeft != null && (
          <div className="mb-2">
            <div className="flex justify-center gap-1 mb-1">
              {Array.from({ length: result.maxHearts }, (_, i) => (
                <PixelSprite key={i} sprite={i < result.heartsLeft ? HEART_FILLED : HEART_EMPTY} size={22} />
              ))}
            </div>
            {result.enemyName && (
              <p className="text-slate-600 font-[family-name:var(--font-display)] text-sm">
                You defeated the {result.enemyName}! ⚔️
              </p>
            )}
          </div>
        )}

        <p className="text-slate-500 text-sm mb-2">
          {result.mistakes === 0 ? 'Perfect — no hearts lost! 🌟' : `Lost ${result.mistakes} heart${result.mistakes === 1 ? '' : 's'}. Keep practising!`}
        </p>

        {/* New critter */}
        {critter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
            className="mc-slot mt-3 mb-1 p-3"
          >
            <p className="font-[family-name:var(--font-display)] text-fuchsia-700">New mob unlocked!</p>
            <div className="flex items-center justify-center gap-2">
              <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Critter critter={critter} size={96} />
              </motion.div>
              <div className="text-left">
                <p className="font-[family-name:var(--font-display)] text-xl text-slate-800">{critter.name}</p>
                <p className="text-xs uppercase tracking-wide" style={{ color: RARITY_RING[critter.rarity] }}>{critter.rarity}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onMap} className="mc-btn flex-1 py-3">Map</button>
          <button onClick={onNext} className="mc-btn mc-btn-green flex-1 py-3">
            {isLast ? 'Play Again' : 'Next →'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
