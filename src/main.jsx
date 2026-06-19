import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { sfx } from './game/audio'
import './index.css'

// Expose the GUI-TheStone sprite URLs as CSS vars (respects the deploy base path
// so border-image refs resolve under /joe-maths-fun/ on GitHub Pages).
{
  const B = import.meta.env.BASE_URL
  const r = document.documentElement.style
  const set = (k, n) => r.setProperty(k, `url(${B}ui/${n})`)
  set('--ui-panel', 'panel.png')
  set('--ui-popup', 'popup.png')
  set('--ui-btn', 'btn.png')
  set('--ui-btn-green', 'btn-green.png')
  set('--ui-btn-gold', 'btn-gold.png')
  set('--ui-slot', 'slot.png')
}

// Unlock the AudioContext on the very first interaction (browser autoplay rule).
const unlock = () => { sfx.unlock(); window.removeEventListener('pointerdown', unlock) }
window.addEventListener('pointerdown', unlock)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
