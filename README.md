<div align="center">

# 🎲 YAMB Score Tracker

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![HTML](https://img.shields.io/badge/HTML-5-e34f26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572b6?style=flat-square&logo=css3&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-deployed-4c1?style=flat-square&logo=github&logoColor=white)

[![Live Demo](https://img.shields.io/badge/🎲_Live_Demo-yamb--table-39ff14?style=for-the-badge)](https://pero-grubac.github.io/yamb-table/)

</div>

---

## 📌 Project Overview

**YAMB Score Tracker** is a multiplayer digital scoresheet for **Yamb**, **Yahtzee** and **Yatzy** — built as a mobile-first React app with a retro CRT aesthetic. Players pass a single device around the table, each filling in their own score while others can view any sheet in read-only mode.

---

## ✨ Features

- 👥 **Unlimited players** — add as many as you want before starting
- 🎮 **3 game modes** — Yamb (4 columns), Yahtzee (classic), Yatzy (Scandinavian)
- 📋 **Full Yamb column rules** — Dolje ↓, Gore ↑, Slobodno ★, Najava !
- 📢 **Najava system** — declare your category before the first roll or sacrifice it
- 🎲 **Optional dice roller** — roll, hold dice, get smart category suggestions
- 👁️ **View-only tabs** — peek at any player's sheet mid-game without editing
- 📱 **Pass screen** — clean handoff screen between players on shared devices
- 💾 **Autosave** — game state persists in `localStorage`, survives page refresh
- 📐 **Mobile-first** — designed for phones, works great on desktop too

---

## 🎮 Game Modes

| Mode | Description |
|------|-------------|
| **YAMB** | Balkanski klasik — 4 columns with strict fill-order rules |
| **YAHTZEE** | American classic — fill any category in any order |
| **YATZY** | Scandinavian variant — pairs system, different bonus |

### YAMB Column Rules

| Column | Rule |
|--------|------|
| ↓ Dolje | Fill top → bottom only |
| ↑ Gore | Fill bottom → top only |
| ★ Slobodno | Fill in any order, any time |
| ! Najava | Must declare category **before** the first roll |

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| React 18 | UI framework |
| Vite 5 | Dev server & bundler |
| CSS Variables | Full retro CRT theme |
| localStorage | Game autosave |
| GitHub Pages | Hosting |

---

## 🚀 Setup & Run

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/pero-grubac/yamb-table.git
cd yamb-table
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
yamb-table/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── App.jsx                   # Phase router — setup | pass | game | winner
    ├── main.jsx
    ├── components/
    │   ├── Btn.jsx               # Reusable retro button
    │   ├── Toast.jsx             # Notification toast
    │   ├── Overlay.jsx           # Confirm dialog
    │   ├── Logo.jsx              # Animated CRT logo
    │   ├── DiceRoller.jsx        # Roll, hold, suggest
    │   ├── ScoreCell.jsx         # Single score table cell
    │   ├── PlayerTabs.jsx        # Player switcher tabs
    │   ├── YambTable.jsx         # 4-column Yamb grid
    │   └── FreeTable.jsx         # Single-column Yahtzee / Yatzy sheet
    ├── pages/
    │   ├── SetupPage.jsx         # Player names + mode selection
    │   ├── PassPage.jsx          # Device handoff screen
    │   ├── GamePage.jsx          # Main game screen
    │   └── WinnerPage.jsx        # Results + podium
    ├── services/
    │   └── gameService.js        # Pure JS — scoring, cell rules, suggestions
    ├── models/
    │   └── gameModel.js          # Data factories — createGame, emptySheet, getCell
    ├── hooks/
    │   ├── useGame.js            # Central game state and flow
    │   ├── useDice.js            # Dice roll / hold logic
    │   ├── useToast.js           # Toast notification helper
    │   └── usePersist.js         # localStorage save / load / clear
    ├── constants/
    │   └── index.js              # Row definitions, column config, mode metadata
    └── styles/
        └── global.css            # CSS variables, CRT effects, animations
```

---

## ⚙️ How It Works

### Game Flow

```
Setup (players + mode)
        ↓
Pass screen (hand device to next player)
        ↓
Game screen (fill sheet, optional dice roller)
        ↓
Pass screen → next player ...
        ↓
Winner screen (podium + full rankings)
```

### Scoring

| Section | Yamb | Yahtzee | Yatzy |
|---------|------|---------|-------|
| Upper bonus | (MAX − MIN) × 10 per column | +35 if upper ≥ 63 | +50 if upper ≥ 63 |
| Straight | 66 pts (1–6) / 45 pts (1–5 or 2–6) | 30 pts | 15 pts |
| Full House | Sum of all dice | 25 pts | Sum of all dice |
| Poker / 4 of a Kind | Sum × 10 | Sum of all dice | Sum of all dice |
| Yamb / Yahtzee / Yatzy | 50 pts | 50 pts | 50 pts |

---

## 🌍 Deploy to GitHub Pages

1. Set `base` in `vite.config.js` to match your repo name:

```js
export default defineConfig({
  plugins: [react()],
  base: '/yamb-table/',
})
```

2. Add `.github/workflows/deploy.yml` — push to `main` triggers an automatic build and deploy.

3. In **Settings → Pages → Source** select **GitHub Actions**.

Site will be live at `https://pero-grubac.github.io/yamb-table/`

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
