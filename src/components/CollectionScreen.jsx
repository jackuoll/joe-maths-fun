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
    <div className="min-h-full w-full" style={{ background: 'linear-gradient(180deg,#fae8ff,#f5f3ff 40%,#fff)' }}>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 grid place-items-center rounded-full bg-white shadow text-slate-500 text-xl font-bold active:scale-90 transition">←</button>
          <h1 className="font-[family-name:var(--font-display)] font-extrabold text-2xl text-fuchsia-600">Critter Collection</h1>
          <div className="ml-auto flex items-center gap-1 bg-amber-100 text-amber-700 font-bold rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-lg">🪙</span><span className="tnum">{state.coins}</span>
          </div>
        </div>

        {/* Egg hatch */}
        <div className="bg-white rounded-3xl shadow-md p-4 mb-5 flex items-center gap-4">
          <motion.div animate={{ rotate: [0, -4, 4, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} className="text-5xl">🥚</motion.div>
          <div className="flex-1">
            <p className="font-[family-name:var(--font-display)] font-bold text-slate-800">Mystery Egg</p>
            <p className="text-sm text-slate-500 font-medium">
              {allOwned ? 'You caught them all! Hatch for bonus coins.' : `Spend ${eggCost} coins to hatch a random critter.`}
            </p>
          </div>
          <button
            onClick={hatch}
            disabled={!canHatch}
            className="px-5 py-3 rounded-2xl text-white font-bold shadow-md active:scale-95 transition disabled:opacity-40"
            style={{ background: 'linear-gradient(150deg,#d946ef,#a855f7)' }}
          >Hatch 🪙{eggCost}</button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {CRITTERS.map((c) => {
            const owned = state.owned.includes(c.id)
            return (
              <div key={c.id} className={`rounded-2xl p-2 flex flex-col items-center shadow-sm ${owned ? 'bg-white' : 'bg-slate-100'}`}>
                <Critter critter={c} size={84} owned={owned} />
                <span className={`font-[family-name:var(--font-display)] font-bold text-sm mt-1 ${owned ? 'text-slate-700' : 'text-slate-400'}`}>
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
              className="bg-white rounded-3xl p-7 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-[family-name:var(--font-display)] font-bold text-fuchsia-600 text-lg">It hatched!</p>
              <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                <Critter critter={revealed} size={150} />
              </motion.div>
              <p className="font-[family-name:var(--font-display)] font-extrabold text-2xl text-slate-800">{revealed.name}</p>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'hsl(' + revealed.hue + ' 60% 45%)' }}>{revealed.rarity}</p>
              <button onClick={() => setReveal(null)} className="px-6 py-2.5 rounded-2xl bg-fuchsia-500 text-white font-bold active:scale-95 transition">Yay!</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
