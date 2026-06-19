// Tiny Web Audio sound effects — no asset files, all synthesised. Lazily
// created on first user gesture so browsers don't block the AudioContext.

let ctx = null
let muted = false

function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)() }
    catch { return null }
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  const c = ac(); if (!c) return
  const t0 = c.currentTime + start
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t0); osc.stop(t0 + dur + 0.02)
}

export const sfx = {
  setMuted(v) { muted = v },
  isMuted() { return muted },
  unlock() { ac() },
  click() { if (!muted) tone(420, 0, 0.08, 'triangle', 0.12) },
  correct() {
    if (muted) return
    tone(523, 0, 0.12, 'triangle', 0.16)
    tone(659, 0.09, 0.12, 'triangle', 0.16)
    tone(784, 0.18, 0.18, 'triangle', 0.16)
  },
  carry() { if (!muted) { tone(880, 0, 0.1, 'sine', 0.14); tone(1175, 0.08, 0.12, 'sine', 0.12) } },
  wrong() {
    if (muted) return
    tone(196, 0, 0.18, 'sawtooth', 0.12)
    tone(160, 0.1, 0.2, 'sawtooth', 0.12)
  },
  coin() { if (!muted) { tone(988, 0, 0.07, 'square', 0.1); tone(1319, 0.06, 0.1, 'square', 0.1) } },
  win() {
    if (muted) return
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.17))
  },
  hatch() {
    if (muted) return
    tone(330, 0, 0.1, 'sine', 0.12)
    tone(440, 0.1, 0.1, 'sine', 0.13)
    tone(660, 0.22, 0.25, 'triangle', 0.16)
  },
}
