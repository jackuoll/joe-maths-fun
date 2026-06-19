import { useEffect, useState } from 'react'
import { useGameState } from './game/storage'
import { STAGES, stageIndex } from './game/stages'
import { sfx } from './game/audio'
import MapScreen from './components/MapScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'
import CollectionScreen from './components/CollectionScreen'

export default function App() {
  const { state, daily, finishStage, hatchEgg, toggleMute, claimTask, EGG_COST } = useGameState()
  const [screen, setScreen] = useState({ name: 'map' })

  useEffect(() => { sfx.setMuted(state.muted) }, [state.muted])

  const play = (stage) => setScreen({ name: 'game', stage })

  const handleComplete = (stage, result) => {
    const newCritters = finishStage(stage.id, result.stars, result.coinsEarned, stage.critter)
    setScreen({ name: 'result', stage, result, newCritters })
  }

  const nextAfterResult = (stage) => {
    const next = STAGES[stageIndex(stage.id) + 1]
    if (next) play(next)
    else play(stage) // last stage -> play again
  }

  return (
    <div className="h-full w-full overflow-y-auto no-bar" style={{ backgroundColor: '#15161c' }}>
      {screen.name === 'map' && (
        <MapScreen
          state={state}
          daily={daily}
          onPlay={play}
          onCollection={() => setScreen({ name: 'collection' })}
          onToggleMute={toggleMute}
          onClaimTask={claimTask}
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
