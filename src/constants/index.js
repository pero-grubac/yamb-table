export const SAVE_KEY = 'yamb_v1'

export const YAMB_ROWS = [
  { id: 'ones',   name: '1',        hint: 'Suma jedinica',    s: 'upper' },
  { id: 'twos',   name: '2',        hint: 'Suma dvojki',      s: 'upper' },
  { id: 'threes', name: '3',        hint: 'Suma trojki',      s: 'upper' },
  { id: 'fours',  name: '4',        hint: 'Suma četvorki',    s: 'upper' },
  { id: 'fives',  name: '5',        hint: 'Suma petica',      s: 'upper' },
  { id: 'sixes',  name: '6',        hint: 'Suma šestica',     s: 'upper' },
  { id: 'max',    name: 'MAX',      hint: 'Suma svih (max)',  s: 'mid'   },
  { id: 'min',    name: 'MIN',      hint: 'Suma svih (min)',  s: 'mid'   },
  { id: 'str',    name: 'STRAIGHT', hint: '66 / 45 pts',      s: 'lower' },
  { id: 'full',   name: 'FULL',     hint: 'Suma × 10',        s: 'lower' },
  { id: 'poker',  name: 'POKER',    hint: '4 iste: suma × 10',s: 'lower' },
  { id: 'yamb',   name: 'YAMB',     hint: '5 istih: 50 pts',  s: 'lower' },
  { id: 'chance', name: 'ŠANSA',    hint: 'Suma svih',        s: 'lower' },
]

export const YAMB_COLS = [
  { id: 'dolje',    label: '↓', full: 'DOLJE',    rule: 'down',     color: '#00ffff' },
  { id: 'gore',     label: '↑', full: 'GORE',     rule: 'up',       color: '#bf00ff' },
  { id: 'slobodno', label: '★', full: 'SLOBODNO', rule: 'free',     color: '#39ff14' },
  { id: 'najava',   label: '!', full: 'NAJAVA',   rule: 'announce', color: '#ff8800' },
]

export const YAHTZEE_ROWS = [
  { id: 'ones',    name: 'Ones',          hint: 'Sum of 1s', s: 'upper' },
  { id: 'twos',    name: 'Twos',          hint: 'Sum of 2s', s: 'upper' },
  { id: 'threes',  name: 'Threes',        hint: 'Sum of 3s', s: 'upper' },
  { id: 'fours',   name: 'Fours',         hint: 'Sum of 4s', s: 'upper' },
  { id: 'fives',   name: 'Fives',         hint: 'Sum of 5s', s: 'upper' },
  { id: 'sixes',   name: 'Sixes',         hint: 'Sum of 6s', s: 'upper' },
  { id: '3kind',   name: '3 of a Kind',   hint: 'Sum all',   s: 'lower' },
  { id: '4kind',   name: '4 of a Kind',   hint: 'Sum all',   s: 'lower' },
  { id: 'fhouse',  name: 'Full House',    hint: '25 pts',    s: 'lower' },
  { id: 'sstr',    name: 'Sm. Straight',  hint: '30 pts',    s: 'lower' },
  { id: 'lstr',    name: 'Lg. Straight',  hint: '40 pts',    s: 'lower' },
  { id: 'yahtzee', name: 'YAHTZEE',       hint: '50 pts',    s: 'lower' },
  { id: 'chance',  name: 'Chance',        hint: 'Sum all',   s: 'lower' },
]

export const YATZY_ROWS = [
  { id: 'ones',   name: 'Ones',          hint: 'Sum of 1s',  s: 'upper' },
  { id: 'twos',   name: 'Twos',          hint: 'Sum of 2s',  s: 'upper' },
  { id: 'threes', name: 'Threes',        hint: 'Sum of 3s',  s: 'upper' },
  { id: 'fours',  name: 'Fours',         hint: 'Sum of 4s',  s: 'upper' },
  { id: 'fives',  name: 'Fives',         hint: 'Sum of 5s',  s: 'upper' },
  { id: 'sixes',  name: 'Sixes',         hint: 'Sum of 6s',  s: 'upper' },
  { id: '1pair',  name: 'One Pair',      hint: 'Sum of pair',s: 'lower' },
  { id: '2pair',  name: 'Two Pairs',     hint: 'Sum pairs',  s: 'lower' },
  { id: '3kind',  name: '3 of a Kind',   hint: 'Sum three',  s: 'lower' },
  { id: '4kind',  name: '4 of a Kind',   hint: 'Sum four',   s: 'lower' },
  { id: 'sstr',   name: 'Sm. Straight',  hint: '15 pts',     s: 'lower' },
  { id: 'lstr',   name: 'Lg. Straight',  hint: '20 pts',     s: 'lower' },
  { id: 'fhouse', name: 'Full House',    hint: 'Sum all',    s: 'lower' },
  { id: 'chance', name: 'Chance',        hint: 'Sum all',    s: 'lower' },
  { id: 'yatzy',  name: 'YATZY',         hint: '50 pts',     s: 'lower' },
]

export const MODE_INFO = {
  yamb:    { title: 'YAMB',    sub: '▶ BALKANSKI DICE TRACKER ◀' },
  yahtzee: { title: 'YAHTZEE', sub: '▶ CLASSIC AMERICAN DICE ◀'  },
  yatzy:   { title: 'YATZY',   sub: '▶ SKANDINAVSKI DICE ◀'      },
}

export const MAX_ROLLS = 3
export const MAX_PLAYERS = 12
