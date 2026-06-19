// World map: a progression of stages from easy addition to mixed 3-digit work.
// Each stage holds a handful of problems and rewards a signature critter.

export const STAGE_PROBLEMS = 5

export const STAGES = [
  {
    id: 'meadow',
    title: 'Sunny Meadow',
    blurb: 'Add two 2-digit numbers. No carrying yet!',
    spec: { len: 2, kind: 'add-nocarry' },
    color: '#22c55e', color2: '#86efac', emoji: '🌻',
    critter: 'addybug',
  },
  {
    id: 'orchard',
    title: 'Apple Orchard',
    blurb: 'Adding where a column passes 10 — carry the 1!',
    spec: { len: 2, kind: 'add-carry' },
    color: '#f97316', color2: '#fdba74', emoji: '🍎',
    critter: 'sumling',
  },
  {
    id: 'bridge',
    title: 'Rolling River',
    blurb: 'Big 3-digit addition with carries.',
    spec: { len: 3, kind: 'add-carry' },
    color: '#0ea5e9', color2: '#7dd3fc', emoji: '🌉',
    critter: 'carrymoth',
  },
  {
    id: 'cave',
    title: 'Crystal Cave',
    blurb: 'Take away with 2-digit subtraction. No borrowing.',
    spec: { len: 2, kind: 'sub-noborrow' },
    color: '#14b8a6', color2: '#5eead4', emoji: '💎',
    critter: 'borrobear',
  },
  {
    id: 'peak',
    title: 'Frosty Peak',
    blurb: 'Subtraction where you must borrow 10.',
    spec: { len: 2, kind: 'sub-borrow' },
    color: '#6366f1', color2: '#a5b4fc', emoji: '🏔️',
    critter: 'minusmole',
  },
  {
    id: 'castle',
    title: 'Star Castle',
    blurb: 'The big test: 3-digit add AND subtract, mixed!',
    spec: { len: 3, kind: 'mix' },
    color: '#a855f7', color2: '#d8b4fe', emoji: '🏰',
    critter: 'digitdrake',
  },
]

export const stageIndex = (id) => STAGES.findIndex((s) => s.id === id)

// stars on the previous stage unlock the next one
export function isUnlocked(stage, stars) {
  const idx = stageIndex(stage.id)
  if (idx === 0) return true
  const prev = STAGES[idx - 1]
  return (stars[prev.id] || 0) > 0
}
