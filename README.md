# 🎲 YAMB Score Tracker

A multiplayer digital scoresheet for **Yamb**, **Yahtzee** and **Yatzy** — built as a mobile-first React PWA with a retro CRT aesthetic.

[![Live Demo](https://img.shields.io/badge/🎲_Live_Demo-yamb--score--tracker-39ff14?style=for-the-badge)](https://pero-grubac.github.io/yamb-table/)

---

## Features

- **Unlimited players** — add as many as you want before starting
- **3 game modes** — Yamb (4 columns), Yahtzee (classic), Yatzy (Scandinavian)
- **Full Yamb column rules** — Dolje ↓, Gore ↑, Slobodno ★, Najava !
- **Najava system** — declare your category before the first roll, or sacrifice it
- **Optional dice roller** — roll, hold dice, get smart category suggestions
- **View-only tabs** — peek at any player's sheet mid-game without editing
- **Pass screen** — clean handoff screen between players on shared devices
- **Autosave** — game state persists in `localStorage`, survives page refresh
- **Mobile-first** — designed for phones, works great on desktop too
- **Retro CRT style** — scanlines, neon glow, pixel fonts

---

## Game Modes

| Mode        | Description                                               |
| ----------- | --------------------------------------------------------- |
| **YAMB**    | Balkanski klasik — 4 columns with strict fill order rules |
| **YAHTZEE** | American classic — fill any category in any order         |
| **YATZY**   | Scandinavian variant — pairs, different bonus system      |

### YAMB Column Rules

| Column     | Rule                                        |
| ---------- | ------------------------------------------- |
| ↓ Dolje    | Fill top → bottom only                      |
| ↑ Gore     | Fill bottom → top only                      |
| ★ Slobodno | Fill in any order, any time                 |
| ! Najava   | Must declare category **before** first roll |

---

## Tech Stack

- **React 18** — component-based UI
- **Vite** — fast dev server and build tool
- **CSS Variables** — full retro theme via custom properties
- No UI library, no state management library — pure React hooks

---

## Project Structure

```
src/
├── components/        # Reusable UI — Btn, Toast, Overlay, DiceRoller, ScoreCell, PlayerTabs
│   ├── YambTable.jsx  # 4-column Yamb grid with column rules
│   └── FreeTable.jsx  # Single-column sheet for Yahtzee / Yatzy
├── pages/             # Full screens — Setup, Pass, Game, Winner
├── services/
│   └── gameService.js # Pure JS — scoring, cell rules, dice suggestions (no React)
├── models/
│   └── gameModel.js   # Data factories — createGame, emptySheet, getCell, setCell
├── hooks/
│   ├── useGame.js     # Central game state and flow
│   ├── useDice.js     # Dice roll / hold logic
│   ├── useToast.js    # Toast notification helper
│   └── usePersist.js  # localStorage save / load / clear
├── constants/
│   └── index.js       # Row definitions, column config, mode metadata
├── styles/
│   └── global.css     # CSS variables, CRT effects, animations
├── App.jsx            # Phase router — setup | pass | game | winner
└── main.jsx           # Entry point
```

---

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Build

```bash
npm run build
```


## Scoring Reference

### Upper Section (all modes)

Sum of the matching dice face (1s, 2s, 3s, 4s, 5s, 6s).

### Yamb Bonus

`(MAX − MIN) × 10` per column.

### Yahtzee / Yatzy Bonus

`+35` (Yahtzee) or `+50` (Yatzy) if upper section total ≥ 63.

### Lower Section — Yamb

| Category | Score                              |
| -------- | ---------------------------------- |
| Straight | 66 pts (1–6) / 45 pts (1–5 or 2–6) |
| Full     | Sum of all dice × 10               |
| Poker    | Sum of four-of-a-kind × 10         |
| Yamb     | 50 pts                             |
| Šansa    | Sum of all dice                    |
