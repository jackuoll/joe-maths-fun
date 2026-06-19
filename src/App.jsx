import { useEffect, useState } from 'react'
import { useGameState, todayStr } from './game/storage'
import { STAGES, DAILY_STAGE, stageIndex } from './game/stages'
import { sfx } from './game/audio'
import MapScreen from './components/MapScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'
import CollectionScreen from './components/CollectionScreen'

export default function App() {
  const { state, finishStage, hatchEgg, toggleMute, claimDaily, finishDaily, EGG_COST } = useGameState()
  const [screen, setScreen] = useState({ name: 'map' })

  useEffect(() => { sfx.setMuted(state.muted) }, [state.muted])

  const today = todayStr()
  const canClaimDaily = state.lastReward !== today
  const dailyDone = state.dailyDoneDate === today

  const play = (stage) => setScreen({ name: 'game', stage })
  const playDaily = () => setScreen({ name: 'game', stage: DAILY_STAGE })

  const handleComplete = (stage, result) => {
    if (stage.id === 'daily') {
      const bonus = state.streak * 5 // streak makes the daily worth more
      const total = result.coinsEarned + bonus
      finishDaily(total)
      setScreen({ name: 'result', stage, result: { ...result, coinsEarned: total, streakBonus: bonus }, newCritters: [], daily: true })
    } else {
      const newCritters = finishStage(stage.id, result.stars, result.coinsEarned, stage.critter)
      setScreen({ name: 'result', stage, result, newCritters })
    }
  }

  const nextAfterResult = (stage) => {
    if (stage.id === 'daily') { setScreen({ name: 'map' }); return }
    const next = STAGES[stageIndex(stage.id) + 1]
    if (next) play(next)
    else play(stage) // last stage -> play again
  }

  return (
    <div className="h-full w-full overflow-y-auto no-bar" style={{ backgroundColor: '#15161c' }}>
      {screen.name === 'map' && (
        <MapScreen
          state={state}
          onPlay={play}
          onCollection={() => setScreen({ name: 'collection' })}
          onToggleMute={toggleMute}
          canClaimDaily={canClaimDaily}
          dailyDone={dailyDone}
          onClaimDaily={claimDaily}
          onPlayDaily={playDaily}
        />
      )}

      {screen.name === 'game' && (
        <GameScreen
          key={screen.stage.id}
          stage={screen.stage}
          coins={state.coins}
          onExit={() => setScreen({ name: 'map' })}
          onComplete={(result) => handleComplete(screen.stage, result)}
        />
      )}

      {screen.name === 'result' && (
        <ResultScreen
          stage={screen.stage}
          result={screen.result}
          newCritters={screen.newCritters}
          daily={screen.daily}
          streak={state.streak}
          isLast={stageIndex(screen.stage.id) === STAGES.length - 1}
          onNext={() => nextAfterResult(screen.stage)}
          onMap={() => setScreen({ name: 'map' })}
        />
      )}

      {screen.name === 'collection' && (
        <CollectionScreen
          state={state}
          eggCost={EGG_COST}
          onHatch={hatchEgg}
          onBack={() => setScreen({ name: 'map' })}
        />
      )}
    </div>
  )
}
