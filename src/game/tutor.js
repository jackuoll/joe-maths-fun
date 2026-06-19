// Talks to the local tutor bridge (tutor/server.mjs) and handles voice via the
// browser's Web Speech API. Everything degrades gracefully: if the bridge isn't
// running (e.g. on the deployed site) the game just doesn't show the owl's help.
const BRIDGE = import.meta.env.VITE_TUTOR_URL || 'http://localhost:8787'

// Is the local bridge reachable? (used to decide whether to show Help/Ask)
export async function tutorHealth() {
  try {
    const r = await fetch(`${BRIDGE}/health`, { cache: 'no-store' })
    return r.ok
  } catch { return false }
}

// Ask Claude for a kid-friendly hint. Returns the hint text, or null on failure.
export async function askTutor(payload) {
  try {
    const r = await fetch(`${BRIDGE}/hint`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!r.ok) return null
    const j = await r.json()
    return j.text || null
  } catch { return null }
}

// ---- pick the most natural-sounding free voice the browser offers ----
// Edge/Windows expose "… Natural" neural voices; Chrome exposes "Google …".
// Robotic legacy SAPI voices (David/Zira/Mark) are pushed to the bottom.
function rankVoice(v) {
  const n = (v.name || '').toLowerCase()
  let s = 0
  if (!v.lang || !v.lang.toLowerCase().startsWith('en')) s -= 100
  if (n.includes('natural')) s += 60
  if (n.includes('google')) s += 35
  if (/(aria|jenny|libby|sonia|michelle|emma|ana|clara)/.test(n)) s += 25 // friendly neural voices
  if (/(ryan|guy|christopher|eric)/.test(n)) s += 15
  if (/(david|zira|mark|hazel|microsoft\b)/.test(n)) s -= 15 // legacy robotic SAPI
  if (v.localService) s -= 8 // online neural voices usually sound better
  return s
}

let chosenVoice = null
function refreshVoice() {
  try {
    const vs = window.speechSynthesis ? speechSynthesis.getVoices() : []
    if (vs.length) chosenVoice = vs.slice().sort((a, b) => rankVoice(b) - rankVoice(a))[0]
  } catch { /* ignore */ }
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoice()
  speechSynthesis.onvoiceschanged = refreshVoice // voices load asynchronously
}

export const voiceName = () => (chosenVoice ? chosenVoice.name : null)

// Speak text aloud using the most natural available voice.
export function speak(text) {
  try {
    if (!('speechSynthesis' in window) || !text) return
    speechSynthesis.cancel()
    if (!chosenVoice) refreshVoice()
    const u = new SpeechSynthesisUtterance(text)
    if (chosenVoice) u.voice = chosenVoice
    u.rate = 0.92  // a touch slower for a young child
    u.pitch = 1.1
    speechSynthesis.speak(u)
  } catch { /* ignore */ }
}

export function stopSpeaking() {
  try { speechSynthesis.cancel() } catch { /* ignore */ }
}

export const canListen = () =>
  typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

// Listen for a spoken question (speech-to-text). Resolves with the transcript
// (string) or null if it failed / isn't supported.
export function listen() {
  return new Promise((resolve) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { resolve(null); return }
    try {
      const rec = new SR()
      rec.lang = 'en-US'
      rec.interimResults = false
      rec.maxAlternatives = 1
      let done = false
      const finish = (v) => { if (!done) { done = true; resolve(v) } }
      rec.onresult = (e) => finish(e.results[0][0].transcript)
      rec.onerror = () => finish(null)
      rec.onend = () => finish(null)
      rec.start()
    } catch { resolve(null) }
  })
}
