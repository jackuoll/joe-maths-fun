import { useCallback, useEffect, useState } from 'react'
import { CRITTERS } from './critters'

const KEY = 'number-quest-save-v1'

// ---- daily helpers (local time, midnight boundary) ----
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const todayStr = () => ymd(new Date())
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymd(d) }
// daily chest grows with the streak, capped so it stays sensible
export const dailyRewardCoins = (streak) => 20 + Math.min(streak, 7) * 10

const fresh = () => ({
  coins: 0,
  stars: {},        // stageId -> best star count (0..3)
  owned: [],        // critter ids
  muted: false,
  streak: 0,        // consecutive days played
  lastReward: '',   // YYYY-MM-DD of last claimed daily chest
  dailyDoneDate: '',// YYYY-MM-DD the daily challenge was last completed
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...fresh(), ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return fresh()
}

export function useGameState() {
  const [state, setState] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const addCoins = useCallback((n) => {
    setState((s) => ({ ...s, coins: s.coins + n }))
  }, [])

  // Save a finished stage. Returns the list of newly unlocked critter ids.
  const finishStage = useCallback((stageId, stars, coinsEarned, signatureCritter) => {
    let unlocked = []
    setState((s) => {
      const bestStars = Math.max(s.stars[stageId] || 0, stars)
      const owned = new Set(s.owned)
      if (signatureCritter && !owned.has(signatureCritter)) {
        owned.add(signatureCritter)
        unlocked.push(signatureCritter)
      }
      return {
        ...s,
        coins: s.coins + coinsEarned,
        stars: { ...s.stars, [stageId]: bestStars },
        owned: [...owned],
      }
    })
    return unlocked
  }, [])

  // Spend coins to hatch a random un-owned critter. Returns critter id or null.
  const EGG_COST = 50
  const hatchEgg = useCallback(() => {
    let hatched = null
    setState((s) => {
      if (s.coins < EGG_COST) return s
      const locked = CRITTERS.filter((c) => !s.owned.includes(c.id))
      if (locked.length === 0) {
        // collection complete — refund into coins as a small bonus
        return { ...s, coins: s.coins - EGG_COST + 60 }
      }
      const pick = locked[Math.floor(Math.random() * locked.length)]
      hatched = pick.id
      return { ...s, coins: s.coins - EGG_COST, owned: [...s.owned, pick.id] }
    })
    return hatched
  }, [])

  const toggleMute = useCallback(() => {
    setState((s) => ({ ...s, muted: !s.muted }))
  }, [])

  // Claim the daily reward chest (once per local day). Returns {coins, streak} or
  // null if already claimed today.
  const claimDaily = useCallback(() => {
    let info = null
    setState((s) => {
      const today = todayStr()
      if (s.lastReward === today) return s
      const streak = s.lastReward === yesterdayStr() ? s.streak + 1 : 1
      const reward = dailyRewardCoins(streak)
      info = { coins: reward, streak }
      return { ...s, coins: s.coins + reward, lastReward: today, streak }
    })
    return info
  }, [])

  // Mark today's Daily Challenge complete and bank the bonus coins.
  const finishDaily = useCallback((coinsEarned) => {
    setState((s) => ({ ...s, coins: s.coins + coinsEarned, dailyDoneDate: todayStr() }))
  }, [])

  const reset = useCallback(() => setState(fresh()), [])

  return { state, addCoins, finishStage, hatchEgg, toggleMute, reset, claimDaily, finishDaily, EGG_COST }
}
