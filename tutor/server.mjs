// Local tutor bridge: the game (browser) can't run `claude -p` itself, so this
// tiny server does it. Run it alongside the dev server:  npm run tutor
// Then the in-game owl can fetch kid-friendly hints from your local Claude.
//
// It only listens on localhost and only ever runs `claude -p` with a fixed
// tutor prompt + the current problem context. Nothing here works on the public
// deployed site (no backend) - the game just hides the Help button there.
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'

const PORT = process.env.TUTOR_PORT || 8787
const TIMEOUT_MS = 45000

function buildPrompt({ problem, step, attempts, priorHints, level, question }) {
  const rules = [
    'You are a warm, patient maths tutor talking directly to a 6-year-old child playing a maths game.',
    'Reply with ONE or TWO short, simple, encouraging sentences a young child understands.',
    'No emojis, no markdown, no preamble - just the spoken words.',
  ]
  // Escalate with how many times help has been asked for THIS step.
  const lvl = level || 1
  if (lvl <= 1) {
    rules.push('Give a gentle nudge about the current step so they can work it out. Do NOT state the final answer.')
  } else if (lvl === 2) {
    rules.push('They are still stuck, so be more concrete: name the exact numbers and exactly what to do with them, but let them say the final number themselves. Do NOT state the final answer.')
  } else {
    rules.push('They have tried several times and are getting frustrated. Gently walk through THIS step like a worked example and tell them the number to write down. It is fine to give the answer now, with a one-line reason.')
  }
  rules.push('Do not repeat a hint you already gave (listed below); say something new and more helpful each time.')

  const ctx = []
  if (problem) ctx.push(`The problem is ${problem}.`)
  if (step) ctx.push(`They are working on ${step}.`)
  if (attempts && attempts.length) {
    ctx.push(`Their wrong answers for this step, in order: ${attempts.join(', ')}. Work out WHAT misunderstanding produced those answers and address it directly (e.g. they subtracted the small digit from the big one, forgot to add the carry, forgot to borrow).`)
  }
  if (priorHints && priorHints.length) {
    ctx.push(`Hints you ALREADY gave this step (do not repeat these): ${priorHints.map((h) => `"${h}"`).join(' ')}`)
  }
  const ask = question
    ? `The child asked out loud: "${question}". Answer their question simply and kindly, in the context of this problem.`
    : 'Give the next hint for the step they are on.'
  return `${rules.join(' ')}\n\n${ctx.join(' ')}\n${ask}`
}

function runClaude(prompt) {
  return new Promise((resolve, reject) => {
    // shell:true so Windows resolves the `claude` / `claude.cmd` shim;
    // prompt goes via stdin to avoid any quoting/escaping issues.
    const child = spawn('claude', ['-p'], { shell: true })
    let out = '', err = ''
    const timer = setTimeout(() => { child.kill(); reject(new Error('claude timed out')) }, TIMEOUT_MS)
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { err += d })
    child.on('error', (e) => { clearTimeout(timer); reject(e) })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0 && out.trim()) resolve(out.trim())
      else reject(new Error(err.trim() || `claude exited ${code}`))
    })
    child.stdin.write(prompt)
    child.stdin.end()
  })
}

const json = (res, code, obj) => {
  res.writeHead(code, { 'content-type': 'application/json' })
  res.end(JSON.stringify(obj))
}

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (req.method === 'GET' && req.url === '/health') { json(res, 200, { ok: true }); return }
  if (req.method === 'POST' && req.url === '/hint') {
    let body = ''
    req.on('data', (c) => { body += c })
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}')
        const text = await runClaude(buildPrompt(payload))
        json(res, 200, { text })
      } catch (e) {
        console.error('hint error:', e.message)
        json(res, 500, { error: String(e.message || e) })
      }
    })
    return
  }
  res.writeHead(404); res.end()
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🦉 tutor bridge ready on http://localhost:${PORT}  (POST /hint, GET /health)`)
  console.log('   needs the `claude` CLI on your PATH. Stop with Ctrl+C.')
})
