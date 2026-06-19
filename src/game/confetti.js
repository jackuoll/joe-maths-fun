import confetti from 'canvas-confetti'

export function burst(x = 0.5, y = 0.5) {
  confetti({
    particleCount: 70,
    spread: 75,
    startVelocity: 38,
    origin: { x, y },
    colors: ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#a78bfa'],
    scalar: 0.9,
  })
}

export function bigCelebration() {
  const end = Date.now() + 900
  const tick = () => {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#fbbf24', '#f472b6', '#34d399'] })
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#60a5fa', '#a78bfa', '#fb7185'] })
    if (Date.now() < end) requestAnimationFrame(tick)
  }
  tick()
}
