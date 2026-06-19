import { useCallback, useEffect, useState } from 'react'
import { CRITTERS } from './critters'

const KEY = 'number-quest-save-v1'

const fresh = () => ({
  coins: 0,
  stars: {},        // stageId -> best star count (0..3)
  owned: [],        // critter ids
  muted: false,
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

  const reset = useCallback(() => setState(fresh()), [])

  return { state, addCoins, finishStage, hatchEgg, toggleMute, reset, EGG_COST }
}
