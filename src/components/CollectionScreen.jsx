import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CRITTERS } from '../game/critters'
import { sfx } from '../game/audio'
import { burst } from '../game/confetti'
import Critter from './Critter'

export default function CollectionScreen({ state, onBack, onHatch, eggCost }) {
  const [reveal, setReveal] = useState(null) // critter id just hatched
  const canHatch = state.coins >= eggCost
  const allOwned = state.owned.length >= CRITTERS.length

  const hatch = () => {
    if (!canHatch) return
    sfx.click()
    const id = onHatch()
    if (id) {
      sfx.hatch()
      burst(0.5, 0.4)
      setReveal(id)
    }
  }

  const revealed = reveal ? CRITTERS.find((c) => c.id === reveal) : null

  return (
    <div className="min-h-full w-full" style={{ background: 'radial-gradient(120% 90% at 50% 0%, #3b4a63 0%, #1f2937 60%, #111827 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="mc-btn w-10 h-10 grid place-items-center text-xl">←</button>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-fuchsia-300 mc-text">Critter Collection</h1>
          <div className="mc-panel ml-auto flex items-center gap-1 text-amber-800 px-3 py-1.5">
            <span className="text-lg">🪙</span><span className="tnum">{state.coins}</span>
          </div>
        </div>

        {/* Egg hatch */}
        <div className="mc-panel p-4 mb-5 flex items-center gap-4">
          <motion.div animate={{ rotate: [0, -4, 4, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} className="text-5xl">🥚</motion.div>
          <div className="flex-1">
            <p className="font-[family-name:var(--font-display)] text-slate-800 text-lg">Mystery Egg</p>
            <p className="text-sm text-slate-600">
              {allOwned ? 'You caught them all! Hatch for bonus coins.' : `Spend ${eggCost} coins to hatch a random critter.`}
            </p>
          </div>
          <button onClick={hatch} disabled={!canHatch} className="mc-btn mc-btn-green px-5 py-3">Hatch 🪙{eggCost}</button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {CRITTERS.map((c) => {
            const owned = state.owned.includes(c.id)
            return (
              <div key={c.id} className="mc-slot p-2 flex flex-col items-center">
                <Critter critter={c} size={84} owned={owned} />
                <span className={`font-[family-name:var(--font-display)] text-sm mt-1 ${owned ? 'text-slate-800' : 'text-slate-500'}`}>
                  {owned ? c.name : '???'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hatch reveal overlay */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setReveal(null)}
            className="fixed inset-0 bg-black/50 grid place-items-center px-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="mc-panel p-7 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-[family-name:var(--font-display)] text-fuchsia-700 text-lg">It hatched!</p>
              <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                <Critter critter={revealed} size={150} />
              </motion.div>
              <p className="font-[family-name:var(--font-display)] text-2xl text-slate-800">{revealed.name}</p>
              <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'hsl(' + revealed.hue + ' 60% 40%)' }}>{revealed.rarity}</p>
              <button onClick={() => setReveal(null)} className="mc-btn mc-btn-green px-6 py-2.5">Yay!</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
