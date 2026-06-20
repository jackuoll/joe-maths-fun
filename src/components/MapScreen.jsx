import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { STAGES, isUnlocked } from '../game/stages'
import { DAILY_TASKS } from '../game/daily'
import { themeGradient } from '../game/shop'
import { sfx } from '../game/audio'
import layout from '../game/mapLayout.json'
import Mascot from './Mascot'

const url = (name) => `${import.meta.env.BASE_URL}map/${name}`
const ui = (name) => `${import.meta.env.BASE_URL}ui/${name}`
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

export default function MapScreen({ state, daily, onPlay, onCollection, onShop, onToggleMute, onClaimTask }) {
  const [hover, setHover] = useState(null)
  const [showTasks, setShowTasks] = useState(false)
  const [bonus, setBonus] = useState(false) // all-tasks-done chest popup
  const totalStars = Object.values(state.stars).reduce((a, b) => a + b, 0)
  const roadPts = layout.pois.map((p) => ({ x: p.x, y: (p.y * VBH) / 100 }))

  const doneCount = DAILY_TASKS.filter((t) => daily[t.metric] >= t.goal).length
  const claimTask = (t) => {
    const info = onClaimTask(t.id)
    if (info) { sfx.win?.(); if (info.allDone) setBonus(true) }
  }

  return (
    <div className="min-h-full w-full" style={{ background: themeGradient(state.equipped.theme) }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
        {/* Header / HUD */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <Mascot size={56} hat={state.equipped.hat} />
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-3xl text-amber-300 leading-none mc-text">Number Quest</h1>
            <p className="text-slate-300/80 text-xs sm:text-sm mc-text">Choose your adventure</p>
          </div>
          <div className="mc-chip gap-1 text-amber-300 px-3 py-1.5">
            <span className="text-base">🪙</span><span className="tnum text-sm">{state.coins}</span>
          </div>
          <div className="mc-chip gap-1 text-amber-200 px-3 py-1.5">
            <span className="text-base">★</span><span className="tnum text-sm">{totalStars}</span>
          </div>
          <button onClick={onCollection} className="mc-chip gap-1 text-fuchsia-200 px-3 py-1.5 active:translate-y-0.5">
            <span className="text-base">📒</span><span className="text-sm">{state.owned.length}/12</span>
          </button>
          <button onClick={() => { sfx.click(); onShop() }} className="mc-chip gap-1 text-amber-200 px-3 py-1.5 active:translate-y-0.5">
            <span className="text-base">🛒</span><span className="text-sm hidden sm:inline">Shop</span>
          </button>
          <button onClick={onToggleMute} className="mc-chip w-9 h-9 grid place-items-center">
            {state.muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Daily tasks bar (opens the checklist) */}
        <button
          onClick={() => { sfx.click(); setShowTasks(true) }}
          className={`mc-bar w-full flex items-center gap-3 px-2 py-1.5 mb-4 active:translate-y-0.5 ${doneCount > daily.claimed.length ? 'animate-glow' : ''}`}
        >
          <div className="relative shrink-0 grid place-items-center" style={{ width: 42, height: 38, backgroundImage: `url(${ui('icon-frame.png')})`, backgroundSize: '100% 100%' }}>
            <img src={ui('chest.png')} alt="" className="w-6 h-6 object-contain" draggable={false} />
          </div>
          <div className="text-left leading-tight flex-1">
            <div className="font-[family-name:var(--font-display)] text-slate-100">Daily Tasks</div>
            <div className="text-[0.7rem] text-slate-300">{daily.claimed.length}/{DAILY_TASKS.length} rewards collected</div>
          </div>
          <span className="mc-chip text-amber-200 px-3 py-1 text-sm">{doneCount}/{DAILY_TASKS.length} done</span>
        </button>

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

      {/* Daily tasks checklist */}
      <AnimatePresence>
        {showTasks && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowTasks(false)}
            className="fixed inset-0 bg-black/60 grid place-items-center px-5 z-50"
          >
            <motion.div
              initial={{ scale: 0.7, y: 20 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mc-panel-dark w-full max-w-[420px] pt-7 pb-5 px-3"
            >
              {/* Title banner: wide + short so the long title isn't squashed against
                  the side decorations. Sits high, lower half straddling the top edge. */}
              <div className="absolute left-1/2 -top-10 -translate-x-1/2 z-10" style={{ width: 214 }}>
                <img src={ui('title-wing-l.png')} alt="" draggable={false} className="absolute -left-11 select-none" style={{ zIndex: -1, width: 64, height: 26, top: 8 }} />
                <img src={ui('title-wing-r.png')} alt="" draggable={false} className="absolute -right-11 select-none" style={{ zIndex: -1, width: 64, height: 26, top: 8 }} />
                <div className="grid place-items-center" style={{ height: 62, backgroundImage: `url(${ui('title-center.png')})`, backgroundSize: '100% 100%' }}>
                  <span className="font-[family-name:var(--font-display)] text-base text-amber-100 mc-text pb-0.5">Daily Tasks</span>
                </div>
              </div>

              {/* Close knob - its centre aligns with the panel's top-right corner */}
              <button
                onClick={() => setShowTasks(false)} aria-label="Close"
                className="absolute w-12 h-12 grid place-items-center active:translate-y-0.5 z-20"
                style={{ top: -52, right: -49, backgroundImage: `url(${ui('knob.png')})`, backgroundSize: '100% 100%' }}
              >
                <span className="text-stone-800 text-lg font-black leading-none" style={{ textShadow: '0 1px 0 rgba(255,255,255,.25)' }}>✕</span>
              </button>

              {/* Recessed inner panel the tasks sit on (matches the kit's popups) */}
              <div className="rounded-2xl px-2.5 py-2" style={{ background: 'rgba(0,0,0,.24)', boxShadow: 'inset 0 2px 7px rgba(0,0,0,.55), inset 0 0 0 2px rgba(0,0,0,.16)' }}>
              <div className="flex flex-col gap-1.5">
                {DAILY_TASKS.map((t) => {
                  const prog = Math.min(daily[t.metric], t.goal)
                  const pct = Math.round((prog / t.goal) * 100)
                  const done = prog >= t.goal
                  const claimed = daily.claimed.includes(t.id)
                  return (
                    <div key={t.id} className="flex items-center gap-2.5 py-1">
                      <div className="relative shrink-0 grid place-items-center" style={{ width: 50, height: 45, backgroundImage: `url(${ui('icon-frame.png')})`, backgroundSize: '100% 100%' }}>
                        <span className="text-2xl" style={{ filter: done ? 'none' : 'grayscale(.45)' }}>{t.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-100 text-sm leading-tight font-[family-name:var(--font-display)]">{t.label}</div>
                        <div className="mt-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,.4)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.55)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(180deg,#ffb454,#ef8a2b)' }} />
                        </div>
                        <div className="text-[0.65rem] text-slate-300 mt-0.5">{prog}/{t.goal} · reward 🪙{t.reward}</div>
                      </div>
                      {claimed ? (
                        <div className="shrink-0 w-12 h-9 grid place-items-center rounded-lg" style={{ background: 'rgba(0,0,0,.32)', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,.3)' }}>
                          <span className="text-emerald-400 text-xl font-black">✓</span>
                        </div>
                      ) : (
                        <button onClick={() => claimTask(t)} disabled={!done} className={`shrink-0 px-1.5 py-0.5 text-xs font-[family-name:var(--font-display)] mc-btn ${done ? 'mc-btn-green-sm' : 'mc-btn-brown-sm'}`}>
                          {done ? 'Claim' : `${prog}/${t.goal}`}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All tasks done bonus */}
      <AnimatePresence>
        {bonus && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBonus(false)}
            className="fixed inset-0 bg-black/60 grid place-items-center px-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.6, y: 20 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="mc-panel-dark p-6 text-center max-w-xs w-full"
            >
              <motion.img
                src={ui('chest-open.png')} alt="" draggable={false}
                animate={{ scale: [0.9, 1.05, 1], y: [0, -4, 0] }} transition={{ duration: 0.6 }}
                className="w-28 h-28 object-contain mx-auto mb-1 animate-floaty"
              />
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-amber-200 mc-text">All Tasks Done!</h2>
              <p className="text-slate-300 text-sm mt-1">You collected the bonus chest 🪙</p>
              <button onClick={() => setBonus(false)} className="mc-btn mc-btn-green px-6 py-2.5 mt-4 w-full">Yay!</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
