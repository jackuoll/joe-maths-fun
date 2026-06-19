// Daily checklist: a few simple goals that reset every local day. All are
// level-agnostic so they can be finished on easy levels - nothing forces the
// harder borrowing levels.
export const DAILY_TASKS = [
  { id: 'play2',    label: 'Play 2 levels',        metric: 'plays',    goal: 2, reward: 20, icon: '⚔️' },
  { id: 'stars5',   label: 'Earn 5 stars',         metric: 'stars',    goal: 5, reward: 30, icon: '⭐' },
  { id: 'perfect1', label: 'Ace a level (3 stars)', metric: 'perfects', goal: 1, reward: 25, icon: '🏅' },
  { id: 'hatch1',   label: 'Hatch a mob',          metric: 'hatched',  goal: 1, reward: 25, icon: '🥚' },
]

// bonus for ticking off the whole checklist
export const ALL_DONE_BONUS = 50
