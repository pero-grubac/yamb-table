# YAMB 🎲

Balkanski digitalni scoresheet za Yamb, Yahtzee i Yatzy. Multiplayer, mobile-first, retro CRT stil.

## Pokretanje lokalno

```bash
npm install
npm run dev
```

Otvori http://localhost:5173

## Build

```bash
npm run build
```

## Struktura projekta

```
src/
├── components/   # Reusable UI komponente (Btn, Toast, DiceRoller, ScoreCell...)
├── pages/        # Ekrani (SetupPage, PassPage, GamePage, WinnerPage)
├── services/     # Čista game logika (scoring, pravila, sugestije)
├── models/       # Data modeli i factory funkcije
├── hooks/        # Custom React hookovi (useGame, useDice, useToast, usePersist)
├── constants/    # Konstante (redovi, kolone, mode info)
└── styles/       # Global CSS (varijable, CRT efekti, animacije)
```

## Modovi igre

- **YAMB** — Balkanski klasik, 4 kolone (Dolje, Gore, Slobodno, Najava)
- **YAHTZEE** — Američki klasik, slobodni upis
- **YATZY** — Skandinavska varijanta

## Feature-ovi

- ♾️ Neograničen broj igrača
- 💾 Autosave u localStorage
- 🎲 Opcioni dice roller s prijedlozima
- 👁 View-only pregled tuđih scoresheet-ova
- 📱 Mobile-first dizajn
