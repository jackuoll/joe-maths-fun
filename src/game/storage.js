import { useCallback, useEffect, useState } from 'react'
import { CRITTERS } from './critters'
import { DAILY_TASKS, ALL_DONE_BONUS } from './daily'
import { DEFAULT_EQUIP, shopItemById } from './shop'

const KEY = 'number-quest-save-v1'

// ---- daily helpers (local time, midnight boundary) ----
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const todayStr = () => ymd(new Date())

const freshDaily = () => ({ date: todayStr(), plays: 0, stars: 0, perfects: 0, hatched: 0, claimed: [] })
// Roll the daily checklist over to today if it's a new day.
const rollDaily = (d) => (d && d.date === todayStr()) ? d : freshDaily()

const fresh = () => ({
  coins: 0,
  stars: {},        // stageId -> best star count (0..3)
  owned: [],        // critter ids
  purchased: [],    // shop cosmetic ids bought (free defaults excluded)
  equipped: { ...DEFAULT_EQUIP }, // { hat, theme }
  muted: false,
  daily: freshDaily(),
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = { ...fresh(), ...JSON.parse(raw) }
      s.daily = rollDaily(s.daily)
      s.equipped = { ...DEFAULT_EQUIP, ...s.equipped }
      return s
    }
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

  // Save a finished stage AND record daily-checklist progress.
  // Returns the list of newly unlocked critter ids.
  const finishStage = useCallback((stageId, stars, coinsEarned, signatureCritter) => {
    let unlocked = []
    setState((s) => {
      const bestStars = Math.max(s.stars[stageId] || 0, stars)
      const owned = new Set(s.owned)
      if (signatureCritter && !owned.has(signatureCritter)) {
        owned.add(signatureCritter)
        unlocked.push(signatureCritter)
      }
      const daily = rollDaily(s.daily)
      return {
        ...s,
        coins: s.coins + coinsEarned,
        stars: { ...s.stars, [stageId]: bestStars },
        owned: [...owned],
        daily: { ...daily, plays: daily.plays + 1, stars: daily.stars + stars, perfects: daily.perfects + (stars >= 3 ? 1 : 0) },
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
      const daily = rollDaily(s.daily)
      const locked = CRITTERS.filter((c) => !s.owned.includes(c.id))
      if (locked.length === 0) {
        // collection complete — refund into coins as a small bonus
        return { ...s, coins: s.coins - EGG_COST + 60, daily: { ...daily, hatched: daily.hatched + 1 } }
      }
      const pick = locked[Math.floor(Math.random() * locked.length)]
      hatched = pick.id
      return { ...s, coins: s.coins - EGG_COST, owned: [...s.owned, pick.id], daily: { ...daily, hatched: daily.hatched + 1 } }
    })
    return hatched
  }, [])

  // Buy a shop cosmetic. Returns true if the purchase went through.
  const buyItem = useCallback((id) => {
    let ok = false
    setState((s) => {
      const item = shopItemById(id)
      if (!item || s.purchased.includes(id) || s.coins < item.cost) return s
      ok = true
      return { ...s, coins: s.coins - item.cost, purchased: [...s.purchased, id] }
    })
    return ok
  }, [])

  // Equip an owned cosmetic into a slot ('hat' | 'theme').
  const equipItem = useCallback((slot, id) => {
    setState((s) => ({ ...s, equipped: { ...s.equipped, [slot]: id } }))
  }, [])

  const toggleMute = useCallback(() => {
    setState((s) => ({ ...s, muted: !s.muted }))
  }, [])

  // Claim a finished daily task's reward (once). Returns {coins, allDone} or null.
  const claimTask = useCallback((taskId) => {
    let info = null
    setState((s) => {
      const daily = rollDaily(s.daily)
      const task = DAILY_TASKS.find((t) => t.id === taskId)
      if (!task) return { ...s, daily }
      const done = daily[task.metric] >= task.goal
      if (!done || daily.claimed.includes(taskId)) return { ...s, daily }
      const claimed = [...daily.claimed, taskId]
      const allDone = DAILY_TASKS.every((t) => claimed.includes(t.id))
      const bonus = allDone ? ALL_DONE_BONUS : 0
      info = { coins: task.reward + bonus, allDone }
      return { ...s, coins: s.coins + task.reward + bonus, daily: { ...daily, claimed } }
    })
    return info
  }, [])

  const reset = useCallback(() => setState(fresh()), [])

  // Always expose today's daily (rolled over at midnight even before a mutation).
  const daily = rollDaily(state.daily)

  return { state, daily, addCoins, finishStage, hatchEgg, buyItem, equipItem, toggleMute, reset, claimTask, EGG_COST }
}
