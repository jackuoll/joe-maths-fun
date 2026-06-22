// The in-level battle strip: the hero on the left (with a row of hearts that
// break when you slip up) facing a randomised mob on the right (with an HP bar
// that drains as you solve problems). Purely cosmetic — it visualises the
// mistakes/stars the level already tracks.
import { useEffect } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import PixelSprite from './PixelSprite'
import { HEART_FILLED, HEART_EMPTY } from '../game/battleSprites'

export default function BattleBanner({ hero, enemy, hearts, maxHearts, mobHP, mobMax, hit, victory }) {
  const heroC = useAnimationControls()
  const mobC = useAnimationControls()

  // Replay the lunge/recoil whenever a hit lands (hit.n increments per hit).
  useEffect(() => {
    if (!hit?.who) return
    if (hit.who === 'hero') {
      heroC.start({
        x: [0, -7, 6, -4, 0],
        filter: ['brightness(1)', 'brightness(.45) saturate(5) hue-rotate(-25deg)', 'brightness(1)'],
        transition: { duration: 0.45 },
      })
      mobC.start({ x: [0, -10, 0], transition: { duration: 0.3 } }) // mob lunges in
    } else if (hit.who === 'mob') {
      mobC.start({
        x: [0, 9, -3, 0],
        filter: ['brightness(1)', 'brightness(2.4)', 'brightness(1)'],
        transition: { duration: 0.4 },
      })
      heroC.start({ x: [0, 12, 0], transition: { duration: 0.28 } }) // hero lunges in
    }
  }, [hit?.n]) // eslint-disable-line react-hooks/exhaustive-deps

  // Killing blow: the mob keels over.
  useEffect(() => {
    if (victory) mobC.start({ rotate: -90, y: 14, opacity: 0.15, transition: { duration: 0.7, delay: 0.15 } })
  }, [victory]) // eslint-disable-line react-hooks/exhaustive-deps

  const Combatant = ({ sprite, name, flip, controls, big }) => (
    <div className="flex flex-col items-center gap-1 w-20">
      <motion.div animate={controls}>
        <PixelSprite sprite={sprite} size={big ? 60 : 52} flip={flip} />
      </motion.div>
      <span className="text-[0.65rem] leading-none mc-text text-white/90 truncate max-w-full">{name}</span>
    </div>
  )

  return (
    <div className="max-w-2xl w-full mx-auto px-4 mt-3">
      <div className="mc-panel-dark flex items-center justify-between gap-2 px-3 py-2">
        {/* Hero + hearts */}
        <div className="flex flex-col items-center gap-1">
          <Combatant sprite={hero} name="Hero" controls={heroC} />
          <div className="flex gap-0.5">
            {Array.from({ length: maxHearts }, (_, i) => {
              const filled = i < hearts
              return (
                <AnimatePresence mode="popLayout" key={i}>
                  <motion.div
                    key={filled ? 'f' : 'e'}
                    initial={{ scale: filled ? 1 : 1.6, rotate: filled ? 0 : -25, opacity: filled ? 1 : 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                  >
                    <PixelSprite sprite={filled ? HEART_FILLED : HEART_EMPTY} size={16} />
                  </motion.div>
                </AnimatePresence>
              )
            })}
          </div>
        </div>

        {/* Crossed-swords divider */}
        <motion.div
          className="text-2xl select-none"
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
        >
          ⚔️
        </motion.div>

        {/* Mob + HP bar */}
        <div className="flex flex-col items-center gap-1">
          <Combatant sprite={enemy.sprite} name={enemy.name} flip controls={mobC} big={enemy.boss} />
          <div className="flex gap-0.5 w-20">
            {Array.from({ length: mobMax }, (_, i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-sm transition-colors duration-300"
                style={{ background: i < mobHP ? '#e2483b' : '#3a2a2a', boxShadow: i < mobHP ? '0 0 4px #e2483b88' : 'none' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
