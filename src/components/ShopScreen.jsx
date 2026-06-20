import { motion } from 'framer-motion'
import { HATS, THEMES, themeGradient } from '../game/shop'
import { sfx } from '../game/audio'
import { burst } from '../game/confetti'
import Mascot from './Mascot'

// One purchasable card. `preview` is the rendered cosmetic, the rest is the
// buy / equip button logic shared by hats and themes.
function ShopCard({ item, owned, equipped, canAfford, preview, onBuy, onEquip }) {
  return (
    <div className="mc-slot p-3 flex flex-col items-center text-center">
      <div className="grid place-items-center mb-1" style={{ height: 92 }}>{preview}</div>
      <span className="font-[family-name:var(--font-display)] text-sm text-slate-800 leading-tight">{item.name}</span>
      <span className="text-[0.68rem] text-slate-500 leading-tight mb-2 min-h-[1.6em]">{item.blurb || ''}</span>
      {!owned ? (
        <button
          onClick={onBuy} disabled={!canAfford}
          className="mc-btn mc-btn-gold px-3 py-2 text-sm w-full"
        >
          🪙 {item.cost}
        </button>
      ) : equipped ? (
        <div className="w-full px-3 py-2 text-sm rounded-xl font-[family-name:var(--font-display)] text-emerald-700"
          style={{ background: 'rgba(16,185,129,.16)', boxShadow: 'inset 0 0 0 2px rgba(16,185,129,.35)' }}>
          Equipped ✓
        </div>
      ) : (
        <button onClick={onEquip} className="mc-btn mc-btn-green px-3 py-2 text-sm w-full">Equip</button>
      )}
    </div>
  )
}

export default function ShopScreen({ state, onBack, onBuy, onEquip }) {
  const { coins, purchased, equipped } = state
  const owns = (item) => item.cost === 0 || purchased.includes(item.id)

  const buy = (slot, item) => {
    if (coins < item.cost) return
    sfx.coin()
    if (onBuy(item.id)) {
      burst(0.5, 0.4)
      onEquip(slot, item.id) // wear/use it straight away
    }
  }
  const equip = (slot, item) => { sfx.click(); onEquip(slot, item.id) }

  return (
    <div className="min-h-full w-full" style={{ background: themeGradient(equipped.theme) }}>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="mc-btn w-10 h-10 grid place-items-center text-xl">←</button>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-amber-300 mc-text">Coin Shop</h1>
          <div className="mc-chip ml-auto gap-1 text-amber-300 px-3 py-1.5">
            <span className="text-lg">🪙</span><span className="tnum">{coins}</span>
          </div>
        </div>

        {/* Hats — worn by Professor Hoot */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎩</span>
          <h2 className="font-[family-name:var(--font-display)] text-lg text-fuchsia-200 mc-text">Hats for Professor Hoot</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          {HATS.map((item) => (
            <ShopCard
              key={item.id}
              item={item}
              owned={owns(item)}
              equipped={equipped.hat === item.id}
              canAfford={coins >= item.cost}
              preview={<Mascot size={76} hat={item.id} />}
              onBuy={() => buy('hat', item)}
              onEquip={() => equip('hat', item)}
            />
          ))}
        </div>

        {/* Themes — the world background */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🌈</span>
          <h2 className="font-[family-name:var(--font-display)] text-lg text-sky-200 mc-text">Background Themes</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {THEMES.map((item) => (
            <ShopCard
              key={item.id}
              item={item}
              owned={owns(item)}
              equipped={equipped.theme === item.id}
              canAfford={coins >= item.cost}
              preview={
                <div className="w-20 h-20 rounded-2xl" style={{ background: item.gradient, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.18), 0 3px 8px rgba(0,0,0,.4)' }} />
              }
              onBuy={() => buy('theme', item)}
              onEquip={() => equip('theme', item)}
            />
          ))}
        </div>

        <p className="text-center text-slate-400 text-xs mt-6 font-medium">Earn coins by playing levels and finishing daily tasks!</p>
      </div>
    </div>
  )
}
