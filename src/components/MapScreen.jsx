import { useState } from 'react'
import { motion } from 'framer-motion'
import { STAGES, isUnlocked } from '../game/stages'
import { sfx } from '../game/audio'
import Mascot from './Mascot'

const url = (name) => `${import.meta.env.BASE_URL}map/${name}`

// Where each level sits on the island (% of the map), which POI sprite it uses,
// and how big to draw it. Tuned against public/map/bg.png (the grass island).
const MAP = {
  meadow:  { x: 31, y: 27, poi: 'poi-meadow.png',  w: 15 },
  orchard: { x: 54, y: 19, poi: 'poi-orchard.png', w: 12 },
  bridge:  { x: 73, y: 38, poi: 'poi-river.png',   w: 16 },
  cave:    { x: 59, y: 55, poi: 'poi-cave.png',    w: 12 },
  peak:    { x: 40, y: 64, poi: 'poi-peak.png',    w: 12, snow: true },
  castle:  { x: 54, y: 81, poi: 'poi-castle.png',  w: 18 },
}

// Biome ground patches (drawn under the road) and scenery props (over the road,
// under the POIs). Coordinates are % of the map; w is width in % of the map.
const GROUND = [
  { img: 'snow.png', x: 40, y: 66, w: 26, o: 0.85 },
  { img: 'lake.png', x: 80, y: 47, w: 17 },
  { img: 'lake.png', x: 70, y: 30, w: 9, o: 0.9 },
]
const PROPS = [
  { img: 'mtn-big.png', x: 82, y: 20, w: 20 },
  { img: 'mtn1.png',    x: 70, y: 17, w: 11 },
  { img: 'rocky.png',   x: 66, y: 56, w: 19 },
  { img: 'mtn2.png',    x: 53, y: 49, w: 10 },
  { img: 'forest.png',  x: 47, y: 26, w: 17 },
  { img: 'tree1.png',   x: 24, y: 38, w: 7 },
  { img: 'tree2.png',   x: 38, y: 35, w: 6 },
  { img: 'tree3.png',   x: 64, y: 68, w: 6 },
  { img: 'tree1.png',   x: 30, y: 58, w: 6, flip: true },
  { img: 'tree2.png',   x: 47, y: 75, w: 6 },
  { img: 'mtn1.png',    x: 33, y: 70, w: 12 },
]

// Catmull-Rom -> cubic Bezier, so the road flows smoothly through every POI.
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

function Stars({ n, size = '0.9rem' }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'text-amber-300' : 'text-black/25'} style={{ fontSize: size, textShadow: '0 1px 1px rgba(0,0,0,.4)' }}>★</span>
      ))}
    </div>
  )
}

export default function MapScreen({ state, onPlay, onCollection, onToggleMute }) {
  const [hover, setHover] = useState(null)
  const totalStars = Object.values(state.stars).reduce((a, b) => a + b, 0)

  const roadPts = STAGES.map((s) => ({ x: MAP[s.id].x, y: MAP[s.id].y }))

  return (
    <div className="min-h-full w-full" style={{ background: 'radial-gradient(120% 90% at 50% 0%, #3b4a63 0%, #1f2937 60%, #111827 100%)' }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
        {/* Header / HUD */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <Mascot size={56} />
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl sm:text-2xl text-amber-200 leading-none" style={{ textShadow: '0 2px 6px rgba(0,0,0,.5)' }}>Number Quest</h1>
            <p className="text-slate-300/80 font-semibold text-xs sm:text-sm">Choose your adventure</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-100 text-amber-700 font-bold rounded-full px-2.5 py-1 shadow">
            <span className="text-base">🪙</span><span className="tnum text-sm">{state.coins}</span>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 text-amber-600 font-bold rounded-full px-2.5 py-1 shadow">
            <span className="text-base">★</span><span className="tnum text-sm">{totalStars}</span>
          </div>
          <button onClick={onCollection} className="flex items-center gap-1 bg-fuchsia-100 text-fuchsia-700 font-bold rounded-full px-2.5 py-1 shadow active:scale-95 transition">
            <span className="text-base">📒</span><span className="text-sm">{state.owned.length}/12</span>
          </button>
          <button onClick={onToggleMute} className="w-9 h-9 grid place-items-center rounded-full bg-white/90 shadow active:scale-90 transition">
            {state.muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* The map */}
        <div
          className="relative w-full rounded-3xl overflow-hidden"
          style={{
            aspectRatio: '1500 / 1187',
            background: 'radial-gradient(130% 110% at 50% 40%, #6b8aa3 0%, #4f7287 55%, #3c5a6e 100%)',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,.45), 0 12px 30px rgba(0,0,0,.45)',
            border: '6px solid #2b2018',
            outline: '2px solid #6b5640',
          }}
        >
          {/* island artwork */}
          <img src={url('bg.png')} alt="" draggable={false} className="absolute inset-0 w-full h-full select-none pointer-events-none" />

          {/* biome ground patches */}
          {GROUND.map((g, i) => (
            <img key={`g${i}`} src={url(g.img)} alt="" draggable={false}
              className="absolute select-none pointer-events-none"
              style={{ left: `${g.x}%`, top: `${g.y}%`, width: `${g.w}%`, opacity: g.o ?? 1, transform: 'translate(-50%,-50%)' }} />
          ))}

          {/* winding road through every level */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={roadPath(roadPts)} fill="none" stroke="#5a4528" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.45" />
            <path d={roadPath(roadPts)} fill="none" stroke="#e7d3a4" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.85" />
            <path d={roadPath(roadPts)} fill="none" stroke="#8a6f44" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 5" vectorEffect="non-scaling-stroke" opacity="0.7" />
          </svg>

          {/* scenery props */}
          {PROPS.map((p, i) => (
            <img key={`p${i}`} src={url(p.img)} alt="" draggable={false}
              className="absolute select-none pointer-events-none"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, transform: `translate(-50%,-50%) scaleX(${p.flip ? -1 : 1})`, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,.25))' }} />
          ))}

          {/* compass rose */}
          <img src={url('compass.png')} alt="" draggable={false}
            className="absolute select-none pointer-events-none"
            style={{ left: '90%', top: '85%', width: '12%', transform: 'translate(-50%,-50%)', opacity: 0.9 }} />

          {/* level POIs */}
          {STAGES.map((stage, i) => {
            const m = MAP[stage.id]
            const unlocked = isUnlocked(stage, state.stars)
            const stars = state.stars[stage.id] || 0
            const isHover = hover === stage.id
            return (
              <motion.button
                key={stage.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200, damping: 16 }}
                disabled={!unlocked}
                onClick={() => { if (unlocked) { sfx.click(); onPlay(stage) } }}
                onMouseEnter={() => setHover(stage.id)}
                onMouseLeave={() => setHover((h) => (h === stage.id ? null : h))}
                className="absolute group"
                style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, transform: 'translate(-50%,-60%)', zIndex: isHover ? 40 : 30, cursor: unlocked ? 'pointer' : 'not-allowed' }}
              >
                {/* snow ground for cold levels */}
                {m.snow && (
                  <img src={url('snow.png')} alt="" draggable={false}
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ width: '170%', bottom: '-30%', opacity: 0.9 }} />
                )}

                {/* the building */}
                <motion.img
                  src={url(m.poi)} alt={stage.title} draggable={false}
                  whileHover={unlocked ? { y: -4, scale: 1.05 } : {}}
                  className="relative w-full select-none"
                  style={{ filter: unlocked ? 'drop-shadow(0 6px 6px rgba(0,0,0,.4))' : 'grayscale(1) brightness(.7) drop-shadow(0 4px 4px rgba(0,0,0,.4))' }}
                />

                {/* lock badge */}
                {!unlocked && (
                  <div className="absolute inset-0 grid place-items-center pointer-events-none">
                    <span className="text-2xl sm:text-3xl drop-shadow-lg">🔒</span>
                  </div>
                )}

                {/* crown for a mastered level */}
                {stars === 3 && (
                  <img src={url('crown.png')} alt="" draggable={false}
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ width: '34%', top: '-22%', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.5))' }} />
                )}

                {/* name ribbon */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 grid place-items-center"
                  style={{ width: '155%', top: '92%', aspectRatio: '895 / 256', backgroundImage: `url(${url('ribbon.png')})`, backgroundSize: '100% 100%', filter: unlocked ? 'none' : 'grayscale(1) brightness(.85)' }}
                >
                  <span
                    className="font-[family-name:var(--font-display)] font-extrabold text-[#3a2c1c] leading-none px-2 text-center"
                    style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.95rem)', marginTop: '-6%' }}
                  >
                    {unlocked ? stage.title : '???'}
                  </span>
                </div>

                {/* stars under the ribbon */}
                {unlocked && stars > 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '128%' }}>
                    <Stars n={stars} />
                  </div>
                )}

                {/* hover tooltip */}
                {isHover && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    style={{ bottom: '118%', width: 'max(160px, 130%)' }}
                  >
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

        <p className="text-center text-slate-400 text-xs mt-4 font-medium">Tap a glowing place on the map to start that level. Earn stars to open the path ahead!</p>
      </div>
    </div>
  )
}
