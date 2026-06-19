import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { buildProblem } from '../game/problems'
import { STAGE_PROBLEMS } from '../game/stages'
import { sfx } from '../game/audio'
import Keypad from './Keypad'
import Mascot from './Mascot'

const toDigits = (n, len) => String(n).padStart(len, '0').split('').map(Number)

function hintFor(step) {
  if (step.op === '+') {
    return `Not quite — what is ${step.da} + ${step.db}${step.carryIn ? ` + ${step.carryIn}` : ''}? Type the whole answer.`
  }
  return `Not quite. Work out ${step.shownTop} − ${step.db}. Count up if it helps!`
}

export default function GameScreen({ stage, coins, onExit, onComplete }) {
  const [pIndex, setPIndex] = useState(0)
  const [problem, setProblem] = useState(() => buildProblem(stage.spec))
  const [stepIndex, setStepIndex] = useState(0)
  const [placed, setPlaced] = useState({})
  const [carryChips, setCarryChips] = useState({})
  const [displayMap, setDisplayMap] = useState({})
  const [shake, setShake] = useState(null)
  const [locked, setLocked] = useState(false)
  const [speech, setSpeech] = useState('')
  const [mood, setMood] = useState('happy')
  const [buffer, setBuffer] = useState('')      // digits typed for the current + column
  const [splitAnim, setSplitAnim] = useState(null) // {gridCol, tens, ones} carry split anim
  const [borrowedCols, setBorrowedCols] = useState(() => new Set()) // gridCols already regrouped
  const [flyTen, setFlyTen] = useState(null)    // gridCol the "10" is sliding into
  const [colStep, setColStep] = useState(56)    // px between column centres (for the slide)

  const mistakesRef = useRef(0)
  const lockRef = useRef(false)
  const gridRef = useRef(null)

  const len = problem.len
  const steps = problem.steps
  const active = steps[stepIndex]
  const totalCols = problem.gridCols + 1 // +1 left gutter for the operator
  const topDigits = useMemo(() => toDigits(problem.a, len), [problem, len])
  const botDigits = useMemo(() => toDigits(problem.b, len), [problem, len])
  const answerCols = useMemo(() => new Set(steps.map((s) => s.gridCol)), [steps])
  const colToCi = useCallback((g) => (problem.op === '+' ? g - 1 : g), [problem.op])

  // a subtraction column whose top is too small, with the regroup not yet done
  const awaitingBorrow = !!(active && problem.op === '-' && active.need && !borrowedCols.has(active.gridCol))
  const borrowSourceCi = awaitingBorrow ? active.ci - 1 : null // the neighbour the child taps

  const problemCount = stage.problems ?? STAGE_PROBLEMS
  const progress = ((pIndex + stepIndex / steps.length) / problemCount) * 100

  // ---- measure column spacing so the "10" can slide one column to the right --
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const measure = () => {
      const cell = (el.clientWidth - (totalCols - 1) * 4) / totalCols // gap-x-1 = 4px
      setColStep(cell + 4)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [totalCols])

  // ---- advance to the next problem or finish the stage --------------------
  const completeProblem = useCallback(() => {
    if (pIndex + 1 >= problemCount) {
      const m = mistakesRef.current
      const stars = m === 0 ? 3 : m <= 2 ? 2 : 1
      const coinsEarned = problemCount * 8 + stars * 10
      sfx.win()
      setTimeout(() => onComplete({ stars, coinsEarned, mistakes: m }), 400)
    } else {
      setTimeout(() => {
        setProblem(buildProblem(stage.spec))
        setPIndex((i) => i + 1)
        setStepIndex(0)
        setPlaced({}); setCarryChips({}); setDisplayMap({})
        setBorrowedCols(new Set()); setFlyTen(null)
        lockRef.current = false; setLocked(false)
        setSpeech('')
      }, 850)
    }
  }, [pIndex, stage.spec, onComplete])

  const goNext = useCallback(() => {
    const next = stepIndex + 1
    if (next >= steps.length) completeProblem()
    else { setStepIndex(next); lockRef.current = false; setLocked(false) }
  }, [stepIndex, steps.length, completeProblem])

  const wrong = useCallback((step) => {
    mistakesRef.current += 1
    setShake(step.gridCol)
    setMood('think')
    setSpeech(hintFor(step))
    sfx.wrong()
    setTimeout(() => setShake(null), 450)
  }, [])

  // ---- handle a digit press ------------------------------------------------
  const handleDigit = useCallback((d) => {
    if (lockRef.current) return
    const step = steps[stepIndex]
    if (!step || step.leading) return

    // ----- ADDITION: type the FULL column total, then split off the carry ---
    if (step.op === '+') {
      const target = String(step.total)        // e.g. "11" for 5 + 6
      const nb = buffer + String(d)
      if (target.slice(0, nb.length) !== nb) { wrong(step); return } // keep good prefix
      setBuffer(nb)

      if (nb.length < target.length) { sfx.click(); return } // need the next digit

      // full total entered correctly
      lockRef.current = true; setLocked(true)
      setMood('cheer')
      setSpeech(step.reveal)
      const ones = step.result

      if (step.carryOut) {
        sfx.correct()
        setSplitAnim({ gridCol: step.gridCol, tens: step.tens, ones })
        setTimeout(() => { setCarryChips((c) => ({ ...c, [step.ci]: 1 })); sfx.carry() }, 300)
        setTimeout(() => {
          setPlaced((p) => ({ ...p, [step.gridCol]: ones }))
          setBuffer(''); setSplitAnim(null)
        }, 760)
        setTimeout(goNext, 1080)
      } else {
        sfx.correct()
        setPlaced((p) => ({ ...p, [step.gridCol]: ones }))
        setBuffer('')
        setTimeout(goNext, 560)
      }
      return
    }

    // ----- SUBTRACTION: single difference digit -----------------------------
    if (d !== step.result) { wrong(step); return }
    lockRef.current = true; setLocked(true)
    setPlaced((p) => ({ ...p, [step.gridCol]: d }))
    setSpeech(step.reveal)
    setMood('cheer')
    sfx.correct()
    setTimeout(goNext, 560)
  }, [steps, stepIndex, buffer, wrong, goNext])

  // ---- the child performs the regroup themselves -------------------------
  const performBorrow = useCallback(() => {
    if (!active || problem.op !== '-' || !active.need || borrowedCols.has(active.gridCol)) return
    const nb = steps.find((s) => s.ci === active.ci - 1)
    sfx.carry()
    setMood('cheer')
    // the neighbour gives up a ten right away (3 → 2, original struck through)
    setDisplayMap((m) => {
      const nm = { ...m }
      if (nb) nm[nb.gridCol] = { value: nb.top, kind: 'reduced', base: nb.da }
      return nm
    })
    setFlyTen(active.gridCol)
    setBorrowedCols((s) => { const n = new Set(s); n.add(active.gridCol); return n })
    // ...and the ten lands in this column, turning e.g. 4 into 14
    setTimeout(() => {
      setDisplayMap((m) => ({ ...m, [active.gridCol]: { value: active.shownTop, kind: 'plus10' } }))
    }, 360)
    setTimeout(() => {
      setFlyTen(null)
      setSpeech(`Now we have ${active.shownTop} − ${active.db}. What does that make?`)
      lockRef.current = false; setLocked(false)
    }, 560)
  }, [active, problem.op, borrowedCols, steps])

  // ---- activation: prompt + leading carry; borrows wait for a tap ----------
  useEffect(() => {
    if (!active) return
    setBuffer('')

    // too small to subtract: ask the child to regroup, lock the keypad until they do
    if (problem.op === '-' && active.need && !borrowedCols.has(active.gridCol)) {
      const nb = steps.find((s) => s.ci === active.ci - 1)
      lockRef.current = true; setLocked(true)
      setMood('think')
      setSpeech(`${active.top} − ${active.db}? We can't take ${active.db} from ${active.top}! Tap the glowing ${nb ? nb.place : 'next'} digit to borrow a ten.`)
      return
    }

    setSpeech(active.prompt)

    if (active.leading) {
      lockRef.current = true; setLocked(true)
      const t = setTimeout(() => {
        setPlaced((p) => ({ ...p, [active.gridCol]: 1 }))
        sfx.carry()
        setTimeout(() => {
          const next = stepIndex + 1
          if (next >= steps.length) completeProblem()
          else { setStepIndex(next); lockRef.current = false; setLocked(false) }
        }, 650)
      }, 650)
      return () => clearTimeout(t)
    }
  }, [stepIndex, problem]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- physical keyboard ---------------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(Number(e.key))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleDigit])

  const cw = 'clamp(2.4rem, 11vw, 3.8rem)'

  // ---- a single digit cell -------------------------------------------------
  const TopCell = ({ g }) => {
    const ci = colToCi(g)
    const base = ci >= 0 && ci < len ? topDigits[ci] : null
    const ov = displayMap[g]
    if (ov) {
      if (ov.kind === 'reduced') {
        return (
          <div className="relative grid place-items-center tnum font-[family-name:var(--font-display)] font-bold text-slate-700" style={{ height: cw, fontSize: '1.9rem' }}>
            <span className="absolute text-slate-300 line-through" style={{ fontSize: '1.9rem' }}>{ov.base}</span>
            <span className="absolute -top-1 right-1 text-orange-500" style={{ fontSize: '1.05rem' }}>{ov.value}</span>
          </div>
        )
      }
      // plus10
      return (
        <div className="grid place-items-center tnum font-[family-name:var(--font-display)] font-extrabold text-orange-500 animate-pop" style={{ height: cw, fontSize: '1.9rem' }}>
          {ov.value}
        </div>
      )
    }
    // the neighbour the child taps to borrow a ten
    if (g === borrowSourceCi) {
      return (
        <button
          onClick={performBorrow}
          className="grid place-items-center tnum font-[family-name:var(--font-display)] font-extrabold text-orange-600 rounded-xl animate-pulse"
          style={{ height: cw, fontSize: '2.1rem', boxShadow: '0 0 0 3px #fb923c, 0 0 14px 2px #fdba7488' }}
        >
          {base ?? ''}
        </button>
      )
    }
    // the column that is too small, waiting for its ten
    if (awaitingBorrow && g === active.ci) {
      return (
        <div className="grid place-items-center tnum font-[family-name:var(--font-display)] font-bold text-rose-400 rounded-xl" style={{ height: cw, fontSize: '2.1rem', boxShadow: 'inset 0 0 0 2px #fda4af' }}>
          {base ?? ''}
        </div>
      )
    }
    return (
      <div className="grid place-items-center tnum font-[family-name:var(--font-display)] font-bold text-slate-700" style={{ height: cw, fontSize: '2.1rem' }}>
        {base ?? ''}
      </div>
    )
  }

  return (
    <div className="min-h-full w-full flex flex-col" style={{ background: `linear-gradient(180deg, ${stage.color}cc, ${stage.color2}66 35%, #1c1e26 70%)` }}>
      {/* HUD */}
      <div className="flex items-center gap-3 px-4 pt-4 max-w-2xl w-full mx-auto">
        <button onClick={onExit} className="mc-btn w-10 h-10 grid place-items-center text-xl">←</button>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-white mc-text mb-1">
            <span className="font-[family-name:var(--font-display)]">{stage.emoji} {stage.title}</span>
            <span>Problem {pIndex + 1} / {problemCount}</span>
          </div>
          <div className="mc-slot h-4 overflow-hidden">
            <motion.div className="h-full" style={{ background: 'linear-gradient(180deg,#9ad24f,#5b8a3a)' }} animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
        </div>
        <div className="mc-chip gap-1 text-amber-300 px-3 py-1.5">
          <span className="text-lg">🪙</span><span className="tnum">{coins}</span>
        </div>
      </div>

      {/* Speech bubble + mascot */}
      <div className="max-w-2xl w-full mx-auto px-4 mt-3 flex items-end gap-2">
        <Mascot size={72} mood={mood} />
        <AnimatePresence mode="popLayout">
          <motion.div
            key={speech}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex-1 mc-panel-dark px-4 py-3 text-slate-100 min-h-[3.5rem] flex items-center text-sm sm:text-base"
          >
            {speech || 'Let’s solve it column by column — start with the ones!'}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The calculation */}
      <div className="flex-1 grid place-items-center px-4 py-6">
        <div className="mc-panel px-5 sm:px-8 py-6">
          <div ref={gridRef} className="grid gap-x-1" style={{ gridTemplateColumns: `repeat(${totalCols}, ${cw})` }}>
            {/* carry row */}
            {Array.from({ length: totalCols }, (_, gi) => {
              const g = gi - 1
              const chip = g >= 0 ? carryChips[g] : null
              return (
                <div key={`c${gi}`} className="relative grid place-items-center" style={{ height: '1.6rem' }}>
                  <AnimatePresence>
                    {chip && (
                      <motion.span
                        initial={{ y: 18, opacity: 0, scale: 0.4 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        className="text-sm font-extrabold text-rose-500 bg-rose-100 rounded-full w-6 h-6 grid place-items-center shadow"
                      >1</motion.span>
                    )}
                  </AnimatePresence>
                  {/* a ten sliding in from the neighbour on the left */}
                  {flyTen === g && (
                    <motion.span
                      initial={{ x: -colStep, opacity: 0, scale: 0.5 }}
                      animate={{ x: 0, opacity: [0, 1, 1], scale: 1 }}
                      transition={{ duration: 0.42, ease: 'easeOut' }}
                      className="absolute text-xs font-extrabold text-white bg-rose-500 rounded-full px-2 h-6 grid place-items-center shadow-md"
                    >+10</motion.span>
                  )}
                </div>
              )
            })}

            {/* top number */}
            {Array.from({ length: totalCols }, (_, gi) => (
              gi === 0 ? <div key={`t${gi}`} /> : <TopCell key={`t${gi}`} g={gi - 1} />
            ))}

            {/* bottom number (gutter shows operator) */}
            {Array.from({ length: totalCols }, (_, gi) => {
              if (gi === 0) {
                return (
                  <div key={`b${gi}`} className="grid place-items-center font-[family-name:var(--font-display)] font-extrabold" style={{ height: cw, fontSize: '2rem', color: stage.color }}>
                    {problem.op === '+' ? '+' : '−'}
                  </div>
                )
              }
              const ci = colToCi(gi - 1)
              const base = ci >= 0 && ci < len ? botDigits[ci] : null
              return (
                <div key={`b${gi}`} className="grid place-items-center tnum font-[family-name:var(--font-display)] font-bold text-slate-700" style={{ height: cw, fontSize: '2.1rem' }}>
                  {base ?? ''}
                </div>
              )
            })}

            {/* divider */}
            <div style={{ gridColumn: '1 / -1' }} className="h-1.5 rounded-full my-1" />
            <div style={{ gridColumn: '1 / -1', background: stage.color }} className="h-1.5 rounded-full -mt-2 mb-1" />

            {/* result row */}
            {Array.from({ length: totalCols }, (_, gi) => {
              if (gi === 0) return <div key={`r${gi}`} />
              const g = gi - 1
              const isAnswer = answerCols.has(g)
              const val = placed[g]
              const isActive = active && active.gridCol === g && !active.leading
              const isSplit = splitAnim && splitAnim.gridCol === g
              const showBuffer = isActive && active.op === '+' && buffer && val === undefined && !isSplit
              const filled = val !== undefined || isSplit
              return (
                <div key={`r${gi}`} className="grid place-items-center" style={{ height: cw }}>
                  {isAnswer ? (
                    <div
                      className={`relative w-[82%] h-[82%] rounded-xl grid place-items-center tnum font-[family-name:var(--font-display)] font-extrabold ${shake === g ? 'animate-shake' : ''}`}
                      style={{
                        fontSize: '2.1rem',
                        background: filled ? `${stage.color}22` : '#f1f5f9',
                        boxShadow: isActive && !isSplit ? `0 0 0 3px ${stage.color}` : 'inset 0 0 0 2px #e2e8f0',
                        color: stage.color,
                      }}
                    >
                      {isSplit ? (
                        <>
                          <span className="animate-pop">{splitAnim.ones}</span>
                          <motion.span
                            initial={{ y: 0, x: 0, opacity: 1 }}
                            animate={{ y: -58, x: -38, opacity: 0, scale: 0.75 }}
                            transition={{ duration: 0.55, delay: 0.12, ease: 'easeIn' }}
                            className="absolute text-rose-500"
                            style={{ fontSize: '1.5rem' }}
                          >{splitAnim.tens}</motion.span>
                        </>
                      ) : val !== undefined ? (
                        <span className="animate-pop">{val}</span>
                      ) : showBuffer ? (
                        <span style={{ fontSize: buffer.length > 1 ? '1.45rem' : '2.1rem' }}>{buffer}</span>
                      ) : isActive ? (
                        <span className="opacity-40 animate-pulse">?</span>
                      ) : ''}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="px-4 pb-6 pt-2 max-w-2xl w-full mx-auto">
        <Keypad onDigit={handleDigit} disabled={locked} accent={stage.color} />
      </div>
    </div>
  )
}
