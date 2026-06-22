// Renders any { pal, rows } pixel sprite as crisp SVG pixels. Shared by the
// battle banner, hearts and anywhere else that needs a sprite outside the
// collectible-critter flow.
export default function PixelSprite({ sprite, size = 64, flip = false, className = '', style }) {
  if (!sprite) return null
  const { pal, rows } = sprite
  const H = rows.length
  const W = rows[0].length
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      style={{
        imageRendering: 'pixelated',
        transform: flip ? 'scaleX(-1)' : undefined,
        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.35))',
        ...style,
      }}
    >
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const c = pal[ch]
          return c ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={c} /> : null
        })
      )}
    </svg>
  )
}
