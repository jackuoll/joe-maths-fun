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

  const mistakesRef = useRef(0)
  const lockRef = useRef(false)

  const len = problem.len
  const steps = problem.steps
  const active = steps[stepIndex]
  const totalCols = problem.gridCols + 1 // +1 left gutter for the operator
  const topDigits = useMemo(() => toDigits(problem.a, len), [problem, len])
  const botDigits = useMemo(() => toDigits(problem.b, len), [problem, len])
  const answerCols = useMemo(() => new Set(steps.map((s) => s.gridCol)), [steps])
  const colToCi = useCallback((g) => (problem.op === '+' ? g - 1 : g), [problem.op])

  const progress = ((pIndex + stepIndex / steps.length) / STAGE_PROBLEMS) * 100

  // ---- advance to the next problem or finish the stage --------------------
  const completeProblem = useCallback(() => {
    if (pIndex + 1 >= STAGE_PROBLEMS) {
      const m = mistakesRef.current
      const stars = m === 0 ? 3 : m <= 2 ? 2 : 1
      const coinsEarned = STAGE_PROBLEMS * 8 + stars * 10
      sfx.win()
      setTimeout(() => onComplete({ stars, coinsEarned, mistakes: m }), 400)
    } else {
      setTimeout(() => {
        setProblem(buildProblem(stage.spec))
        setPIndex((i) => i + 1)
        setStepIndex(0)
        setPlaced({}); setCarryChips({}); setDisplayMap({})
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

  // ---- activation: borrow visuals + auto leading carry + prompt -----------
  useEffect(() => {
    if (!active) return
    setSpeech(active.prompt)
    setBuffer('')

    if (problem.op === '-' && active.need) {
      setDisplayMap((m) => {
        const nm = { ...m, [active.gridCol]: { value: active.shownTop, kind: 'plus10' } }
        const nb = steps.find((s) => s.ci === active.ci - 1)
        if (nb) nm[nb.gridCol] = { value: nb.top, kind: 'reduced', base: nb.da }
        return nm
      })
      sfx.carry()
    }

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
    return (
      <div className="grid place-items-center tnum font-[family-name:var(--font-display)] font-bold text-slate-700" style={{ height: cw, fontSize: '2.1rem' }}>
        {base ?? ''}
      </div>
    )
  }

  return (
    <div className="min-h-full w-full flex flex-col" style={{ background: `linear-gradient(180deg, ${stage.color2}55, #f8fafc 55%)` }}>
      {/* HUD */}
      <div className="flex items-center gap-3 px-4 pt-4 max-w-2xl w-full mx-auto">
        <button onClick={onExit} className="w-10 h-10 grid place-items-center rounded-full bg-white shadow text-slate-500 text-xl font-bold active:scale-90 transition">←</button>
        <div className="flex-1">
          <div className="flex justify-between text-sm font-semibold text-slate-500 mb-1">
            <span className="font-[family-name:var(--font-display)]">{stage.emoji} {stage.title}</span>
            <span>Problem {pIndex + 1} / {STAGE_PROBLEMS}</span>
          </div>
          <div className="h-3 rounded-full bg-white/70 overflow-hidden shadow-inner">
            <motion.div className="h-full rounded-full" style={{ background: stage.color }} animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-amber-100 text-amber-700 font-bold rounded-full px-3 py-1.5 shadow-sm">
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
            className="relative flex-1 bg-white rounded-2xl rounded-bl-none shadow-md px-4 py-3 text-slate-700 font-semibold min-h-[3.5rem] flex items-center"
          >
            {speech || 'Let’s solve it column by column — start with the ones!'}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The calculation */}
      <div className="flex-1 grid place-items-center px-4 py-6">
        <div className="bg-white rounded-3xl shadow-xl px-5 sm:px-8 py-6">
          <div className="grid gap-x-1" style={{ gridTemplateColumns: `repeat(${totalCols}, ${cw})` }}>
            {/* carry row */}
            {Array.from({ length: totalCols }, (_, gi) => {
              const g = gi - 1
              const chip = g >= 0 ? carryChips[g] : null
              return (
                <div key={`c${gi}`} className="grid place-items-center" style={{ height: '1.6rem' }}>
                  <AnimatePresence>
                    {chip && (
                      <motion.span
                        initial={{ y: 18, opacity: 0, scale: 0.4 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        className="text-sm font-extrabold text-rose-500 bg-rose-100 rounded-full w-6 h-6 grid place-items-center shadow"
                      >1</motion.span>
                    )}
                  </AnimatePresence>
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
