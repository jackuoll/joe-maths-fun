import { motion } from 'framer-motion'
import { STAGES, isUnlocked } from '../game/stages'
import { critterById } from '../game/critters'
import { sfx } from '../game/audio'
import Mascot from './Mascot'
import Critter from './Critter'

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'text-amber-400' : 'text-slate-300'} style={{ fontSize: '1rem' }}>★</span>
      ))}
    </div>
  )
}

export default function MapScreen({ state, onPlay, onCollection, onToggleMute }) {
  const totalStars = Object.values(state.stars).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-full w-full" style={{ background: 'linear-gradient(180deg,#bae6fd,#e0f2fe 30%,#f0fdf4)' }}>
      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Mascot size={64} />
            <div>
              <h1 className="font-[family-name:var(--font-display)] font-extrabold text-2xl sm:text-3xl text-indigo-600 leading-none">Number Quest</h1>
              <p className="text-slate-500 font-semibold text-sm">Long Addition & Subtraction</p>
            </div>
          </div>
          <button onClick={onToggleMute} className="w-10 h-10 grid place-items-center rounded-full bg-white shadow text-lg active:scale-90 transition">
            {state.muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Stat bar */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 flex items-center justify-center gap-1.5 bg-amber-100 text-amber-700 font-bold rounded-2xl py-2 shadow-sm">
            <span className="text-xl">🪙</span><span className="tnum text-lg">{state.coins}</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-50 text-amber-500 font-bold rounded-2xl py-2 shadow-sm">
            <span className="text-xl">★</span><span className="tnum text-lg">{totalStars}</span>
          </div>
          <button onClick={onCollection} className="flex-1 flex items-center justify-center gap-1.5 bg-fuchsia-100 text-fuchsia-700 font-bold rounded-2xl py-2 shadow-sm active:scale-95 transition">
            <span className="text-xl">📒</span><span>{state.owned.length}/12</span>
          </button>
        </div>

        {/* Stage path */}
        <div className="relative">
          <div className="absolute left-8 top-6 bottom-6 w-1.5 bg-white/70 rounded-full" />
          <div className="flex flex-col gap-4">
            {STAGES.map((stage, i) => {
              const unlocked = isUnlocked(stage, state.stars)
              const stars = state.stars[stage.id] || 0
              const critter = critterById(stage.critter)
              return (
                <motion.button
                  key={stage.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  disabled={!unlocked}
                  onClick={() => { if (unlocked) { sfx.click(); onPlay(stage) } }}
                  className={`relative flex items-center gap-3 text-left rounded-3xl p-3 pr-4 shadow-md transition ${unlocked ? 'bg-white active:scale-[0.98]' : 'bg-slate-100'}`}
                >
                  <div
                    className="relative w-16 h-16 rounded-2xl grid place-items-center text-3xl shrink-0 shadow-inner"
                    style={{ background: unlocked ? `linear-gradient(150deg, ${stage.color}, ${stage.color2})` : '#cbd5e1' }}
                  >
                    {unlocked ? stage.emoji : '🔒'}
                    {stars === 3 && <span className="absolute -top-2 -right-2 text-lg">👑</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className={`font-[family-name:var(--font-display)] font-bold text-lg truncate ${unlocked ? 'text-slate-800' : 'text-slate-400'}`}>{stage.title}</h2>
                      {unlocked && stars > 0 && <Stars n={stars} />}
                    </div>
                    <p className={`text-sm font-medium leading-tight ${unlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                      {unlocked ? stage.blurb : 'Earn a star on the previous level to unlock!'}
                    </p>
                  </div>
                  <div className="shrink-0 opacity-90">
                    <Critter critter={critter} size={48} owned={state.owned.includes(stage.critter)} />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6 font-medium">Tip: solve each column from the right. When adding, type the whole total (like 11) and watch the tens digit carry up!</p>
      </div>
    </div>
  )
}
