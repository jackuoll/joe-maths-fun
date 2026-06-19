// Renders a collectible Minecraft pet as crisp pixel art from its sprite grid.
import { RARITY_RING } from '../game/critters'
import { PETS } from '../game/petSprites'

export default function Critter({ critter, size = 120, owned = true, className = '' }) {
  const pet = PETS[critter.sprite]

  if (!owned || !pet) {
    return (
      <svg viewBox="0 0 16 16" width={size} height={size} className={className} shapeRendering="crispEdges">
        <rect x="2" y="2" width="12" height="12" rx="2" fill="#33384a" />
        <text x="8" y="11.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#6b7280" fontFamily="Changa, sans-serif">?</text>
      </svg>
    )
  }

  const rows = pet.rows
  const H = rows.length
  const W = rows[0].length
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.35))' }}
    >
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const c = pet.pal[ch]
          return c ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={c} /> : null
        })
      )}
    </svg>
  )
}

export { RARITY_RING }
