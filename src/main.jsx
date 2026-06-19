import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { sfx } from './game/audio'
import './index.css'

// Unlock the AudioContext on the very first interaction (browser autoplay rule).
const unlock = () => { sfx.unlock(); window.removeEventListener('pointerdown', unlock) }
window.addEventListener('pointerdown', unlock)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
