import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { STAGES, isUnlocked } from '../game/stages'
import { sfx } from '../game/audio'
import layout from '../game/mapLayout.json'
import Mascot from './Mascot'

const url = (name) => `${import.meta.env.BASE_URL}map/${name}`
const stageById = (id) => STAGES.find((s) => s.id === id)

const [BGW, BGH] = layout.aspect
const VBH = (100 * BGH) / BGW // svg viewBox height that preserves aspect

// Catmull-Rom -> cubic Bezier so the road flows smoothly through every POI.
function roadPath(pts) {
  if (pts.length < 2) return ''
  const d = [`M ${pts[0].x} ${pts[0].y}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6
    d.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`)
  }
  return d.join(' ')
}

function Stars({ n }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'text-amber-300' : 'text-black/25'} style={{ fontSize: '0.85rem', textShadow: '0 1px 1px rgba(0,0,0,.5)' }}>★</span>
      ))}
    </div>
  )
}

// a decorative (non-interactive) sprite placed at x%,y% with width w% of the map
function Decor({ s }) {
  return (
    <img
      src={url(s.img)} alt="" draggable={false}
      className="absolute select-none pointer-events-none"
      style={{
        left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`,
        opacity: s.o ?? 1,
        transform: `translate(-50%,-50%) scaleX(${s.flip ? -1 : 1})`,
        filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.22))',
      }}
    />
  )
}

export default function MapScreen({ state, onPlay, onCollection, onToggleMute, canClaimDaily, dailyDone, onClaimDaily, onPlayDaily }) {
  const [hover, setHover] = useState(null)
  const [reward, setReward] = useState(null) // {coins, streak} after claiming the chest
  const totalStars = Object.values(state.stars).reduce((a, b) => a + b, 0)
  const roadPts = layout.pois.map((p) => ({ x: p.x, y: (p.y * VBH) / 100 }))

  const claim = () => {
    if (!canClaimDaily) return
    const info = onClaimDaily()
    if (info) { sfx.win?.(); setReward(info) }
  }

  return (
    <div className="min-h-full w-full" style={{ background: 'radial-gradient(120% 90% at 50% 0%, #3b4a63 0%, #1f2937 60%, #111827 100%)' }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
        {/* Header / HUD */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <Mascot size={56} />
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-3xl text-amber-300 leading-none mc-text">Number Quest</h1>
            <p className="text-slate-300/80 text-xs sm:text-sm mc-text">Choose your adventure</p>
          </div>
          <div className="mc-panel flex items-center gap-1 text-amber-800 px-2.5 py-1.5">
            <span className="text-base">🪙</span><span className="tnum text-sm">{state.coins}</span>
          </div>
          <div className="mc-panel flex items-center gap-1 text-amber-700 px-2.5 py-1.5">
            <span className="text-base">★</span><span className="tnum text-sm">{totalStars}</span>
          </div>
          <button onClick={onCollection} className="mc-panel flex items-center gap-1 text-fuchsia-800 px-2.5 py-1.5 active:translate-y-0.5">
            <span className="text-base">📒</span><span className="text-sm">{state.owned.length}/12</span>
          </button>
          <button onClick={onToggleMute} className="mc-panel w-9 h-9 grid place-items-center">
            {state.muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Daily bar: streak + reward chest + daily challenge */}
        <div className="mc-panel flex items-center gap-2 sm:gap-3 px-3 py-2 mb-4">
          <div className="flex items-center gap-1.5 text-slate-800">
            <span className="text-xl">🔥</span>
            <div className="leading-none">
              <div className="font-[family-name:var(--font-display)] text-lg leading-none">{state.streak}</div>
              <div className="text-[0.6rem] text-slate-600 leading-none">day streak</div>
            </div>
          </div>

          <button
            onClick={claim}
            disabled={!canClaimDaily}
            className={`mc-btn-gold mc-btn px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 ${canClaimDaily ? 'animate-glow' : ''}`}
          >
            <span className="text-lg">🎁</span>
            {canClaimDaily ? 'Daily Reward' : 'Claimed ✓'}
          </button>

          <button
            onClick={() => { if (!dailyDone) { sfx.click(); onPlayDaily() } }}
            disabled={dailyDone}
            className="mc-btn-green mc-btn px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 ml-auto"
          >
            <span className="text-lg">⛏️</span>
            {dailyDone ? "Done today ✓" : 'Daily Challenge'}
          </button>
        </div>

        {/* The map */}
        <div
          className="relative w-full rounded-3xl overflow-hidden"
          style={{
            aspectRatio: `${BGW} / ${BGH}`,
            boxShadow: 'inset 0 0 70px rgba(20,15,8,.55), 0 12px 30px rgba(0,0,0,.45)',
            border: '6px solid #2b2018',
            outline: '2px solid #6b5640',
          }}
        >
          {/* terrain */}
          <img src={url(layout.bg)} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />

          {/* biome ground patches + water (under the road) */}
          {layout.ground.map((s, i) => <Decor key={`g${i}`} s={s} />)}

          {/* winding road through every level */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 100 ${VBH}`} preserveAspectRatio="none">
            <path d={roadPath(roadPts)} fill="none" stroke="#4f3d22" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity="0.5" />
            <path d={roadPath(roadPts)} fill="none" stroke="#e7d3a4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity="0.9" />
          </svg>

          {/* scenery props (mountains, forests, trees) */}
          {layout.props.map((s, i) => <Decor key={`p${i}`} s={s} />)}

          {/* compass */}
          <img src={url('compass.png')} alt="" draggable={false} className="absolute select-none pointer-events-none"
            style={{ left: `${layout.compass.x}%`, top: `${layout.compass.y}%`, width: `${layout.compass.w}%`, transform: 'translate(-50%,-50%)', opacity: 0.9 }} />

          {/* level POIs */}
          {layout.pois.map((p, i) => {
            const stage = stageById(p.id)
            const unlocked = isUnlocked(stage, state.stars)
            const stars = state.stars[stage.id] || 0
            const isHover = hover === p.id
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.09, type: 'spring', stiffness: 200, damping: 16 }}
                disabled={!unlocked}
                onClick={() => { if (unlocked) { sfx.click(); onPlay(stage) } }}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover((h) => (h === p.id ? null : h))}
                className="absolute"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, transform: 'translate(-50%,-50%)', zIndex: isHover ? 40 : 30, cursor: unlocked ? 'pointer' : 'not-allowed' }}
              >
                <motion.img
                  src={url(p.img)} alt={stage.title} draggable={false}
                  whileHover={unlocked ? { y: -5, scale: 1.06 } : {}}
                  className="relative w-full select-none"
                  style={{ filter: unlocked ? 'drop-shadow(0 6px 6px rgba(0,0,0,.45))' : 'grayscale(1) brightness(.65) drop-shadow(0 4px 5px rgba(0,0,0,.45))' }}
                />

                {!unlocked && (
                  <div className="absolute inset-0 grid place-items-center pointer-events-none">
                    <span className="text-2xl sm:text-3xl drop-shadow-lg">🔒</span>
                  </div>
                )}

                {stars === 3 && (
                  <img src={url('crown.png')} alt="" draggable={false} className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ width: '32%', top: '-20%', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.5))' }} />
                )}

                {/* name ribbon */}
                <div className="absolute left-1/2 -translate-x-1/2 grid place-items-center"
                  style={{ width: '150%', top: '90%', aspectRatio: '895 / 256', backgroundImage: `url(${url('ribbon.png')})`, backgroundSize: '100% 100%', filter: unlocked ? 'none' : 'grayscale(1) brightness(.85)' }}>
                  <span className="font-[family-name:var(--font-display)] font-extrabold text-[#3a2c1c] leading-none px-2 text-center"
                    style={{ fontSize: 'clamp(0.5rem, 1.45vw, 0.95rem)', marginTop: '-7%' }}>
                    {unlocked ? stage.title : '???'}
                  </span>
                </div>

                {unlocked && stars > 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '124%' }}><Stars n={stars} /></div>
                )}

                {/* hover tooltip */}
                {isHover && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{ bottom: '116%', width: 'max(160px, 135%)' }}>
                    <div className="bg-[#fdf6e3] text-[#3a2c1c] rounded-xl shadow-xl px-3 py-2 border-2 border-[#caa86a]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{stage.emoji}</span>
                        <span className="font-[family-name:var(--font-display)] font-extrabold text-sm">{unlocked ? stage.title : 'Locked'}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#6b5b45] leading-snug mt-0.5">
                        {unlocked ? stage.blurb : 'Earn a star on the level before to unlock this one!'}
                      </p>
                      {unlocked && <p className="text-[0.65rem] font-bold text-emerald-700 mt-1">▶ Tap to play</p>}
                    </div>
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        <p className="text-center text-slate-400 text-xs mt-4 font-medium">Tap a place on the map to start that level. Earn stars to open the path ahead!</p>
      </div>

      {/* Daily reward chest popup */}
      <AnimatePresence>
        {reward && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setReward(null)}
            className="fixed inset-0 bg-black/60 grid place-items-center px-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.6, y: 20 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="mc-panel p-6 text-center max-w-xs w-full"
            >
              <motion.div animate={{ rotate: [0, -8, 8, -4, 0], y: [0, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-6xl mb-1">🎁</motion.div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-slate-800">Daily Reward!</h2>
              <p className="text-slate-700 text-sm mt-1">Day <b>{reward.streak}</b> streak 🔥</p>
              <div className="mc-slot inline-flex items-center gap-2 px-4 py-2 mt-3 text-amber-800">
                <span className="text-2xl">🪙</span>
                <span className="font-[family-name:var(--font-display)] text-xl">+{reward.coins}</span>
              </div>
              <p className="text-[0.7rem] text-slate-600 mt-3">Come back tomorrow to grow your streak!</p>
              <button onClick={() => setReward(null)} className="mc-btn mc-btn-green px-6 py-2.5 mt-4 w-full">Collect</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
