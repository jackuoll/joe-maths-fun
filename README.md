# 🔢 Number Quest

A colourful maths adventure that teaches **long addition** and **long subtraction**
column by column — built with **React + Vite + Tailwind**.

## How it teaches

Every problem is solved the proper written way: stacked in columns, working from
the **ones** up. Professor Hoot (the owl) narrates each step:

- **Adding** — the child types each column's **full total** (e.g. `5 + 6` → type
  `11`). The game then **splits the tens digit off** and carries it up to the next
  column with a happy chime — exactly the "write 1, carry 1" idea, made visible.
- **Subtracting** — when the top digit is too small, the game **borrows 10**: the
  neighbouring digit visibly drops by one and the current column gains ten.

It guides the child to write *only* the column digit and carry/borrow the rest —
exactly the skill long arithmetic is about.

## Progression (gets harder as you go)

| World | Skill |
|-------|-------|
| 🌻 Sunny Meadow | 2-digit addition, no carrying |
| 🍎 Apple Orchard | 2-digit addition **with carrying** |
| 🌉 Rolling River | 3-digit addition with carries |
| 💎 Crystal Cave | 2-digit subtraction, no borrowing |
| 🏔️ Frosty Peak | 2-digit subtraction **with borrowing** |
| 🏰 Star Castle | 3-digit add **and** subtract, mixed |

Each world unlocks the next once a star is earned.

## Rewards

- 🪙 **Coins** for every correct answer (more for a clean run).
- ⭐ **Stars** (up to 3) per world — perfect runs earn a crown.
- 🐾 **12 collectible Number Critters** — each world gifts one, and coins hatch the
  rest from **Mystery Eggs** in the Collection book.

Progress saves automatically in the browser.

## Run it

```bash
npm install      # first time only
npm run dev      # opens http://localhost:5173
```

Build a static version with `npm run build` (output in `dist/`).

## Tech / credits

- React 19, Vite, Tailwind CSS v4, Framer Motion, canvas-confetti.
- Fonts: **Baloo 2** & **Fredoka** (SIL Open Font License), bundled locally in
  `public/fonts` so it works offline.
- All critters, the mascot and sound effects are generated in-app (SVG + Web
  Audio) — no external art assets.
